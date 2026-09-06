package com.kemkendra.invoice;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "invoice_number", nullable = false, unique = true, length = 50)
    private String invoiceNumber;

    @Column(name = "financial_year", nullable = false, length = 10)
    private String financialYear;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private InvoiceStatus status = InvoiceStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    // Reference linkage
    @Column(name = "purchase_order_id")
    private UUID purchaseOrderId;

    @Column(name = "po_number", length = 50)
    private String poNumber;

    @Column(name = "rfq_id")
    private UUID rfqId;

    @Column(name = "rfq_reference", length = 50)
    private String rfqReference;

    @Column(name = "quotation_id")
    private UUID quotationId;

    @Column(name = "quotation_reference", length = 50)
    private String quotationReference;

    // Supplier snapshot
    @Column(name = "supplier_id", nullable = false)
    private Long supplierId;

    @Column(name = "supplier_user_id")
    private UUID supplierUserId;

    @Column(name = "supplier_legal_name", nullable = false)
    private String supplierLegalName;

    @Column(name = "supplier_trade_name")
    private String supplierTradeName;

    @Column(name = "supplier_gstin", length = 15)
    private String supplierGstin;

    @Column(name = "supplier_pan", length = 10)
    private String supplierPan;

    @Column(name = "supplier_address", nullable = false, columnDefinition = "TEXT")
    private String supplierAddress;

    @Column(name = "supplier_city", length = 100)
    private String supplierCity;

    @Column(name = "supplier_state", nullable = false, length = 100)
    private String supplierState;

    @Column(name = "supplier_state_code", nullable = false, length = 2)
    private String supplierStateCode;

    @Column(name = "supplier_postal_code", length = 20)
    private String supplierPostalCode;

    @Column(name = "supplier_email")
    private String supplierEmail;

    @Column(name = "supplier_phone", length = 50)
    private String supplierPhone;

    // Buyer snapshot
    @Column(name = "buyer_id", nullable = false)
    private UUID buyerId;

    @Column(name = "buyer_legal_name", nullable = false)
    private String buyerLegalName;

    @Column(name = "buyer_trade_name")
    private String buyerTradeName;

    @Column(name = "buyer_gstin", length = 15)
    private String buyerGstin;

    @Column(name = "buyer_pan", length = 10)
    private String buyerPan;

    @Column(name = "buyer_billing_address", nullable = false, columnDefinition = "TEXT")
    private String buyerBillingAddress;

    @Column(name = "buyer_shipping_address", nullable = false, columnDefinition = "TEXT")
    private String buyerShippingAddress;

    @Column(name = "buyer_city", length = 100)
    private String buyerCity;

    @Column(name = "buyer_state", nullable = false, length = 100)
    private String buyerState;

    @Column(name = "buyer_state_code", nullable = false, length = 2)
    private String buyerStateCode;

    @Column(name = "buyer_postal_code", length = 20)
    private String buyerPostalCode;

    @Column(name = "buyer_email")
    private String buyerEmail;

    @Column(name = "buyer_phone", length = 50)
    private String buyerPhone;

    // Supply & GST Determination
    @Column(name = "is_interstate", nullable = false)
    private Boolean isInterstate = false;

    @Column(name = "place_of_supply_state_code", nullable = false, length = 2)
    private String placeOfSupplyStateCode;

    @Column(name = "place_of_supply_state", nullable = false, length = 100)
    private String placeOfSupplyState;

    @Column(nullable = false, length = 10)
    private String currency = "INR";

    // Monetary Totals
    @Column(name = "taxable_amount", nullable = false, precision = 18, scale = 4)
    private BigDecimal taxableAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", nullable = false, precision = 18, scale = 4)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "additional_charges", nullable = false, precision = 18, scale = 4)
    private BigDecimal additionalCharges = BigDecimal.ZERO;

    @Column(name = "cgst_amount", nullable = false, precision = 18, scale = 4)
    private BigDecimal cgstAmount = BigDecimal.ZERO;

    @Column(name = "sgst_amount", nullable = false, precision = 18, scale = 4)
    private BigDecimal sgstAmount = BigDecimal.ZERO;

    @Column(name = "igst_amount", nullable = false, precision = 18, scale = 4)
    private BigDecimal igstAmount = BigDecimal.ZERO;

    @Column(name = "total_tax_amount", nullable = false, precision = 18, scale = 4)
    private BigDecimal totalTaxAmount = BigDecimal.ZERO;

    @Column(name = "grand_total", nullable = false, precision = 18, scale = 4)
    private BigDecimal grandTotal = BigDecimal.ZERO;

    @Column(name = "amount_paid", nullable = false, precision = 18, scale = 4)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "amount_due", nullable = false, precision = 18, scale = 4)
    private BigDecimal amountDue = BigDecimal.ZERO;

    // Revisions & Controls
    @Column(nullable = false)
    private Integer version = 1;

    @Column(name = "original_invoice_id")
    private UUID originalInvoiceId;

    @Column(name = "revised_invoice_id")
    private UUID revisedInvoiceId;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "dispute_reason", columnDefinition = "TEXT")
    private String disputeReason;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "terms_and_conditions", columnDefinition = "TEXT")
    private String termsAndConditions;

    @Column(name = "issued_at")
    private LocalDateTime issuedAt;

    @Column(name = "issued_by", length = 100)
    private String issuedBy;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancelled_by", length = 100)
    private String cancelledBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<InvoiceItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<InvoicePaymentRecord> paymentRecords = new ArrayList<>();

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<InvoiceAudit> audits = new ArrayList<>();

    public Invoice() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public String getFinancialYear() {
        return financialYear;
    }

    public void setFinancialYear(String financialYear) {
        this.financialYear = financialYear;
    }

    public LocalDate getInvoiceDate() {
        return invoiceDate;
    }

    public void setInvoiceDate(LocalDate invoiceDate) {
        this.invoiceDate = invoiceDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public InvoiceStatus getStatus() {
        return status;
    }

    public void setStatus(InvoiceStatus status) {
        this.status = status;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public UUID getPurchaseOrderId() {
        return purchaseOrderId;
    }

    public void setPurchaseOrderId(UUID purchaseOrderId) {
        this.purchaseOrderId = purchaseOrderId;
    }

    public String getPoNumber() {
        return poNumber;
    }

    public void setPoNumber(String poNumber) {
        this.poNumber = poNumber;
    }

    public UUID getRfqId() {
        return rfqId;
    }

    public void setRfqId(UUID rfqId) {
        this.rfqId = rfqId;
    }

    public String getRfqReference() {
        return rfqReference;
    }

    public void setRfqReference(String rfqReference) {
        this.rfqReference = rfqReference;
    }

    public UUID getQuotationId() {
        return quotationId;
    }

    public void setQuotationId(UUID quotationId) {
        this.quotationId = quotationId;
    }

    public String getQuotationReference() {
        return quotationReference;
    }

    public void setQuotationReference(String quotationReference) {
        this.quotationReference = quotationReference;
    }

    public Long getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Long supplierId) {
        this.supplierId = supplierId;
    }

    public UUID getSupplierUserId() {
        return supplierUserId;
    }

    public void setSupplierUserId(UUID supplierUserId) {
        this.supplierUserId = supplierUserId;
    }

    public String getSupplierLegalName() {
        return supplierLegalName;
    }

    public void setSupplierLegalName(String supplierLegalName) {
        this.supplierLegalName = supplierLegalName;
    }

    public String getSupplierTradeName() {
        return supplierTradeName;
    }

    public void setSupplierTradeName(String supplierTradeName) {
        this.supplierTradeName = supplierTradeName;
    }

    public String getSupplierGstin() {
        return supplierGstin;
    }

    public void setSupplierGstin(String supplierGstin) {
        this.supplierGstin = supplierGstin;
    }

    public String getSupplierPan() {
        return supplierPan;
    }

    public void setSupplierPan(String supplierPan) {
        this.supplierPan = supplierPan;
    }

    public String getSupplierAddress() {
        return supplierAddress;
    }

    public void setSupplierAddress(String supplierAddress) {
        this.supplierAddress = supplierAddress;
    }

    public String getSupplierCity() {
        return supplierCity;
    }

    public void setSupplierCity(String supplierCity) {
        this.supplierCity = supplierCity;
    }

    public String getSupplierState() {
        return supplierState;
    }

    public void setSupplierState(String supplierState) {
        this.supplierState = supplierState;
    }

    public String getSupplierStateCode() {
        return supplierStateCode;
    }

    public void setSupplierStateCode(String supplierStateCode) {
        this.supplierStateCode = supplierStateCode;
    }

    public String getSupplierPostalCode() {
        return supplierPostalCode;
    }

    public void setSupplierPostalCode(String supplierPostalCode) {
        this.supplierPostalCode = supplierPostalCode;
    }

    public String getSupplierEmail() {
        return supplierEmail;
    }

    public void setSupplierEmail(String supplierEmail) {
        this.supplierEmail = supplierEmail;
    }

    public String getSupplierPhone() {
        return supplierPhone;
    }

    public void setSupplierPhone(String supplierPhone) {
        this.supplierPhone = supplierPhone;
    }

    public UUID getBuyerId() {
        return buyerId;
    }

    public void setBuyerId(UUID buyerId) {
        this.buyerId = buyerId;
    }

    public String getBuyerLegalName() {
        return buyerLegalName;
    }

    public void setBuyerLegalName(String buyerLegalName) {
        this.buyerLegalName = buyerLegalName;
    }

    public String getBuyerTradeName() {
        return buyerTradeName;
    }

    public void setBuyerTradeName(String buyerTradeName) {
        this.buyerTradeName = buyerTradeName;
    }

    public String getBuyerGstin() {
        return buyerGstin;
    }

    public void setBuyerGstin(String buyerGstin) {
        this.buyerGstin = buyerGstin;
    }

    public String getBuyerPan() {
        return buyerPan;
    }

    public void setBuyerPan(String buyerPan) {
        this.buyerPan = buyerPan;
    }

    public String getBuyerBillingAddress() {
        return buyerBillingAddress;
    }

    public void setBuyerBillingAddress(String buyerBillingAddress) {
        this.buyerBillingAddress = buyerBillingAddress;
    }

    public String getBuyerShippingAddress() {
        return buyerShippingAddress;
    }

    public void setBuyerShippingAddress(String buyerShippingAddress) {
        this.buyerShippingAddress = buyerShippingAddress;
    }

    public String getBuyerCity() {
        return buyerCity;
    }

    public void setBuyerCity(String buyerCity) {
        this.buyerCity = buyerCity;
    }

    public String getBuyerState() {
        return buyerState;
    }

    public void setBuyerState(String buyerState) {
        this.buyerState = buyerState;
    }

    public String getBuyerStateCode() {
        return buyerStateCode;
    }

    public void setBuyerStateCode(String buyerStateCode) {
        this.buyerStateCode = buyerStateCode;
    }

    public String getBuyerPostalCode() {
        return buyerPostalCode;
    }

    public void setBuyerPostalCode(String buyerPostalCode) {
        this.buyerPostalCode = buyerPostalCode;
    }

    public String getBuyerEmail() {
        return buyerEmail;
    }

    public void setBuyerEmail(String buyerEmail) {
        this.buyerEmail = buyerEmail;
    }

    public String getBuyerPhone() {
        return buyerPhone;
    }

    public void setBuyerPhone(String buyerPhone) {
        this.buyerPhone = buyerPhone;
    }

    public Boolean getIsInterstate() {
        return isInterstate;
    }

    public void setIsInterstate(Boolean interstate) {
        isInterstate = interstate;
    }

    public String getPlaceOfSupplyStateCode() {
        return placeOfSupplyStateCode;
    }

    public void setPlaceOfSupplyStateCode(String placeOfSupplyStateCode) {
        this.placeOfSupplyStateCode = placeOfSupplyStateCode;
    }

    public String getPlaceOfSupplyState() {
        return placeOfSupplyState;
    }

    public void setPlaceOfSupplyState(String placeOfSupplyState) {
        this.placeOfSupplyState = placeOfSupplyState;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public BigDecimal getTaxableAmount() {
        return taxableAmount;
    }

    public void setTaxableAmount(BigDecimal taxableAmount) {
        this.taxableAmount = taxableAmount;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getAdditionalCharges() {
        return additionalCharges;
    }

    public void setAdditionalCharges(BigDecimal additionalCharges) {
        this.additionalCharges = additionalCharges;
    }

    public BigDecimal getCgstAmount() {
        return cgstAmount;
    }

    public void setCgstAmount(BigDecimal cgstAmount) {
        this.cgstAmount = cgstAmount;
    }

    public BigDecimal getSgstAmount() {
        return sgstAmount;
    }

    public void setSgstAmount(BigDecimal sgstAmount) {
        this.sgstAmount = sgstAmount;
    }

    public BigDecimal getIgstAmount() {
        return igstAmount;
    }

    public void setIgstAmount(BigDecimal igstAmount) {
        this.igstAmount = igstAmount;
    }

    public BigDecimal getTotalTaxAmount() {
        return totalTaxAmount;
    }

    public void setTotalTaxAmount(BigDecimal totalTaxAmount) {
        this.totalTaxAmount = totalTaxAmount;
    }

    public BigDecimal getGrandTotal() {
        return grandTotal;
    }

    public void setGrandTotal(BigDecimal grandTotal) {
        this.grandTotal = grandTotal;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
    }

    public BigDecimal getAmountDue() {
        return amountDue;
    }

    public void setAmountDue(BigDecimal amountDue) {
        this.amountDue = amountDue;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public UUID getOriginalInvoiceId() {
        return originalInvoiceId;
    }

    public void setOriginalInvoiceId(UUID originalInvoiceId) {
        this.originalInvoiceId = originalInvoiceId;
    }

    public UUID getRevisedInvoiceId() {
        return revisedInvoiceId;
    }

    public void setRevisedInvoiceId(UUID revisedInvoiceId) {
        this.revisedInvoiceId = revisedInvoiceId;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public String getDisputeReason() {
        return disputeReason;
    }

    public void setDisputeReason(String disputeReason) {
        this.disputeReason = disputeReason;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getTermsAndConditions() {
        return termsAndConditions;
    }

    public void setTermsAndConditions(String termsAndConditions) {
        this.termsAndConditions = termsAndConditions;
    }

    public LocalDateTime getIssuedAt() {
        return issuedAt;
    }

    public void setIssuedAt(LocalDateTime issuedAt) {
        this.issuedAt = issuedAt;
    }

    public String getIssuedBy() {
        return issuedBy;
    }

    public void setIssuedBy(String issuedBy) {
        this.issuedBy = issuedBy;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public String getCancelledBy() {
        return cancelledBy;
    }

    public void setCancelledBy(String cancelledBy) {
        this.cancelledBy = cancelledBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<InvoiceItem> getItems() {
        return items;
    }

    public void setItems(List<InvoiceItem> items) {
        this.items = items;
    }

    public void addItem(InvoiceItem item) {
        items.add(item);
        item.setInvoice(this);
    }

    public List<InvoicePaymentRecord> getPaymentRecords() {
        return paymentRecords;
    }

    public void setPaymentRecords(List<InvoicePaymentRecord> paymentRecords) {
        this.paymentRecords = paymentRecords;
    }

    public void addPaymentRecord(InvoicePaymentRecord record) {
        paymentRecords.add(record);
        record.setInvoice(this);
    }

    public List<InvoiceAudit> getAudits() {
        return audits;
    }

    public void setAudits(List<InvoiceAudit> audits) {
        this.audits = audits;
    }

    public void addAudit(InvoiceAudit audit) {
        audits.add(audit);
        audit.setInvoice(this);
    }
}
