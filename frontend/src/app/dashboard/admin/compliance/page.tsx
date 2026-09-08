import React from "react";
import { Metadata } from "next";
import { AdminComplianceWorkspace } from "@/features/documents/components/AdminComplianceWorkspace";

export const metadata: Metadata = {
  title: "Compliance & Document Verification | KemKendra Admin",
  description: "Audit, approve, reject, and govern B2B supplier and transaction compliance documents on KemKendra.",
};

export default function AdminCompliancePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminComplianceWorkspace />
    </div>
  );
}
