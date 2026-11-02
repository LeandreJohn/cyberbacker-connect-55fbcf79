// Knowledge Base endpoints, client and admin sides.
import { apiFetch } from "@/lib/api/client";
import type {
  ArticleStatus,
  KbArticleAdminDetail,
  KbArticleAdminListItem,
  KbArticleCreate,
  KbArticleDetail,
  KbArticleListItem,
  KbArticleUpdate,
  KbCategory,
  KbCategoryAdmin,
  KbCategoryCreate,
  KbCategoryUpdate,
  KbImportReport,
} from "@/lib/types";

const CP = "/api/v1/cb_client_portal/knowledge_base";
const AP = "/api/v1/cb_admin_portal/knowledge_base";

export function fetchKbCategories(): Promise<KbCategory[]> {
  return apiFetch<KbCategory[]>(`${CP}/categories`);
}
export function fetchPopularArticles(limit = 5): Promise<KbArticleListItem[]> {
  return apiFetch<KbArticleListItem[]>(`${CP}/articles/popular?limit=${limit}`);
}
export function fetchArticles(filters: { category?: string; search?: string; limit?: number; offset?: number } = {}): Promise<KbArticleListItem[]> {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  params.set("limit", String(filters.limit ?? 20));
  if (filters.offset) params.set("offset", String(filters.offset));
  return apiFetch<KbArticleListItem[]>(`${CP}/articles?${params}`);
}
/** Every call adds 1 to the article's view_count — never call to prefetch. */
export function fetchArticleBySlug(slug: string): Promise<KbArticleDetail> {
  return apiFetch<KbArticleDetail>(`${CP}/articles/${slug}`);
}

// ---- admin ----

export function fetchKbCategoriesAdmin(): Promise<KbCategoryAdmin[]> {
  return apiFetch<KbCategoryAdmin[]>(`${AP}/categories`);
}
export function createKbCategory(input: KbCategoryCreate): Promise<KbCategoryAdmin> {
  return apiFetch<KbCategoryAdmin>(`${AP}/categories`, { method: "POST", body: JSON.stringify(input) });
}
export function updateKbCategory(id: number, patch: KbCategoryUpdate): Promise<KbCategoryAdmin> {
  return apiFetch<KbCategoryAdmin>(`${AP}/categories/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}
export function fetchKbArticlesAdmin(filters: { status?: ArticleStatus; category_id?: number; search?: string; limit?: number; offset?: number } = {}): Promise<KbArticleAdminListItem[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.category_id) params.set("category_id", String(filters.category_id));
  if (filters.search) params.set("search", filters.search);
  params.set("limit", String(filters.limit ?? 50));
  if (filters.offset) params.set("offset", String(filters.offset));
  return apiFetch<KbArticleAdminListItem[]>(`${AP}/articles?${params}`);
}
export function fetchKbArticleAdmin(id: number): Promise<KbArticleAdminDetail> {
  return apiFetch<KbArticleAdminDetail>(`${AP}/articles/${id}`);
}
export function createKbArticle(input: KbArticleCreate): Promise<KbArticleAdminDetail> {
  return apiFetch<KbArticleAdminDetail>(`${AP}/articles`, { method: "POST", body: JSON.stringify(input) });
}
export function updateKbArticle(id: number, patch: KbArticleUpdate): Promise<KbArticleAdminDetail> {
  return apiFetch<KbArticleAdminDetail>(`${AP}/articles/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}
export function deleteKbArticle(id: number): Promise<void> {
  return apiFetch<void>(`${AP}/articles/${id}`, { method: "DELETE" });
}
export function importKbArticles(file: File, options: { updateExisting?: boolean; dryRun?: boolean }): Promise<KbImportReport> {
  const form = new FormData();
  form.set("file", file);
  form.set("update_existing", String(Boolean(options.updateExisting)));
  form.set("dry_run", String(Boolean(options.dryRun)));
  return apiFetch<KbImportReport>(`${AP}/articles/import`, { method: "POST", body: form });
}
