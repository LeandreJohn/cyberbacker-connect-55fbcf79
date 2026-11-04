import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/PageHeader";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { SimpleLineChart } from "@/components/charts/Charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { portalQ } from "@/lib/api/queries";
import { fromBackendId, postCompanyReview, postCyberbackerReview, toBackendId } from "@/lib/api/reviews";
import type { CompanyReviewItem } from "@/lib/types";
import { expectationLabel } from "@/lib/expectations";
import { q } from "@/lib/data/queries";
import { cn, firstName } from "@/lib/utils";

interface ReviewsSearch { cyberbacker?: string }

export const Route = createFileRoute("/_app/reviews")({
  validateSearch: (search: Record<string, unknown>): ReviewsSearch => ({ cyberbacker: typeof search.cyberbacker === "string" ? search.cyberbacker : undefined }),
  head: () => ({
    meta: [
      { title: "Reviews & Ratings — Cyberbacker" },
      { name: "description", content: "Review and rate your Cyberbackers on quality, communication and reliability." },
      { property: "og:title", content: "Reviews & Ratings — Cyberbacker" },
      { property: "og:description", content: "Share feedback and ratings for your Cyberbacker team." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(q.cyberbackers()),
      context.queryClient.ensureQueryData(portalQ.cbSummaries()),
      context.queryClient.ensureQueryData(portalQ.cbReviews()),
      context.queryClient.ensureQueryData(portalQ.cbTrend()),
      context.queryClient.ensureQueryData(portalQ.companyReviews()),
    ]);
  },
  component: ReviewsPage,
});

const CATS = ["communication", "quality", "reliability", "timeliness"] as const;

function Stars({ value, onChange, size = "md" }: { value: number; onChange?: (v: number) => void; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-3.5 w-3.5" : "h-6 w-6";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className={cn(!onChange && "cursor-default")}
        >
          <Star className={cn(cls, n <= value ? "fill-warning text-warning" : "text-muted-foreground/40")} />
        </button>
      ))}
    </div>
  );
}

function ExpectationStars({ value, onChange, id }: { value: number; onChange: (v: number) => void; id: string }) {
  return (
    <div className="space-y-2" id={id}>
      <Label>Meets expectations?</Label>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="w-20 text-right leading-tight">Doesn't meet expectations</span>
        <Stars value={value} onChange={onChange} />
        <span className="w-20 leading-tight">Exceeds expectations</span>
      </div>
      <p className="text-sm font-medium text-primary">{value ? expectationLabel(value) : "Select a rating"}</p>
    </div>
  );
}

function usePortalError(...results: { error: unknown }[]): string | null {
  const first = results.find((r) => r.error);
  if (!first) return null;
  return first.error instanceof Error ? first.error.message : "Something went wrong";
}

