package com.kemkendra.dispute;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, UUID>, JpaSpecificationExecutor<Dispute> {

    Optional<Dispute> findByDisputeNumber(String disputeNumber);

    Optional<Dispute> findByIdAndBuyerId(UUID id, UUID buyerId);

    Optional<Dispute> findByIdAndSupplierId(UUID id, Long supplierId);

    Page<Dispute> findByBuyerId(UUID buyerId, Pageable pageable);

    Page<Dispute> findByBuyerIdAndStatus(UUID buyerId, DisputeStatus status, Pageable pageable);

    Page<Dispute> findBySupplierId(Long supplierId, Pageable pageable);

    Page<Dispute> findBySupplierIdAndStatus(Long supplierId, DisputeStatus status, Pageable pageable);

    Page<Dispute> findByStatus(DisputeStatus status, Pageable pageable);

    long countByStatus(DisputeStatus status);

    long countByBuyerIdAndStatusIn(UUID buyerId, java.util.Collection<DisputeStatus> statuses);

    long countBySupplierIdAndStatusIn(Long supplierId, java.util.Collection<DisputeStatus> statuses);

    java.util.List<Dispute> findTop5ByBuyerIdOrderByCreatedAtDesc(UUID buyerId);

    java.util.List<Dispute> findTop5BySupplierIdOrderByCreatedAtDesc(Long supplierId);
}
