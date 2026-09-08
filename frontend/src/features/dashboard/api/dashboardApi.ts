import { authenticatedFetch } from "@/features/auth/api/authenticatedFetch";
import {
  BuyerDashboardSummaryResponse,
  DashboardActivityItemDto,
  PendingActionDto,
  SupplierDashboardSummaryResponse,
} from "../types/dashboardTypes";

export async function getBuyerDashboardSummary(): Promise<BuyerDashboardSummaryResponse | null> {
  try {
    const res = await authenticatedFetch("/api/v1/dashboard/buyer");
    if (!res.ok) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to fetch buyer dashboard summary:", res.status);
      }
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("Error loading buyer dashboard summary:", err);
    return null;
  }
}

export async function getSupplierDashboardSummary(): Promise<SupplierDashboardSummaryResponse | null> {
  try {
    const res = await authenticatedFetch("/api/v1/dashboard/supplier");
    if (!res.ok) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to fetch supplier dashboard summary:", res.status);
      }
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("Error loading supplier dashboard summary:", err);
    return null;
  }
}

export async function getDashboardActivity(limit: number = 10): Promise<DashboardActivityItemDto[]> {
  try {
    const res = await authenticatedFetch(`/api/v1/dashboard/activity?limit=${limit}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Error loading activity timeline:", err);
    return [];
  }
}

export async function getPendingActions(): Promise<PendingActionDto[]> {
  try {
    const res = await authenticatedFetch("/api/v1/dashboard/pending-actions");
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Error loading pending actions:", err);
    return [];
  }
}
