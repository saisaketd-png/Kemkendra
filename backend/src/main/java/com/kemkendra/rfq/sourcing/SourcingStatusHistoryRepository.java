package com.kemkendra.rfq.sourcing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SourcingStatusHistoryRepository extends JpaRepository<SourcingStatusHistory, UUID> {
    List<SourcingStatusHistory> findBySourcingRequestIdOrderByCreatedAtDesc(UUID sourcingRequestId);
}
