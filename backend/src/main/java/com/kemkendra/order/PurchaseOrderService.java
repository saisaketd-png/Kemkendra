package com.kemkendra.order;

import com.kemkendra.common.ResourceNotFoundException;
import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.identity.UserStatus;
import com.kemkendra.order.dto.CancelPurchaseOrderRequest;
import com.kemkendra.order.dto.CreatePurchaseOrderRequest;
import com.kemkendra.order.dto.DispatchOrderRequest;
import com.kemkendra.order.dto.OrderInvoiceSummaryDto;
import com.kemkendra.order.dto.OrderTimelineEventDto;
import com.kemkendra.order.dto.PurchaseOrderResponse;
import com.kemkendra.order.dto.RejectPurchaseOrderRequest;
import com.kemkendra.order.dto.ShipmentResponse;
import com.kemkendra.order.dto.UpdateShipmentStatusRequest;
import com.kemkendra.product.*;
import com.kemkendra.rfq.Rfq;
import com.kemkendra.rfq.RfqRepository;
import com.kemkendra.rfq.RfqStatus;
import com.kemkendra.rfq.quotation.Quotation;
import com.kemkendra.rfq.quotation.QuotationRepository;
import com.kemkendra.notification.events.*;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final RfqRepository rfqRepository;
    private final QuotationRepository quotationRepository;
    private final ProductRepository productRepository;
    private final MasterProductRepository masterProductRepository;
    private final SupplierOfferingRepository supplierOfferingRepository;
    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final ShipmentRepository shipmentRepository;
    private final ApplicationEventPublisher eventPublisher;
    private com.kemkendra.admin.config.FeatureToggleService featureToggleService;
    private com.kemkendra.admin.audit.AuditService auditService;
    private com.kemkendra.invoice.InvoiceRepository invoiceRepository;
    private com.kemkendra.invoice.InvoicePaymentRecordRepository paymentRecordRepository;
    private com.kemkendra.dispute.DisputeRepository disputeRepository;

    public PurchaseOrderService(
            PurchaseOrderRepository purchaseOrderRepository,
            RfqRepository rfqRepository,
            QuotationRepository quotationRepository,
            ProductRepository productRepository,
            MasterProductRepository masterProductRepository,
            SupplierOfferingRepository supplierOfferingRepository,
            UserRepository userRepository,
            SupplierRepository supplierRepository,
            ShipmentRepository shipmentRepository,
            ApplicationEventPublisher eventPublisher) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.rfqRepository = rfqRepository;
        this.quotationRepository = quotationRepository;
        this.productRepository = productRepository;
        this.masterProductRepository = masterProductRepository;
        this.supplierOfferingRepository = supplierOfferingRepository;
        this.userRepository = userRepository;
        this.supplierRepository = supplierRepository;
        this.shipmentRepository = shipmentRepository;
        this.eventPublisher = eventPublisher;
    }

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    public void setFeatureToggleService(com.kemkendra.admin.config.FeatureToggleService featureToggleService) {
        this.featureToggleService = featureToggleService;
    }

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    public void setAuditService(com.kemkendra.admin.audit.AuditService auditService) {
        this.auditService = auditService;
    }

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    public void setInvoiceRepository(com.kemkendra.invoice.InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    public void setPaymentRecordRepository(com.kemkendra.invoice.InvoicePaymentRecordRepository paymentRecordRepository) {
        this.paymentRecordRepository = paymentRecordRepository;
    }

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    public void setDisputeRepository(com.kemkendra.dispute.DisputeRepository disputeRepository) {
        this.disputeRepository = disputeRepository;
    }

    public PurchaseOrderResponse createPurchaseOrder(
            CreatePurchaseOrderRequest request,
            Authentication authentication) {

        if (featureToggleService != null) {
            if (featureToggleService.isMaintenanceModeActive()) {
                throw new IllegalStateException("The platform is currently in maintenance mode. Purchase orders cannot be issued.");
            }
            if (!featureToggleService.isFeatureEnabled("MARKETPLACE_ORDERS_ENABLED")) {
                throw new IllegalStateException("Purchase order creation is currently disabled on the platform.");
            }
        }

        String email = authentication.getName();
        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (buyer.getStatus() != null && buyer.getStatus() != UserStatus.ACTIVE) {
            throw new IllegalStateException("Buyer account is not active");
        }

        // Pessimistically lock RFQ
        Rfq rfq = rfqRepository.findByIdAndBuyerIdForUpdate(request.rfqId(), buyer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("RFQ not found"));

        // Precondition 1: RFQ must be in ACCEPTED status
        if (rfq.getStatus() != RfqStatus.ACCEPTED) {
            throw new IllegalStateException("Cannot issue purchase order for RFQ in status: " + rfq.getStatus());
        }

        // Precondition 2: RFQ must have accepted quotation id
        if (rfq.getAcceptedQuotationId() == null) {
            throw new IllegalStateException("RFQ does not have an accepted quotation");
        }

        // Precondition 3: Duplicate PO guard
        if (purchaseOrderRepository.existsByRfqId(rfq.getId())) {
            throw new IllegalStateException("Purchase order already issued for this RFQ");
        }

        // Fetch accepted quotation snapshot
        Quotation quotation = quotationRepository.findByIdAndRfqId(rfq.getAcceptedQuotationId(), rfq.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Accepted quotation not found for this RFQ"));

        // Precondition 4: Quotation validity check
        if (quotation.getValidityDate() != null && quotation.getValidityDate().isBefore(LocalDate.now())) {
            throw new IllegalStateException("Cannot create purchase order from an expired quotation. Validity expired on: " + quotation.getValidityDate());
        }

        // Verify supplier is active
        Supplier supplier = supplierRepository.findById(rfq.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
        if (supplier.getUser() != null && supplier.getUser().getStatus() != null && supplier.getUser().getStatus() != UserStatus.ACTIVE) {
            throw new IllegalStateException("Supplier account is not active");
        }

        // Resolve chemical & offering snapshots
        UUID masterProductId = rfq.getMasterProductId();
        String masterProductCode = null;
        String productName = "Chemical Product";
        BigDecimal purity = null;
        String grade = null;
        String packaging = quotation.getPackagingDetails();

        if (masterProductId != null) {
            MasterProduct mp = masterProductRepository.findById(masterProductId).orElse(null);
            if (mp != null) {
                masterProductCode = mp.getMasterProductCode();
                productName = mp.getName();
            }
        }

        if (rfq.getSupplierOfferingId() != null) {
            SupplierOffering offering = supplierOfferingRepository.findById(rfq.getSupplierOfferingId()).orElse(null);
            if (offering != null) {
                purity = offering.getPurity();
                grade = offering.getGrade();
                if (packaging == null) {
                    packaging = offering.getPackaging();
                }
                if (masterProductId == null && offering.getMasterProduct() != null) {
                    masterProductId = offering.getMasterProduct().getId();
                    masterProductCode = offering.getMasterProduct().getMasterProductCode();
                    productName = offering.getMasterProduct().getName();
                }
            }
        }

        if (productName.equals("Chemical Product") && rfq.getProductId() != null) {
            productName = productRepository.findById(rfq.getProductId())
                    .map(Product::getName)
                    .orElse("Chemical Product");
        }

        // Calculate subtotal = quantity * unitPrice
        BigDecimal subtotal = request.subtotal() != null
                ? request.subtotal()
                : rfq.getQuantity().multiply(quotation.getUnitPrice()).setScale(4, RoundingMode.HALF_UP);
        BigDecimal taxAmount = request.taxAmount() != null ? request.taxAmount() : BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal.add(taxAmount).setScale(4, RoundingMode.HALF_UP);

        LocalDate expectedDeliveryDate = request.expectedDeliveryDate();
        if (expectedDeliveryDate == null && quotation.getLeadTimeDays() != null && quotation.getLeadTimeDays() > 0) {
            expectedDeliveryDate = LocalDate.now().plusDays(quotation.getLeadTimeDays());
        }

        // Generate Human-Readable PO Number
        Long seqVal = purchaseOrderRepository.getNextPoSequenceValue();
        String poNumber = String.format("PO-%d-%06d", Year.now().getValue(), seqVal);

        // Derive Human-Readable Traceability References
        int rfqYear = rfq.getCreatedAt() != null ? rfq.getCreatedAt().getYear() : Year.now().getValue();
        String rfqRef = String.format("RFQ-%d-%s", rfqYear, rfq.getId().toString().substring(0, 8).toUpperCase());
        int quoteYear = quotation.getCreatedAt() != null ? quotation.getCreatedAt().getYear() : Year.now().getValue();
        String quoteRef = String.format("QT-%d-%s-V%d", quoteYear, quotation.getId().toString().substring(0, 8).toUpperCase(), quotation.getQuotationVersion());

        PurchaseOrder po = new PurchaseOrder();
        po.setPoNumber(poNumber);
        po.setRfqId(rfq.getId());
        po.setQuotationId(quotation.getId());
        po.setBuyerId(buyer.getId());
        po.setSupplierId(rfq.getSupplierId());
        po.setProductId(rfq.getProductId());
        po.setMasterProductId(masterProductId);
        po.setMasterProductCode(masterProductCode);
        po.setSupplierOfferingId(rfq.getSupplierOfferingId());
        po.setRfqReference(rfqRef);
        po.setQuotationReference(quoteRef);
        po.setQuotationVersion(quotation.getQuotationVersion());
        po.setProductName(productName);
        po.setPurity(purity);
        po.setGrade(grade);
        po.setPackaging(packaging);
        po.setQuantity(rfq.getQuantity());
        po.setUnit(rfq.getUnit());
        po.setUnitPrice(quotation.getUnitPrice());
        po.setSubtotal(subtotal);
        po.setTaxAmount(taxAmount);
        po.setTotalAmount(totalAmount);
        po.setCurrency(quotation.getCurrency());
        po.setAgreedLeadTimeDays(quotation.getLeadTimeDays());
        po.setExpectedDeliveryDate(expectedDeliveryDate);
        po.setPaymentTerms(request.paymentTerms() != null && !request.paymentTerms().isBlank() ? request.paymentTerms().trim() : "Standard Terms");
        po.setDeliveryTerms(request.deliveryTerms() != null && !request.deliveryTerms().isBlank() ? request.deliveryTerms().trim() : "Standard Delivery");
        po.setIncoterms(request.incoterms() != null && !request.incoterms().isBlank() ? request.incoterms().trim() : null);
        po.setShippingAddress(request.shippingAddress().trim());
        po.setBillingContact(request.billingContact().trim());
        po.setNotes(request.notes() != null && !request.notes().isBlank() ? request.notes().trim() : quotation.getCommercialNotes());
        po.setStatus(OrderStatus.PLACED);
        po.setPlacedAt(LocalDateTime.now());

        PurchaseOrder saved = purchaseOrderRepository.save(po);

        if (auditService != null) {
            auditService.recordUserAction(
                    buyer,
                    com.kemkendra.admin.audit.AuditAction.PO_ISSUED,
                    com.kemkendra.admin.audit.AuditTargetType.PURCHASE_ORDER,
                    saved.getId().toString(),
                    "Purchase Order " + saved.getPoNumber() + " issued for RFQ " + rfq.getId() + " (" + saved.getCurrency() + " " + saved.getTotalAmount() + ")"
            );
        }

        eventPublisher.publishEvent(new PurchaseOrderIssuedEvent(
                saved.getId(),
                saved.getBuyerId(),
                saved.getSupplierId()
        ));

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getBuyerOrders(Authentication authentication) {
        String email = authentication.getName();
        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return purchaseOrderRepository.findByBuyerIdOrderByCreatedAtDesc(buyer.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PurchaseOrderResponse getBuyerOrder(UUID orderId, Authentication authentication) {
        String email = authentication.getName();
        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        PurchaseOrder order = purchaseOrderRepository.findByIdAndBuyerId(orderId, buyer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        return mapToResponse(order);
    }

    public PurchaseOrderResponse cancelBuyerOrder(UUID orderId, CancelPurchaseOrderRequest request, Authentication authentication) {
        if (request == null || request.reason() == null || request.reason().trim().length() < 5) {
            throw new IllegalArgumentException("Cancellation reason must be at least 5 characters");
        }

        String email = authentication.getName();
        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        PurchaseOrder order = purchaseOrderRepository.findByIdAndBuyerId(orderId, buyer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PLACED && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Cannot cancel order in status: " + order.getStatus() + ". Cancellation is only permitted prior to active fulfillment.");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledAt(LocalDateTime.now());
        order.setCancelledBy(buyer.getEmail());
        order.setCancellationReason(request.reason().trim());

        PurchaseOrder updated = purchaseOrderRepository.save(order);

        if (auditService != null) {
            auditService.recordUserAction(
                    buyer,
                    com.kemkendra.admin.audit.AuditAction.PO_CANCELLED,
                    com.kemkendra.admin.audit.AuditTargetType.PURCHASE_ORDER,
                    updated.getId().toString(),
                    "Purchase Order cancelled by buyer. Reason: " + updated.getCancellationReason()
            );
        }

        eventPublisher.publishEvent(new PurchaseOrderCancelledEvent(
                updated.getId(),
                updated.getBuyerId(),
                updated.getSupplierId(),
                updated.getCancellationReason()
        ));

        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getSupplierOrders(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Supplier supplier = supplierRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier profile not found"));

        return purchaseOrderRepository.findBySupplierIdOrderByCreatedAtDesc(supplier.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PurchaseOrderResponse getSupplierOrder(UUID orderId, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Supplier supplier = supplierRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier profile not found"));

        PurchaseOrder order = purchaseOrderRepository.findByIdAndSupplierId(orderId, supplier.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        return mapToResponse(order);
    }

    public PurchaseOrderResponse confirmSupplierOrder(UUID orderId, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Supplier supplier = supplierRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier profile not found"));

        PurchaseOrder order = purchaseOrderRepository.findByIdAndSupplierId(orderId, supplier.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PLACED) {
            throw new IllegalStateException("Cannot confirm order in status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CONFIRMED);
        order.setConfirmedAt(LocalDateTime.now());
        order.setConfirmedBy(user.getEmail());

        PurchaseOrder updated = purchaseOrderRepository.save(order);

        if (auditService != null) {
            auditService.recordUserAction(
                    user,
                    com.kemkendra.admin.audit.AuditAction.PO_CONFIRMED,
                    com.kemkendra.admin.audit.AuditTargetType.PURCHASE_ORDER,
                    updated.getId().toString(),
                    "Purchase Order " + updated.getPoNumber() + " confirmed by supplier"
            );
        }

        eventPublisher.publishEvent(new PurchaseOrderConfirmedEvent(
                updated.getId(),
                updated.getBuyerId(),
                updated.getSupplierId()
        ));

        return mapToResponse(updated);
    }

    public PurchaseOrderResponse startProcessingSupplierOrder(UUID orderId, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Supplier supplier = supplierRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier profile not found"));

        PurchaseOrder order = purchaseOrderRepository.findByIdAndSupplierId(orderId, supplier.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Cannot start processing order in status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.PROCESSING);
        order.setProcessingAt(LocalDateTime.now());
        PurchaseOrder updated = purchaseOrderRepository.save(order);

        if (auditService != null) {
            auditService.recordUserAction(
                    user,
                    com.kemkendra.admin.audit.AuditAction.PO_PROCESSING_STARTED,
                    com.kemkendra.admin.audit.AuditTargetType.PURCHASE_ORDER,
                    updated.getId().toString(),
                    "Supplier started processing Purchase Order " + updated.getPoNumber()
            );
        }

        eventPublisher.publishEvent(new OrderProcessingStartedEvent(
                updated.getId(),
                updated.getBuyerId(),
                updated.getSupplierId()
        ));

        return mapToResponse(updated);
    }

    public PurchaseOrderResponse rejectSupplierOrder(UUID orderId, RejectPurchaseOrderRequest request, Authentication authentication) {
        if (request == null || request.reason() == null || request.reason().trim().length() < 5) {
            throw new IllegalArgumentException("Rejection reason must be at least 5 characters");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Supplier supplier = supplierRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier profile not found"));

        PurchaseOrder order = purchaseOrderRepository.findByIdAndSupplierId(orderId, supplier.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PLACED && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Cannot reject order in status: " + order.getStatus() + ". Rejection is only allowed prior to fulfillment.");
        }

        order.setStatus(OrderStatus.REJECTED);
        order.setRejectedAt(LocalDateTime.now());
        order.setRejectedBy(user.getEmail());
        order.setRejectionReason(request.reason().trim());

        PurchaseOrder updated = purchaseOrderRepository.save(order);

        if (auditService != null) {
            auditService.recordUserAction(
                    user,
                    com.kemkendra.admin.audit.AuditAction.PO_REJECTED,
                    com.kemkendra.admin.audit.AuditTargetType.PURCHASE_ORDER,
                    updated.getId().toString(),
                    "Purchase Order rejected by supplier. Reason: " + updated.getRejectionReason()
            );
        }

        eventPublisher.publishEvent(new PurchaseOrderRejectedEvent(
                updated.getId(),
                updated.getBuyerId(),
                updated.getSupplierId(),
                updated.getRejectionReason()
        ));

        return mapToResponse(updated);
    }

    public PurchaseOrderResponse markReadyForDispatchSupplierOrder(UUID orderId, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Supplier supplier = supplierRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier profile not found"));

        PurchaseOrder order = purchaseOrderRepository.findByIdAndSupplierId(orderId, supplier.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PROCESSING) {
            throw new IllegalStateException("Cannot mark order ready for dispatch in status: " + order.getStatus() + ". Order must be in PROCESSING status.");
        }

        order.setStatus(OrderStatus.READY_FOR_DISPATCH);
        order.setReadyForDispatchAt(LocalDateTime.now());
        PurchaseOrder updated = purchaseOrderRepository.save(order);

        if (auditService != null) {
            auditService.recordUserAction(
                    user,
                    com.kemkendra.admin.audit.AuditAction.PO_PROCESSING_STARTED,
                    com.kemkendra.admin.audit.AuditTargetType.PURCHASE_ORDER,
                    updated.getId().toString(),
                    "Order " + updated.getPoNumber() + " marked ready for dispatch"
            );
        }

        eventPublisher.publishEvent(new OrderReadyForDispatchEvent(
                updated.getId(),
                updated.getBuyerId(),
                updated.getSupplierId()
        ));

        return mapToResponse(updated);
    }

    public PurchaseOrderResponse dispatchSupplierOrder(UUID orderId, DispatchOrderRequest request, Authentication authentication) {
        if (request == null || request.trackingNumber() == null || request.trackingNumber().isBlank()) {
            throw new IllegalArgumentException("Tracking number is required for dispatch");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Supplier supplier = supplierRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier profile not found"));

        PurchaseOrder order = purchaseOrderRepository.findByIdAndSupplierId(orderId, supplier.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PROCESSING && order.getStatus() != OrderStatus.READY_FOR_DISPATCH) {
            throw new IllegalStateException("Cannot dispatch order in status: " + order.getStatus() + ". Order must be PROCESSING or READY_FOR_DISPATCH.");
        }

        LocalDateTime dispatchTime = request.dispatchDate() != null ? request.dispatchDate() : LocalDateTime.now();
        Shipment shipment = shipmentRepository.findByPurchaseOrderId(orderId).orElseGet(() -> {
            Shipment s = new Shipment();
            s.setPurchaseOrder(order);
            return s;
        });

        shipment.setCarrier(request.carrier() != null && !request.carrier().isBlank() ? request.carrier().trim() : null);
        shipment.setTrackingNumber(request.trackingNumber().trim());
        shipment.setDispatchDate(dispatchTime);
        shipment.setShippedAt(dispatchTime);
        if (request.estimatedDeliveryDate() != null) {
            shipment.setEstimatedDeliveryDate(request.estimatedDeliveryDate());
        }
        if (request.deliveryNotes() != null && !request.deliveryNotes().isBlank()) {
            shipment.setDeliveryNotes(request.deliveryNotes().trim());
        }
        shipment.setShipmentStatus(ShipmentStatus.DISPATCHED);
        Shipment savedShipment = shipmentRepository.save(shipment);

        order.setStatus(OrderStatus.DISPATCHED);
        order.setShippedAt(dispatchTime);
        PurchaseOrder updated = purchaseOrderRepository.save(order);

        if (auditService != null) {
            auditService.recordUserAction(
                    user,
                    com.kemkendra.admin.audit.AuditAction.PO_SHIPPED,
                    com.kemkendra.admin.audit.AuditTargetType.PURCHASE_ORDER,
                    updated.getId().toString(),
                    "Order " + updated.getPoNumber() + " dispatched (Tracking: " + request.trackingNumber().trim() + ")"
            );
        }

        eventPublisher.publishEvent(new OrderShippedEvent(
                updated.getId(),
                updated.getBuyerId(),
                updated.getSupplierId(),
                savedShipment.getId()
        ));

        return mapToResponse(updated);
    }

    public PurchaseOrderResponse shipSupplierOrder(UUID orderId, String carrier, String trackingNumber, LocalDate estimatedDeliveryDate, Authentication authentication) {
        if (carrier == null || carrier.trim().isEmpty()) {
            throw new IllegalArgumentException("Carrier is required");
        }
        if (trackingNumber == null || trackingNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Tracking number is required");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Supplier supplier = supplierRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier profile not found"));

        PurchaseOrder order = purchaseOrderRepository.findByIdAndSupplierId(orderId, supplier.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PROCESSING) {
            throw new IllegalStateException("Cannot ship order in status: " + order.getStatus() + ". Order must be in PROCESSING status to be shipped.");
        }

        if (shipmentRepository.findByPurchaseOrderId(orderId).isPresent()) {
            throw new IllegalStateException("Shipment already exists for order: " + orderId);
        }

        LocalDateTime shippedTime = LocalDateTime.now();
        Shipment shipment = new Shipment();
        shipment.setPurchaseOrder(order);
        shipment.setCarrier(carrier.trim());
        shipment.setTrackingNumber(trackingNumber.trim());
        shipment.setEstimatedDeliveryDate(estimatedDeliveryDate);
        shipment.setShippedAt(shippedTime);
        shipment.setDispatchDate(shippedTime);
        shipment.setShipmentStatus(ShipmentStatus.DISPATCHED);
        Shipment savedShipment = shipmentRepository.save(shipment);

        order.setStatus(OrderStatus.SHIPPED);
        order.setShippedAt(shippedTime);
        PurchaseOrder updated = purchaseOrderRepository.save(order);

        if (auditService != null) {
            auditService.recordUserAction(
                    user,
                    com.kemkendra.admin.audit.AuditAction.PO_SHIPPED,
                    com.kemkendra.admin.audit.AuditTargetType.PURCHASE_ORDER,
                    updated.getId().toString(),
                    "Supplier shipped Purchase Order " + updated.getPoNumber() + " via " + carrier.trim() + " (Tracking: " + trackingNumber.trim() + ")"
            );
        }

        eventPublisher.publishEvent(new OrderShippedEvent(
                updated.getId(),
                updated.getBuyerId(),
                updated.getSupplierId(),
                savedShipment.getId()
        ));

        return mapToResponse(updated);
    }

    public ShipmentResponse updateShipmentStatus(UUID orderId, UpdateShipmentStatusRequest request, Authentication authentication) {
        if (request == null || request.shipmentStatus() == null) {
            throw new IllegalArgumentException("Shipment status is required");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Supplier supplier = supplierRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier profile not found"));

        PurchaseOrder order = purchaseOrderRepository.findByIdAndSupplierId(orderId, supplier.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Shipment shipment = shipmentRepository.findByPurchaseOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found for order"));

        shipment.setShipmentStatus(request.shipmentStatus());
        if (request.carrier() != null && !request.carrier().isBlank()) {
            shipment.setCarrier(request.carrier().trim());
        }
        if (request.trackingNumber() != null && !request.trackingNumber().isBlank()) {
            shipment.setTrackingNumber(request.trackingNumber().trim());
        }
        if (request.estimatedDeliveryDate() != null) {
            shipment.setEstimatedDeliveryDate(request.estimatedDeliveryDate());
        }
        if (request.deliveryNotes() != null && !request.deliveryNotes().isBlank()) {
            shipment.setDeliveryNotes(request.deliveryNotes().trim());
        }

        if (request.shipmentStatus() == ShipmentStatus.IN_TRANSIT) {
            if (order.getStatus() == OrderStatus.DISPATCHED || order.getStatus() == OrderStatus.SHIPPED) {
                order.setStatus(OrderStatus.IN_TRANSIT);
                order.setInTransitAt(LocalDateTime.now());
                purchaseOrderRepository.save(order);
            }
        } else if (request.shipmentStatus() == ShipmentStatus.DELIVERED) {
            shipment.setDeliveredAt(LocalDateTime.now());
            if (order.getStatus() != OrderStatus.DELIVERED && order.getStatus() != OrderStatus.COMPLETED) {
                order.setStatus(OrderStatus.DELIVERED);
                order.setDeliveredAt(LocalDateTime.now());
                purchaseOrderRepository.save(order);
            }
        }

        Shipment updated = shipmentRepository.save(shipment);

        eventPublisher.publishEvent(new ShipmentStatusUpdatedEvent(
                order.getId(),
                order.getBuyerId(),
                order.getSupplierId(),
                updated.getShipmentStatus().name(),
                updated.getCarrier(),
                updated.getTrackingNumber()
        ));

        return new ShipmentResponse(
                updated.getId(),
                updated.getCarrier(),
                updated.getTrackingNumber(),
                updated.getShipmentStatus(),
                updated.getDispatchDate(),
                updated.getEstimatedDeliveryDate(),
                updated.getShippedAt(),
                updated.getDeliveredAt(),
                updated.getDeliveryNotes()
        );
    }

    public PurchaseOrderResponse confirmReceiptBuyerOrder(UUID orderId, Authentication authentication) {
        String email = authentication.getName();
        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        PurchaseOrder order = purchaseOrderRepository.findByIdAndBuyerId(orderId, buyer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.SHIPPED && order.getStatus() != OrderStatus.DISPATCHED && order.getStatus() != OrderStatus.IN_TRANSIT) {
            throw new IllegalStateException("Cannot confirm receipt for order in status: " + order.getStatus() + ". Order must be SHIPPED, DISPATCHED, or IN_TRANSIT.");
        }

        LocalDateTime deliveredTime = LocalDateTime.now();
        order.setStatus(OrderStatus.DELIVERED);
        order.setDeliveredAt(deliveredTime);
        PurchaseOrder updated = purchaseOrderRepository.save(order);

        shipmentRepository.findByPurchaseOrderId(orderId).ifPresent(s -> {
            s.setShipmentStatus(ShipmentStatus.DELIVERED);
            s.setDeliveredAt(deliveredTime);
            shipmentRepository.save(s);
        });

        if (auditService != null) {
            auditService.recordUserAction(
                    buyer,
                    com.kemkendra.admin.audit.AuditAction.ORDER_RECEIPT_CONFIRMED,
                    com.kemkendra.admin.audit.AuditTargetType.PURCHASE_ORDER,
                    updated.getId().toString(),
                    "Buyer confirmed receipt for Order " + updated.getPoNumber()
            );
        }

        eventPublisher.publishEvent(new OrderReceiptConfirmedEvent(
                updated.getId(),
                updated.getBuyerId(),
                updated.getSupplierId()
        ));

        return mapToResponse(updated);
    }

    public PurchaseOrderResponse markOrderDeliveredSupplier(UUID orderId, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Supplier supplier = supplierRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier profile not found"));

        PurchaseOrder order = purchaseOrderRepository.findByIdAndSupplierId(orderId, supplier.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.SHIPPED && order.getStatus() != OrderStatus.DISPATCHED && order.getStatus() != OrderStatus.IN_TRANSIT) {
            throw new IllegalStateException("Cannot mark delivered order in status: " + order.getStatus() + ". Order must be SHIPPED, DISPATCHED, or IN_TRANSIT.");
        }

        if (shipmentRepository.findByPurchaseOrderId(orderId).isEmpty()) {
            throw new IllegalStateException("Cannot mark delivered: Shipment record not found for this order");
        }

        LocalDateTime deliveredTime = LocalDateTime.now();
        order.setStatus(OrderStatus.DELIVERED);
        order.setDeliveredAt(deliveredTime);
        PurchaseOrder updated = purchaseOrderRepository.save(order);

        shipmentRepository.findByPurchaseOrderId(orderId).ifPresent(s -> {
            s.setShipmentStatus(ShipmentStatus.DELIVERED);
            s.setDeliveredAt(deliveredTime);
            shipmentRepository.save(s);
        });

        if (auditService != null) {
            auditService.recordUserAction(
                    user,
                    com.kemkendra.admin.audit.AuditAction.PO_DELIVERED,
                    com.kemkendra.admin.audit.AuditTargetType.PURCHASE_ORDER,
                    updated.getId().toString(),
                    "Supplier recorded delivery for Order " + updated.getPoNumber()
            );
        }

        eventPublisher.publishEvent(new OrderDeliveredEvent(
                updated.getId(),
                updated.getBuyerId(),
                updated.getSupplierId()
        ));

        return mapToResponse(updated);
    }

    public PurchaseOrderResponse completeOrder(UUID orderId, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Supplier supplier = supplierRepository.findByUser(user).orElse(null);
        boolean isBuyer = order.getBuyerId().equals(user.getId());
        boolean isSupplier = supplier != null && order.getSupplierId().equals(supplier.getId());

        if (!isBuyer && !isSupplier) {
            throw new ResourceNotFoundException("Order not found");
        }

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new IllegalStateException("Cannot complete order in status: " + order.getStatus() + ". Order must be DELIVERED first.");
        }

        order.setStatus(OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());
        PurchaseOrder updated = purchaseOrderRepository.save(order);

        if (auditService != null) {
            auditService.recordUserAction(
                    user,
                    com.kemkendra.admin.audit.AuditAction.PO_COMPLETED,
                    com.kemkendra.admin.audit.AuditTargetType.PURCHASE_ORDER,
                    updated.getId().toString(),
                    "Order " + updated.getPoNumber() + " completed"
            );
        }

        eventPublisher.publishEvent(new OrderCompletedEvent(
                updated.getId(),
                updated.getBuyerId(),
                updated.getSupplierId(),
                user.getId()
        ));

        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public ShipmentResponse getShipment(UUID orderId, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Supplier supplier = supplierRepository.findByUser(user).orElse(null);
        boolean isBuyer = order.getBuyerId().equals(user.getId());
        boolean isSupplier = supplier != null && order.getSupplierId().equals(supplier.getId());

        if (!isBuyer && !isSupplier) {
            throw new ResourceNotFoundException("Order not found");
        }

        Shipment shipment = shipmentRepository.findByPurchaseOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found for this order"));

        return new ShipmentResponse(
                shipment.getId(),
                shipment.getCarrier(),
                shipment.getTrackingNumber(),
                shipment.getShipmentStatus(),
                shipment.getDispatchDate(),
                shipment.getEstimatedDeliveryDate(),
                shipment.getShippedAt(),
                shipment.getDeliveredAt(),
                shipment.getDeliveryNotes()
        );
    }

    @Transactional(readOnly = true)
    public List<OrderTimelineEventDto> getOrderTimeline(UUID orderId, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Supplier supplier = supplierRepository.findByUser(user).orElse(null);
        boolean isBuyer = order.getBuyerId().equals(user.getId());
        boolean isSupplier = supplier != null && order.getSupplierId().equals(supplier.getId());
        boolean isAdmin = user.getRole() == com.kemkendra.identity.UserRole.ADMIN;

        if (!isBuyer && !isSupplier && !isAdmin) {
            throw new ResourceNotFoundException("Order not found");
        }

        List<OrderTimelineEventDto> timeline = new ArrayList<>();

        // 1. Quotation Accepted
        timeline.add(new OrderTimelineEventDto(
                "QUOTATION_ACCEPTED",
                "Quotation Accepted",
                "Buyer accepted quotation v" + (order.getQuotationVersion() != null ? order.getQuotationVersion() : 1),
                "BUYER",
                "Buyer",
                order.getPlacedAt(),
                true,
                false
        ));

        // 2. Order Placed / Created
        boolean isPlacedCurrent = order.getStatus() == OrderStatus.PLACED || order.getStatus() == OrderStatus.PENDING_CONFIRMATION;
        timeline.add(new OrderTimelineEventDto(
                "ORDER_CREATED",
                "Order Created",
                "Purchase order " + order.getPoNumber() + " issued to supplier",
                "BUYER",
                "Buyer",
                order.getPlacedAt(),
                true,
                isPlacedCurrent
        ));

        // 3. Order Confirmed
        if (order.getConfirmedAt() != null) {
            boolean isConfirmedCurrent = order.getStatus() == OrderStatus.CONFIRMED;
            timeline.add(new OrderTimelineEventDto(
                    "ORDER_CONFIRMED",
                    "Order Confirmed",
                    "Supplier confirmed purchase order execution",
                    "SUPPLIER",
                    order.getConfirmedBy() != null ? order.getConfirmedBy() : "Supplier",
                    order.getConfirmedAt(),
                    true,
                    isConfirmedCurrent
            ));
        }

        // 4. Processing Started
        if (order.getProcessingAt() != null) {
            boolean isProcessingCurrent = order.getStatus() == OrderStatus.PROCESSING;
            timeline.add(new OrderTimelineEventDto(
                    "PROCESSING_STARTED",
                    "Processing Started",
                    "Batch preparation and quality control in progress",
                    "SUPPLIER",
                    "Supplier",
                    order.getProcessingAt(),
                    true,
                    isProcessingCurrent
            ));
        }

        // 5. Ready for Dispatch
        if (order.getReadyForDispatchAt() != null) {
            boolean isReadyCurrent = order.getStatus() == OrderStatus.READY_FOR_DISPATCH;
            timeline.add(new OrderTimelineEventDto(
                    "READY_FOR_DISPATCH",
                    "Ready for Dispatch",
                    "Consignment packaged and prepared for shipping handover",
                    "SUPPLIER",
                    "Supplier",
                    order.getReadyForDispatchAt(),
                    true,
                    isReadyCurrent
            ));
        }

        // 6. Dispatched
        if (order.getShippedAt() != null) {
            boolean isDispatchedCurrent = order.getStatus() == OrderStatus.DISPATCHED || order.getStatus() == OrderStatus.SHIPPED;
            Shipment shipment = shipmentRepository.findByPurchaseOrderId(order.getId()).orElse(null);
            String desc = "Consignment handed over to logistics carrier";
            if (shipment != null && shipment.getTrackingNumber() != null) {
                desc += " (Tracking: " + shipment.getTrackingNumber() + (shipment.getCarrier() != null ? ", Carrier: " + shipment.getCarrier() : "") + ")";
            }
            timeline.add(new OrderTimelineEventDto(
                    "DISPATCHED",
                    "Dispatched",
                    desc,
                    "SUPPLIER",
                    "Supplier",
                    order.getShippedAt(),
                    true,
                    isDispatchedCurrent
            ));
        }

        // 7. In Transit
        if (order.getInTransitAt() != null) {
            boolean isInTransitCurrent = order.getStatus() == OrderStatus.IN_TRANSIT;
            timeline.add(new OrderTimelineEventDto(
                    "IN_TRANSIT",
                    "In Transit",
                    "Consignment en route to delivery destination",
                    "SUPPLIER",
                    "Supplier",
                    order.getInTransitAt(),
                    true,
                    isInTransitCurrent
            ));
        }

        // 8. Delivered
        if (order.getDeliveredAt() != null) {
            boolean isDeliveredCurrent = order.getStatus() == OrderStatus.DELIVERED;
            timeline.add(new OrderTimelineEventDto(
                    "DELIVERED",
                    "Delivered",
                    "Consignment arrival recorded and acknowledged",
                    "SYSTEM",
                    "Delivery",
                    order.getDeliveredAt(),
                    true,
                    isDeliveredCurrent
            ));
        }

        // 9. Completed
        if (order.getCompletedAt() != null) {
            timeline.add(new OrderTimelineEventDto(
                    "COMPLETED",
                    "Completed",
                    "Order settled and commercially finalized",
                    "SYSTEM",
                    "System",
                    order.getCompletedAt(),
                    true,
                    order.getStatus() == OrderStatus.COMPLETED
            ));
        }

        // 10. Cancelled
        if (order.getCancelledAt() != null) {
            timeline.add(new OrderTimelineEventDto(
                    "CANCELLED",
                    "Order Cancelled",
                    "Order cancelled. Reason: " + (order.getCancellationReason() != null ? order.getCancellationReason() : "None stated"),
                    "USER",
                    order.getCancelledBy() != null ? order.getCancelledBy() : "User",
                    order.getCancelledAt(),
                    true,
                    true
            ));
        }

        // 11. Disputed
        if (order.getDisputedAt() != null || order.getStatus() == OrderStatus.DISPUTED) {
            LocalDateTime dispTime = order.getDisputedAt() != null ? order.getDisputedAt() : LocalDateTime.now();
            timeline.add(new OrderTimelineEventDto(
                    "DISPUTED",
                    "Order Disputed",
                    "Dispute raised regarding order fulfillment or invoice",
                    "USER",
                    order.getDisputedBy() != null ? order.getDisputedBy() : "Party",
                    dispTime,
                    true,
                    true
            ));
        }

        return timeline;
    }

    @Transactional(readOnly = true)
    public OrderInvoiceSummaryDto getOrderInvoiceSummary(UUID orderId, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Supplier supplier = supplierRepository.findByUser(user).orElse(null);
        boolean isBuyer = order.getBuyerId().equals(user.getId());
        boolean isSupplier = supplier != null && order.getSupplierId().equals(supplier.getId());
        boolean isAdmin = user.getRole() == com.kemkendra.identity.UserRole.ADMIN;

        if (!isBuyer && !isSupplier && !isAdmin) {
            throw new ResourceNotFoundException("Order not found");
        }

        if (invoiceRepository == null) {
            return OrderInvoiceSummaryDto.noInvoice(order.getId(), order.getPoNumber());
        }

        List<com.kemkendra.invoice.Invoice> invoices = invoiceRepository.findByPurchaseOrderId(orderId);
        if (invoices.isEmpty()) {
            return OrderInvoiceSummaryDto.noInvoice(order.getId(), order.getPoNumber());
        }

        com.kemkendra.invoice.Invoice invoice = invoices.get(0);
        BigDecimal amountDue = invoice.getAmountDue() != null ? invoice.getAmountDue() : invoice.getGrandTotal().subtract(invoice.getAmountPaid());

        boolean hasProof = false;
        UUID latestRecordId = null;
        String proofKey = null;

        if (paymentRecordRepository != null) {
            List<com.kemkendra.invoice.InvoicePaymentRecord> records = paymentRecordRepository.findByInvoiceIdOrderByCreatedAtDesc(invoice.getId());
            if (!records.isEmpty()) {
                com.kemkendra.invoice.InvoicePaymentRecord latest = records.get(0);
                latestRecordId = latest.getId();
                proofKey = latest.getProofStorageKey();
                hasProof = proofKey != null && !proofKey.isBlank();
            }
        }

        return new OrderInvoiceSummaryDto(
                order.getId(),
                order.getPoNumber(),
                true,
                invoice.getId(),
                invoice.getInvoiceNumber(),
                invoice.getStatus() != null ? invoice.getStatus().name() : "ISSUED",
                invoice.getInvoiceDate(),
                invoice.getDueDate(),
                invoice.getCurrency() != null ? invoice.getCurrency() : order.getCurrency(),
                invoice.getGrandTotal(),
                invoice.getAmountPaid(),
                amountDue,
                invoice.getPaymentStatus() != null ? invoice.getPaymentStatus().name() : "PENDING",
                hasProof,
                latestRecordId,
                proofKey,
                true
        );
    }

    @Transactional(readOnly = true)
    public PurchaseOrderResponse getOrderByRfqId(UUID rfqId, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        PurchaseOrder order = purchaseOrderRepository.findByRfqId(rfqId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found for RFQ"));

        // Verify authorization: must be either the buyer, assigned supplier, or admin
        Supplier supplier = supplierRepository.findByUser(user).orElse(null);
        boolean isBuyer = order.getBuyerId().equals(user.getId());
        boolean isSupplier = supplier != null && order.getSupplierId().equals(supplier.getId());
        boolean isAdmin = user.getRole() == com.kemkendra.identity.UserRole.ADMIN;

        if (!isBuyer && !isSupplier && !isAdmin) {
            throw new ResourceNotFoundException("Order not found for RFQ");
        }

        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrderResponse> getAllOrdersAdmin(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole() != com.kemkendra.identity.UserRole.ADMIN) {
            throw new ResourceNotFoundException("Orders not found");
        }
        return purchaseOrderRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public PurchaseOrderResponse mapToResponse(PurchaseOrder po) {
        return new PurchaseOrderResponse(
                po.getId(),
                po.getPoNumber(),
                po.getRfqId(),
                po.getQuotationId(),
                po.getBuyerId(),
                po.getSupplierId(),
                po.getProductId(),
                po.getMasterProductId(),
                po.getMasterProductCode(),
                po.getSupplierOfferingId(),
                po.getRfqReference(),
                po.getQuotationReference(),
                po.getQuotationVersion(),
                po.getProductName(),
                po.getPurity(),
                po.getGrade(),
                po.getPackaging(),
                po.getQuantity(),
                po.getUnit(),
                po.getUnitPrice(),
                po.getSubtotal(),
                po.getTaxAmount(),
                po.getTotalAmount(),
                po.getCurrency(),
                po.getAgreedLeadTimeDays(),
                po.getExpectedDeliveryDate(),
                po.getPaymentTerms(),
                po.getDeliveryTerms(),
                po.getIncoterms(),
                po.getShippingAddress(),
                po.getBillingContact(),
                po.getNotes(),
                po.getStatus(),
                po.getPlacedAt(),
                po.getConfirmedAt(),
                po.getConfirmedBy(),
                po.getProcessingAt(),
                po.getReadyForDispatchAt(),
                po.getShippedAt(),
                po.getInTransitAt(),
                po.getDeliveredAt(),
                po.getCompletedAt(),
                po.getRejectedAt(),
                po.getRejectedBy(),
                po.getRejectionReason(),
                po.getCancelledAt(),
                po.getCancelledBy(),
                po.getCancellationReason(),
                po.getDisputedAt(),
                po.getDisputedBy(),
                po.getDisputeId(),
                po.getCreatedAt(),
                po.getUpdatedAt()
        );
    }
}
