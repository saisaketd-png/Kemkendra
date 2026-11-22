package com.kemkendra.rfq.sourcing.api;

import com.kemkendra.rfq.sourcing.SourcingService;
import com.kemkendra.rfq.sourcing.dto.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Buyer-facing APIs for KemKendra Sourcing.
 * Restricted to authenticated users with role USER or ADMIN.
 */
@RestController
@RequestMapping("/api/v1/sourcing/requests")
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class SourcingRequestController {

    private final SourcingService sourcingService;

    public SourcingRequestController(SourcingService sourcingService) {
        this.sourcingService = sourcingService;
    }

    /**
     * Submit a new sourcing request.
     */
    @PostMapping
    public ResponseEntity<SourcingRequestDetailDto> submitRequest(
            @Valid @RequestBody CreateSourcingRequestDto dto,
            Authentication authentication
    ) {
        SourcingRequestDetailDto created = sourcingService.createRequest(dto, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Get all sourcing requests submitted by the currently authenticated buyer.
     */
    @GetMapping("/my")
    public ResponseEntity<List<SourcingRequestSummaryDto>> getMyRequests(
            Authentication authentication
    ) {
        List<SourcingRequestSummaryDto> requests = sourcingService.getMyRequests(authentication);
        return ResponseEntity.ok(requests);
    }

    /**
     * Get paginated sourcing requests submitted by the currently authenticated buyer.
     */
    @GetMapping("/my/paged")
    public ResponseEntity<Page<SourcingRequestSummaryDto>> getMyRequestsPaged(
            Authentication authentication,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<SourcingRequestSummaryDto> requests = sourcingService.getMyRequests(authentication, pageable);
        return ResponseEntity.ok(requests);
    }

    /**
     * Get specific sourcing request details.
     * Enforces ownership so buyers can only see their own requests.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SourcingRequestDetailDto> getRequestDetail(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        SourcingRequestDetailDto detail = sourcingService.getRequestDetail(id, authentication);
        return ResponseEntity.ok(detail);
    }

    /**
     * Buyer submits requested additional information for a sourcing request.
     */
    @PatchMapping("/{id}/additional-info")
    public ResponseEntity<SourcingRequestDetailDto> provideAdditionalInformation(
            @PathVariable UUID id,
            @Valid @RequestBody ProvideAdditionalInformationDto dto,
            Authentication authentication
    ) {
        SourcingRequestDetailDto updated = sourcingService.provideAdditionalInformation(id, dto, authentication);
        return ResponseEntity.ok(updated);
    }

    /**
     * Get published proposals for a buyer's sourcing request.
     */
    @GetMapping("/{id}/proposals")
    public ResponseEntity<List<SourcingProposalDto>> getPublishedProposals(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        List<SourcingProposalDto> proposals = sourcingService.getBuyerPublishedProposals(id, authentication);
        return ResponseEntity.ok(proposals);
    }

    /**
     * Buyer expresses interest or accepts a curated supplier option in a proposal.
     */
    @PostMapping("/{id}/proposals/{proposalId}/options/{optionId}/interest")
    public ResponseEntity<SourcingProposalDto> expressInterest(
            @PathVariable UUID id,
            @PathVariable UUID proposalId,
            @PathVariable UUID optionId,
            @Valid @RequestBody BuyerOptionDecisionDto dto,
            Authentication authentication
    ) {
        SourcingProposalDto updated = sourcingService.expressBuyerInterestInOption(id, proposalId, optionId, dto, authentication);
        return ResponseEntity.ok(updated);
    }

    /**
     * Buyer submits clarification question regarding a proposal.
     */
    @PostMapping("/{id}/proposals/{proposalId}/clarification")
    public ResponseEntity<SourcingProposalDto> requestClarification(
            @PathVariable UUID id,
            @PathVariable UUID proposalId,
            @Valid @RequestBody BuyerClarificationRequestDto dto,
            Authentication authentication
    ) {
        SourcingProposalDto updated = sourcingService.submitBuyerClarification(id, proposalId, dto, authentication);
        return ResponseEntity.ok(updated);
    }
}
