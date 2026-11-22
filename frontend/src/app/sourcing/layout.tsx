import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kemkendra.online";

export const metadata: Metadata = {
  title: "KemKendra Sourcing | Custom Chemical & API Procurement Assistance",
  description:
    "Can't find the chemical or pharmaceutical ingredient you need? Let KemKendra's procurement desk help you source custom chemicals, APIs, intermediates, and excipients from verified manufacturers.",
  alternates: {
    canonical: `${SITE_URL}/sourcing`,
  },
  openGraph: {
    title: "KemKendra Sourcing | Dedicated Chemical & Ingredient Sourcing Assistance",
    description:
      "Can't find the chemical or pharmaceutical ingredient you need? Let KemKendra help you source the right chemicals from verified suppliers.",
    url: `${SITE_URL}/sourcing`,
    siteName: "KemKendra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KemKendra Sourcing | Custom Chemical Procurement Assistance",
    description:
      "Source hard-to-find chemicals, APIs, intermediates, and excipients with KemKendra's dedicated sourcing desk.",
  },
};

export default function SourcingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
