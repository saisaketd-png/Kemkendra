package com.kemkendra.invoice;

import com.kemkendra.common.ResourceNotFoundException;
import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.invoice.dto.*;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class PaymentController {

    private final PaymentTrackingService paymentTrackingService;
    private final UserRepository userRepository;

    public PaymentController(PaymentTrackingService paymentTrackingService, UserRepository userRepository) {
        this.paymentTrackingService = paymentTrackingService;
        this.userRepository = userRepository;
    }

    private User resolveUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResourceNotFoundException("Unauthenticated request");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authentication.getName()));
    }

    @PostMapping(value = "/invoices/{id}/payments", consumes = {MediaType.APPLICATION_JSON_VALUE})
    @PreAuthorize("hasRole('BUYER') or hasRole('USER')")
    public ResponseEntity<InvoiceDto> recordPaymentJson(
            @PathVariable UUID id,
            @Valid @RequestBody RecordPaymentRequest request,
            Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(paymentTrackingService.recordPayment(user.getId(), id, request, null));
    }

    @PostMapping(value = "/invoices/{id}/payments/upload", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasRole('BUYER') or hasRole('USER')")
    public ResponseEntity<InvoiceDto> recordPaymentMultipart(
            @PathVariable UUID id,
            @RequestPart("data") @Valid RecordPaymentRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(paymentTrackingService.recordPayment(user.getId(), id, request, file));
    }

    @PostMapping(value = "/payments/proof/upload", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasRole('BUYER') or hasRole('USER')")
    public ResponseEntity<Map<String, Object>> uploadProofStandalone(
            @RequestPart("file") MultipartFile file) {
        PaymentTrackingService.ProofUploadResult result = paymentTrackingService.uploadPaymentProof(file);
        return ResponseEntity.ok(Map.of(
                "fileName", result.fileName(),
                "fileSize", result.fileSize(),
                "contentType", result.contentType(),
                "storageKey", result.storageKey()
        ));
    }

    @GetMapping("/payments/{paymentRecordId}/proof")
    public ResponseEntity<Resource> downloadPaymentProof(
            @PathVariable UUID paymentRecordId,
            Authentication authentication) {
        User user = resolveUser(authentication);
        PaymentTrackingService.PaymentProofDownload download = paymentTrackingService.loadPaymentProof(paymentRecordId, user);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(download.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + download.fileName() + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .body(download.resource());
    }

    @PostMapping("/invoices/{id}/payments/{paymentId}/confirm")
    @PreAuthorize("hasRole('SUPPLIER') or hasRole('ADMIN')")
    public ResponseEntity<InvoiceDto> confirmPayment(
            @PathVariable UUID id,
            @PathVariable UUID paymentId,
            @RequestBody(required = false) ConfirmPaymentRequest request,
            Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(paymentTrackingService.confirmPayment(user.getId(), id, paymentId, request));
    }

    @PostMapping("/invoices/{id}/payments/{paymentId}/reject")
    @PreAuthorize("hasRole('SUPPLIER') or hasRole('ADMIN')")
    public ResponseEntity<InvoiceDto> rejectPayment(
            @PathVariable UUID id,
            @PathVariable UUID paymentId,
            @Valid @RequestBody RejectPaymentRequest request,
            Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(paymentTrackingService.rejectPayment(user.getId(), id, paymentId, request));
    }

    @PostMapping("/invoices/{id}/payments/{paymentId}/request-info")
    @PreAuthorize("hasRole('SUPPLIER') or hasRole('ADMIN')")
    public ResponseEntity<InvoiceDto> requestPaymentInfo(
            @PathVariable UUID id,
            @PathVariable UUID paymentId,
            @Valid @RequestBody RequestPaymentInfoRequest request,
            Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(paymentTrackingService.requestPaymentInfo(user.getId(), id, paymentId, request));
    }
}
