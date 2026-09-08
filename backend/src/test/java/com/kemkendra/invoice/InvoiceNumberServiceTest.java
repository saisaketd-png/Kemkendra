package com.kemkendra.invoice;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceNumberServiceTest {

    @Mock
    private InvoiceSequenceRepository sequenceRepository;

    private InvoiceNumberService invoiceNumberService;

    @BeforeEach
    void setUp() {
        invoiceNumberService = new InvoiceNumberService(sequenceRepository);
    }

    @Test
    @DisplayName("Should correctly calculate Indian financial year across April boundary")
    void testCalculateFinancialYear() {
        // April 2026 starts FY 2026-27
        assertThat(invoiceNumberService.calculateFinancialYear(LocalDate.of(2026, 4, 1))).isEqualTo("2026-27");
        assertThat(invoiceNumberService.calculateFinancialYear(LocalDate.of(2026, 12, 31))).isEqualTo("2026-27");
        // Jan - March 2027 is still in FY 2026-27
        assertThat(invoiceNumberService.calculateFinancialYear(LocalDate.of(2027, 1, 15))).isEqualTo("2026-27");
        assertThat(invoiceNumberService.calculateFinancialYear(LocalDate.of(2027, 3, 31))).isEqualTo("2026-27");
        // April 2027 transitions to FY 2027-28
        assertThat(invoiceNumberService.calculateFinancialYear(LocalDate.of(2027, 4, 1))).isEqualTo("2027-28");
    }

    @Test
    @DisplayName("Should format invoice sequence as KK/{FY}/{00001}")
    void testGenerateInvoiceNumber() {
        LocalDate date = LocalDate.of(2026, 9, 1);
        String fy = "2026-27";

        InvoiceSequence sequence = new InvoiceSequence(fy, 42L);
        when(sequenceRepository.findByFinancialYearForUpdate(fy)).thenReturn(Optional.of(sequence));
        when(sequenceRepository.saveAndFlush(any(InvoiceSequence.class))).thenReturn(sequence);

        String invoiceNumber = invoiceNumberService.generateInvoiceNumber(date);

        assertThat(invoiceNumber).isEqualTo("KK/2026-27/00042");
        assertThat(sequence.getNextValue()).isEqualTo(43L);
        verify(sequenceRepository).saveAndFlush(sequence);
    }
}
