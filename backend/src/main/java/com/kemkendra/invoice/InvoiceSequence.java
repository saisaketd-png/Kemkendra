package com.kemkendra.invoice;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "invoice_sequences")
public class InvoiceSequence {

    @Id
    @Column(name = "financial_year", length = 10)
    private String financialYear;

    @Column(name = "next_value", nullable = false)
    private Long nextValue = 1L;

    public InvoiceSequence() {
    }

    public InvoiceSequence(String financialYear, Long nextValue) {
        this.financialYear = financialYear;
        this.nextValue = nextValue;
    }

    public String getFinancialYear() {
        return financialYear;
    }

    public void setFinancialYear(String financialYear) {
        this.financialYear = financialYear;
    }

    public Long getNextValue() {
        return nextValue;
    }

    public void setNextValue(Long nextValue) {
        this.nextValue = nextValue;
    }
}
