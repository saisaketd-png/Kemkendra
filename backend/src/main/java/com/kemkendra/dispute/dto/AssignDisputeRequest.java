package com.kemkendra.dispute.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class AssignDisputeRequest {

    @NotNull(message = "Admin user ID is required")
    private UUID adminId;

    public AssignDisputeRequest() {}

    public AssignDisputeRequest(UUID adminId) {
        this.adminId = adminId;
    }

    public UUID getAdminId() {
        return adminId;
    }

    public void setAdminId(UUID adminId) {
        this.adminId = adminId;
    }
}
