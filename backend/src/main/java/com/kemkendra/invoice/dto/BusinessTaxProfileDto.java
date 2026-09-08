package com.kemkendra.invoice.dto;

import com.kemkendra.invoice.GstRegistrationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

public class BusinessTaxProfileDto {

    private UUID id;
    private UUID userId;

    @NotBlank(message = "Legal business name is required")
    @Size(max = 255, message = "Legal business name cannot exceed 255 characters")
    private String legalBusinessName;

    private String tradeName;

    @Size(max = 15, message = "GSTIN cannot exceed 15 characters")
    private String gstin;

    private Boolean isGstRegistered = false;

    @NotNull(message = "GST registration type is required")
    private GstRegistrationType gstRegistrationType = GstRegistrationType.UNREGISTERED;

    @Size(max = 10, message = "PAN must be 10 characters")
    private String panNumber;

    @NotBlank(message = "Registered address is required")
    private String registeredAddress;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "State code is required")
    @Size(min = 2, max = 2, message = "State code must be a 2-digit Indian state code")
    private String stateCode;

    @NotBlank(message = "Postal code is required")
    private String postalCode;

    private String country = "India";
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BusinessTaxProfileDto() {
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getLegalBusinessName() { return legalBusinessName; }
    public void setLegalBusinessName(String legalBusinessName) { this.legalBusinessName = legalBusinessName; }

    public String getTradeName() { return tradeName; }
    public void setTradeName(String tradeName) { this.tradeName = tradeName; }

    public String getGstin() { return gstin; }
    public void setGstin(String gstin) { this.gstin = gstin; }

    public Boolean getIsGstRegistered() { return isGstRegistered; }
    public void setIsGstRegistered(Boolean isGstRegistered) { this.isGstRegistered = isGstRegistered; }

    public GstRegistrationType getGstRegistrationType() { return gstRegistrationType; }
    public void setGstRegistrationType(GstRegistrationType gstRegistrationType) { this.gstRegistrationType = gstRegistrationType; }

    public String getPanNumber() { return panNumber; }
    public void setPanNumber(String panNumber) { this.panNumber = panNumber; }

    public String getRegisteredAddress() { return registeredAddress; }
    public void setRegisteredAddress(String registeredAddress) { this.registeredAddress = registeredAddress; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getStateCode() { return stateCode; }
    public void setStateCode(String stateCode) { this.stateCode = stateCode; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
