package com.kemkendra.document;

import com.kemkendra.admin.audit.AuditLog;
import com.kemkendra.admin.audit.AuditLogRepository;
import com.kemkendra.admin.audit.AuditTargetType;
import com.kemkendra.document.dto.DocumentComplianceStatsDto;
import com.kemkendra.document.dto.ReviewDocumentRequest;
import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.identity.UserRole;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/documents")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDocumentController {

    private final DocumentService documentService;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminDocumentController(DocumentService documentService,
                                   UserRepository userRepository,
                                   AuditLogRepository auditLogRepository) {
        this.documentService = documentService;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    private User getAdminUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AccessDeniedException("Admin authentication required");
        }
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new AccessDeniedException("Authenticated user not found"));
        if (UserRole.ADMIN != user.getRole()) {
            throw new AccessDeniedException("Administrative privileges required");
        }
        return user;
    }

    @GetMapping
    public Page<DocumentResponse> getDocuments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) DocumentCategory category,
            @RequestParam(required = false) DocumentOwnerType ownerType,
            @RequestParam(required = false) UUID ownerId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {

        getAdminUser(authentication);
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by("createdAt").descending());
        return documentService.searchDocuments(status, category, ownerType, ownerId, search, pageable);
    }

    @GetMapping("/stats")
    public DocumentComplianceStatsDto getComplianceStats(Authentication authentication) {
        getAdminUser(authentication);
        return documentService.getComplianceStats();
    }

    @GetMapping("/{id}")
    public DocumentResponse getDocument(@PathVariable UUID id, Authentication authentication) {
        getAdminUser(authentication);
        return documentService.getDocument(id);
    }

    @GetMapping("/{id}/versions")
    public List<DocumentResponse> getDocumentVersions(@PathVariable UUID id, Authentication authentication) {
        getAdminUser(authentication);
        DocumentResponse doc = documentService.getDocument(id);
        return documentService.getDocumentVersions(doc.getDocumentGroupId());
    }

    @PostMapping("/{id}/approve")
    public DocumentResponse approveDocument(
            @PathVariable UUID id,
            @RequestBody(required = false) ReviewDocumentRequest request,
            Authentication authentication) {

        User admin = getAdminUser(authentication);
        String notes = request != null ? request.getReviewNotes() : null;
        return documentService.approveDocument(id, admin.getId(), notes);
    }

    @PostMapping("/{id}/reject")
    public DocumentResponse rejectDocument(
            @PathVariable UUID id,
            @Valid @RequestBody ReviewDocumentRequest request,
            Authentication authentication) {

        User admin = getAdminUser(authentication);
        if (request == null || request.getReviewNotes() == null || request.getReviewNotes().isBlank()) {
            throw new IllegalArgumentException("A rejection reason is required.");
        }
        return documentService.rejectDocument(id, admin.getId(), request.getReviewNotes());
    }

    @PostMapping("/{id}/expire")
    public DocumentResponse expireDocument(
            @PathVariable UUID id,
            @RequestBody(required = false) ReviewDocumentRequest request,
            Authentication authentication) {

        User admin = getAdminUser(authentication);
        String reason = request != null ? request.getReviewNotes() : "Manually expired by administrator";
        return documentService.expireDocument(id, admin.getId(), reason);
    }

    @GetMapping("/{id}/audit")
    public List<AuditLog> getDocumentAuditLogs(@PathVariable UUID id, Authentication authentication) {
        getAdminUser(authentication);
        return auditLogRepository.findByTargetTypeAndTargetIdOrderByCreatedAtDesc(
                AuditTargetType.DOCUMENT, id.toString());
    }
}
