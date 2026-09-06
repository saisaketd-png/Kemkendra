package com.kemkendra.dispute;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DisputeAttachmentRepository extends JpaRepository<DisputeAttachment, UUID> {
    List<DisputeAttachment> findByDisputeId(UUID disputeId);
}
