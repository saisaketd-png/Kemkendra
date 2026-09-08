package com.kemkendra.invoice;

import com.kemkendra.common.ResourceNotFoundException;
import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.identity.UserRole;
import com.kemkendra.invoice.dto.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final UserRepository userRepository;

    public InvoiceController(InvoiceService invoiceService, UserRepository userRepository) {
        this.invoiceService = invoiceService;
        this.userRepository = userRepository;
    }

    private User resolveUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResourceNotFoundException("Unauthenticated");
        }
        String identifier = authentication.getName();
        return userRepository.findByEmail(identifier)
                .or(() -> {
                    try {
                        return userRepository.findById(UUID.fromString(identifier));
                    } catch (IllegalArgumentException e) {
                        return Optional.empty();
                    }
                })
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + identifier));
    }

    // ==========================================
    // 1. Business Tax Profile
    // ==========================================

    @GetMapping("/tax-profile/me")
    public ResponseEntity<BusinessTaxProfileDto> getMyTaxProfile(Authentication authentication) {
        User user = resolveUser(authentication);
        BusinessTaxProfileDto profile = invoiceService.getTaxProfile(user.getId());
        return ResponseEntity.ok(profile != null ? profile : new BusinessTaxProfileDto());
    }

    @PutMapping("/tax-profile/me")
    public ResponseEntity<BusinessTaxProfileDto> updateMyTaxProfile(
            @Valid @RequestBody BusinessTaxProfileDto dto,
            Authentication authentication) {
        User user = resolveUser(authentication);
        BusinessTaxProfileDto saved = invoiceService.saveTaxProfile(user.getId(), dto);
        return ResponseEntity.ok(saved);
    }

    // ==========================================
    // 2. Supplier Invoice Issuance
    // ==========================================

    @PostMapping("/invoices/issue")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<InvoiceDto> issueInvoice(
            @Valid @RequestBody IssueInvoiceRequest request,
            Authentication authentication) {
        User user = resolveUser(authentication);
        InvoiceDto created = invoiceService.issueInvoiceFromOrder(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ==========================================
    // 3. Buyer Endpoints
    // ==========================================

    @GetMapping("/invoices/buyer")
    @PreAuthorize("hasRole('BUYER') or hasRole('USER')")
    public ResponseEntity<Page<InvoiceDto>> getBuyerInvoices(
            @RequestParam(required = false) InvoiceStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        User user = resolveUser(authentication);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(invoiceService.listInvoicesForBuyer(user.getId(), status, pageable));
    }

    @GetMapping("/invoices/buyer/{id}")
    @PreAuthorize("hasRole('BUYER') or hasRole('USER')")
    public ResponseEntity<InvoiceDto> getBuyerInvoice(
            @PathVariable UUID id,
            Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(invoiceService.getInvoiceForBuyer(user.getId(), id));
    }

    @PostMapping("/invoices/{id}/payment")
    @PreAuthorize("hasRole('BUYER') or hasRole('USER')")
    public ResponseEntity<InvoiceDto> recordPayment(
            @PathVariable UUID id,
            @Valid @RequestBody RecordPaymentRequest request,
            Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(invoiceService.recordPayment(user.getId(), id, request));
    }

    @PostMapping("/invoices/{id}/dispute")
    @PreAuthorize("hasRole('BUYER') or hasRole('USER')")
    public ResponseEntity<InvoiceDto> disputeInvoice(
            @PathVariable UUID id,
            @Valid @RequestBody DisputeInvoiceRequest request,
            Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(invoiceService.disputeInvoice(user.getId(), id, request));
    }

    // ==========================================
    // 4. Supplier Endpoints
    // ==========================================

    @GetMapping("/invoices/supplier")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<Page<InvoiceDto>> getSupplierInvoices(
            @RequestParam(required = false) InvoiceStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        User user = resolveUser(authentication);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(invoiceService.listInvoicesForSupplier(user.getId(), status, pageable));
    }

    @GetMapping("/invoices/supplier/{id}")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<InvoiceDto> getSupplierInvoice(
            @PathVariable UUID id,
            Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(invoiceService.getInvoiceForSupplier(user.getId(), id));
    }

    @PostMapping("/invoices/supplier/{id}/cancel")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<InvoiceDto> cancelInvoice(
            @PathVariable UUID id,
            @RequestParam(required = false) String reason,
            Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(invoiceService.cancelInvoice(user.getId(), id, reason));
    }


    @PostMapping("/invoices/{id}/payments/{paymentId}/dispute")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<InvoiceDto> disputePayment(
            @PathVariable UUID id,
            @PathVariable UUID paymentId,
            @Valid @RequestBody DisputePaymentRequest request,
            Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(invoiceService.disputePayment(user.getId(), id, paymentId, request));
    }

    @PostMapping("/invoices/{id}/cancel")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<InvoiceDto> cancelInvoice(
            @PathVariable UUID id,
            @Valid @RequestBody CancelInvoiceRequest request,
            Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(invoiceService.cancelInvoice(user.getId(), id, request));
    }

    // ==========================================
    // 5. PDF Generation & Download
    // ==========================================

    @GetMapping("/invoices/{id}/pdf")
    public ResponseEntity<byte[]> downloadInvoicePdf(
            @PathVariable UUID id,
            Authentication authentication) {
        User user = resolveUser(authentication);
        boolean isAdmin = user.getRole() == UserRole.ADMIN;
        byte[] pdfBytes = invoiceService.generateInvoicePdf(id, user.getId(), isAdmin);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", "invoice-" + id + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
