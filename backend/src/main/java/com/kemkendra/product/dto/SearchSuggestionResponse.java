package com.kemkendra.product.dto;

public record SearchSuggestionResponse(
        String type,
        String title,
        String subtitle,
        String url,
        String matchedField,
        String badge
) {}
