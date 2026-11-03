// Central TanStack Query options for the live API features.
import { queryOptions } from "@tanstack/react-query";

import * as endorsements from "./endorsements";
import * as kb from "./knowledge-base";
import * as reviews from "./reviews";
import * as settings from "./settings";
import * as support from "./support";
import type { ArticleStatus } from "@/lib/types";

export const portalQ = {
  // settings
  preferences: () => queryOptions({ queryKey: ["preferences"], queryFn: settings.fetchPreferences }),
  tutorials: () => queryOptions({ queryKey: ["tutorials"], queryFn: settings.fetchTutorials }),
  profile: () => queryOptions({ queryKey: ["profile"], queryFn: settings.fetchProfile }),

  // reviews
  cbSummaries: () => queryOptions({ queryKey: ["cb_ratings"], queryFn: reviews.fetchCyberbackerSummaries }),
  cbReviews: (cyberbackerId?: number) =>
    queryOptions({ queryKey: ["cb_reviews", cyberbackerId ?? null], queryFn: () => reviews.fetchCyberbackerReviews({ cyberbackerId }) }),
  cbTrend: (months = 6) =>
    queryOptions({ queryKey: ["cb_rating_trend", months], queryFn: () => reviews.fetchRatingTrend({ months }) }),
  companyReviews: () => queryOptions({ queryKey: ["company_reviews"], queryFn: () => reviews.fetchCompanyReviews() }),
  endorsements: (cyberbackerId: number) =>
    queryOptions({ queryKey: ["endorsements", cyberbackerId], queryFn: () => endorsements.fetchEndorsements(cyberbackerId) }),

  // support
  ticketSummary: (admin: boolean) =>
    queryOptions({ queryKey: ["support-summary", admin], queryFn: () => support.fetchTicketSummary(admin) }),
  tickets: (filters: support.TicketFilters, admin: boolean) =>
    queryOptions({ queryKey: ["support-tickets", admin, filters], queryFn: () => support.fetchTickets(filters, admin) }),
  ticket: (id: number, admin: boolean) =>
    queryOptions({ queryKey: ["support-ticket", admin, id], queryFn: () => support.fetchTicket(id, admin) }),

  // knowledge base, client
  kbCategories: () => queryOptions({ queryKey: ["kb-categories"], queryFn: kb.fetchKbCategories }),
  kbPopular: () => queryOptions({ queryKey: ["kb-popular"], queryFn: () => kb.fetchPopularArticles() }),
  kbArticles: (filters: { category?: string; search?: string }) =>
    queryOptions({ queryKey: ["kb-articles", filters], queryFn: () => kb.fetchArticles(filters) }),
  kbArticle: (slug: string) => queryOptions({ queryKey: ["kb-article", slug], queryFn: () => kb.fetchArticleBySlug(slug) }),

  // knowledge base, admin
  kbCategoriesAdmin: () => queryOptions({ queryKey: ["kb-categories-admin"], queryFn: kb.fetchKbCategoriesAdmin }),
  kbArticlesAdmin: (filters: { status?: ArticleStatus; category_id?: number; search?: string }) =>
    queryOptions({ queryKey: ["kb-articles-admin", filters], queryFn: () => kb.fetchKbArticlesAdmin(filters) }),
  kbArticleAdmin: (id: number) => queryOptions({ queryKey: ["kb-article-admin", id], queryFn: () => kb.fetchKbArticleAdmin(id) }),
};
