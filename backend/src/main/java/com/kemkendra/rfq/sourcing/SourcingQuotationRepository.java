package com.kemkendra.rfq.sourcing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SourcingQuotationRepository extends JpaRepository<SourcingQuotation, UUID> {
    List<SourcingQuotation> findBySourcingRequestIdOrderByCreatedAtDesc(UUID sourcingRequestId);
    java.util.Optional<SourcingQuotation> findBySourcingRequestIdAndId(UUID sourcingRequestId, UUID id);
    List<SourcingQuotation> findBySourcingRequestIdAndShareWithBuyerTrueOrderByCreatedAtDesc(UUID sourcingRequestId);
}
