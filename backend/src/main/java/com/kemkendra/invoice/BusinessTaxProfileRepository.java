package com.kemkendra.invoice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BusinessTaxProfileRepository extends JpaRepository<BusinessTaxProfile, UUID> {
    Optional<BusinessTaxProfile> findByUserId(UUID userId);
    boolean existsByUserId(UUID userId);
    Optional<BusinessTaxProfile> findByGstin(String gstin);
}
