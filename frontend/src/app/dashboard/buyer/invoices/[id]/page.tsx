"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Invoice } from "@/features/invoice/types/invoice";
import { getBuyerInvoice } from "@/features/invoice/api/invoice";
import { InvoiceDetailView } from "@/features/invoice/components/InvoiceDetailView";

export default function BuyerInvoiceDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadInvoice();
    }
  }, [id]);

  async function loadInvoice() {
    try {
      setLoading(true);
      setError(null);
      const data = await getBuyerInvoice(id);
      setInvoice(data);
    } catch (err: any) {
      setError(err.message || "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
        <p className="text-sm">Loading tax invoice...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
          {error || "Invoice not found or access denied."}
        </div>
        <Link
          href="/dashboard/buyer/invoices"
          className="inline-block px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
        >
          &larr; Back to Invoices
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="print:hidden">
        <Link
          href="/dashboard/buyer/invoices"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
        >
          &larr; Back to Buyer Invoices
        </Link>
      </div>

      <InvoiceDetailView initialInvoice={invoice} userRole="BUYER" />
    </div>
  );
}
