package com.kemkendra.rfq.sourcing;

public enum SourcingRequestStatus {
    // Sourcing Lifecycle Statuses
    SUBMITTED,
    UNDER_REVIEW,
    MORE_INFORMATION_REQUIRED,
    ACCEPTED,
    SOURCING,
    SUPPLIER_CONTACTED,
    QUOTATIONS_RECEIVED,
    PROPOSAL_READY,
    PROPOSAL_SENT,
    NEGOTIATION,
    FULFILLED,
    CLOSED,
    REJECTED,

    // Legacy RFQ multi-supplier statuses (preserved for backwards compatibility)
    OPEN,
    PARTIALLY_QUOTED,
    COMPLETED,
    CANCELLED,
    EXPIRED
}
