package com.kemkendra.contact;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kemkendra.contact.dto.ContactInquiryRequest;
import com.kemkendra.notification.Notification;
import com.kemkendra.notification.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class PublicContactInquiryIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ContactInquiryRepository contactInquiryRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private com.kemkendra.identity.UserRepository userRepository;

    @BeforeEach
    void setUp() {
        contactInquiryRepository.deleteAll();
        notificationRepository.deleteAll();

        if (userRepository.findByEmail("admin.contact@kemkendra.com").isEmpty()) {
            com.kemkendra.identity.User admin = new com.kemkendra.identity.User();
            admin.setId(java.util.UUID.randomUUID());
            admin.setName("Admin Contact Manager");
            admin.setEmail("admin.contact@kemkendra.com");
            admin.setPasswordHash("hash123");
            admin.setRole(com.kemkendra.identity.UserRole.ADMIN);
            admin.setStatus(com.kemkendra.identity.UserStatus.ACTIVE);
            admin.setCreatedAt(java.time.Instant.now());
            admin.setUpdatedAt(java.time.Instant.now());
            userRepository.save(admin);
        }
    }

    @Test
    @DisplayName("Valid public chemical inquiry submits successfully, persists to DB, and notifies admins")
    void testValidInquirySubmission() throws Exception {
        ContactInquiryRequest request = new ContactInquiryRequest(
                "Dr. Ramesh Sharma",
                "r.sharma@biopharm.co.in",
                "+919876543210",
                "BioPharm Laboratories Ltd",
                "Paracetamol IP / USP Grade",
                "103-90-2",
                "5000 KG",
                "Requesting COA and commercial quote for batch delivery in Bengaluru.",
                null
        );

        mockMvc.perform(post("/api/v1/public/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", containsString("received by our technical desk")))
                .andExpect(jsonPath("$.inquiryId", not(emptyOrNullString())));

        List<ContactInquiry> inquiries = contactInquiryRepository.findAll();
        assertThat(inquiries, hasSize(1));
        ContactInquiry saved = inquiries.get(0);
        assertThat(saved.getName(), is("Dr. Ramesh Sharma"));
        assertThat(saved.getEmail(), is("r.sharma@biopharm.co.in"));
        assertThat(saved.getCasNumber(), is("103-90-2"));
        assertThat(saved.getChemicalInterest(), is("Paracetamol IP / USP Grade"));
        assertThat(saved.getStatus(), is("NEW"));

        List<Notification> adminNotifications = notificationRepository.findAll();
        boolean foundInquiryNotification = adminNotifications.stream()
                .anyMatch(n -> n.getTitle().contains("New Inbound Chemical Inquiry") &&
                               n.getMessage().contains("Dr. Ramesh Sharma"));
        assertThat("Admin notification should be generated for inbound inquiry", foundInquiryNotification, is(true));
    }

    @Test
    @DisplayName("Inquiry submission with missing required fields returns 400 validation error")
    void testMissingRequiredFields() throws Exception {
        ContactInquiryRequest invalidRequest = new ContactInquiryRequest(
                "", // Blank name
                "not-an-email", // Invalid email
                null,
                null,
                null,
                null,
                null,
                "", // Blank message
                null
        );

        mockMvc.perform(post("/api/v1/public/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        assertThat(contactInquiryRepository.findAll(), hasSize(0));
    }

    @Test
    @DisplayName("Honeypot spam bot submission is filtered out without persisting to DB")
    void testHoneypotSpamProtection() throws Exception {
        ContactInquiryRequest spamRequest = new ContactInquiryRequest(
                "Bot Spammer",
                "bot@spam-network.ru",
                "1234567890",
                "Crypto Seo Spams",
                "Spam Product",
                "000-00-0",
                "1",
                "Check out cheap links at spam.com",
                "http://bot-honeypot-trap.com" // Honeypot filled!
        );

        mockMvc.perform(post("/api/v1/public/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(spamRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // Spammed inquiry should not be saved in database
        assertThat(contactInquiryRepository.findAll(), hasSize(0));
    }
}
