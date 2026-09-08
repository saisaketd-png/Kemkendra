package com.kemkendra.invoice;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class InvoicePdfGeneratorTest {

    @Test
    @DisplayName("Should generate valid non-empty PDF bytes starting with %PDF- header")
    void testGenerateInvoicePdf() {
        InvoicePdfGenerator generator = new InvoicePdfGenerator();

        Invoice invoice = new Invoice();
        invoice.setId(UUID.randomUUID());
        invoice.setInvoiceNumber("KK/2026-27/00001");
        invoice.setFinancialYear("2026-27");
        invoice.setInvoiceDate(LocalDate.now());
        invoice.setDueDate(LocalDate.now().plusDays(30));
        invoice.setStatus(InvoiceStatus.ISSUED);
        invoice.setPaymentStatus(PaymentStatus.PENDING);
        invoice.setPoNumber("PO-20260901-001");
        invoice.setRfqReference("RFQ-2026-001");

        invoice.setSupplierId(101L);
        invoice.setSupplierLegalName("Apex Chemical Industries Pvt Ltd");
        invoice.setSupplierTradeName("Apex Chem");
        invoice.setSupplierGstin("27AAAAA0000A1Z5");
        invoice.setSupplierPan("AAAAA0000A");
        invoice.setSupplierAddress("MIDC Phase II, Tarapur");
        invoice.setSupplierCity("Palghar");
        invoice.setSupplierState("Maharashtra");
        invoice.setSupplierStateCode("27");
        invoice.setSupplierPostalCode("401506");

        invoice.setBuyerId(UUID.randomUUID());
        invoice.setBuyerLegalName("Zenith Pharma Ltd");
        invoice.setBuyerGstin("24ABCDE1234F1Z5");
        invoice.setBuyerBillingAddress("GIDC Estate, Ankleshwar");
        invoice.setBuyerShippingAddress("GIDC Estate, Ankleshwar");
        invoice.setBuyerCity("Bharuch");
        invoice.setBuyerState("Gujarat");
        invoice.setBuyerStateCode("24");
        invoice.setBuyerPostalCode("393002");

        invoice.setIsInterstate(true);
        invoice.setPlaceOfSupplyState("Gujarat");
        invoice.setPlaceOfSupplyStateCode("24");
        invoice.setCurrency("INR");

        InvoiceItem item = new InvoiceItem();
        item.setItemNumber(1);
        item.setProductName("High Purity Benzene");
        item.setHsnCode("2901");
        item.setQuantity(new BigDecimal("10.00"));
        item.setUnit("MT");
        item.setUnitPrice(new BigDecimal("85000.0000"));
        item.setTaxableValue(new BigDecimal("850000.0000"));
        item.setGstRate(new BigDecimal("18.00"));
        item.setIgstRate(new BigDecimal("18.00"));
        item.setIgstAmount(new BigDecimal("153000.0000"));
        item.setTotalAmount(new BigDecimal("1003000.0000"));
        invoice.addItem(item);

        invoice.setTaxableAmount(new BigDecimal("850000.0000"));
        invoice.setIgstAmount(new BigDecimal("153000.0000"));
        invoice.setTotalTaxAmount(new BigDecimal("153000.0000"));
        invoice.setGrandTotal(new BigDecimal("1003000.0000"));
        invoice.setAmountPaid(BigDecimal.ZERO);
        invoice.setAmountDue(new BigDecimal("1003000.0000"));
        invoice.setCreatedAt(LocalDateTime.now());

        byte[] pdf = generator.generateInvoicePdf(invoice);

        assertThat(pdf).isNotNull();
        assertThat(pdf.length).isGreaterThan(100);

        // Verify PDF magic bytes "%PDF-"
        String header = new String(pdf, 0, 5);
        assertThat(header).isEqualTo("%PDF-");
    }
}
