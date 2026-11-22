import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kemkendra.online";

export const metadata: Metadata = {
  title: "Submit Sourcing Request | Custom Chemical & API Procurement | KemKendra",
  description:
    "Submit your custom chemical and pharmaceutical raw material requirements. Our procurement desk manually identifies verified manufacturers, aggregates competitive quotations, and delivers suitable options.",
  alternates: {
    canonical: `${SITE_URL}/sourcing/request`,
  },
  openGraph: {
    title: "Submit Sourcing Request | KemKendra Procurement Desk",
    description:
      "Submit custom chemical or API requirements for manual manufacturer sourcing and competitive quotation aggregation.",
    url: `${SITE_URL}/sourcing/request`,
    siteName: "KemKendra",
    type: "website",
  },
};

export default function SourcingRequestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
