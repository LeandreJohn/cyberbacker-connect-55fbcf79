import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COMPANY_CATEGORIES, addCompanyReview, getCompanyReviews, type CompanyCategory, type CompanyReview } from "@/lib/data/company-reviews";
import { useEffect } from "react";
import { expectationLabel } from "@/lib/expectations";
import { q } from "@/lib/data/queries";
import { submitReview } from "@/lib/data/api";
import type { Review } from "@/lib/data/types";
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
      context.queryClient.ensureQueryData(q.reviews()),
      context.queryClient.ensureQueryData(q.cyberbackers()),
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

function ReviewsPage() {
  const { data: reviews } = useSuspenseQuery(q.reviews());
  const { data: team } = useSuspenseQuery(q.cyberbackers());
  const qc = useQueryClient();
  const search = Route.useSearch();

  const [cbId, setCbId] = useState(team.some((cb) => cb.id === search.cyberbacker) ? search.cyberbacker ?? "" : team[0]?.id ?? "");
  const [overall, setOverall] = useState(0);
  const [scores, setScores] = useState<Record<(typeof CATS)[number], number>>({
    communication: 0, quality: 0, reliability: 0, timeliness: 0,
  });
  const [comment, setComment] = useState("");
  const [recommend, setRecommend] = useState(true);
  const [expectations, setExpectations] = useState(0);

  const mutation = useMutation({
    mutationFn: submitReview,
    onSuccess: (r) => {
      qc.setQueryData<Review[]>(q.reviews().queryKey, (old) => [r, ...(old ?? [])]);
      toast.success("Review submitted", { description: `Thanks for rating ${r.cyberbackerName}.` });
      setOverall(0);
      setScores({ communication: 0, quality: 0, reliability: 0, timeliness: 0 });
      setComment("");
      setExpectations(0);
    },
  });

  const summary = useMemo(
    () =>
      team.map((cb) => {
        const rs = reviews.filter((r) => r.cyberbackerId === cb.id);
        const avg = rs.length ? rs.reduce((s, r) => s + r.overall, 0) / rs.length : 0;
        return { cb, count: rs.length, avg };
      }),
    [team, reviews],
  );

  const trend = useMemo(() => {
    const byMonth = new Map<string, number[]>();
    [...reviews].reverse().forEach((r) => {
      const m = new Date(r.date).toLocaleDateString("en-US", { month: "short" });
      byMonth.set(m, [...(byMonth.get(m) ?? []), r.overall]);
    });
    return [...byMonth].map(([month, v]) => ({ month, rating: +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(2) }));
  }, [reviews]);

  const submit = () => {
    const cb = team.find((t) => t.id === cbId);
    if (!cb || !overall) return toast.error("Choose a Cyberbacker and an overall rating.");
    if (CATS.some((c) => !scores[c])) return toast.error("Please rate every category.");
    if (!expectations) return toast.error("Rate how well they meet expectations.");
    mutation.mutate({ cyberbackerId: cb.id, cyberbackerName: cb.name, overall, ...scores, expectations, comment, recommend });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reviews & Ratings" description="Rate your Cyberbackers and help us keep quality high." />
      <Tabs defaultValue="team" className="space-y-6">
        <TabsList><TabsTrigger value="team">Rate my Cyberbackers</TabsTrigger><TabsTrigger value="company">Rate Cyberbacker</TabsTrigger></TabsList>
      <TabsContent value="team" className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {summary.map(({ cb, count, avg }) => (
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
                  {team.map((t) => <SelectItem key={t.id} value={t.id}>{firstName(t.name)} — {t.role}</SelectItem>)}
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
              <SimpleLineChart data={trend} xKey="month" height={220} series={[{ key: "rating", label: "Avg rating", color: "var(--color-primary)" }]} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Recent reviews</CardTitle></CardHeader>
            <CardContent className="divide-y divide-border">
              {reviews.slice(0, 8).map((r) => (
                <div key={r.id} className="space-y-1.5 py-3 first:pt-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{firstName(r.cyberbackerName)}</p>
                    <div className="flex items-center gap-2">
                      <Stars value={r.overall} size="sm" />
                      <span className="text-xs text-muted-foreground">{r.date}</span>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-primary">{expectationLabel(r.expectations)}</p>
                  {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                  {r.recommend && (
                    <p className="flex items-center gap-1 text-xs text-success"><ThumbsUp className="h-3 w-3" /> Recommended</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      </TabsContent>
      <TabsContent value="company"><CompanyReviewTab /></TabsContent>
      </Tabs>
    </div>
  );
}

const emptyCompanyScores = (): Record<CompanyCategory, number> => ({ service: 0, communication: 0, matching: 0, support: 0, value: 0 });
function CompanyReviewTab() {
  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  useEffect(() => setReviews(getCompanyReviews()), []);
  const [overall, setOverall] = useState(0);
  const [scores, setScores] = useState(emptyCompanyScores);
  const [comment, setComment] = useState("");
  const [recommend, setRecommend] = useState(true);
  const [expectations, setExpectations] = useState(0);
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.overall, 0) / reviews.length : 0;
  const submit = () => {
    if (!overall) return toast.error("Choose an overall rating.");
    if (COMPANY_CATEGORIES.some((c) => !scores[c.key])) return toast.error("Please rate every category.");
    if (!expectations) return toast.error("Rate how well Cyberbacker meets expectations.");
    setReviews(addCompanyReview({ overall, scores, expectations, comment, recommend, author: "Jordan Avery" }));
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
            {COMPANY_CATEGORIES.map((c) => (
              <div key={c.key} className="flex items-center justify-between gap-3">
                <Label>{c.label}</Label>
                <Stars size="sm" value={scores[c.key]} onChange={(v) => setScores((s) => ({ ...s, [c.key]: v }))} />
              </div>
            ))}
          </div>
          <ExpectationStars id="company-expectations" value={expectations} onChange={setExpectations} />
          <div className="space-y-2"><Label htmlFor="company-comment">Comments</Label><Textarea id="company-comment" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How has working with Cyberbacker been?" /></div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3"><Label htmlFor="company-rec">Would you recommend Cyberbacker?</Label><Switch id="company-rec" checked={recommend} onCheckedChange={setRecommend} /></div>
          <Button className="w-full" onClick={submit}>Submit review</Button>
        </CardContent>
      </Card>
      <Card className="lg:col-span-3">
        <CardHeader className="flex-row items-center justify-between"><CardTitle>Your company reviews</CardTitle><div className="flex items-center gap-2"><Stars size="sm" value={Math.round(avg)} /><span className="text-sm text-muted-foreground">{avg ? avg.toFixed(1) : "—"} · {reviews.length}</span></div></CardHeader>
        <CardContent className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="space-y-2 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between"><Stars size="sm" value={r.overall} /><span className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString()}</span></div>
              <p className="text-xs font-medium text-primary">{expectationLabel(r.expectations)}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">{COMPANY_CATEGORIES.map((c) => <span key={c.key}>{c.label}: {r.scores[c.key]}/5</span>)}</div>
              {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
              {r.recommend && <p className="flex items-center gap-1 text-xs text-success"><ThumbsUp className="h-3 w-3" /> Recommends Cyberbacker</p>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
