package com.kemkendra.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.net.InetAddress;

/**
 * Authoritative Client IP Resolution Service.
 *
 * Security Defense against IP Spoofing and Audit Trail Evasion:
 * 1. If the direct connecting peer (request.getRemoteAddr()) is an untrusted public IP,
 *    all client-controlled forwarding headers (X-Forwarded-For, CF-Connecting-IP, X-Real-IP)
 *    are strictly ignored to prevent attackers from spoofing their IP.
 * 2. If the connecting peer is a trusted reverse proxy (loopback, private RFC-1918 network,
 *    e.g. Render/AWS ALB load balancers or Docker bridge networks):
 *    - Scans X-Forwarded-For from RIGHT to LEFT to select the rightmost untrusted hop
 *      appended by the trusted proxy infrastructure.
 *    - Validates and falls back to CF-Connecting-IP or X-Real-IP if present.
 * 3. Falls back safely to request.getRemoteAddr() if no forwarded address resolves.
 */
@Component
public class ClientIpResolver {

    public String resolveClientIp(HttpServletRequest request) {
        if (request == null) {
            return "127.0.0.1";
        }

        String remoteAddr = request.getRemoteAddr();
        if (remoteAddr == null || remoteAddr.isBlank()) {
            remoteAddr = "127.0.0.1";
        }
        remoteAddr = remoteAddr.trim();

        // 1. Direct connection from an untrusted public peer: ignore all forwarding headers.
        if (!isTrustedProxy(remoteAddr)) {
            return remoteAddr;
        }

        // 2. Request arrived from a trusted proxy (e.g. Render/ALB, local dev, Docker network):
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            String[] hops = xForwardedFor.split(",");
            // Scan backwards from right to left to find the first client IP before trusted internal proxies
            for (int i = hops.length - 1; i >= 0; i--) {
                String candidate = hops[i].trim();
                if (isValidIpAddress(candidate)) {
                    if (!isTrustedProxy(candidate)) {
                        return candidate;
                    }
                }
            }
            // If all hops were internal IPs, use the leftmost valid IP
            for (String hop : hops) {
                String candidate = hop.trim();
                if (isValidIpAddress(candidate)) {
                    return candidate;
                }
            }
        }

        String cfConnectingIp = request.getHeader("CF-Connecting-IP");
        if (cfConnectingIp != null && !cfConnectingIp.isBlank()) {
            String candidate = cfConnectingIp.trim();
            if (isValidIpAddress(candidate)) {
                return candidate;
            }
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            String candidate = xRealIp.trim();
            if (isValidIpAddress(candidate)) {
                return candidate;
            }
        }

        return remoteAddr;
    }

    public boolean isTrustedProxy(String ip) {
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            return false;
        }
        String cleanIp = ip.trim();
        if ("127.0.0.1".equals(cleanIp) || "::1".equals(cleanIp) || "0:0:0:0:0:0:0:1".equals(cleanIp) || "localhost".equalsIgnoreCase(cleanIp)) {
            return true;
        }
        try {
            InetAddress addr = InetAddress.getByName(cleanIp);
            return addr.isLoopbackAddress() || addr.isSiteLocalAddress() || addr.isLinkLocalAddress();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isValidIpAddress(String ip) {
        if (ip == null || ip.isBlank()) {
            return false;
        }
        String clean = ip.trim();
        if (clean.length() > 45 || clean.contains(" ") || clean.contains("/") || clean.contains(";")) {
            return false;
        }
        try {
            InetAddress.getByName(clean);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