function ReviewsPage() {
  const { data: team } = useQuery({ ...q.cyberbackers(), throwOnError: false });
  const summaries = useQuery(portalQ.cbSummaries());
  const reviews = useQuery(portalQ.cbReviews());
  const trend = useQuery(portalQ.cbTrend());
  const company = useQuery(portalQ.companyReviews());
  const loadError = usePortalError(summaries, reviews, trend, company);
  const roster = team ?? [];
  const nameByBackend = (id: number) => roster.find((t) => t.id === fromBackendId(id))?.name ?? "Cyberbacker";

  const [cbId, setCbId] = useState("cb1");
  const [overall, setOverall] = useState(0);
  const [scores, setScores] = useState<Record<(typeof CATS)[number], number>>({
    communication: 0, quality: 0, reliability: 0, timeliness: 0,
  });
  const [comment, setComment] = useState("");
  const [recommend, setRecommend] = useState(true);
  const [expectations, setExpectations] = useState(0);
  const qc = useQueryClient();

  const reset = () => {
    setOverall(0);
    setScores({ communication: 0, quality: 0, reliability: 0, timeliness: 0 });
    setComment("");
    setExpectations(0);
  };
  const mutation = useMutation({
    mutationFn: () => postCyberbackerReview({
      cyberbackerId: toBackendId(cbId),
      overall, ...scores, expectations, comments: comment, recommend,
    }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["cb_reviews"] });
      void qc.invalidateQueries({ queryKey: ["cb_ratings"] });
      void qc.invalidateQueries({ queryKey: ["cb_rating_trend"] });
      toast.success("Review submitted", { description: `Thanks for rating ${firstName(roster.find((t) => t.id === cbId)?.name ?? "your Cyberbacker")}.` });
      reset();
    },
    onError: (e) => toast.error("Couldn't submit review", { description: e instanceof Error ? e.message : undefined }),
  });

  const summary = useMemo(() => roster.map((cb) => {
    let id: number | null = null;
    try { id = toBackendId(cb.id); } catch { id = null; }
    const s = summaries.data?.find((x) => x.id === id);
    return { cb, count: s?.review_count ?? 0, avg: s?.average_rating ?? 0 };
  }), [roster, summaries.data]);

  const trendData = useMemo(() => (trend.data ?? []).map((p) => ({
    month: new Date(`${p.month}-01T00:00:00`).toLocaleDateString("en-US", { month: "short" }),
    rating: p.average_rating,
  })), [trend.data]);

  const submit = () => {
    if (!cbId || !overall) return toast.error("Choose a Cyberbacker and an overall rating.");
    if (CATS.some((c) => !scores[c])) return toast.error("Please rate every category.");
    if (!expectations) return toast.error("Rate how well they meet expectations.");
    mutation.mutate();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reviews & Ratings" description="Rate your Cyberbackers and help us keep quality high." />
      {loadError && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">Couldn't load your reviews: {loadError}</p>
      )}
      <Tabs defaultValue="team" className="space-y-6">
        <TabsList><TabsTrigger value="team">Rate my Cyberbackers</TabsTrigger><TabsTrigger value="company">Rate Cyberbacker</TabsTrigger></TabsList>
        <TabsContent value="team" className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {summaries.isPending ? [...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />) : summary.map(({ cb, count, avg }) => (
              <Card key={cb.id}>
                <CardContent className="flex items-center gap-3 p-4">
                  <InitialsAvatar initials={cb.initials} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{firstName(cb.name)}</p>
                    <div className="flex items-center gap-1.5">
                      <Stars value={Math.round(avg)} size="sm" />
                      <span className="text-xs text-muted-foreground">{avg ? avg.toFixed(1) : "—"} · {count}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Write a review</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Cyberbacker</Label>
                  <Select value={cbId} onValueChange={setCbId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {roster.map((t) => <SelectItem key={t.id} value={t.id}>{firstName(t.name)} — {t.role}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Overall rating</Label>
                  <Stars value={overall} onChange={setOverall} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {CATS.map((c) => (
                    <div key={c} className="space-y-1">
                      <Label className="capitalize">{c}</Label>
                      <Stars size="sm" value={scores[c]} onChange={(v) => setScores((s) => ({ ...s, [c]: v }))} />
                    </div>
                  ))}
                </div>
                <ExpectationStars id="cb-expectations" value={expectations} onChange={setExpectations} />
                <div className="space-y-2">
                  <Label htmlFor="comment">Comments</Label>
                  <Textarea id="comment" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What went well? What could improve?" />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <Label htmlFor="rec">Would you recommend them?</Label>
                  <Switch id="rec" checked={recommend} onCheckedChange={setRecommend} />
                </div>
                <Button className="w-full" onClick={submit} disabled={mutation.isPending}>
                  {mutation.isPending ? "Submitting…" : "Submit review"}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6 lg:col-span-3">
              <Card>
                <CardHeader><CardTitle>Average rating trend</CardTitle></CardHeader>
                <CardContent>
                  {trend.isPending ? <Skeleton className="h-52 w-full" /> : (
                    <SimpleLineChart data={trendData} xKey="month" height={220} series={[{ key: "rating", label: "Avg rating", color: "var(--color-primary)" }]} />
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Recent reviews</CardTitle></CardHeader>
                <CardContent className="divide-y divide-border">
                  {reviews.isPending ? [...Array(4)].map((_, i) => <Skeleton key={i} className="my-2 h-14 w-full" />) : (reviews.data ?? []).slice(0, 8).map((r) => (
                    <div key={r.id} className="space-y-1.5 py-3 first:pt-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium">{firstName(nameByBackend(r.cyberbacker_id))}</p>
                        <div className="flex items-center gap-2">
                          <Stars value={r.overall_rating} size="sm" />
                          <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-xs font-medium text-primary">{r.expectation_label}</p>
                      {r.comments && <p className="text-sm text-muted-foreground">{r.comments}</p>}
                      {r.would_recommend && (
                        <p className="flex items-center gap-1 text-xs text-success"><ThumbsUp className="h-3 w-3" /> Recommended</p>
                      )}
                    </div>
                  ))}
                  {!reviews.isPending && !(reviews.data ?? []).length && (
                    <p className="py-6 text-center text-sm text-muted-foreground">No reviews yet. Rate one of your Cyberbackers to get started.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="company"><CompanyReviewTab data={company.data} isPending={company.isPending} onSubmitted={() => void qc.invalidateQueries({ queryKey: ["company_reviews"] })} /></TabsContent>
      </Tabs>
    </div>
  );
}

const emptyCompanyScores = () => ({ service: 0, communication: 0, matching: 0, support: 0, value: 0 });
function CompanyReviewTab({ data, isPending, onSubmitted }: { data?: { average_rating: number | null; total_reviews: number; reviews: CompanyReviewItem[] }; isPending: boolean; onSubmitted: () => void }) {
  const [overall, setOverall] = useState(0);
  const [scores, setScores] = useState(emptyCompanyScores);
  const [comment, setComment] = useState("");
  const [recommend, setRecommend] = useState(true);
  const [expectations, setExpectations] = useState(0);
  const [pending, setPending] = useState(false);
  const avg = data?.average_rating ?? 0;
  const total = data?.total_reviews ?? 0;
  const categories = [
    { key: "service" as const, label: "Service quality", field: "service_quality_rating" as const },
    { key: "communication" as const, label: "Communication", field: "communication_rating" as const },
    { key: "matching" as const, label: "Recruiting & matching", field: "recruiting_matching_rating" as const },
    { key: "support" as const, label: "Support responsiveness", field: "support_responsiveness_rating" as const },
    { key: "value" as const, label: "Value for money", field: "value_for_money_rating" as const },
  ];
  const submit = async () => {
    if (!overall) return toast.error("Choose an overall rating.");
    if (categories.some((c) => !scores[c.key])) return toast.error("Please rate every category.");
    if (!expectations) return toast.error("Rate how well Cyberbacker meets expectations.");
    setPending(true);
    try {
      await postCompanyReview({ overall, ...scores, expectations, comments: comment, recommend });
      onSubmitted();
    } catch (e) {
      setPending(false);
      return toast.error("Couldn't submit review", { description: e instanceof Error ? e.message : undefined });
    }
    setPending(false);
    toast.success("Thanks for rating Cyberbacker!");
    setOverall(0); setScores(emptyCompanyScores()); setComment(""); setExpectations(0);
  };
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Rate Cyberbacker as a company</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2"><Label>Overall rating</Label><Stars value={overall} onChange={setOverall} /></div>
          <div className="space-y-3">
            {categories.map((c) => (
              <div key={c.key} className="flex items-center justify-between gap-3">
                <Label>{c.label}</Label>
                <Stars size="sm" value={scores[c.key]} onChange={(v) => setScores((s) => ({ ...s, [c.key]: v }))} />
              </div>
            ))}
          </div>
          <ExpectationStars id="company-expectations" value={expectations} onChange={setExpectations} />
          <div className="space-y-2"><Label htmlFor="company-comment">Comments</Label><Textarea id="company-comment" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How has working with Cyberbacker been?" /></div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3"><Label htmlFor="company-rec">Would you recommend Cyberbacker?</Label><Switch id="company-rec" checked={recommend} onCheckedChange={setRecommend} /></div>
          <Button className="w-full" onClick={submit} disabled={pending}>{pending ? "Submitting…" : "Submit review"}</Button>
        </CardContent>
      </Card>
      <Card className="lg:col-span-3">
        <CardHeader className="flex-row items-center justify-between"><CardTitle>Your company reviews</CardTitle><div className="flex items-center gap-2"><Stars size="sm" value={Math.round(avg)} /><span className="text-sm text-muted-foreground">{avg ? avg.toFixed(1) : "—"} · {total}</span></div></CardHeader>
        <CardContent className="space-y-4">
          {isPending ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />) : (data?.reviews ?? []).map((r) => (
            <div key={r.id} className="space-y-2 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between"><Stars size="sm" value={r.overall_rating} /><span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span></div>
              <p className="text-xs font-medium text-primary">{r.expectation_label}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {categories.map((c) => <span key={c.key}>{c.label}: {r[c.field] ?? "—"}/5</span>)}
              </div>
              {r.comments && <p className="text-sm text-muted-foreground">{r.comments}</p>}
              {r.would_recommend && <p className="flex items-center gap-1 text-xs text-success"><ThumbsUp className="h-3 w-3" /> Recommends Cyberbacker</p>}
            </div>
          ))}
          {!isPending && !(data?.reviews ?? []).length && (
            <p className="py-6 text-center text-sm text-muted-foreground">You haven't rated Cyberbacker as a company yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
