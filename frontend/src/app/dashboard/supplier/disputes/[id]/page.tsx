"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { Dispute } from "@/features/dispute/types/dispute";
import { getSupplierDispute } from "@/features/dispute/api/dispute";
import { DisputeDetailView } from "@/features/dispute/components/DisputeDetailView";

export default function SupplierDisputeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDispute();
  }, [id]);

  async function loadDispute() {
    try {
      setLoading(true);
      setError(null);
      const data = await getSupplierDispute(id);
      setDispute(data);
    } catch (err: any) {
      setError(err.message || "Dispute not found");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <Link
          href="/dashboard/supplier/disputes"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition inline-flex items-center gap-1.5"
        >
          ← Back to Claims & Disputes
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
          <p className="text-sm">Loading dispute details...</p>
        </div>
      ) : dispute ? (
        <DisputeDetailView initialDispute={dispute} role="supplier" />
      ) : null}
    </div>
  );
}
