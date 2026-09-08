package com.kemkendra.admin.transaction.api;

import com.kemkendra.common.ResourceNotFoundException;
import com.kemkendra.dispute.DisputeService;
import com.kemkendra.dispute.DisputeStatus;
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
@RequestMapping("/api/v1/admin/disputes")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDisputeController {

    private final DisputeService disputeService;
    private final UserRepository userRepository;

    public AdminDisputeController(DisputeService disputeService, UserRepository userRepository) {
        this.disputeService = disputeService;
        this.userRepository = userRepository;
    }

    private User resolveUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResourceNotFoundException("Unauthenticated request");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found: " + authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<Page<DisputeDto>> listDisputes(
            @RequestParam(required = false) DisputeStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(disputeService.listDisputesForAdmin(status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DisputeDto> getDispute(@PathVariable UUID id) {
        return ResponseEntity.ok(disputeService.getDisputeForAdmin(id));
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<DisputeDto> assignDispute(
            @PathVariable UUID id,
            @Valid @RequestBody AssignDisputeRequest request,
            Authentication authentication) {
        User admin = resolveUser(authentication);
        return ResponseEntity.ok(disputeService.assignDispute(admin.getId(), id, request));
    }

    @PostMapping("/{id}/status")
    public ResponseEntity<DisputeDto> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDisputeStatusRequest request,
            Authentication authentication) {
        User admin = resolveUser(authentication);
        return ResponseEntity.ok(disputeService.updateDisputeStatus(admin.getId(), id, request));
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<DisputeDto> resolveDispute(
            @PathVariable UUID id,
            @Valid @RequestBody ResolveDisputeRequest request,
            Authentication authentication) {
        User admin = resolveUser(authentication);
        return ResponseEntity.ok(disputeService.resolveDispute(admin.getId(), id, request));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<DisputeDto> rejectDispute(
            @PathVariable UUID id,
            @Valid @RequestBody ResolveDisputeRequest request,
            Authentication authentication) {
        User admin = resolveUser(authentication);
        return ResponseEntity.ok(disputeService.rejectDispute(admin.getId(), id, request));
    }

    @PostMapping(value = "/{id}/respond", consumes = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<DisputeDto> respondDisputeJson(
            @PathVariable UUID id,
            @Valid @RequestBody RespondDisputeRequest request,
            Authentication authentication) {
        User admin = resolveUser(authentication);
        return ResponseEntity.ok(disputeService.respondToDispute(admin.getId(), id, request, null));
    }

    @PostMapping(value = "/{id}/respond/upload", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<DisputeDto> respondDisputeMultipart(
            @PathVariable UUID id,
            @RequestPart("data") @Valid RespondDisputeRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            Authentication authentication) {
        User admin = resolveUser(authentication);
        return ResponseEntity.ok(disputeService.respondToDispute(admin.getId(), id, request, files));
    }
}
