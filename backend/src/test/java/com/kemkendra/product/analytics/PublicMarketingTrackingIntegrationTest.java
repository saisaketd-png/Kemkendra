package com.kemkendra.product.analytics;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kemkendra.product.analytics.dto.PublicEventTrackRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class PublicMarketingTrackingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Public analytics track endpoint records valid conversion and page events")
    void testTrackValidEvents() throws Exception {
        PublicEventTrackRequest categoryEvent = new PublicEventTrackRequest(
                "CATEGORY_VIEW",
                "api-pharma",
                "Pharmaceutical APIs"
        );

        mockMvc.perform(post("/api/v1/public/analytics/track")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(categoryEvent)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tracked", is(true)));

        PublicEventTrackRequest regEvent = new PublicEventTrackRequest(
                "REG_START",
                "BUYER",
                null
        );

        mockMvc.perform(post("/api/v1/public/analytics/track")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regEvent)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tracked", is(true)));
    }

    @Test
    @DisplayName("Public analytics track endpoint ignores unknown event types safely")
    void testTrackUnknownEvent() throws Exception {
        PublicEventTrackRequest unknownEvent = new PublicEventTrackRequest(
                "UNKNOWN_ARBITRARY_TYPE",
                "test",
                null
        );

        mockMvc.perform(post("/api/v1/public/analytics/track")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(unknownEvent)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tracked", is(false)));
    }
}
