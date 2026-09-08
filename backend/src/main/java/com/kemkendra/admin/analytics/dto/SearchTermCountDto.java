package com.kemkendra.admin.analytics.dto;

public record SearchTermCountDto(
        String searchTerm,
        long searchCount
) {
}
