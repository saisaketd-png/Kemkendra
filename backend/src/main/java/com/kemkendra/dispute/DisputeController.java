package com.kemkendra.dispute;

import com.kemkendra.common.ResourceNotFoundException;
import com.kemkendra.dispute.dto.*;
import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/disputes")
public class DisputeController {

    private final DisputeService disputeService;
    private final UserRepository userRepository;

    public DisputeController(DisputeService disputeService, UserRepository userRepository) {
        this.disputeService = disputeService;
        this.userRepository = userRepository;
    }

    private User resolveUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResourceNotFoundException("Unauthenticated request");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authentication.getName()));
    }

    // ==========================================
    // Buyer Endpoints
    // ==========================================

    @PostMapping(consumes = {MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasRole('BUYER') or hasRole('USER')")
    public ResponseEntity<DisputeDto> createDisputeJson(
            @Valid @RequestBody CreateDisputeRequest request,
            Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(disputeService.createDispute(user.getId(), request, null));
    }

    @PostMapping(value = "/upload", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasRole('BUYER') or hasRole('USER')")
    public ResponseEntity<DisputeDto> createDisputeMultipart(
            @RequestPart("data") @Valid CreateDisputeRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(disputeService.createDispute(user.getId(), request, files));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('BUYER') or hasRole('USER')")
    public ResponseEntity<Page<DisputeDto>> getMyDisputes(
            @RequestParam(required = false) DisputeStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        User user = resolveUser(authentication);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(disputeService.listDisputesForBuyer(user.getId(), status, pageable));
    }

    @GetMapping("/my/{id}")
    @PreAuthorize("hasRole('BUYER') or hasRole('USER')")
    public ResponseEntity<DisputeDto> getMyDispute(
            @PathVariable UUID id,
            Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(disputeService.getDisputeForBuyer(user.getId(), id));
    }

    @PostMapping(value = "/my/{id}/respond", consumes = {MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasRole('BUYER') or hasRole('USER')")
    public ResponseEntity<DisputeDto> respondDisputeBuyerJson(
            @PathVariable UUID id,
            @Valid @RequestBody RespondDisputeRequest request,
            Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(disputeService.respondToDispute(user.getId(), id, request, null));
    }

    @PostMapping(value = "/my/{id}/respond/upload", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasRole('BUYER') or hasRole('USER')")
    public ResponseEntity<DisputeDto> respondDisputeBuyerMultipart(
            @PathVariable UUID id,
            @RequestPart("data") @Valid RespondDisputeRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(disputeService.respondToDispute(user.getId(), id, request, files));
    }

    // ==========================================
    // Supplier Endpoints
    // ==========================================

    @GetMapping("/supplier")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<Page<DisputeDto>> getSupplierDisputes(
            @RequestParam(required = false) DisputeStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        User user = resolveUser(authentication);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(disputeService.listDisputesForSupplier(user.getId(), status, pageable));
    }

    @GetMapping("/supplier/{id}")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<DisputeDto> getSupplierDispute(
            @PathVariable UUID id,
            Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(disputeService.getDisputeForSupplier(user.getId(), id));
    }

    @PostMapping(value = "/supplier/{id}/respond", consumes = {MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<DisputeDto> respondDisputeSupplierJson(
            @PathVariable UUID id,
            @Valid @RequestBody RespondDisputeRequest request,
            Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(disputeService.respondToDispute(user.getId(), id, request, null));
    }

    @PostMapping(value = "/supplier/{id}/respond/upload", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<DisputeDto> respondDisputeSupplierMultipart(
            @PathVariable UUID id,
            @RequestPart("data") @Valid RespondDisputeRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(disputeService.respondToDispute(user.getId(), id, request, files));
    }
}
