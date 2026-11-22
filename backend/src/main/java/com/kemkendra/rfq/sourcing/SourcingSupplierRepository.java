package com.kemkendra.rfq.sourcing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SourcingSupplierRepository extends JpaRepository<SourcingSupplier, UUID> {
    List<SourcingSupplier> findBySourcingRequestIdOrderByCreatedAtDesc(UUID sourcingRequestId);

    Optional<SourcingSupplier> findBySourcingRequestIdAndId(UUID sourcingRequestId, UUID id);

    boolean existsBySourcingRequestIdAndSupplierId(UUID sourcingRequestId, Long supplierId);

    boolean existsBySourcingRequestIdAndSupplierNameIgnoreCase(UUID sourcingRequestId, String supplierName);

    List<SourcingSupplier> findBySupplierNameContainingIgnoreCase(String supplierName);
}
