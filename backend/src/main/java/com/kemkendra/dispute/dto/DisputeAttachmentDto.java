package com.kemkendra.dispute.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class DisputeAttachmentDto {

    private UUID id;
    private UUID uploadedById;
    private UUID documentId;
    private String fileName;
    private Long fileSize;
    private String contentType;
    private LocalDateTime createdAt;

    public DisputeAttachmentDto() {
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUploadedById() { return uploadedById; }
    public void setUploadedById(UUID uploadedById) { this.uploadedById = uploadedById; }

    public UUID getDocumentId() { return documentId; }
    public void setDocumentId(UUID documentId) { this.documentId = documentId; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
