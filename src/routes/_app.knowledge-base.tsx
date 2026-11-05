import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  CreditCard,
  Eye,
  Rocket,
  Search,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { portalQ } from "@/lib/api/queries";

export const Route = createFileRoute("/_app/knowledge-base")({
  head: () => ({
    meta: [
      { title: "Knowledge Base — Cyberbacker" },
      { name: "description", content: "Guides, tutorials and best practices for working with Cyberbacker." },
    ],
  }),
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(portalQ.kbCategories());
    void context.queryClient.ensureQueryData(portalQ.kbPopular());
  },
  component: KnowledgeBase,
});

const icons: Record<string, LucideIcon> = { Rocket, Users, CreditCard, Zap };

function KnowledgeBase() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const categories = useQuery(portalQ.kbCategories());
  const popular = useQuery(portalQ.kbPopular());
  const articles = useQuery(portalQ.kbArticles({ search: search.trim() || undefined, category }));

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-elegant">
        <CardContent className="space-y-4 p-8 text-center">
          <BookOpen className="mx-auto h-9 w-9" />
          <h1 className="text-2xl font-bold">How can we help?</h1>
          <p className="text-sm text-primary-foreground/80">
            Search our guides, tutorials and best practices
          </p>
          <div className="relative mx-auto max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles…"
              className="h-11 bg-background pl-9 text-foreground"
            />
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Browse by category</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(categories.data ?? []).map((c) => {
            const Icon = icons[c.icon ?? ""] ?? BookOpen;
            const active = category === c.slug;
            return (
              <Card
                key={c.id}
                role="button"
                tabIndex={0}
                aria-pressed={active}
                onClick={() => setCategory(active ? undefined : c.slug)}
                onKeyDown={(e) => e.key === "Enter" && setCategory(active ? undefined : c.slug)}
                className={cn("shadow-card cursor-pointer transition-colors hover:border-primary/40", active && "border-primary")}
              >
                <CardContent className="space-y-2 p-5">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                  <p className="text-xs font-medium text-primary">{c.article_count} articles</p>
                </CardContent>
              </Card>
            );
          })}
          {categories.isPending && [...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Popular articles</CardTitle>
          {category && (
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setCategory(undefined)}>
              Clear category filter
            </Button>
          )}
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {(popular.data ?? []).map((a) => (
            <Link
              key={a.id}
              to="/knowledge-base/$slug"
              params={{ slug: a.slug }}
              className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{a.title}</p>
                <p className="truncate text-sm text-muted-foreground">{a.summary}</p>
              </div>
              <div className="hidden shrink-0 items-center gap-3 text-xs text-muted-foreground sm:flex">
                <Badge variant="secondary" className="font-normal">{a.category_name}</Badge>
                <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {a.view_count.toLocaleString()}</span>
                <span>{a.read_time_minutes} min</span>
              </div>
            </Link>
          ))}
          {popular.isPending && <div className="space-y-3 p-6">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{category ? "Filtered articles" : "All articles"}</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {articles.isPending ? (
            <div className="space-y-3 p-6">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (articles.data ?? []).length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">No articles match. Try a different search or category.</p>
          ) : (
            (articles.data ?? []).map((a) => (
              <Link
                key={a.id}
                to="/knowledge-base/$slug"
                params={{ slug: a.slug }}
                className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{a.title}</p>
                  <p className="truncate text-sm text-muted-foreground">{a.summary}</p>
                </div>
                <div className="hidden shrink-0 items-center gap-3 text-xs text-muted-foreground sm:flex">
                  <Badge variant="secondary" className="font-normal">{a.category_name}</Badge>
                  <span>{a.read_time_minutes} min</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
