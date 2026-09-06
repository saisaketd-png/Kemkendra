package com.kemkendra.contact.api;

import com.kemkendra.contact.ContactInquiryService;
import com.kemkendra.contact.dto.ContactInquiryRequest;
import com.kemkendra.contact.dto.ContactInquiryResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/public/contact")
public class PublicContactController {

    private final ContactInquiryService contactInquiryService;

    public PublicContactController(ContactInquiryService contactInquiryService) {
        this.contactInquiryService = contactInquiryService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> submitInquiry(
            @Valid @RequestBody ContactInquiryRequest request,
            HttpServletRequest httpRequest) {

        String clientIp = httpRequest.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isBlank()) {
            clientIp = httpRequest.getRemoteAddr();
        } else if (clientIp.contains(",")) {
            clientIp = clientIp.split(",")[0].trim();
        }

        ContactInquiryResponse response = contactInquiryService.processInquiry(request, clientIp);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Thank you. Your chemical procurement inquiry has been received by our technical desk.",
                "inquiryId", response.id() != null ? response.id().toString() : ""
        ));
    }
}
