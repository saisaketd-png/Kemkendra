package com.kemkendra.invoice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID>, JpaSpecificationExecutor<Invoice> {

    Page<Invoice> findByStatus(InvoiceStatus status, Pageable pageable);

    Optional<Invoice> findByIdAndBuyerId(UUID id, UUID buyerId);

    Optional<Invoice> findByIdAndSupplierId(UUID id, Long supplierId);

    Page<Invoice> findByBuyerId(UUID buyerId, Pageable pageable);

    Page<Invoice> findBySupplierId(Long supplierId, Pageable pageable);

    Page<Invoice> findByBuyerIdAndStatus(UUID buyerId, InvoiceStatus status, Pageable pageable);

    Page<Invoice> findBySupplierIdAndStatus(Long supplierId, InvoiceStatus status, Pageable pageable);

    List<Invoice> findByPurchaseOrderId(UUID purchaseOrderId);

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    long countByBuyerId(UUID buyerId);

    long countBySupplierId(Long supplierId);

    long countByBuyerIdAndStatus(UUID buyerId, InvoiceStatus status);

    long countBySupplierIdAndStatus(Long supplierId, InvoiceStatus status);

    long countByBuyerIdAndPaymentStatus(UUID buyerId, PaymentStatus paymentStatus);

    long countBySupplierIdAndPaymentStatus(Long supplierId, PaymentStatus paymentStatus);

    List<Invoice> findTop5ByBuyerIdOrderByCreatedAtDesc(UUID buyerId);

    List<Invoice> findTop5BySupplierIdOrderByCreatedAtDesc(Long supplierId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(i.amountDue), 0) FROM Invoice i WHERE i.buyerId = :buyerId AND i.status != com.kemkendra.invoice.InvoiceStatus.CANCELLED AND i.paymentStatus != com.kemkendra.invoice.PaymentStatus.CONFIRMED")
    java.math.BigDecimal sumOutstandingAmountByBuyerId(@org.springframework.data.repository.query.Param("buyerId") UUID buyerId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(i.amountPaid), 0) FROM Invoice i WHERE i.buyerId = :buyerId")
    java.math.BigDecimal sumPaidAmountByBuyerId(@org.springframework.data.repository.query.Param("buyerId") UUID buyerId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(i.amountDue), 0) FROM Invoice i WHERE i.supplierId = :supplierId AND i.status != com.kemkendra.invoice.InvoiceStatus.CANCELLED AND i.paymentStatus != com.kemkendra.invoice.PaymentStatus.CONFIRMED")
    java.math.BigDecimal sumOutstandingAmountBySupplierId(@org.springframework.data.repository.query.Param("supplierId") Long supplierId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(i.amountPaid), 0) FROM Invoice i WHERE i.supplierId = :supplierId")
    java.math.BigDecimal sumPaidAmountBySupplierId(@org.springframework.data.repository.query.Param("supplierId") Long supplierId);
}
