package com.kemkendra.dashboard.api;

import com.kemkendra.common.ResourceNotFoundException;
import com.kemkendra.dashboard.DashboardService;
import com.kemkendra.dashboard.dto.BuyerDashboardSummaryResponse;
import com.kemkendra.dashboard.dto.DashboardActivityItemDto;
import com.kemkendra.dashboard.dto.PendingActionDto;
import com.kemkendra.dashboard.dto.SupplierDashboardSummaryResponse;
import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.identity.UserRole;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    public DashboardController(DashboardService dashboardService, UserRepository userRepository) {
        this.dashboardService = dashboardService;
        this.userRepository = userRepository;
    }

    private User resolveUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResourceNotFoundException("Unauthenticated request");
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

    @GetMapping("/buyer")
    @PreAuthorize("hasRole('BUYER') or hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<BuyerDashboardSummaryResponse> getBuyerDashboard(Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(dashboardService.getBuyerDashboard(user));
    }

    @GetMapping("/supplier")
    @PreAuthorize("hasRole('SUPPLIER') or hasRole('ADMIN')")
    public ResponseEntity<SupplierDashboardSummaryResponse> getSupplierDashboard(Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(dashboardService.getSupplierDashboard(user));
    }

    @GetMapping("/activity")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DashboardActivityItemDto>> getActivityTimeline(
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        User user = resolveUser(authentication);
        boolean isSupplier = user.getRole() == UserRole.SUPPLIER;
        return ResponseEntity.ok(dashboardService.getUnifiedActivity(user, isSupplier, Math.min(limit, 50)));
    }

    @GetMapping("/pending-actions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PendingActionDto>> getPendingActions(Authentication authentication) {
        User user = resolveUser(authentication);
        if (user.getRole() == UserRole.SUPPLIER) {
            return ResponseEntity.ok(dashboardService.getSupplierDashboard(user).pendingActions());
        } else {
            return ResponseEntity.ok(dashboardService.getBuyerDashboard(user).pendingActions());
        }
    }
}
