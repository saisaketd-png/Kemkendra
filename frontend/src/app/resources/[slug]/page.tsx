import { Metadata } from "next";
import { Navbar } from "@/features/home/components/Navbar";
import { Footer } from "@/features/home/components/Footer";
import {
  RESOURCE_ARTICLES,
  getResourceBySlug,
  getAllResourceSlugs,
} from "@/features/resources/data/resourceArticles";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  User,
  Calendar,
  Tag,
  Share2,
  FileCheck2,
  HelpCircle,
  Building2,
} from "lucide-react";
import { serializeJsonLd } from "@/shared/utils/security";

export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kemkendra.online";

export async function generateStaticParams() {
  return getAllResourceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getResourceBySlug(slug);

  if (!article) {
    return {
      title: "Resource Not Found | KemKendra",
      robots: { index: false, follow: false },
    };
  }

  // Title format: [Article Title] | Chemical Sourcing Guide | KemKendra
  const title = `${article.title} | Chemical Sourcing Guide | KemKendra`;
  const description = article.summary;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/resources/${article.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/resources/${article.slug}`,
      siteName: "KemKendra",
      type: "article",
      publishedTime: article.publishedDate,
      modifiedTime: article.updatedDate,
      authors: [article.author],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ResourceArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getResourceBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = RESOURCE_ARTICLES.filter(
    (a) => a.slug !== article.slug && (a.categoryKey === article.categoryKey || a.tags.some((t) => article.tags.includes(t)))
  ).slice(0, 2);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    url: `${SITE_URL}/resources/${article.slug}`,
    datePublished: article.publishedDate,
    dateModified: article.updatedDate,
    author: {
      "@type": "Organization",
      name: article.author,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "KemKendra",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/resources/${article.slug}`,
    },
  };

  const faqJsonLd = article.content.faqs && article.content.faqs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: article.content.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }
    : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Resources",
        item: `${SITE_URL}/resources`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `${SITE_URL}/resources/${article.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] font-sans text-[#0F172A] antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />

      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-[#64748B] flex-wrap">
            <Link href="/" className="hover:text-[#155EEF]">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <Link href="/resources" className="hover:text-[#155EEF]">Resources</Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="text-[#0F172A] font-bold line-clamp-1">{article.title}</span>
          </nav>

          {/* Article Header Card */}
          <div className="bg-white border border-[#DCE3EC] rounded-3xl p-8 sm:p-12 shadow-2xs space-y-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#EFF4FF] text-[#155EEF] border border-[#BFDBFE]">
                {article.category}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                {article.readTime}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1F3A] tracking-tight leading-tight">
              {article.title}
            </h1>

            <p className="text-base text-[#475467] leading-relaxed">
              {article.summary}
            </p>

            {/* Author & Date Meta */}
            <div className="pt-4 border-t border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#64748B]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EFF4FF] border border-[#BFDBFE] text-[#155EEF] flex items-center justify-center font-bold text-sm">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-[#0F172A] text-sm">{article.author}</p>
                  <p className="text-[#64748B]">{article.authorRole}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                  Published {article.publishedDate}
                </span>
                <span>•</span>
                <span>Updated {article.updatedDate}</span>
              </div>
            </div>
          </div>

          {/* Article Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <article className="lg:col-span-8 bg-white border border-[#DCE3EC] rounded-3xl p-8 sm:p-12 shadow-2xs space-y-8">
              
              <div className="text-sm sm:text-base text-[#334155] leading-relaxed font-medium bg-[#F8FAFC] border-l-4 border-[#155EEF] p-4 sm:p-5 rounded-r-xl">
                {article.content.intro}
              </div>

              {article.content.sections.map((section, idx) => (
                <section key={idx} className="space-y-4 pt-4">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight border-b border-[#F1F5F9] pb-2">
                    {section.heading}
                  </h2>

                  {section.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-sm sm:text-base text-[#334155] leading-relaxed">
                      {p}
                    </p>
                  ))}

                  {section.bulletPoints && section.bulletPoints.length > 0 && (
                    <ul className="space-y-2.5 pt-2 pl-2">
                      {section.bulletPoints.map((bp, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#334155]">
                          <FileCheck2 className="w-4 h-4 text-[#155EEF] shrink-0 mt-0.5" />
                          <span>{bp}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              {/* FAQs Section if present */}
              {article.content.faqs && article.content.faqs.length > 0 && (
                <section className="space-y-4 pt-6">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2 border-b border-[#F1F5F9] pb-2">
                    <HelpCircle className="w-5 h-5 text-[#155EEF]" /> Frequently Asked Questions
                  </h2>

                  <div className="space-y-4 pt-2">
                    {article.content.faqs.map((faq, fIdx) => (
                      <div key={fIdx} className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                        <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">
                          {faq.question}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#475467] leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Conclusion */}
              <div className="pt-6 border-t border-[#E2E8F0] space-y-3">
                <h3 className="text-base font-bold text-[#0F172A]">Summary & Procurement Recommendation</h3>
                <p className="text-xs sm:text-sm text-[#475467] leading-relaxed">
                  {article.content.conclusion}
                </p>
              </div>

              {/* Tags */}
              <div className="pt-6 border-t border-[#F1F5F9] flex items-center gap-2 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-[#94A3B8]" />
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#EFF4FF] text-[#155EEF] border border-[#BFDBFE]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </article>

            {/* Sidebar CTAs & Related Resources */}
            <aside className="lg:col-span-4 space-y-6">
              
              {/* Sourcing Action Card */}
              <div className="bg-[#0B1F3A] text-white rounded-2xl p-6 shadow-md space-y-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#38BDF8] bg-[#0284C7]/20 border border-[#0284C7]/30 px-2 py-0.5 rounded">
                  Direct Procurement
                </span>
                <h3 className="text-lg font-bold text-white leading-snug">
                  Need chemical raw materials matching these specifications?
                </h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Search active supplier offerings or submit a multi-supplier RFQ to obtain verified commercial quotes and analytical COAs.
                </p>
                <div className="pt-2 space-y-2.5">
                  <Link
                    href="/products"
                    className="block w-full py-2.5 px-4 bg-[#155EEF] hover:bg-[#104EC6] text-white text-xs font-bold rounded-xl text-center transition-colors"
                  >
                    Browse Chemical Catalog
                  </Link>
                  <Link
                    href="/contact"
                    className="block w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl text-center transition-colors"
                  >
                    Contact Sourcing Desk
                  </Link>
                </div>
              </div>

              {/* Manufacturer Onboarding Card */}
              <div className="bg-white border border-[#DCE3EC] rounded-2xl p-6 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#155EEF]">
                  <Building2 className="w-4 h-4" /> For Chemical Manufacturers
                </div>
                <h4 className="text-sm font-bold text-[#0F172A]">
                  Supply verified raw materials to institutional buyers
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Join our audited directory to list commercial offerings, respond to buyer RFQs, and expand industrial distribution.
                </p>
                <div className="pt-2">
                  <Link
                    href="/register/supplier"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#155EEF] hover:underline"
                  >
                    <span>Apply for Manufacturer Audit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Related Resources */}
              {relatedArticles.length > 0 && (
                <div className="bg-white border border-[#DCE3EC] rounded-2xl p-6 shadow-2xs space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#475467]">
                    Related Technical Guides
                  </h4>
                  <div className="space-y-4">
                    {relatedArticles.map((rel) => (
                      <Link
                        key={rel.slug}
                        href={`/resources/${rel.slug}`}
                        className="block group space-y-1 border-b border-[#F1F5F9] pb-3 last:border-b-0 last:pb-0"
                      >
                        <p className="text-xs font-bold text-[#0F172A] group-hover:text-[#155EEF] transition-colors line-clamp-2">
                          {rel.title}
                        </p>
                        <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {rel.readTime}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </aside>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
