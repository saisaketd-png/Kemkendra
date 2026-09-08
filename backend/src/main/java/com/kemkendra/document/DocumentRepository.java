package com.kemkendra.document;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID>, JpaSpecificationExecutor<Document> {
    List<Document> findByOwnerTypeAndOwnerId(DocumentOwnerType ownerType, UUID ownerId);
    List<Document> findByOwnerTypeAndOwnerIdAndIsActiveTrue(DocumentOwnerType ownerType, UUID ownerId);
    List<Document> findByDocumentGroupIdOrderByVersionDesc(UUID documentGroupId);
    Optional<Document> findTopByDocumentGroupIdOrderByVersionDesc(UUID documentGroupId);
    Optional<Document> findByDocumentGroupIdAndIsActiveTrue(UUID documentGroupId);
    List<Document> findByOwnerTypeAndOwnerIdAndCategoryAndIsActiveTrue(DocumentOwnerType ownerType, UUID ownerId, DocumentCategory category);
    List<Document> findByUploadedBy(UUID uploadedBy);

    List<Document> findByVerificationStatusAndExpiryDateBeforeAndIsActiveTrue(String status, LocalDate date);
    List<Document> findByVerificationStatusAndExpiryDateBetweenAndIsActiveTrue(String status, LocalDate startDate, LocalDate endDate);

    long countByVerificationStatus(String verificationStatus);
    long countByVerificationStatusAndIsActiveTrue(String verificationStatus);
    long countByVerificationStatusAndExpiryDateBeforeAndIsActiveTrue(String status, LocalDate date);
    long countByVerificationStatusAndExpiryDateBetweenAndIsActiveTrue(String status, LocalDate startDate, LocalDate endDate);
}
