-- V52: Create Notification Delivery Logs and Enhancements for Phase V1.1

-- 1. Enhance notifications table with business context and archive capability
ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS business_id UUID,
    ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_archived_created
    ON notifications(recipient_id, archived, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_business
    ON notifications(recipient_id, business_id);

CREATE INDEX IF NOT EXISTS idx_notifications_dedup
    ON notifications(recipient_id, type, entity_id, created_at DESC);

-- 3. Create notification_delivery_logs table for audit and retry
CREATE TABLE IF NOT EXISTS notification_delivery_logs (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id   UUID REFERENCES notifications(id) ON DELETE SET NULL,
    recipient_id      UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_email   VARCHAR(255) NOT NULL,
    channel           VARCHAR(20)  NOT NULL DEFAULT 'EMAIL',
    notification_type VARCHAR(60)  NOT NULL,
    subject           VARCHAR(255),
    status            VARCHAR(30)  NOT NULL,
    error_message     TEXT,
    retry_count       INT          NOT NULL DEFAULT 0,
    last_attempted_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_delivery_logs_status_created
    ON notification_delivery_logs(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_delivery_logs_recipient
    ON notification_delivery_logs(recipient_id);

CREATE INDEX IF NOT EXISTS idx_delivery_logs_notification
    ON notification_delivery_logs(notification_id);
