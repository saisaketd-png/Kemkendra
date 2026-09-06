package com.kemkendra.invoice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoicePaymentRecordRepository extends JpaRepository<InvoicePaymentRecord, UUID> {

    List<InvoicePaymentRecord> findByInvoiceIdOrderByCreatedAtDesc(UUID invoiceId);

    List<InvoicePaymentRecord> findByInvoiceId(UUID invoiceId);

    List<InvoicePaymentRecord> findByPurchaseOrderId(UUID purchaseOrderId);

    Optional<InvoicePaymentRecord> findByPaymentReference(String paymentReference);

    Optional<InvoicePaymentRecord> findByIdAndBuyerId(UUID id, UUID buyerId);

    Optional<InvoicePaymentRecord> findByIdAndSupplierId(UUID id, Long supplierId);

    Page<InvoicePaymentRecord> findByBuyerId(UUID buyerId, Pageable pageable);

    Page<InvoicePaymentRecord> findBySupplierId(Long supplierId, Pageable pageable);
}
