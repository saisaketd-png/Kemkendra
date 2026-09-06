package com.kemkendra.invoice;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.format.DateTimeFormatter;

@Service
public class InvoicePdfGenerator {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MMM-yyyy");
    private static final DecimalFormat CURRENCY_FORMATTER = new DecimalFormat("#,##0.00");

    private static final Color BRAND_NAVY = new Color(15, 23, 42); // slate-900
    private static final Color BRAND_BLUE = new Color(37, 99, 235); // blue-600
    private static final Color BORDER_GRAY = new Color(226, 232, 240); // slate-200
    private static final Color BG_LIGHT = new Color(248, 250, 252); // slate-50

    public byte[] generateInvoicePdf(Invoice invoice) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BRAND_NAVY);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BRAND_BLUE);
            Font sectionHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BRAND_NAVY);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, BRAND_NAVY);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY);

            // 1. Header Table
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{60, 40});

            PdfPCell leftHeader = new PdfPCell();
            leftHeader.setBorder(Rectangle.NO_BORDER);
            Paragraph brandPara = new Paragraph("KemKendra", titleFont);
            Paragraph subPara = new Paragraph("B2B Chemical Commerce & Marketplace", smallFont);
            Paragraph taxInvoicePara = new Paragraph("TAX INVOICE", subtitleFont);
            taxInvoicePara.setSpacingBefore(8);
            leftHeader.addElement(brandPara);
            leftHeader.addElement(subPara);
            leftHeader.addElement(taxInvoicePara);
            headerTable.addCell(leftHeader);

            PdfPCell rightHeader = new PdfPCell();
            rightHeader.setBorder(Rectangle.NO_BORDER);
            rightHeader.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph invNumPara = new Paragraph("Invoice No: " + invoice.getInvoiceNumber(), boldFont);
            invNumPara.setAlignment(Element.ALIGN_RIGHT);
            Paragraph invDatePara = new Paragraph("Invoice Date: " + (invoice.getInvoiceDate() != null ? invoice.getInvoiceDate().format(DATE_FORMATTER) : "N/A"), normalFont);
            invDatePara.setAlignment(Element.ALIGN_RIGHT);
            Paragraph dueDatePara = new Paragraph("Due Date: " + (invoice.getDueDate() != null ? invoice.getDueDate().format(DATE_FORMATTER) : "N/A"), normalFont);
            dueDatePara.setAlignment(Element.ALIGN_RIGHT);
            Paragraph statusPara = new Paragraph("Status: " + invoice.getStatus() + " | " + invoice.getPaymentStatus(), boldFont);
            statusPara.setAlignment(Element.ALIGN_RIGHT);
            rightHeader.addElement(invNumPara);
            rightHeader.addElement(invDatePara);
            rightHeader.addElement(dueDatePara);
            rightHeader.addElement(statusPara);
            headerTable.addCell(rightHeader);

            document.add(headerTable);
            document.add(new Paragraph("\n"));

            // 2. Reference Bar
            PdfPTable refTable = new PdfPTable(4);
            refTable.setWidthPercentage(100);
            refTable.setWidths(new float[]{25, 25, 25, 25});
            addCell(refTable, "Purchase Order", invoice.getPoNumber() != null ? invoice.getPoNumber() : "N/A", boldFont, normalFont);
            addCell(refTable, "Financial Year", invoice.getFinancialYear() != null ? invoice.getFinancialYear() : "N/A", boldFont, normalFont);
            addCell(refTable, "RFQ Reference", invoice.getRfqReference() != null ? invoice.getRfqReference() : "N/A", boldFont, normalFont);
            addCell(refTable, "Place of Supply", (invoice.getPlaceOfSupplyState() != null ? invoice.getPlaceOfSupplyState() : "N/A") + " (" + invoice.getPlaceOfSupplyStateCode() + ")", boldFont, normalFont);
            document.add(refTable);
            document.add(new Paragraph("\n"));

            // 3. Parties Table (Supplier vs Buyer)
            PdfPTable partiesTable = new PdfPTable(2);
            partiesTable.setWidthPercentage(100);
            partiesTable.setWidths(new float[]{50, 50});

            PdfPCell supplierCell = new PdfPCell();
            supplierCell.setBackgroundColor(BG_LIGHT);
            supplierCell.setPadding(8);
            supplierCell.setBorderColor(BORDER_GRAY);
            supplierCell.addElement(new Paragraph("SUPPLIER (SELLER)", sectionHeaderFont));
            supplierCell.addElement(new Paragraph(invoice.getSupplierLegalName(), boldFont));
            if (invoice.getSupplierTradeName() != null && !invoice.getSupplierTradeName().isBlank()) {
                supplierCell.addElement(new Paragraph("Trade Name: " + invoice.getSupplierTradeName(), normalFont));
            }
            supplierCell.addElement(new Paragraph("GSTIN: " + (invoice.getSupplierGstin() != null ? invoice.getSupplierGstin() : "Unregistered / None"), boldFont));
            if (invoice.getSupplierPan() != null && !invoice.getSupplierPan().isBlank()) {
                supplierCell.addElement(new Paragraph("PAN: " + invoice.getSupplierPan(), normalFont));
            }
            supplierCell.addElement(new Paragraph("Address: " + invoice.getSupplierAddress() + ", " + (invoice.getSupplierCity() != null ? invoice.getSupplierCity() + ", " : "") + invoice.getSupplierState() + " (" + invoice.getSupplierStateCode() + ") " + (invoice.getSupplierPostalCode() != null ? invoice.getSupplierPostalCode() : ""), normalFont));
            if (invoice.getSupplierEmail() != null) {
                supplierCell.addElement(new Paragraph("Email: " + invoice.getSupplierEmail(), smallFont));
            }
            if (invoice.getSupplierPhone() != null) {
                supplierCell.addElement(new Paragraph("Phone: " + invoice.getSupplierPhone(), smallFont));
            }
            partiesTable.addCell(supplierCell);

            PdfPCell buyerCell = new PdfPCell();
            buyerCell.setBackgroundColor(BG_LIGHT);
            buyerCell.setPadding(8);
            buyerCell.setBorderColor(BORDER_GRAY);
            buyerCell.addElement(new Paragraph("BUYER (RECIPIENT)", sectionHeaderFont));
            buyerCell.addElement(new Paragraph(invoice.getBuyerLegalName(), boldFont));
            if (invoice.getBuyerTradeName() != null && !invoice.getBuyerTradeName().isBlank()) {
                buyerCell.addElement(new Paragraph("Trade Name: " + invoice.getBuyerTradeName(), normalFont));
            }
            buyerCell.addElement(new Paragraph("GSTIN: " + (invoice.getBuyerGstin() != null ? invoice.getBuyerGstin() : "Unregistered / None"), boldFont));
            if (invoice.getBuyerPan() != null && !invoice.getBuyerPan().isBlank()) {
                buyerCell.addElement(new Paragraph("PAN: " + invoice.getBuyerPan(), normalFont));
            }
            buyerCell.addElement(new Paragraph("Billing Address: " + invoice.getBuyerBillingAddress() + ", " + (invoice.getBuyerCity() != null ? invoice.getBuyerCity() + ", " : "") + invoice.getBuyerState() + " (" + invoice.getBuyerStateCode() + ") " + (invoice.getBuyerPostalCode() != null ? invoice.getBuyerPostalCode() : ""), normalFont));
            buyerCell.addElement(new Paragraph("Shipping Address: " + (invoice.getBuyerShippingAddress() != null ? invoice.getBuyerShippingAddress() : invoice.getBuyerBillingAddress()), normalFont));
            if (invoice.getBuyerEmail() != null) {
                buyerCell.addElement(new Paragraph("Email: " + invoice.getBuyerEmail(), smallFont));
            }
            if (invoice.getBuyerPhone() != null) {
                buyerCell.addElement(new Paragraph("Phone: " + invoice.getBuyerPhone(), smallFont));
            }
            partiesTable.addCell(buyerCell);

            document.add(partiesTable);
            document.add(new Paragraph("\n"));

            // 4. Line Items Table
            PdfPTable itemsTable = new PdfPTable(8);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[]{5, 25, 10, 10, 12, 12, 12, 14});

            addTableHeader(itemsTable, "#", boldFont);
            addTableHeader(itemsTable, "Product Description", boldFont);
            addTableHeader(itemsTable, "HSN", boldFont);
            addTableHeader(itemsTable, "Qty", boldFont);
            addTableHeader(itemsTable, "Rate (INR)", boldFont);
            addTableHeader(itemsTable, "Taxable (INR)", boldFont);
            addTableHeader(itemsTable, invoice.getIsInterstate() ? "IGST" : "CGST+SGST", boldFont);
            addTableHeader(itemsTable, "Total (INR)", boldFont);

            if (invoice.getItems() != null && !invoice.getItems().isEmpty()) {
                for (InvoiceItem item : invoice.getItems()) {
                    addTableCell(itemsTable, String.valueOf(item.getItemNumber()), normalFont, Element.ALIGN_CENTER);
                    addTableCell(itemsTable, item.getProductName() + (item.getCasNumber() != null ? "\nCAS: " + item.getCasNumber() : ""), normalFont, Element.ALIGN_LEFT);
                    addTableCell(itemsTable, item.getHsnCode() != null ? item.getHsnCode() : "2901", normalFont, Element.ALIGN_CENTER);
                    addTableCell(itemsTable, item.getQuantity() + " " + item.getUnit(), normalFont, Element.ALIGN_RIGHT);
                    addTableCell(itemsTable, formatCurrency(item.getUnitPrice()), normalFont, Element.ALIGN_RIGHT);
                    addTableCell(itemsTable, formatCurrency(item.getTaxableValue()), normalFont, Element.ALIGN_RIGHT);
                    if (invoice.getIsInterstate()) {
                        addTableCell(itemsTable, item.getIgstRate() + "%\n" + formatCurrency(item.getIgstAmount()), normalFont, Element.ALIGN_RIGHT);
                    } else {
                        addTableCell(itemsTable, "C: " + item.getCgstRate() + "%\nS: " + item.getSgstRate() + "%", normalFont, Element.ALIGN_RIGHT);
                    }
                    addTableCell(itemsTable, formatCurrency(item.getTotalAmount()), boldFont, Element.ALIGN_RIGHT);
                }
            }

            document.add(itemsTable);
            document.add(new Paragraph("\n"));

            // 5. Monetary Summary Table
            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(100);
            summaryTable.setWidths(new float[]{60, 40});

            PdfPCell termsCell = new PdfPCell();
            termsCell.setBorder(Rectangle.NO_BORDER);
            termsCell.addElement(new Paragraph("Terms & Payment Instructions:", boldFont));
            termsCell.addElement(new Paragraph("1. Payments must be deposited directly into the supplier's verified bank account.", normalFont));
            termsCell.addElement(new Paragraph("2. KemKendra does not hold, custody, or process escrow transaction funds.", normalFont));
            termsCell.addElement(new Paragraph("3. Please upload your transaction reference / UTR upon completing bank transfer.", normalFont));
            if (invoice.getNotes() != null && !invoice.getNotes().isBlank()) {
                termsCell.addElement(new Paragraph("Notes: " + invoice.getNotes(), smallFont));
            }
            summaryTable.addCell(termsCell);

            PdfPTable totalBreakdown = new PdfPTable(2);
            totalBreakdown.setWidthPercentage(100);
            totalBreakdown.setWidths(new float[]{60, 40});

            addSummaryRow(totalBreakdown, "Taxable Amount:", formatCurrency(invoice.getTaxableAmount()), normalFont);
            if (!invoice.getIsInterstate()) {
                addSummaryRow(totalBreakdown, "CGST:", formatCurrency(invoice.getCgstAmount()), normalFont);
                addSummaryRow(totalBreakdown, "SGST:", formatCurrency(invoice.getSgstAmount()), normalFont);
            } else {
                addSummaryRow(totalBreakdown, "IGST:", formatCurrency(invoice.getIgstAmount()), normalFont);
            }
            addSummaryRow(totalBreakdown, "Total Tax:", formatCurrency(invoice.getTotalTaxAmount()), normalFont);
            if (invoice.getDiscountAmount() != null && invoice.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                addSummaryRow(totalBreakdown, "Discount:", "-" + formatCurrency(invoice.getDiscountAmount()), normalFont);
            }
            if (invoice.getAdditionalCharges() != null && invoice.getAdditionalCharges().compareTo(BigDecimal.ZERO) > 0) {
                addSummaryRow(totalBreakdown, "Additional Charges:", formatCurrency(invoice.getAdditionalCharges()), normalFont);
            }
            addSummaryRow(totalBreakdown, "Grand Total (INR):", formatCurrency(invoice.getGrandTotal()), boldFont);
            addSummaryRow(totalBreakdown, "Amount Paid:", formatCurrency(invoice.getAmountPaid()), normalFont);
            addSummaryRow(totalBreakdown, "Balance Due:", formatCurrency(invoice.getAmountDue()), boldFont);

            PdfPCell totalContainerCell = new PdfPCell(totalBreakdown);
            totalContainerCell.setBorder(Rectangle.NO_BORDER);
            summaryTable.addCell(totalContainerCell);

            document.add(summaryTable);
            document.add(new Paragraph("\n\n"));

            // 6. Signatory and Disclaimer Footer
            Paragraph footer = new Paragraph(
                    "This is a computer-generated tax invoice generated through the KemKendra B2B Commerce Platform. " +
                            "All trade settlements are direct non-custodial transactions between buyer and supplier.",
                    smallFont
            );
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate invoice PDF", e);
        }
    }

    private void addCell(PdfPTable table, String label, String value, Font labelFont, Font valFont) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(BG_LIGHT);
        cell.setBorderColor(BORDER_GRAY);
        cell.setPadding(6);
        cell.addElement(new Paragraph(label, labelFont));
        cell.addElement(new Paragraph(value, valFont));
        table.addCell(cell);
    }

    private void addTableHeader(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(BG_LIGHT);
        cell.setBorderColor(BORDER_GRAY);
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private void addTableCell(PdfPTable table, String text, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorderColor(BORDER_GRAY);
        cell.setPadding(6);
        cell.setHorizontalAlignment(alignment);
        table.addCell(cell);
    }

    private void addSummaryRow(PdfPTable table, String label, String value, Font font) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, font));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(3);
        table.addCell(labelCell);

        PdfPCell valCell = new PdfPCell(new Phrase(value, font));
        valCell.setBorder(Rectangle.NO_BORDER);
        valCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valCell.setPadding(3);
        table.addCell(valCell);
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "0.00";
        return CURRENCY_FORMATTER.format(amount);
    }
}
