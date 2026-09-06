import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kemkendra.online";

export const metadata: Metadata = {
  title: "Contact KemKendra | Chemical Procurement & Supplier Support Desk",
  description:
    "Contact KemKendra's chemical procurement desk in Bengaluru, Karnataka. Call +91 7676447077 or email kemkendra1@gmail.com for bulk chemical inquiries, RFQs, and supplier verification.",
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: "Contact KemKendra | Chemical Procurement & Supplier Support",
    description:
      "Contact KemKendra's chemical procurement desk in Bengaluru, Karnataka. Call +91 7676447077 or email kemkendra1@gmail.com for bulk chemical inquiries.",
    url: `${SITE_URL}/contact`,
    siteName: "KemKendra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact KemKendra | Chemical Procurement Support",
    description: "Contact KemKendra's chemical procurement desk in Bengaluru, Karnataka.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
