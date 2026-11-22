package com.kemkendra.rfq.sourcing.api;

import com.kemkendra.rfq.sourcing.SourcingRequestStatus;
import com.kemkendra.rfq.sourcing.SourcingService;
import com.kemkendra.rfq.sourcing.dto.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Administrative APIs for KemKendra Sourcing operations.
 * Strictly restricted to platform administrators via {@code @PreAuthorize("hasRole('ADMIN')")}.
 */
@RestController
@RequestMapping("/api/v1/admin/sourcing")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSourcingController {

    private final SourcingService sourcingService;

    public AdminSourcingController(SourcingService sourcingService) {
        this.sourcingService = sourcingService;
    }

    /**
     * Get real-time overview counts for Sourcing Management dashboard.
     */
    @GetMapping("/stats")
    public ResponseEntity<SourcingStatsDto> getStats() {
        SourcingStatsDto stats = sourcingService.getSourcingStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * List all sourcing requests with optional status filtering and query search.
     */
    @GetMapping("/requests")
    public ResponseEntity<Page<SourcingRequestSummaryDto>> getRequests(
            @RequestParam(required = false) SourcingRequestStatus status,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        String effectiveQuery = (query != null && !query.trim().isEmpty()) ? query : q;
        Page<SourcingRequestSummaryDto> results = sourcingService.getAdminRequests(status, effectiveQuery, pageable);
        return ResponseEntity.ok(results);
    }

    /**
     * Get full details of a sourcing request for administration (assignments, suppliers, outreach, quotations, proposals).
     */
    @GetMapping("/requests/{id}")
    public ResponseEntity<SourcingRequestDetailDto> getRequestDetail(
            @PathVariable UUID id
    ) {
        SourcingRequestDetailDto detail = sourcingService.getAdminRequestDetail(id);
        return ResponseEntity.ok(detail);
    }

    /**
     * Update the lifecycle status of a sourcing request.
     */
    @PatchMapping("/requests/{id}/status")
    public ResponseEntity<SourcingRequestDetailDto> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSourcingStatusRequestDto dto,
            Authentication authentication
    ) {
        SourcingRequestDetailDto updated = sourcingService.updateStatus(id, dto, authentication);
        return ResponseEntity.ok(updated);
    }

    /**
     * Assign or reassign a sourcing executive to a request.
     */
    @PatchMapping("/requests/{id}/assign")
    public ResponseEntity<SourcingRequestDetailDto> assignExecutive(
            @PathVariable UUID id,
            @Valid @RequestBody AssignExecutiveDto dto,
            Authentication authentication
    ) {
        SourcingRequestDetailDto updated = sourcingService.assignExecutive(id, dto, authentication);
        return ResponseEntity.ok(updated);
    }

    /**
     * Update internal private notes for a sourcing request.
     */
    @PatchMapping("/requests/{id}/notes")
    public ResponseEntity<SourcingRequestDetailDto> updateNotes(
            @PathVariable UUID id,
            @RequestBody UpdateSourcingNotesDto dto,
            Authentication authentication
    ) {
        SourcingRequestDetailDto updated = sourcingService.updateNotes(id, dto, authentication);
        return ResponseEntity.ok(updated);
    }

    /**
     * Search existing registered KemKendra suppliers by company name or email to reuse profile and avoid duplicates.
     */
    @GetMapping("/directory/suppliers")
    public ResponseEntity<java.util.List<RegisteredSupplierLookupDto>> searchDirectorySuppliers(
            @RequestParam(required = false, defaultValue = "") String query
    ) {
        java.util.List<RegisteredSupplierLookupDto> results = sourcingService.searchDirectorySuppliers(query);
        return ResponseEntity.ok(results);
    }

    /**
     * Get all suppliers associated with a sourcing request.
     */
    @GetMapping("/requests/{id}/suppliers")
    public ResponseEntity<java.util.List<SourcingSupplierDto>> getSuppliers(
            @PathVariable UUID id
    ) {
        java.util.List<SourcingSupplierDto> suppliers = sourcingService.getSuppliersForRequest(id);
        return ResponseEntity.ok(suppliers);
    }

    /**
     * Add a supplier to a sourcing request.
     */
    @PostMapping("/requests/{id}/suppliers")
    public ResponseEntity<SourcingSupplierDto> addSupplier(
            @PathVariable UUID id,
            @Valid @RequestBody AddSourcingSupplierDto dto,
            Authentication authentication
    ) {
        SourcingSupplierDto created = sourcingService.addSupplier(id, dto, authentication);
        return ResponseEntity.ok(created);
    }

    /**
     * Update an identified supplier's information.
     */
    @PutMapping("/requests/{id}/suppliers/{supplierId}")
    public ResponseEntity<SourcingSupplierDto> updateSupplier(
            @PathVariable UUID id,
            @PathVariable UUID supplierId,
            @Valid @RequestBody UpdateSourcingSupplierDto dto,
            Authentication authentication
    ) {
        SourcingSupplierDto updated = sourcingService.updateSupplier(id, supplierId, dto, authentication);
        return ResponseEntity.ok(updated);
    }

    /**
     * Remove an identified supplier from a sourcing request.
     */
    @DeleteMapping("/requests/{id}/suppliers/{supplierId}")
    public ResponseEntity<Void> deleteSupplier(
            @PathVariable UUID id,
            @PathVariable UUID supplierId,
            Authentication authentication
    ) {
        sourcingService.deleteSupplier(id, supplierId, authentication);
        return ResponseEntity.noContent().build();
    }

    /**
     * Record an outreach communication with a supplier (call, email, discussion) and schedule follow-ups.
     */
    @PostMapping("/requests/{id}/outreach")
    public ResponseEntity<SourcingOutreachLogDto> logOutreach(
            @PathVariable UUID id,
            @Valid @RequestBody CreateOutreachLogDto dto,
            Authentication authentication
    ) {
        SourcingOutreachLogDto log = sourcingService.logOutreach(id, dto, authentication);
        return ResponseEntity.ok(log);
    }

    /**
     * Get outreach contact history for a specific supplier.
     */
    @GetMapping("/requests/{id}/suppliers/{supplierId}/outreach")
    public ResponseEntity<java.util.List<SourcingOutreachLogDto>> getSupplierOutreachHistory(
            @PathVariable UUID id,
            @PathVariable UUID supplierId
    ) {
        java.util.List<SourcingOutreachLogDto> history = sourcingService.getSupplierOutreachHistory(id, supplierId);
        return ResponseEntity.ok(history);
    }

    // =========================================================================
    // SUPPLIER QUOTATION MANAGEMENT
    // =========================================================================

    /**
     * Get all recorded supplier quotations for a sourcing request with landed cost metrics.
     */
    @GetMapping("/requests/{id}/quotations")
    public ResponseEntity<java.util.List<SourcingQuotationDto>> getQuotations(
            @PathVariable UUID id
    ) {
        java.util.List<SourcingQuotationDto> quotes = sourcingService.getQuotationsForRequest(id);
        return ResponseEntity.ok(quotes);
    }

    /**
     * Add a supplier quotation for a sourcing request.
     */
    @PostMapping("/requests/{id}/quotations")
    public ResponseEntity<SourcingQuotationDto> addQuotation(
            @PathVariable UUID id,
            @Valid @RequestBody AddSourcingQuotationDto dto,
            Authentication authentication
    ) {
        SourcingQuotationDto quotation = sourcingService.addQuotation(id, dto, authentication);
        return ResponseEntity.ok(quotation);
    }

    /**
     * Update an existing supplier quotation.
     */
    @PutMapping("/requests/{id}/quotations/{quotationId}")
    public ResponseEntity<SourcingQuotationDto> updateQuotation(
            @PathVariable UUID id,
            @PathVariable UUID quotationId,
            @Valid @RequestBody UpdateSourcingQuotationDto dto,
            Authentication authentication
    ) {
        SourcingQuotationDto quotation = sourcingService.updateQuotation(id, quotationId, dto, authentication);
        return ResponseEntity.ok(quotation);
    }

    /**
     * Delete a supplier quotation.
     */
    @DeleteMapping("/requests/{id}/quotations/{quotationId}")
    public ResponseEntity<Void> deleteQuotation(
            @PathVariable UUID id,
            @PathVariable UUID quotationId,
            Authentication authentication
    ) {
        sourcingService.deleteQuotation(id, quotationId, authentication);
        return ResponseEntity.noContent().build();
    }

    // =========================================================================
    // BUYER PROPOSAL MANAGEMENT
    // =========================================================================

    /**
     * Create a curated buyer-facing proposal with options.
     */
    @PostMapping("/requests/{id}/proposals")
    public ResponseEntity<SourcingProposalDto> createProposal(
            @PathVariable UUID id,
            @Valid @RequestBody CreateSourcingProposalDto dto,
            Authentication authentication
    ) {
        SourcingProposalDto proposal = sourcingService.createProposal(id, dto, authentication);
        return ResponseEntity.ok(proposal);
    }

    /**
     * Publish a draft proposal to make it visible to the buyer.
     */
    @PostMapping("/requests/{id}/proposals/{proposalId}/publish")
    public ResponseEntity<SourcingProposalDto> publishProposal(
            @PathVariable UUID id,
            @PathVariable UUID proposalId,
            Authentication authentication
    ) {
        SourcingProposalDto proposal = sourcingService.publishProposal(id, proposalId, authentication);
        return ResponseEntity.ok(proposal);
    }

    /**
     * Delete a proposal and its options.
     */
    @DeleteMapping("/requests/{id}/proposals/{proposalId}")
    public ResponseEntity<Void> deleteProposal(
            @PathVariable UUID id,
            @PathVariable UUID proposalId,
            Authentication authentication
    ) {
        sourcingService.deleteProposal(id, proposalId, authentication);
        return ResponseEntity.noContent().build();
    }
}
