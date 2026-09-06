import { resolveApiUrl } from "@/lib/apiUrl";
import { PaginatedSearchResponse, SearchQueryParams, SearchSuggestionResponse } from "../types/searchTypes";

export async function searchCatalog(params: SearchQueryParams = {}): Promise<PaginatedSearchResponse> {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.append("q", params.q.trim());
  if (params.category && params.category !== "ALL") searchParams.append("category", params.category);
  if (params.minPurity !== undefined && params.minPurity !== "") searchParams.append("minPurity", String(params.minPurity));
  if (params.maxPurity !== undefined && params.maxPurity !== "") searchParams.append("maxPurity", String(params.maxPurity));
  if (params.supplierName) searchParams.append("supplierName", params.supplierName.trim());
  if (params.country) searchParams.append("country", params.country.trim());
  if (params.verifiedOnly) searchParams.append("verifiedOnly", "true");
  if (params.inStockOnly) searchParams.append("inStockOnly", "true");
  if (params.minPrice !== undefined && params.minPrice !== "") searchParams.append("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined && params.maxPrice !== "") searchParams.append("maxPrice", String(params.maxPrice));
  if (params.grade) searchParams.append("grade", params.grade.trim());
  if (params.sort) searchParams.append("sort", params.sort);
  if (params.page !== undefined) searchParams.append("page", String(params.page));
  if (params.size !== undefined) searchParams.append("size", String(params.size));

  const queryStr = searchParams.toString();
  const url = resolveApiUrl(`/api/v1/public/search${queryStr ? `?${queryStr}` : ""}`);

  try {
    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) {
      if (process.env.NODE_ENV !== "production") {
        console.error(`Search API returned status ${res.status}`);
      }
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: params.size || 20,
        first: true,
        last: true,
        empty: true,
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Failed to execute search query:", err);
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: params.size || 20,
      first: true,
      last: true,
      empty: true,
    };
  }
}

export async function getSearchSuggestions(query: string, limit: number = 8): Promise<SearchSuggestionResponse[]> {
  if (!query || query.trim().length < 1) return [];

  const searchParams = new URLSearchParams();
  searchParams.append("q", query.trim());
  if (limit) searchParams.append("limit", String(limit));

  const url = resolveApiUrl(`/api/v1/public/search/suggestions?${searchParams.toString()}`);

  try {
    const res = await fetch(url, {
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to fetch suggestions:", err);
    }
    return [];
  }
}
