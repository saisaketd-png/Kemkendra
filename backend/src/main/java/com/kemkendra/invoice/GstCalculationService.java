package com.kemkendra.invoice;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class GstCalculationService {

    private static final Pattern GSTIN_PATTERN = Pattern.compile(
            "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
    );

    private static final Map<String, String> STATE_CODE_MAP;

    static {
        Map<String, String> map = new HashMap<>();
        map.put("01", "Jammu and Kashmir");
        map.put("02", "Himachal Pradesh");
        map.put("03", "Punjab");
        map.put("04", "Chandigarh");
        map.put("05", "Uttarakhand");
        map.put("06", "Haryana");
        map.put("07", "Delhi");
        map.put("08", "Rajasthan");
        map.put("09", "Uttar Pradesh");
        map.put("10", "Bihar");
        map.put("11", "Sikkim");
        map.put("12", "Arunachal Pradesh");
        map.put("13", "Nagaland");
        map.put("14", "Manipur");
        map.put("15", "Mizoram");
        map.put("16", "Tripura");
        map.put("17", "Meghalaya");
        map.put("18", "Assam");
        map.put("19", "West Bengal");
        map.put("20", "Jharkhand");
        map.put("21", "Odisha");
        map.put("22", "Chhattisgarh");
        map.put("23", "Madhya Pradesh");
        map.put("24", "Gujarat");
        map.put("26", "Dadra and Nagar Haveli and Daman and Diu");
        map.put("27", "Maharashtra");
        map.put("29", "Karnataka");
        map.put("30", "Goa");
        map.put("31", "Lakshadweep");
        map.put("32", "Kerala");
        map.put("33", "Tamil Nadu");
        map.put("34", "Puducherry");
        map.put("35", "Andaman and Nicobar Islands");
        map.put("36", "Telangana");
        map.put("37", "Andhra Pradesh");
        map.put("38", "Ladakh");
        map.put("97", "Other Territory");
        STATE_CODE_MAP = Collections.unmodifiableMap(map);
    }

    public boolean isValidGstin(String gstin) {
        if (gstin == null || gstin.trim().length() != 15) {
            return false;
        }
        String normalized = gstin.trim().toUpperCase();
        if (!GSTIN_PATTERN.matcher(normalized).matches()) {
            return false;
        }
        String stateCode = normalized.substring(0, 2);
        return STATE_CODE_MAP.containsKey(stateCode);
    }

    public String extractStateCode(String gstin) {
        if (gstin != null && gstin.trim().length() >= 2) {
            return gstin.trim().substring(0, 2);
        }
        return null;
    }

    public String getStateNameByCode(String code) {
        if (code == null) return "Unknown State";
        return STATE_CODE_MAP.getOrDefault(code.trim(), "Unknown State");
    }

    public boolean isInterstate(String supplierStateCode, String placeOfSupplyStateCode) {
        if (supplierStateCode == null || placeOfSupplyStateCode == null) {
            return false;
        }
        return !supplierStateCode.trim().equalsIgnoreCase(placeOfSupplyStateCode.trim());
    }

    public TaxCalculationResult calculateItemTax(
            BigDecimal quantity,
            BigDecimal unitPrice,
            BigDecimal discountAmount,
            BigDecimal gstRate,
            boolean isInterstate
    ) {
        if (quantity == null) quantity = BigDecimal.ZERO;
        if (unitPrice == null) unitPrice = BigDecimal.ZERO;
        if (discountAmount == null) discountAmount = BigDecimal.ZERO;
        if (gstRate == null) gstRate = BigDecimal.ZERO;

        BigDecimal baseAmount = quantity.multiply(unitPrice).setScale(4, RoundingMode.HALF_UP);
        BigDecimal taxableValue = baseAmount.subtract(discountAmount).max(BigDecimal.ZERO).setScale(4, RoundingMode.HALF_UP);

        BigDecimal cgstRate = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal cgstAmount = BigDecimal.ZERO.setScale(4, RoundingMode.HALF_UP);
        BigDecimal sgstRate = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal sgstAmount = BigDecimal.ZERO.setScale(4, RoundingMode.HALF_UP);
        BigDecimal igstRate = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal igstAmount = BigDecimal.ZERO.setScale(4, RoundingMode.HALF_UP);

        if (gstRate.compareTo(BigDecimal.ZERO) > 0) {
            if (isInterstate) {
                igstRate = gstRate.setScale(2, RoundingMode.HALF_UP);
                igstAmount = taxableValue.multiply(igstRate)
                        .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            } else {
                BigDecimal halfRate = gstRate.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
                cgstRate = halfRate;
                sgstRate = halfRate;
                cgstAmount = taxableValue.multiply(cgstRate)
                        .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
                sgstAmount = taxableValue.multiply(sgstRate)
                        .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            }
        }

        BigDecimal totalItemTax = cgstAmount.add(sgstAmount).add(igstAmount).setScale(4, RoundingMode.HALF_UP);
        BigDecimal totalAmount = taxableValue.add(totalItemTax).setScale(4, RoundingMode.HALF_UP);

        return new TaxCalculationResult(
                baseAmount,
                taxableValue,
                cgstRate,
                cgstAmount,
                sgstRate,
                sgstAmount,
                igstRate,
                igstAmount,
                totalItemTax,
                totalAmount
        );
    }

    public static class TaxCalculationResult {
        private final BigDecimal baseAmount;
        private final BigDecimal taxableValue;
        private final BigDecimal cgstRate;
        private final BigDecimal cgstAmount;
        private final BigDecimal sgstRate;
        private final BigDecimal sgstAmount;
        private final BigDecimal igstRate;
        private final BigDecimal igstAmount;
        private final BigDecimal totalItemTax;
        private final BigDecimal totalAmount;

        public TaxCalculationResult(
                BigDecimal baseAmount,
                BigDecimal taxableValue,
                BigDecimal cgstRate,
                BigDecimal cgstAmount,
                BigDecimal sgstRate,
                BigDecimal sgstAmount,
                BigDecimal igstRate,
                BigDecimal igstAmount,
                BigDecimal totalItemTax,
                BigDecimal totalAmount
        ) {
            this.baseAmount = baseAmount;
            this.taxableValue = taxableValue;
            this.cgstRate = cgstRate;
            this.cgstAmount = cgstAmount;
            this.sgstRate = sgstRate;
            this.sgstAmount = sgstAmount;
            this.igstRate = igstRate;
            this.igstAmount = igstAmount;
            this.totalItemTax = totalItemTax;
            this.totalAmount = totalAmount;
        }

        public BigDecimal getBaseAmount() { return baseAmount; }
        public BigDecimal getTaxableValue() { return taxableValue; }
        public BigDecimal getCgstRate() { return cgstRate; }
        public BigDecimal getCgstAmount() { return cgstAmount; }
        public BigDecimal getSgstRate() { return sgstRate; }
        public BigDecimal getSgstAmount() { return sgstAmount; }
        public BigDecimal getIgstRate() { return igstRate; }
        public BigDecimal getIgstAmount() { return igstAmount; }
        public BigDecimal getTotalItemTax() { return totalItemTax; }
        public BigDecimal getTotalAmount() { return totalAmount; }
    }
}
