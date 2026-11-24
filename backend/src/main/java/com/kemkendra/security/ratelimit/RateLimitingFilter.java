package com.kemkendra.security.ratelimit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.kemkendra.common.dto.ApiErrorResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingFilter.class);

    private final RateLimitProperties properties;
    private final RateLimiterStorage storage;
    private final ObjectMapper objectMapper;
    private final com.kemkendra.security.ClientIpResolver clientIpResolver;

    public RateLimitingFilter(RateLimitProperties properties,
                              RateLimiterStorage storage,
                              com.kemkendra.security.ClientIpResolver clientIpResolver) {
        this.properties = properties;
        this.storage = storage;
        this.clientIpResolver = clientIpResolver;
        this.objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (!properties.isEnabled()) {
            filterChain.doFilter(request, response);
            return;
        }

        RateLimitCategory category = categorizeRequest(request);
        if (category == RateLimitCategory.NONE) {
            filterChain.doFilter(request, response);
            return;
        }

        RateLimitProperties.LimitRule rule = properties.getRule(category);
        if (rule == null || rule.getLimit() <= 0) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = resolveClientIp(request);
        String rateLimitKey = category.name() + ":" + clientIp;

        RateLimitResult result = storage.tryConsume(rateLimitKey, rule.getLimit(), rule.getWindowSeconds());

        if (!result.allowed()) {
            log.warn("Rate limit exceeded for category [{}] from IP [{}] on path [{}]",
                    category, clientIp, request.getRequestURI());

            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", String.valueOf(result.retryAfterSeconds()));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);

            ApiErrorResponse errorResponse = new ApiErrorResponse(
                    LocalDateTime.now(),
                    HttpStatus.TOO_MANY_REQUESTS.value(),
                    "RATE_LIMIT_EXCEEDED",
                    "Too many requests. Please try again in " + result.retryAfterSeconds() + " seconds.",
                    request.getRequestURI()
            );

            response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
            return;
        }

        response.setHeader("X-RateLimit-Remaining", String.valueOf(result.remaining()));
        filterChain.doFilter(request, response);
    }

    private RateLimitCategory categorizeRequest(HttpServletRequest request) {
        String method = request.getMethod();
        String path = request.getRequestURI();

        if (path == null) {
            return RateLimitCategory.NONE;
        }

        if ("POST".equalsIgnoreCase(method)) {
            if ("/api/v1/auth/login".equals(path)) {
                return RateLimitCategory.LOGIN;
            }
            if ("/api/v1/auth/refresh".equals(path)) {
                return RateLimitCategory.REFRESH;
            }
            if (path.startsWith("/api/v1/auth/register")) {
                return RateLimitCategory.REGISTRATION;
            }
            if ("/api/v1/auth/forgot-password".equals(path) || "/api/v1/auth/reset-password".equals(path)) {
                return RateLimitCategory.PASSWORD_RESET;
            }
            if ("/api/v1/auth/verify-email".equals(path) || "/api/v1/auth/resend-verification".equals(path)) {
                return RateLimitCategory.EMAIL_VERIFICATION;
            }
            if (path.startsWith("/api/v1/public/contact") || path.startsWith("/api/v1/public/analytics")) {
                return RateLimitCategory.PUBLIC_API;
            }
        } else if ("GET".equalsIgnoreCase(method)) {
            if (path.startsWith("/api/v1/public") ||
                path.startsWith("/api/v1/products") ||
                path.startsWith("/api/v1/categories") ||
                path.startsWith("/api/v1/suppliers") ||
                path.startsWith("/api/v1/master-products") ||
                "/api/v1/countries".equals(path)) {
                return RateLimitCategory.PUBLIC_API;
            }
        }

        return RateLimitCategory.NONE;
    }

    /**
     * Authoritative Client IP Resolution.
     *
     * Security Defense against IP Spoofing and Rate-Limit Evasion:
     * 1. If the immediate connecting peer (request.getRemoteAddr()) is an untrusted public IP,
     *    all client-controlled forwarding headers (X-Forwarded-For, CF-Connecting-IP, X-Real-IP)
     *    are strictly ignored to prevent attackers from bypassing rate limits by cycling forged headers.
     * 2. If the connecting peer is a trusted reverse proxy / internal peer (loopback, private RFC-1918 network,
     *    such as Render's managed load balancers or container bridge network):
     *    - When X-Forwarded-For is present with multiple comma-separated hops, we scan from RIGHT to LEFT
     *      to pick the rightmost untrusted hop appended by the reverse proxy. Attackers prefixing arbitrary
     *      IPs on the left cannot alter the proxy-appended true client IP.
     *    - If CF-Connecting-IP is present (Cloudflare proxy in front of Render), it is validated and used.
     *    - If X-Real-IP is present, it is validated and used.
     * 3. Fall back safely to request.getRemoteAddr() if no valid forwarded IP is resolved.
     */
    private String resolveClientIp(HttpServletRequest request) {
        return clientIpResolver.resolveClientIp(request);
    }
}
