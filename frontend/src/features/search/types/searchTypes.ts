export interface SearchSuggestionResponse {
  type: "PRODUCT" | "CAS" | "CATEGORY" | "SUPPLIER";
  title: string;
  subtitle?: string;
  url: string;
  matchedField?: string;
  badge?: string;
}

export interface SearchProductCardResponse {
  id: string;
  masterProductCode?: string;
  name: string;
  casNumber?: string;
  molecularFormula?: string;
  category: string;
  description?: string;
  status: string;
  primaryImageUrl?: string;
  minStartingPrice?: number;
  currency?: string;
  minPurity?: number;
  maxPurity?: number;
  grade?: string;
  offeringCount: number;
  verifiedSupplierCount: number;
  supplierNames: string[];
  countries: string[];
  coaAvailable: boolean;
  msdsAvailable: boolean;
  exportReady: boolean;
  availabilityStatus?: string;
  relevanceScore: number;
}

export interface PaginatedSearchResponse {
  content: SearchProductCardResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface SearchQueryParams {
  q?: string;
  category?: string;
  minPurity?: number | string;
  maxPurity?: number | string;
  supplierName?: string;
  country?: string;
  verifiedOnly?: boolean;
  inStockOnly?: boolean;
  minPrice?: number | string;
  maxPrice?: number | string;
  grade?: string;
  sort?: "relevance" | "newest" | "price_asc" | "price_desc" | "purity" | "supplier";
  page?: number;
  size?: number;
}
