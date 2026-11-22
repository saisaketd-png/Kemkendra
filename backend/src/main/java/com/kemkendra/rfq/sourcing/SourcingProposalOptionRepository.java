package com.kemkendra.rfq.sourcing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SourcingProposalOptionRepository extends JpaRepository<SourcingProposalOption, UUID> {
    List<SourcingProposalOption> findBySourcingProposalIdOrderByCreatedAtAsc(UUID sourcingProposalId);

    Optional<SourcingProposalOption> findBySourcingProposalIdAndId(UUID sourcingProposalId, UUID id);
}
