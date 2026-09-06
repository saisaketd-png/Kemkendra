package com.kemkendra.order.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record OrderInvoiceSummaryDto(
        UUID orderId,
        String poNumber,
        boolean hasInvoice,
        UUID invoiceId,
        String invoiceNumber,
        String invoiceStatus,
        LocalDate invoiceDate,
        LocalDate dueDate,
        String currency,
        BigDecimal totalAmount,
        BigDecimal amountPaid,
        BigDecimal remainingBalance,
        String paymentStatus,
        boolean hasPaymentProof,
        UUID latestPaymentRecordId,
        String latestPaymentProofStorageKey,
        boolean pdfAvailable
) {
    public static OrderInvoiceSummaryDto noInvoice(UUID orderId, String poNumber) {
        return new OrderInvoiceSummaryDto(
                orderId,
                poNumber,
                false,
                null,
                null,
                "NOT_ISSUED",
                null,
                null,
                "INR",
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                "NOT_APPLICABLE",
                false,
                null,
                null,
                false
        );
    }
}
