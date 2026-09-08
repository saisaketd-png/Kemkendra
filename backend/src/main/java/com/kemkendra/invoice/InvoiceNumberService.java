package com.kemkendra.invoice;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class InvoiceNumberService {

    private final InvoiceSequenceRepository sequenceRepository;

    public InvoiceNumberService(InvoiceSequenceRepository sequenceRepository) {
        this.sequenceRepository = sequenceRepository;
    }

    public String calculateFinancialYear(LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }
        int year = date.getYear();
        int month = date.getMonthValue();

        int startYear;
        int endYear;
        if (month >= 4) {
            startYear = year;
            endYear = year + 1;
        } else {
            startYear = year - 1;
            endYear = year;
        }

        String endYearSuffix = String.valueOf(endYear).substring(2);
        return startYear + "-" + endYearSuffix;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, isolation = Isolation.SERIALIZABLE)
    public synchronized String generateInvoiceNumber(LocalDate date) {
        String financialYear = calculateFinancialYear(date);

        InvoiceSequence sequence = sequenceRepository.findByFinancialYearForUpdate(financialYear)
                .orElseGet(() -> {
                    InvoiceSequence newSeq = new InvoiceSequence(financialYear, 1L);
                    return sequenceRepository.saveAndFlush(newSeq);
                });

        long currentNumber = sequence.getNextValue();
        sequence.setNextValue(currentNumber + 1);
        sequenceRepository.saveAndFlush(sequence);

        return String.format("KK/%s/%05d", financialYear, currentNumber);
    }
}
