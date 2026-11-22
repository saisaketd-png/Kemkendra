package com.kemkendra.rfq.sourcing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SourcingOutreachLogRepository extends JpaRepository<SourcingOutreachLog, UUID> {
    List<SourcingOutreachLog> findBySourcingRequestIdOrderByLoggedAtDesc(UUID sourcingRequestId);

    List<SourcingOutreachLog> findBySourcingSupplierIdOrderByLoggedAtDesc(UUID sourcingSupplierId);

    List<SourcingOutreachLog> findBySourcingRequestIdAndSourcingSupplierIdOrderByLoggedAtDesc(UUID sourcingRequestId, UUID sourcingSupplierId);
}
