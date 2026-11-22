package com.kemkendra.rfq.sourcing.dto;

public record SourcingStatsDto(
        long totalRequests,
        long newRequests,
        long inProgressRequests,
        long proposalsSent,
        long completedRequests,
        long moreInfoRequired,
        long rejectedRequests
) {
}
