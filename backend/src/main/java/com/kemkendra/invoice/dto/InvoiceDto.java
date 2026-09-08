package com.kemkendra.invoice.dto;

import com.kemkendra.invoice.InvoiceStatus;
import com.kemkendra.invoice.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class InvoiceDto {

    private UUID id;
    private String invoiceNumber;
    private String financialYear;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private InvoiceStatus status;
    private PaymentStatus paymentStatus;

    // References
    private UUID purchaseOrderId;
    private String poNumber;
    private UUID rfqId;
    private String rfqReference;
    private UUID quotationId;
    private String quotationReference;

    // Supplier
    private Long supplierId;
    private UUID supplierUserId;
    private String supplierLegalName;
    private String supplierTradeName;
    private String supplierGstin;
    private String supplierPan;
    private String supplierAddress;
    private String supplierCity;
    private String supplierState;
    private String supplierStateCode;
    private String supplierPostalCode;
    private String supplierEmail;
    private String supplierPhone;

    // Buyer
    private UUID buyerId;
    private String buyerLegalName;
    private String buyerTradeName;
    private String buyerGstin;
    private String buyerPan;
    private String buyerBillingAddress;
    private String buyerShippingAddress;
    private String buyerCity;
    private String buyerState;
    private String buyerStateCode;
    private String buyerPostalCode;
    private String buyerEmail;
    private String buyerPhone;

    // Supply & GST
    private Boolean isInterstate;
    private String placeOfSupplyStateCode;
    private String placeOfSupplyState;
    private String currency;

    // Totals
    private BigDecimal taxableAmount;
    private BigDecimal discountAmount;
    private BigDecimal additionalCharges;
    private BigDecimal cgstAmount;
    private BigDecimal sgstAmount;
    private BigDecimal igstAmount;
    private BigDecimal totalTaxAmount;
    private BigDecimal grandTotal;
    private BigDecimal amountPaid;
    private BigDecimal amountDue;

    // Controls
    private Integer version;
    private UUID originalInvoiceId;
    private UUID revisedInvoiceId;
    private String cancellationReason;
    private String disputeReason;
    private String notes;
    private String termsAndConditions;
    private LocalDateTime issuedAt;
    private String issuedBy;
    private LocalDateTime cancelledAt;
    private String cancelledBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<InvoiceItemDto> items = new ArrayList<>();
    private List<InvoicePaymentRecordDto> paymentRecords = new ArrayList<>();
    private List<InvoiceAuditDto> audits = new ArrayList<>();

    public InvoiceDto() {
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public String getFinancialYear() { return financialYear; }
    public void setFinancialYear(String financialYear) { this.financialYear = financialYear; }

    public LocalDate getInvoiceDate() { return invoiceDate; }
    public void setInvoiceDate(LocalDate invoiceDate) { this.invoiceDate = invoiceDate; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public InvoiceStatus getStatus() { return status; }
    public void setStatus(InvoiceStatus status) { this.status = status; }

    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }

    public UUID getPurchaseOrderId() { return purchaseOrderId; }
    public void setPurchaseOrderId(UUID purchaseOrderId) { this.purchaseOrderId = purchaseOrderId; }

    public String getPoNumber() { return poNumber; }
    public void setPoNumber(String poNumber) { this.poNumber = poNumber; }

    public UUID getRfqId() { return rfqId; }
    public void setRfqId(UUID rfqId) { this.rfqId = rfqId; }

    public String getRfqReference() { return rfqReference; }
    public void setRfqReference(String rfqReference) { this.rfqReference = rfqReference; }

    public UUID getQuotationId() { return quotationId; }
    public void setQuotationId(UUID quotationId) { this.quotationId = quotationId; }

    public String getQuotationReference() { return quotationReference; }
    public void setQuotationReference(String quotationReference) { this.quotationReference = quotationReference; }

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public UUID getSupplierUserId() { return supplierUserId; }
    public void setSupplierUserId(UUID supplierUserId) { this.supplierUserId = supplierUserId; }

    public String getSupplierLegalName() { return supplierLegalName; }
    public void setSupplierLegalName(String supplierLegalName) { this.supplierLegalName = supplierLegalName; }

    public String getSupplierTradeName() { return supplierTradeName; }
    public void setSupplierTradeName(String supplierTradeName) { this.supplierTradeName = supplierTradeName; }

    public String getSupplierGstin() { return supplierGstin; }
    public void setSupplierGstin(String supplierGstin) { this.supplierGstin = supplierGstin; }

    public String getSupplierPan() { return supplierPan; }
    public void setSupplierPan(String supplierPan) { this.supplierPan = supplierPan; }

    public String getSupplierAddress() { return supplierAddress; }
    public void setSupplierAddress(String supplierAddress) { this.supplierAddress = supplierAddress; }

    public String getSupplierCity() { return supplierCity; }
    public void setSupplierCity(String supplierCity) { this.supplierCity = supplierCity; }

    public String getSupplierState() { return supplierState; }
    public void setSupplierState(String supplierState) { this.supplierState = supplierState; }

    public String getSupplierStateCode() { return supplierStateCode; }
    public void setSupplierStateCode(String supplierStateCode) { this.supplierStateCode = supplierStateCode; }

    public String getSupplierPostalCode() { return supplierPostalCode; }
    public void setSupplierPostalCode(String supplierPostalCode) { this.supplierPostalCode = supplierPostalCode; }

    public String getSupplierEmail() { return supplierEmail; }
    public void setSupplierEmail(String supplierEmail) { this.supplierEmail = supplierEmail; }

    public String getSupplierPhone() { return supplierPhone; }
    public void setSupplierPhone(String supplierPhone) { this.supplierPhone = supplierPhone; }

    public UUID getBuyerId() { return buyerId; }
    public void setBuyerId(UUID buyerId) { this.buyerId = buyerId; }

    public String getBuyerLegalName() { return buyerLegalName; }
    public void setBuyerLegalName(String buyerLegalName) { this.buyerLegalName = buyerLegalName; }

    public String getBuyerTradeName() { return buyerTradeName; }
    public void setBuyerTradeName(String buyerTradeName) { this.buyerTradeName = buyerTradeName; }

    public String getBuyerGstin() { return buyerGstin; }
    public void setBuyerGstin(String buyerGstin) { this.buyerGstin = buyerGstin; }

    public String getBuyerPan() { return buyerPan; }
    public void setBuyerPan(String buyerPan) { this.buyerPan = buyerPan; }

    public String getBuyerBillingAddress() { return buyerBillingAddress; }
    public void setBuyerBillingAddress(String buyerBillingAddress) { this.buyerBillingAddress = buyerBillingAddress; }

    public String getBuyerShippingAddress() { return buyerShippingAddress; }
    public void setBuyerShippingAddress(String buyerShippingAddress) { this.buyerShippingAddress = buyerShippingAddress; }

    public String getBuyerCity() { return buyerCity; }
    public void setBuyerCity(String buyerCity) { this.buyerCity = buyerCity; }

    public String getBuyerState() { return buyerState; }
    public void setBuyerState(String buyerState) { this.buyerState = buyerState; }

    public String getBuyerStateCode() { return buyerStateCode; }
    public void setBuyerStateCode(String buyerStateCode) { this.buyerStateCode = buyerStateCode; }

    public String getBuyerPostalCode() { return buyerPostalCode; }
    public void setBuyerPostalCode(String buyerPostalCode) { this.buyerPostalCode = buyerPostalCode; }

    public String getBuyerEmail() { return buyerEmail; }
    public void setBuyerEmail(String buyerEmail) { this.buyerEmail = buyerEmail; }

    public String getBuyerPhone() { return buyerPhone; }
    public void setBuyerPhone(String buyerPhone) { this.buyerPhone = buyerPhone; }

    public Boolean getIsInterstate() { return isInterstate; }
    public void setIsInterstate(Boolean interstate) { isInterstate = interstate; }

    public String getPlaceOfSupplyStateCode() { return placeOfSupplyStateCode; }
    public void setPlaceOfSupplyStateCode(String placeOfSupplyStateCode) { this.placeOfSupplyStateCode = placeOfSupplyStateCode; }

    public String getPlaceOfSupplyState() { return placeOfSupplyState; }
    public void setPlaceOfSupplyState(String placeOfSupplyState) { this.placeOfSupplyState = placeOfSupplyState; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public BigDecimal getTaxableAmount() { return taxableAmount; }
    public void setTaxableAmount(BigDecimal taxableAmount) { this.taxableAmount = taxableAmount; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public BigDecimal getAdditionalCharges() { return additionalCharges; }
    public void setAdditionalCharges(BigDecimal additionalCharges) { this.additionalCharges = additionalCharges; }

    public BigDecimal getCgstAmount() { return cgstAmount; }
    public void setCgstAmount(BigDecimal cgstAmount) { this.cgstAmount = cgstAmount; }

    public BigDecimal getSgstAmount() { return sgstAmount; }
    public void setSgstAmount(BigDecimal sgstAmount) { this.sgstAmount = sgstAmount; }

    public BigDecimal getIgstAmount() { return igstAmount; }
    public void setIgstAmount(BigDecimal igstAmount) { this.igstAmount = igstAmount; }

    public BigDecimal getTotalTaxAmount() { return totalTaxAmount; }
    public void setTotalTaxAmount(BigDecimal totalTaxAmount) { this.totalTaxAmount = totalTaxAmount; }

    public BigDecimal getGrandTotal() { return grandTotal; }
    public void setGrandTotal(BigDecimal grandTotal) { this.grandTotal = grandTotal; }

    public BigDecimal getAmountPaid() { return amountPaid; }
    public void setAmountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid; }

    public BigDecimal getAmountDue() { return amountDue; }
    public void setAmountDue(BigDecimal amountDue) { this.amountDue = amountDue; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public UUID getOriginalInvoiceId() { return originalInvoiceId; }
    public void setOriginalInvoiceId(UUID originalInvoiceId) { this.originalInvoiceId = originalInvoiceId; }

    public UUID getRevisedInvoiceId() { return revisedInvoiceId; }
    public void setRevisedInvoiceId(UUID revisedInvoiceId) { this.revisedInvoiceId = revisedInvoiceId; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public String getDisputeReason() { return disputeReason; }
    public void setDisputeReason(String disputeReason) { this.disputeReason = disputeReason; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getTermsAndConditions() { return termsAndConditions; }
    public void setTermsAndConditions(String termsAndConditions) { this.termsAndConditions = termsAndConditions; }

    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }

    public String getIssuedBy() { return issuedBy; }
    public void setIssuedBy(String issuedBy) { this.issuedBy = issuedBy; }

    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }

    public String getCancelledBy() { return cancelledBy; }
    public void setCancelledBy(String cancelledBy) { this.cancelledBy = cancelledBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<InvoiceItemDto> getItems() { return items; }
    public void setItems(List<InvoiceItemDto> items) { this.items = items; }

    public List<InvoicePaymentRecordDto> getPaymentRecords() { return paymentRecords; }
    public void setPaymentRecords(List<InvoicePaymentRecordDto> paymentRecords) { this.paymentRecords = paymentRecords; }

    public List<InvoiceAuditDto> getAudits() { return audits; }
    public void setAudits(List<InvoiceAuditDto> audits) { this.audits = audits; }
}
