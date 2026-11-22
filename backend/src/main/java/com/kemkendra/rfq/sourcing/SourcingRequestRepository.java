package com.kemkendra.rfq.sourcing;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SourcingRequestRepository extends JpaRepository<SourcingRequest, UUID>, JpaSpecificationExecutor<SourcingRequest> {

    List<SourcingRequest> findByBuyerIdOrderByCreatedAtDesc(UUID buyerId);

    Page<SourcingRequest> findByBuyerIdOrderByCreatedAtDesc(UUID buyerId, Pageable pageable);

    Optional<SourcingRequest> findByIdAndBuyerId(UUID id, UUID buyerId);

    Optional<SourcingRequest> findBySourcingRequestReference(String sourcingRequestReference);

    Page<SourcingRequest> findByStatusOrderByCreatedAtDesc(SourcingRequestStatus status, Pageable pageable);

    long countByStatus(SourcingRequestStatus status);

    long countByStatusIn(List<SourcingRequestStatus> statuses);

    @Query("SELECT sr FROM SourcingRequest sr WHERE " +
           "(:status IS NULL OR sr.status = :status) AND " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(sr.productName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(sr.sourcingRequestReference) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(sr.casNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(sr.category) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<SourcingRequest> searchRequests(@Param("status") SourcingRequestStatus status,
                                         @Param("query") String query,
                                         Pageable pageable);
}
