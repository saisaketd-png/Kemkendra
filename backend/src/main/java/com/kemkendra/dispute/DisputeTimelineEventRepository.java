package com.kemkendra.dispute;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DisputeTimelineEventRepository extends JpaRepository<DisputeTimelineEvent, UUID> {
    List<DisputeTimelineEvent> findByDisputeIdOrderByCreatedAtAsc(UUID disputeId);
}
