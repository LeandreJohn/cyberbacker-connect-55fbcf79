import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Clock, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { renderMarkdown } from "@/lib/markdown";
import { portalQ } from "@/lib/api/queries";

export const Route = createFileRoute("/_app/knowledge-base/$slug")({
  head: () => ({
    meta: [
      { title: "Knowledge Base Article — Cyberbacker" },
      { name: "description", content: "Knowledge base article from the Cyberbacker Knowledge Base." },
      { name: "robots", content: "noindex" },
    ],
  }),
  // No loader prefetch: opening an article counts one view, so the detail is
  // fetched exactly once by the component query.
  component: KbArticlePage,
});

function KbArticlePage() {
  const { slug } = Route.useParams();
  // Fetching the article also increments its view count.
  const { data: article, isPending, error } = useQuery(portalQ.kbArticle(slug));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
        <Link to="/knowledge-base"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Knowledge Base</Link>
      </Button>

      {isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-center">
          <p className="text-sm font-medium text-destructive">{error instanceof Error ? error.message : "Article not found"}</p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link to="/knowledge-base">Browse all articles</Link>
          </Button>
        </div>
      ) : article ? (
        <article className="space-y-6">
          <header className="space-y-3 border-b border-border pb-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="font-normal">{article.category_name}</Badge>
              <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {article.view_count.toLocaleString()} views</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {article.read_time_minutes} min read</span>
              {article.published_at && <span>Updated {new Date(article.updated_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>}
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{article.title}</h1>
            {article.summary && <p className="text-sm text-muted-foreground">{article.summary}</p>}
          </header>
          <div>{renderMarkdown(article.body)}</div>
          <footer className="flex items-center gap-2 border-t border-border pt-6 text-xs text-muted-foreground">
            <BookOpen className="h-4 w-4 text-primary" />
            Cyberbacker Knowledge Base
          </footer>
        </article>
      ) : null}
    </div>
  );
}
