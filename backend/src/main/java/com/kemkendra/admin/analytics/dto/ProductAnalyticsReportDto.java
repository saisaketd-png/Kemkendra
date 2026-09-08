package com.kemkendra.admin.analytics.dto;

import java.util.List;

public record ProductAnalyticsReportDto(
        List<SearchTermCountDto> mostSearched,
        List<ProductCountDto> mostViewed,
        List<ProductDemandDto> mostRequestedChemicals,
        List<CategoryActivityDto> mostActiveCategories,
        List<ProductSummaryDto> productsWithNoActiveOfferings,
        List<ProductDemandGrowthDto> productsWithIncreasingDemand
) {
}
