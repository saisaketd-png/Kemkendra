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
  Clock,
  ChevronRight,
  ArrowRight,
  User,
  Calendar,
  Tag,
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
      "@type": "Person",
      name: article.author,
      jobTitle: article.authorRole,
    },
    publisher: {
      "@type": "Organization",
      name: "KemKendra",
      url: SITE_URL,
    },
  };

  const faqJsonLd =
    article.content.faqs && article.content.faqs.length > 0
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
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans text-slate-900 antialiased">
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
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
            <Link href="/" className="hover:text-[#0052CC] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/resources" className="hover:text-[#0052CC] transition-colors">Resources</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold line-clamp-1">{article.title}</span>
          </nav>

          {/* Article Header Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 shadow-tactile-card space-y-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0052CC] border border-blue-200/80">
                {article.category}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {article.readTime}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#091E42] tracking-tight leading-tight">
              {article.title}
            </h1>

            <p className="text-base text-slate-600 leading-relaxed">
              {article.summary}
            </p>

            {/* Author & Date Meta */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200/80 text-[#0052CC] flex items-center justify-center font-bold text-sm shadow-2xs">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{article.author}</p>
                  <p className="text-slate-500">{article.authorRole}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Published {article.publishedDate}
                </span>
                <span>•</span>
                <span>Updated {article.updatedDate}</span>
              </div>
            </div>
          </div>

          {/* Article Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <article className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 shadow-tactile-card space-y-8">
              
              <div className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium bg-slate-50 border-l-4 border-[#0052CC] p-4 sm:p-5 rounded-r-xl">
                {article.content.intro}
              </div>

              {article.content.sections.map((section, idx) => (
                <section key={idx} className="space-y-4 pt-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight border-b border-slate-100 pb-2">
                    {section.heading}
                  </h2>

                  {section.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-sm sm:text-base text-slate-700 leading-relaxed">
                      {p}
                    </p>
                  ))}

                  {section.bulletPoints && section.bulletPoints.length > 0 && (
                    <ul className="space-y-2.5 pt-2 pl-2">
                      {section.bulletPoints.map((bp, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                          <FileCheck2 className="w-4 h-4 text-[#0052CC] shrink-0 mt-0.5" />
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
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-2">
                    <HelpCircle className="w-5 h-5 text-[#0052CC]" /> Frequently Asked Questions
                  </h2>

                  <div className="space-y-4 pt-2">
                    {article.content.faqs.map((faq, fIdx) => (
                      <div key={fIdx} className="p-5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          {faq.question}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Conclusion */}
              <div className="pt-6 border-t border-slate-200 space-y-3">
                <h3 className="text-base font-bold text-slate-900">Summary & Procurement Recommendation</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {article.content.conclusion}
                </p>
              </div>

              {/* Tags */}
              <div className="pt-6 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0052CC] border border-blue-200/80"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </article>

            {/* Sidebar CTAs & Related Resources */}
            <aside className="lg:col-span-4 space-y-6">
              
              {/* Sourcing Action Card */}
              <div className="bg-[#091E42] text-white rounded-2xl p-6 shadow-tactile-card border border-slate-800 space-y-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-200 bg-white/10 border border-white/20 px-2 py-0.5 rounded">
                  Direct Procurement
                </span>
                <h3 className="text-lg font-bold text-white leading-snug">
                  Need chemical raw materials matching these specifications?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Search active supplier offerings or submit a multi-supplier RFQ to obtain verified commercial quotes and analytical COAs.
                </p>
                <div className="pt-2 space-y-2.5">
                  <Link
                    href="/products"
                    className="block w-full py-2.5 px-4 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#003884] text-white text-xs font-bold rounded-lg text-center transition-colors shadow-2xs cursor-pointer"
                  >
                    Browse Chemical Catalog
                  </Link>
                  <Link
                    href="/contact"
                    className="block w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-lg text-center transition-colors cursor-pointer"
                  >
                    Contact Sourcing Desk
                  </Link>
                </div>
              </div>

              {/* Manufacturer Onboarding Card */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-tactile-card space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0052CC]">
                  <Building2 className="w-4 h-4" /> For Chemical Manufacturers
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Supply verified raw materials to institutional buyers
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Join our audited directory to list commercial offerings, respond to buyer RFQs, and expand industrial distribution.
                </p>
                <div className="pt-2">
                  <Link
                    href="/register/supplier"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0052CC] hover:underline"
                  >
                    <span>Apply for Manufacturer Audit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Related Resources */}
              {relatedArticles.length > 0 && (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-tactile-card space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Related Technical Guides
                  </h4>
                  <div className="space-y-4">
                    {relatedArticles.map((rel) => (
                      <Link
                        key={rel.slug}
                        href={`/resources/${rel.slug}`}
                        className="block group space-y-1 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0"
                      >
                        <p className="text-xs font-bold text-slate-900 group-hover:text-[#0052CC] transition-colors line-clamp-2">
                          {rel.title}
                        </p>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
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
