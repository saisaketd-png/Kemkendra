export interface ResourceArticle {
  slug: string;
  title: string;
  category: "Buyer Education" | "Regulatory & Compliance" | "Marketplace Usage" | "Supplier Education" | "Supply Chain" | "FAQs";
  categoryKey: string;
  summary: string;
  author: string;
  authorRole: string;
  publishedDate: string;
  updatedDate: string;
  readTime: string;
  tags: string[];
  content: {
    intro: string;
    sections: {
      heading: string;
      paragraphs: string[];
      bulletPoints?: string[];
    }[];
    faqs?: {
      question: string;
      answer: string;
    }[];
    conclusion: string;
  };
}

export const RESOURCE_ARTICLES: ResourceArticle[] = [
  {
    slug: "chemical-sourcing-guide-coa-msds-lot-verification",
    title: "Institutional Chemical Sourcing Guide: COA, MSDS, and Lot Verification",
    category: "Buyer Education",
    categoryKey: "buyer-education",
    summary: "A practical monograph on auditing vendor analytical documentation, verifying HPLC assay purity, moisture content, heavy metal limits, and batch consistency.",
    author: "KemKendra Technical Quality Desk",
    authorRole: "Technical Quality Assurance & Compliance",
    publishedDate: "2026-03-15",
    updatedDate: "2026-08-20",
    readTime: "7 min read",
    tags: ["COA Verification", "MSDS", "HPLC Assay", "Quality Assurance", "Pharma Grade"],
    content: {
      intro: "In pharmaceutical and industrial chemical procurement, verifying batch-specific analytical certificates is paramount. A standard Certificate of Analysis (COA) must not be treated as a clerical formality; it is a legally binding statement of chemical composition, lot consistency, and compliance with statutory pharmacopeial monographs.",
      sections: [
        {
          heading: "1. Essential Components of an Authentic COA",
          paragraphs: [
            "Every legitimate manufacturer COA must include traceable metadata that cross-references the batch production date, retest date, manufacturing site license, and specific analytical test protocols.",
            "Buyers should cross-examine the testing methods against standard compendia (USP, BP, EP, or IP) to ensure test specifications match required assay thresholds."
          ],
          bulletPoints: [
            "Manufacturer Name, Site Address, and Statutory Drug/Factory License Number",
            "Unique Batch/Lot Number matching container tamper-evident seals",
            "Manufacturing Date and Expiry/Retest Date",
            "Physical Appearance, Solubility, and Odor specifications",
            "Instrumental Assays (HPLC, GC, Titrimetric Assay with defined percentage limits)",
            "Impurity Profiling (Related substances, enantiomeric purity, residual solvents by GC-HS)"
          ]
        },
        {
          heading: "2. Verifying Safety Data Sheets (MSDS / SDS)",
          paragraphs: [
            "Under GHS (Globally Harmonized System) regulations, a compliant Safety Data Sheet must feature 16 standardized sections. Buyers must verify UN dangerous goods codes, Hazchem classifications, and specific personal protective equipment (PPE) protocols before authorizing warehouse receipt.",
            "Never accept an SDS without current revision dates or with generic CAS number redactions for regulated chemical substances."
          ]
        },
        {
          heading: "3. Retesting and Lot Discrepancy Protocols",
          paragraphs: [
            "Institutional buyers should establish standard quarantine procedures upon delivery. If secondary third-party laboratory verification yields an assay or moisture variance exceeding pharmacopeial tolerances, immediate formal notification and sample retention protocols must be initiated through the marketplace dispute mechanism."
          ]
        }
      ],
      faqs: [
        {
          question: "Can an Indian buyer rely on an overseas COA without local testing?",
          answer: "While foreign manufacturer COAs provide baseline certification, regulatory standards often recommend or mandate secondary release testing at a NABL-accredited or internal QC laboratory prior to commercial formulation."
        },
        {
          question: "What is the difference between Expiry Date and Retest Date?",
          answer: "An Expiry Date indicates the terminal shelf life of the chemical compound. A Retest Date signifies that the material may be re-analyzed according to validated monograph specs and extended if stability results conform to parameters."
        }
      ],
      conclusion: "Rigorous COA and MSDS verification protects chemical supply chains from substandard compounds, operational downtime, and regulatory non-compliance. KemKendra provides structured document vaults to inspect vendor analytical records prior to purchase order issuance."
    }
  },
  {
    slug: "dmf-who-gmp-regulatory-standards-api-procurement",
    title: "Navigating Drug Master Files (DMF) and WHO-GMP in API Procurement",
    category: "Regulatory & Compliance",
    categoryKey: "regulatory",
    summary: "Understanding the regulatory architecture governing Active Pharmaceutical Ingredients (APIs): Open Part vs. Closed Part DMFs, CEP certification, and WHO-GMP audit standards.",
    author: "Regulatory Affairs Advisory Group",
    authorRole: "Pharmaceutical Regulatory Affairs",
    publishedDate: "2026-04-10",
    updatedDate: "2026-08-25",
    readTime: "9 min read",
    tags: ["DMF", "WHO-GMP", "Active Pharmaceutical Ingredients", "CEP", "EDQM", "USFDA"],
    content: {
      intro: "Procuring Active Pharmaceutical Ingredients (APIs) for formulation and export requires comprehensive alignment with global regulatory health authorities. Sourcing managers must navigate Drug Master Files (DMF), Certificates of Suitability (CEP), and Good Manufacturing Practice (GMP) certifications to ensure supply chain integrity.",
      sections: [
        {
          heading: "1. The Anatomy of a Drug Master File (DMF)",
          paragraphs: [
            "A Drug Master File is a confidential dossier submitted to regulatory authorities (such as the US FDA or EDQM) containing detailed information about the chemistry, manufacturing, and controls (CMC) of an active ingredient.",
            "In commercial procurement, buyers receive the Applicant's Part (Open Part), which details specifications, stability data, analytical procedures, and packaging systems without exposing the manufacturer's proprietary synthesis route (Restricted Part)."
          ],
          bulletPoints: [
            "Type II DMF: Active Pharmaceutical Ingredients, drug substance intermediates, and materials used in their preparation",
            "Open Part (Applicant's Part): Shared with pharmaceutical formulators for submission in regulatory dossiers",
            "Letter of Access (LoA): Formal authorization permitting regulatory review of the supplier's confidential file on behalf of the buyer"
          ]
        },
        {
          heading: "2. WHO-GMP and Site Regulatory Audits",
          paragraphs: [
            "A valid WHO-GMP certificate issued by the competent national drug control authority (such as CDSCO in India) affirms that the manufacturing facility operates under rigorous cleanliness, process validation, air handling (HVAC), and cross-contamination prevention standards.",
            "Buyers should verify certificate validity, inspection dates, and the specific list of approved synthetic blocks on the license annexures."
          ]
        }
      ],
      faqs: [
        {
          question: "What is a Letter of Access (LoA)?",
          answer: "An LoA is a formal legal instrument provided by the API manufacturer to regulatory agencies granting permission to reference their DMF in connection with a specific applicant's drug application."
        },
        {
          question: "Can an API with an active DMF be substituted across suppliers without regulatory filing?",
          answer: "No. Sourcing an API from an alternate supplier constitutes a variation or post-approval change requiring regulatory notification and comparative stability testing."
        }
      ],
      conclusion: "Selecting verified API manufacturers with robust regulatory documentation ensures frictionless market approvals and uninterrupted commercial manufacturing."
    }
  },
  {
    slug: "b2b-chemical-rfq-best-practices-procurement",
    title: "B2B Chemical RFQ Best Practices: Specifications, Packaging, and Settlement Terms",
    category: "Marketplace Usage",
    categoryKey: "marketplace-usage",
    summary: "How to draft high-conversion Requests for Quotation (RFQs) that attract competitive commercial bids from verified chemical manufacturers.",
    author: "KemKendra Marketplace Operations",
    authorRole: "Procurement Strategy & Sourcing Desk",
    publishedDate: "2026-05-02",
    updatedDate: "2026-09-01",
    readTime: "6 min read",
    tags: ["RFQ", "Quotation", "Chemical Procurement", "INCOTERMS", "B2B Bidding"],
    content: {
      intro: "The Request for Quotation (RFQ) is the primary commercial mechanism for institutional chemical trade. Vague specifications lead to supplier delays, incorrect grades, and uncompetitive pricing. Structuring concise technical parameters ensures rapid turnaround and precise quotation terms.",
      sections: [
        {
          heading: "1. Core Parameters for High-Accuracy RFQs",
          paragraphs: [
            "Suppliers assess buyer seriousness based on the completeness of technical specifications provided in the initial inquiry. Clear CAS identification and target volume prevent mismatched quotations.",
            "Always state the intended application (e.g., technical grade, reagent grade, pharma compendial IP/BP/USP) to avoid receiving quotes for incompatible purity tiers."
          ],
          bulletPoints: [
            "Accurate Chemical Name & CAS Registry Number",
            "Minimum Required Purity Assay (e.g., 99.5% min by GC)",
            "Compendial Standard (e.g., Commercial Technical Grade, USP, LR, AR)",
            "Target Quantity & Unit of Measurement (KG, MT, Liters, Drum units)",
            "Preferred Packaging (e.g., 200L HDPE Drums, ISO Tank, 25KG Bags, IBC Totes)",
            "Target Delivery Location and INCOTERMS (Ex-Works, FOB, CIF, Door Delivery)"
          ]
        },
        {
          heading: "2. Setting Realistic Lead Times & Delivery Milestones",
          paragraphs: [
            "Custom synthesized chemicals and specialized API intermediates often require batch scheduling. Providing flexible delivery windows and specifying recurring monthly demand volume enables suppliers to optimize pricing tiers and offer advantageous batch economics."
          ]
        }
      ],
      faqs: [
        {
          question: "Can I request batch samples through an RFQ?",
          answer: "Yes. Buyers can request a Pre-Shipment Sample (PSS) or representative analytical sample along with manufacturer COA prior to placing commercial purchase orders."
        },
        {
          question: "How long are quotations typically valid on KemKendra?",
          answer: "Chemical quotations generally carry a validity of 7 to 14 days due to underlying raw material feedstock and energy price volatility."
        }
      ],
      conclusion: "Well-structured RFQs reduce negotiation cycles and enable verified manufacturers to submit competitive, accurate commercial terms quickly."
    }
  },
  {
    slug: "chemical-supplier-verification-audit-protocol",
    title: "Chemical Manufacturer Onboarding & Audit Verification Protocol",
    category: "Supplier Education",
    categoryKey: "supplier-education",
    summary: "An overview of KemKendra's multi-stage seller due diligence: GST verification, manufacturing licenses, pollution control consents, and factory audit checks.",
    author: "Supplier Governance Board",
    authorRole: "Trust, Safety & Supplier Verification",
    publishedDate: "2026-05-20",
    updatedDate: "2026-08-30",
    readTime: "8 min read",
    tags: ["Supplier Verification", "Due Diligence", "Factory Audit", "KYC", "Manufacturer"],
    content: {
      intro: "Maintaining buyer trust on KemKendra requires that every listed supplier is an authentic, legally compliant business entity. Our multi-stage verification architecture evaluates legal incorporation, statutory environmental clearances, and chemical manufacturing capabilities.",
      sections: [
        {
          heading: "1. Statutory Documentation Requirements",
          paragraphs: [
            "Before receiving the 'Verified Supplier' badge, manufacturers submit statutory corporate credentials for validation by the KemKendra compliance desk.",
            "Verification eliminates shell operations, unauthorized brokers, and unverified re-sellers."
          ],
          bulletPoints: [
            "Corporate Identification (PAN, GSTIN Certificate, Certificate of Incorporation)",
            "Manufacturing Drug License / Industrial License",
            "State Pollution Control Board (SPCB) Consent to Operate (CTO)",
            "Factory Registration & ISO 9001 / ISO 14001 certification where applicable",
            "Authorised Signatory Board Resolution"
          ]
        },
        {
          heading: "2. Offering Moderation & Catalog Governance",
          paragraphs: [
            "Every commercial chemical offering submitted by an onboarded supplier undergoes catalog governance before becoming publicly discoverable. Our technical administrators verify CAS number mappings, purity declarations, and documentation to prevent duplicate and miscategorized products."
          ]
        }
      ],
      faqs: [
        {
          question: "How long does supplier verification take?",
          answer: "Standard document verification is completed within 2 to 3 business days once all statutory licenses and registration credentials are submitted."
        },
        {
          question: "What happens if a supplier's statutory license expires?",
          answer: "The platform's compliance daemon notifies the supplier 30 days prior to document expiration. Unrenewed credentials lead to automatic status flags to safeguard marketplace integrity."
        }
      ],
      conclusion: "Rigorous manufacturer verification protects buyers, elevates compliant chemical producers, and ensures institutional procurement confidence across the platform."
    }
  },
  {
    slug: "industrial-solvents-storage-packaging-transport-standards",
    title: "Safe Handling, Packaging & Transport Protocols for Industrial Solvents",
    category: "Supply Chain",
    categoryKey: "supply-chain",
    summary: "Safety standards for storage, decanting, and transporting hazardous solvents: UN packaging codes, static electricity mitigation, and bulk container integrity.",
    author: "Industrial Safety Engineering Team",
    authorRole: "Chemical Logistics & Safety Engineering",
    publishedDate: "2026-06-12",
    updatedDate: "2026-09-02",
    readTime: "7 min read",
    tags: ["Industrial Solvents", "Dangerous Goods", "UN Packaging", "Chemical Safety", "Logistics"],
    content: {
      intro: "Industrial solvents like Acetone, Ethyl Acetate, Toluene, and Isopropanol represent high-volume commodities with strict safety considerations. Mishandling during storage, decanting, or highway transit poses severe combustion and chemical reactivity hazards.",
      sections: [
        {
          heading: "1. UN Certified Packaging and Container Standards",
          paragraphs: [
            "Hazardous chemical consignments must adhere to UN standard packaging classifications (Packing Group I, II, or III) depending on the degree of danger.",
            "Containers must withstand internal hydrostatic pressures, drop tests, and stacking requirements specified in regional motor vehicle dangerous goods rules."
          ],
          bulletPoints: [
            "UN 1A1 Non-Removable Head Steel Drums for flammable liquids",
            "Composite IBCs (Intermediate Bulk Containers) with grounding capabilities",
            "Dedicated stainless steel or lined ISO Tank containers for bulk liquid movements",
            "Tamper-evident vented bung seals preventing vapor pressure buildup"
          ]
        },
        {
          heading: "2. Static Dissipation and Decanting Safety",
          paragraphs: [
            "The primary ignition source during volatile solvent transfer is electrostatic discharge generated by fluid friction. Facilities must implement bonded conductive lines, copper earthing clamps, and controlled flow velocities below 1 meter per second during initial pipeline filling."
          ]
        }
      ],
      faqs: [
        {
          question: "What is an MSDS Section 14 checklist?",
          answer: "Section 14 contains transport information, including UN Number, Proper Shipping Name, Hazard Class, Packing Group, and Marine Pollutant classification."
        },
        {
          question: "Can food-grade solvents be transported in reconditioned drums?",
          answer: "No. Food and pharmaceutical grade chemicals must be transported exclusively in virgin, food-contact compliant containers to eliminate cross-contamination risks."
        }
      ],
      conclusion: "Adhering to certified packaging and transit standards prevents consignor liability, product degradation, and hazardous workplace incidents."
    }
  },
  {
    slug: "marketplace-faqs-bidding-invoicing-settlement",
    title: "KemKendra Marketplace FAQ: Verification, RFQ Bidding, Invoicing & Settlement",
    category: "FAQs",
    categoryKey: "faqs",
    summary: "Frequently asked questions covering account creation, bidding workflows, tax invoicing, commercial dispute resolution, and payment confirmations.",
    author: "KemKendra User Operations Desk",
    authorRole: "Customer Experience & Commercial Support",
    publishedDate: "2026-06-25",
    updatedDate: "2026-09-05",
    readTime: "5 min read",
    tags: ["FAQs", "Escrow", "Invoicing", "GST", "Payment Confirmation", "Dispute Resolution"],
    content: {
      intro: "Everything you need to know about navigating the KemKendra B2B chemical trading platform. This FAQ provides clarity on commercial workflows, user verification, quotation negotiations, and invoice settlement.",
      sections: [
        {
          heading: "General Platform Questions",
          paragraphs: [
            "KemKendra is an institutional marketplace designed specifically for chemical manufacturers, distributors, contract research organizations (CROs), and enterprise procurement teams."
          ]
        }
      ],
      faqs: [
        {
          question: "Is there a fee to register as a buyer or browse chemical products?",
          answer: "No. Buyer account registration, chemical search, and RFQ creation are completely free of charge for institutional users."
        },
        {
          question: "How do commercial payments work between buyers and suppliers?",
          answer: "Once a purchase order is accepted, the supplier issues a formal tax invoice with statutory GST breakdowns. Buyers submit payment confirmation proof (NEFT/RTGS transaction reference), which is verified before order dispatch and completion."
        },
        {
          question: "What happens if delivered chemicals do not meet the agreed COA specification?",
          answer: "Buyers have a defined inspection window upon delivery to log an official dispute with analytical evidence. The platform arbitrates resolution, withholding settlement until corrective action or return authorization is completed."
        },
        {
          question: "Can foreign chemical manufacturers register to sell in India?",
          answer: "Yes. Overseas suppliers with valid international incorporation, export readiness, and authorized import-export codes (IEC) are eligible for onboarding."
        },
        {
          question: "Are chemical prices publicly displayed on the platform?",
          answer: "To reflect dynamic feedstock fluctuations and high-volume institutional packaging tiers, pricing is established through direct supplier quotation bids tailored to specific lot quantities and delivery terms."
        }
      ],
      conclusion: "Have additional operational or commercial questions? Contact our dedicated chemical procurement desk directly via our Contact Desk or telephone support."
    }
  }
];

export function getResourceBySlug(slug: string): ResourceArticle | undefined {
  return RESOURCE_ARTICLES.find((a) => a.slug === slug);
}

export function getAllResourceSlugs(): string[] {
  return RESOURCE_ARTICLES.map((a) => a.slug);
}
