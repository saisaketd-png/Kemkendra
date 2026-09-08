package com.kemkendra.contact;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "contact_inquiries")
public class ContactInquiry {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "company_name", length = 255)
    private String companyName;

    @Column(name = "chemical_interest", length = 255)
    private String chemicalInterest;

    @Column(name = "cas_number", length = 50)
    private String casNumber;

    @Column(name = "target_quantity", length = 100)
    private String targetQuantity;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "NEW";

    @Column(name = "ip_hash", length = 64)
    private String ipHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public ContactInquiry() {
        this.id = UUID.randomUUID();
    }

    public ContactInquiry(String name, String email, String phone, String companyName,
                          String chemicalInterest, String casNumber, String targetQuantity,
                          String message, String ipHash) {
        this.id = UUID.randomUUID();
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.companyName = companyName;
        this.chemicalInterest = chemicalInterest;
        this.casNumber = casNumber;
        this.targetQuantity = targetQuantity;
        this.message = message;
        this.ipHash = ipHash;
        this.status = "NEW";
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getChemicalInterest() {
        return chemicalInterest;
    }

    public void setChemicalInterest(String chemicalInterest) {
        this.chemicalInterest = chemicalInterest;
    }

    public String getCasNumber() {
        return casNumber;
    }

    public void setCasNumber(String casNumber) {
        this.casNumber = casNumber;
    }

    public String getTargetQuantity() {
        return targetQuantity;
    }

    public void setTargetQuantity(String targetQuantity) {
        this.targetQuantity = targetQuantity;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getIpHash() {
        return ipHash;
    }

    public void setIpHash(String ipHash) {
        this.ipHash = ipHash;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
