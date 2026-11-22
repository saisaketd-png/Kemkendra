package com.kemkendra.rfq.sourcing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SourcingProposalRepository extends JpaRepository<SourcingProposal, UUID> {
    List<SourcingProposal> findBySourcingRequestIdOrderByCreatedAtDesc(UUID sourcingRequestId);
    List<SourcingProposal> findBySourcingRequestIdAndStatusInOrderByCreatedAtDesc(UUID sourcingRequestId, List<String> statuses);
    Optional<SourcingProposal> findByProposalReference(String proposalReference);
    Optional<SourcingProposal> findBySourcingRequestIdAndId(UUID sourcingRequestId, UUID id);
}
