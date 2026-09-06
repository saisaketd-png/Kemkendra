package com.kemkendra.invoice;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class GstCalculationServiceTest {

    private GstCalculationService gstCalculationService;

    @BeforeEach
    void setUp() {
        gstCalculationService = new GstCalculationService();
    }

    @Test
    @DisplayName("Should validate correct Indian GSTIN format and state code")
    void testValidGstin() {
        // Valid Maharashtra GSTIN (state code 27)
        assertThat(gstCalculationService.isValidGstin("27AAAAA0000A1Z5")).isTrue();
        // Valid Gujarat GSTIN (state code 24)
        assertThat(gstCalculationService.isValidGstin("24ABCDE1234F1Z5")).isTrue();
        // Valid Delhi GSTIN (state code 07)
        assertThat(gstCalculationService.isValidGstin("07AAAAA1234A1Z1")).isTrue();
    }

    @Test
    @DisplayName("Should reject invalid GSTIN strings")
    void testInvalidGstin() {
        assertThat(gstCalculationService.isValidGstin(null)).isFalse();
        assertThat(gstCalculationService.isValidGstin("")).isFalse();
        assertThat(gstCalculationService.isValidGstin("SHORT123")).isFalse();
        // Invalid state code 99
        assertThat(gstCalculationService.isValidGstin("99AAAAA0000A1Z5")).isFalse();
        // Missing Z at 14th character
        assertThat(gstCalculationService.isValidGstin("27AAAAA0000A1A5")).isFalse();
    }

    @Test
    @DisplayName("Should extract state code and lookup state name correctly")
    void testExtractStateCodeAndName() {
        assertThat(gstCalculationService.extractStateCode("27AAAAA0000A1Z5")).isEqualTo("27");
        assertThat(gstCalculationService.getStateNameByCode("27")).isEqualTo("Maharashtra");
        assertThat(gstCalculationService.getStateNameByCode("24")).isEqualTo("Gujarat");
        assertThat(gstCalculationService.getStateNameByCode("07")).isEqualTo("Delhi");
        assertThat(gstCalculationService.getStateNameByCode("999")).isEqualTo("Unknown State");
    }

    @Test
    @DisplayName("Should determine intra-state when seller and buyer state codes match")
    void testIntraStateDetermination() {
        assertThat(gstCalculationService.isInterstate("27", "27")).isFalse();
        assertThat(gstCalculationService.isInterstate("24", "24")).isFalse();
    }

    @Test
    @DisplayName("Should determine inter-state when seller and buyer state codes differ")
    void testInterStateDetermination() {
        assertThat(gstCalculationService.isInterstate("27", "24")).isTrue();
        assertThat(gstCalculationService.isInterstate("27", "07")).isTrue();
    }

    @Test
    @DisplayName("Should calculate intra-state CGST + SGST (split evenly) with zero IGST")
    void testIntraStateTaxCalculation() {
        // Qty: 10, Unit price: 1000.00 -> Base: 10,000.00. Discount: 500.00 -> Taxable: 9,500.00.
        // GST Rate: 18.00% -> CGST: 9.00% (855.00), SGST: 9.00% (855.00), IGST: 0.00.
        // Total Tax: 1,710.00. Grand Total: 11,210.00.
        GstCalculationService.TaxCalculationResult result = gstCalculationService.calculateItemTax(
                new BigDecimal("10.00"),
                new BigDecimal("1000.00"),
                new BigDecimal("500.00"),
                new BigDecimal("18.00"),
                false // intra-state
        );

        assertThat(result.getBaseAmount()).isEqualByComparingTo("10000.0000");
        assertThat(result.getTaxableValue()).isEqualByComparingTo("9500.0000");
        assertThat(result.getCgstRate()).isEqualByComparingTo("9.00");
        assertThat(result.getCgstAmount()).isEqualByComparingTo("855.0000");
        assertThat(result.getSgstRate()).isEqualByComparingTo("9.00");
        assertThat(result.getSgstAmount()).isEqualByComparingTo("855.0000");
        assertThat(result.getIgstRate()).isEqualByComparingTo("0.00");
        assertThat(result.getIgstAmount()).isEqualByComparingTo("0.0000");
        assertThat(result.getTotalItemTax()).isEqualByComparingTo("1710.0000");
        assertThat(result.getTotalAmount()).isEqualByComparingTo("11210.0000");
    }

    @Test
    @DisplayName("Should calculate inter-state IGST with zero CGST and zero SGST")
    void testInterStateTaxCalculation() {
        // Qty: 5, Unit price: 2500.00 -> Base: 12,500.00. Discount: 0.00 -> Taxable: 12,500.00.
        // GST Rate: 18.00% -> IGST: 18.00% (2250.00), CGST: 0, SGST: 0.
        // Total Tax: 2250.00. Grand Total: 14750.00.
        GstCalculationService.TaxCalculationResult result = gstCalculationService.calculateItemTax(
                new BigDecimal("5.00"),
                new BigDecimal("2500.00"),
                BigDecimal.ZERO,
                new BigDecimal("18.00"),
                true // inter-state
        );

        assertThat(result.getBaseAmount()).isEqualByComparingTo("12500.0000");
        assertThat(result.getTaxableValue()).isEqualByComparingTo("12500.0000");
        assertThat(result.getCgstRate()).isEqualByComparingTo("0.00");
        assertThat(result.getCgstAmount()).isEqualByComparingTo("0.0000");
        assertThat(result.getSgstRate()).isEqualByComparingTo("0.00");
        assertThat(result.getSgstAmount()).isEqualByComparingTo("0.0000");
        assertThat(result.getIgstRate()).isEqualByComparingTo("18.00");
        assertThat(result.getIgstAmount()).isEqualByComparingTo("2250.0000");
        assertThat(result.getTotalItemTax()).isEqualByComparingTo("2250.0000");
        assertThat(result.getTotalAmount()).isEqualByComparingTo("14750.0000");
    }

    @Test
    @DisplayName("Should handle exempt or zero-rated GST properly")
    void testZeroRatedTaxCalculation() {
        GstCalculationService.TaxCalculationResult result = gstCalculationService.calculateItemTax(
                new BigDecimal("2.00"),
                new BigDecimal("5000.00"),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                false
        );

        assertThat(result.getTaxableValue()).isEqualByComparingTo("10000.0000");
        assertThat(result.getTotalItemTax()).isEqualByComparingTo("0.0000");
        assertThat(result.getTotalAmount()).isEqualByComparingTo("10000.0000");
    }
}
