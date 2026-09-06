import { authenticatedFetch } from "@/features/auth/api/authenticatedFetch";
import {
  BulkUpdateNotificationPreferencesRequest,
  DeliveryLogsFilterParams,
  NotificationCategory,
  NotificationDeliveryLogDto,
  NotificationPreferencesResponse,
  NotificationResponse,
  PaginatedDeliveryLogs,
  PaginatedNotifications,
  UnreadCountResponse,
} from "../types/notification";

/**
 * Fetches paginated notifications for the authenticated user with optional category, read, businessId and archived filters.
 */
export async function getNotifications(
  page: number = 0,
  size: number = 20,
  category?: NotificationCategory,
  read?: boolean,
  businessId?: string,
  archived?: boolean
): Promise<PaginatedNotifications> {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("size", Math.min(size, 100).toString());
  params.set("sort", "createdAt,desc");

  if (category) {
    params.set("category", category);
  }
  if (read !== undefined && read !== null) {
    params.set("read", read.toString());
  }
  if (businessId) {
    params.set("businessId", businessId);
  }
  if (archived !== undefined && archived !== null) {
    params.set("archived", archived.toString());
  }

  const response = await authenticatedFetch(`/api/v1/notifications?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to load notifications: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetches the unread notification count for the authenticated user.
 */
export async function getUnreadCount(): Promise<number> {
  const response = await authenticatedFetch("/api/v1/notifications/unread-count");

  if (!response.ok) {
    throw new Error(`Failed to load unread count: ${response.statusText}`);
  }

  const data: UnreadCountResponse = await response.json();
  return data.count;
}

/**
 * Marks a single notification as read.
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<NotificationResponse> {
  const response = await authenticatedFetch(
    `/api/v1/notifications/${notificationId}/read`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to mark notification as read: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Marks all unread notifications for the authenticated user as read.
 */
export async function markAllNotificationsAsRead(): Promise<{ count: number }> {
  const response = await authenticatedFetch("/api/v1/notifications/read-all", {
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error(`Failed to mark all as read: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetches notification channel preferences for the authenticated user.
 */
export async function getNotificationPreferences(): Promise<NotificationPreferencesResponse> {
  const response = await authenticatedFetch("/api/v1/users/me/notification-preferences");

  if (!response.ok) {
    throw new Error(`Failed to load notification preferences: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Updates notification channel preferences for the authenticated user.
 */
export async function updateNotificationPreferences(
  request: BulkUpdateNotificationPreferencesRequest
): Promise<NotificationPreferencesResponse> {
  const response = await authenticatedFetch("/api/v1/users/me/notification-preferences", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.message || `Failed to update preferences: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Archives a single notification.
 */
export async function archiveNotification(
  notificationId: string
): Promise<NotificationResponse> {
  const response = await authenticatedFetch(
    `/api/v1/notifications/${notificationId}/archive`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to archive notification: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Deletes a single notification.
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const response = await authenticatedFetch(
    `/api/v1/notifications/${notificationId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete notification: ${response.statusText}`);
  }
}

/**
 * Admin: Fetches paginated delivery logs for email/push audit with optional filters.
 */
export async function getDeliveryLogs(
  params?: DeliveryLogsFilterParams
): Promise<PaginatedDeliveryLogs> {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.notificationType) q.set("notificationType", params.notificationType);
  if (params?.recipientEmail) q.set("recipientEmail", params.recipientEmail);
  if (params?.page !== undefined) q.set("page", params.page.toString());
  if (params?.size !== undefined) q.set("size", params.size.toString());

  const response = await authenticatedFetch(
    `/api/v1/admin/notifications/delivery-logs?${q.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to load delivery logs: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Admin: Retries a failed notification delivery log.
 */
export async function retryDeliveryLog(
  logId: string
): Promise<NotificationDeliveryLogDto> {
  const response = await authenticatedFetch(
    `/api/v1/admin/notifications/delivery-logs/${logId}/retry`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to retry delivery: ${response.statusText}`);
  }

  return response.json();
}

