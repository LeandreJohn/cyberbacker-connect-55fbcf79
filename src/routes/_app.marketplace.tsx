import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Calendar,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/PageHeader";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { StatusBadge, toneFor } from "@/components/shared/StatusBadge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, firstName } from "@/lib/utils";
import { TalentProfileContent } from "@/components/shared/TalentProfileContent";
import { q } from "@/lib/data/queries";
import {
  EXPERIENCE_TIERS,
  scoreCandidate,
  type ExperienceTier,
  type JobMatchProfile,
} from "@/lib/jobs/matching";
import type { Candidate } from "@/lib/data/types";

interface MarketplaceSearch {
  profile?: string;
  title?: string;
  industry?: string;
  tier?: ExperienceTier;
  requiredSkills?: string[];
  preferredSkills?: string[];
  responsibilities?: string[];
  deliverables?: string[];
  tools?: string[];
  timezone?: string;
  availabilityHours?: string;
  workStyle?: string;
  language?: string;
  certification?: string;
}

export const Route = createFileRoute("/_app/marketplace")({
  head: () => ({
    meta: [
      { title: "Hiring Marketplace — Cyberbacker" },
      {
        name: "description",
        content: "Browse, compare, and hire vetted Cyberbacker talent for your team.",
      },
      { property: "og:title", content: "Hiring Marketplace — Cyberbacker" },
      { property: "og:description", content: "Browse, compare, and hire vetted Cyberbacker talent for your team." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): MarketplaceSearch => ({
    profile: typeof s.profile === "string" ? s.profile : undefined,
    title: typeof s.title === "string" ? s.title : undefined,
    industry: typeof s.industry === "string" ? s.industry : undefined,
    tier: s.tier === "beginner" || s.tier === "intermediate" || s.tier === "advanced" ? s.tier : undefined,
    requiredSkills: Array.isArray(s.requiredSkills) ? s.requiredSkills.filter((x): x is string => typeof x === "string") : undefined,
    preferredSkills: Array.isArray(s.preferredSkills) ? s.preferredSkills.filter((x): x is string => typeof x === "string") : undefined,
    responsibilities: Array.isArray(s.responsibilities) ? s.responsibilities.filter((x): x is string => typeof x === "string") : undefined,
    deliverables: Array.isArray(s.deliverables) ? s.deliverables.filter((x): x is string => typeof x === "string") : undefined,
    tools: Array.isArray(s.tools) ? s.tools.filter((x): x is string => typeof x === "string") : undefined,
    timezone: typeof s.timezone === "string" ? s.timezone : undefined,
    availabilityHours: typeof s.availabilityHours === "string" ? s.availabilityHours : undefined,
    workStyle: typeof s.workStyle === "string" ? s.workStyle : undefined,
    language: typeof s.language === "string" ? s.language : undefined,
    certification: typeof s.certification === "string" ? s.certification : undefined,
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q.candidates()),
  component: Marketplace,
});

const MAX_COMPARE = 4;

function Marketplace() {
  const { data: candidates } = useSuspenseQuery(q.candidates());

  const preset = Route.useSearch();
  const navigate = useNavigate({ from: "/marketplace" });
  const jdActive = Boolean(preset.profile || preset.title || preset.tier || preset.requiredSkills?.length);
  const jdProfile = useMemo<JobMatchProfile | null>(() => {
    if (preset.profile) {
      try {
        return JSON.parse(preset.profile) as JobMatchProfile;
      } catch {
        return null;
      }
    }
    if (!jdActive || !preset.tier) return null;
    return {
      title: preset.title ?? "",
      industry: preset.industry ?? "",
      tier: preset.tier,
      requiredSkills: preset.requiredSkills ?? [],
      preferredSkills: preset.preferredSkills ?? [],
      responsibilities: preset.responsibilities ?? [],
      deliverables: preset.deliverables ?? [],
      tools: preset.tools ?? [],
      timezone: preset.timezone ?? "",
      availabilityHours: preset.availabilityHours ?? "",
      workStyle: preset.workStyle ?? "",
      language: preset.language ?? "",
      certification: preset.certification ?? "",
    };
  }, [jdActive, preset]);

  const [search, setSearch] = useState(preset.title ?? "");
  const [availability, setAvailability] = useState("all");
  const [industry, setIndustry] = useState("all");
  const [minExp, setMinExp] = useState(preset.tier === "advanced" ? 4 : preset.tier === "intermediate" ? 1 : 0);
  const [minRating, setMinRating] = useState(0);
  const [minValues, setMinValues] = useState(0);
  const [sort, setSort] = useState("match");

  const [shortlist, setShortlist] = useState<Set<string>>(new Set());
  const [compare, setCompare] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);

  const industries = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach((c) => c.industries.forEach((i) => set.add(i)));
    return Array.from(set).sort();
  }, [candidates]);

  const jdMatches = useMemo(() => {
    if (!jdProfile) return null;
    return new Map(candidates.map((candidate) => [candidate.id, scoreCandidate(jdProfile, candidate)]));
  }, [candidates, jdProfile]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const words = term.split(/\s+/).filter((w) => w.length > 2);
    const list = candidates.filter((c) => {
      const matchesSearch =
        !term ||
        c.name.toLowerCase().includes(term) ||
        c.title.toLowerCase().includes(term) ||
        c.skills.some((s) => s.toLowerCase().includes(term)) ||
        c.industries.some((i) => i.toLowerCase().includes(term)) ||
        (words.length > 0 &&
          words.some(
            (w) =>
              c.title.toLowerCase().includes(w) ||
              c.skills.some((s) => s.toLowerCase().includes(w)) ||
              c.industries.some((i) => i.toLowerCase().includes(w)),
          ));
      const matchesJd = !jdProfile || Boolean(jdMatches?.get(c.id)?.passesConstraints);
      const matchesAvail = availability === "all" || c.availability === availability;
      const matchesIndustry = industry === "all" || c.industries.includes(industry);
      const matchesExp = c.yearsExperience >= minExp;
      const matchesRating = c.rating >= minRating;
      const matchesValues = c.valuesScore >= minValues;
      return (
        matchesSearch &&
        matchesJd &&
        matchesAvail &&
        matchesIndustry &&
        matchesExp &&
        matchesRating &&
        matchesValues
      );
    });

    return [...list].sort((a, b) => {
      switch (sort) {
        case "rating":
          return b.rating - a.rating;
        case "experience":
          return b.yearsExperience - a.yearsExperience;
        case "values":
          return b.valuesScore - a.valuesScore;
        case "rate":
          return a.hourlyRate - b.hourlyRate;
        default:
          return (jdMatches?.get(b.id)?.score ?? b.matchScore) - (jdMatches?.get(a.id)?.score ?? a.matchScore);
      }
    });
  }, [candidates, search, jdProfile, jdMatches, availability, industry, minExp, minRating, minValues, sort]);

  const clearJd = () =>
    navigate({ to: ".", search: {}, replace: true }).then(() => {
      setSearch("");
      if (preset.tier) setMinExp(0);
    });

  const activeFilterCount =
    (availability !== "all" ? 1 : 0) +
    (industry !== "all" ? 1 : 0) +
    (minExp > 0 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (minValues > 0 ? 1 : 0);

  const clearFilters = () => {
    setAvailability("all");
    setIndustry("all");
    setMinExp(0);
    setMinRating(0);
    setMinValues(0);
  };

  const toggleShortlist = (c: Candidate) => {
    setShortlist((prev) => {
      const next = new Set(prev);
      if (next.has(c.id)) {
        next.delete(c.id);
        toast(`Removed ${firstName(c.name)} from shortlist`);
      } else {
        next.add(c.id);
        toast.success(`${firstName(c.name)} added to shortlist`);
      }
      return next;
    });
  };

  const toggleCompare = (c: Candidate) => {
    setCompare((prev) => {
      if (prev.includes(c.id)) return prev.filter((id) => id !== c.id);
      if (prev.length >= MAX_COMPARE) {
        toast.error(`You can compare up to ${MAX_COMPARE} candidates`);
        return prev;
      }
      return [...prev, c.id];
    });
  };

  const scheduleInterview = (c: Candidate) =>
    toast.success(`Interview request sent for ${firstName(c.name)}`, {
      description: "Our team will confirm a time within 24 hours.",
    });

  const activeCandidate = candidates.find((c) => c.id === activeId) ?? null;
  const compareCandidates = compare
    .map((id) => candidates.find((c) => c.id === id))
    .filter((c): c is Candidate => Boolean(c));

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="Hiring Marketplace"
        description="Vetted, ready-to-start Cyberbacker talent matched to your needs"
      />

      {/* Active job-description filter banner */}
      {jdActive && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <p className="text-sm font-semibold">
                Filtering by job description{preset.title ? `: ${preset.title}` : ""}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(preset.requiredSkills ?? []).map((s) => (
                  <Badge key={s} className="gap-1">
                    {s}
                    <button
                      type="button"
                      aria-label={`Remove ${s} filter`}
                      onClick={() =>
                        navigate({
                          to: ".",
                          search: (prev) => ({ ...prev, requiredSkills: (preset.requiredSkills ?? []).filter((x) => x !== s) }),
                          replace: true,
                        })
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {preset.tier && (
                  <Badge variant="secondary">{EXPERIENCE_TIERS[preset.tier].label} · {EXPERIENCE_TIERS[preset.tier].experience}</Badge>
                )}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/job-builder">Edit job description</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={clearJd}>
                <X className="mr-1 h-3.5 w-3.5" /> Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Toolbar */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative w-full min-w-0 lg:flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, role, skill, or industry…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9"
              />
            </div>

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full shrink-0 lg:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match">Best match</SelectItem>
                <SelectItem value="rating">Highest rating</SelectItem>
                <SelectItem value="values">Values score</SelectItem>
                <SelectItem value="experience">Most experience</SelectItem>
                <SelectItem value="rate">Lowest rate</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full shrink-0 lg:w-auto">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Advanced filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2 h-5 min-w-5 justify-center px-1.5">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 space-y-4">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Availability</p>
                  <Select value={availability} onValueChange={setAvailability}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All availability</SelectItem>
                      <SelectItem value="available">Available now</SelectItem>
                      <SelectItem value="interviewing">Interviewing</SelectItem>
                      <SelectItem value="hired">Recently hired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Industry</p>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All industries</SelectItem>
                      {industries.map((i) => (
                        <SelectItem key={i} value={i}>
                          {i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>Min. experience</span>
                    <span className="text-muted-foreground">{minExp} yrs</span>
                  </div>
                  <Slider
                    value={[minExp]}
                    onValueChange={([v]) => setMinExp(v)}
                    max={10}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>Min. rating</span>
                    <span className="text-muted-foreground">{minRating.toFixed(1)}★</span>
                  </div>
                  <Slider
                    value={[minRating]}
                    onValueChange={([v]) => setMinRating(v)}
                    max={5}
                    step={0.5}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>Min. values score</span>
                    <span className="text-muted-foreground">{minValues}</span>
                  </div>
                  <Slider
                    value={[minValues]}
                    onValueChange={([v]) => setMinValues(v)}
                    max={100}
                    step={5}
                  />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
              candidate{filtered.length === 1 ? "" : "s"} found
              {shortlist.size > 0 && (
                <> · {shortlist.size} shortlisted</>
              )}
            </span>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={clearFilters}>
                <X className="mr-1 h-3.5 w-3.5" /> Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Candidate grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Users className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No candidates match your filters</p>
            <p className="text-sm text-muted-foreground">
              Try widening your search or clearing some filters.
            </p>
            <Button variant="outline" size="sm" className="mt-2" onClick={clearFilters}>
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const isShortlisted = shortlist.has(c.id);
            const inCompare = compare.includes(c.id);
            const jdMatch = jdMatches?.get(c.id);
            return (
              <Card key={c.id} className="flex flex-col shadow-card">
                <CardHeader className="flex-row items-start gap-3 space-y-0">
                  <InitialsAvatar initials={c.initials} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{firstName(c.name)}</p>
                    <p className="truncate text-sm text-muted-foreground">{c.title}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {c.location}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleShortlist(c)}
                    aria-label={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                  >
                    <Heart
                      className={cn("h-4 w-4", isShortlisted && "fill-primary text-primary")}
                    />
                  </button>
                </CardHeader>

                <CardContent className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                      {jdMatch?.score ?? c.matchScore}% match
                    </Badge>
                    <StatusBadge label={c.availability} tone={toneFor(c.availability)} />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {c.skills.slice(0, 4).map((s) => (
                      <Badge key={s} variant="secondary" className="font-normal">
                        {s}
                      </Badge>
                    ))}
                    {c.skills.length > 4 && (
                      <Badge variant="outline" className="font-normal">
                        +{c.skills.length - 4}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Values Assessment</span>
                      <span className="font-medium text-foreground">{c.valuesScore}</span>
                    </div>
                    <Progress value={c.valuesScore} className="h-1.5" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 font-medium">
                      <Star className="h-4 w-4 fill-warning text-warning" /> {c.rating}
                    </span>
                    <span className="text-muted-foreground">{c.yearsExperience} yrs exp</span>
                    <span className="font-semibold">${c.hourlyRate}/hr</span>
                  </div>

                  {jdMatch && (
                    <div className="space-y-1.5 rounded-md border bg-muted/30 p-2.5 text-xs">
                      <p className="font-medium">Why this candidate fits</p>
                      {jdMatch.strengths.length > 0 && (
                        <p className="text-muted-foreground"><span className="font-medium text-success">Strengths:</span> {jdMatch.strengths.join(" · ")}</p>
                      )}
                      {jdMatch.gaps.length > 0 && (
                        <p className="text-muted-foreground"><span className="font-medium text-warning">Gaps:</span> {jdMatch.gaps.join(" · ")}</p>
                      )}
                    </div>
                  )}

                  <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                    <Checkbox
                      checked={inCompare}
                      onCheckedChange={() => toggleCompare(c)}
                    />
                    Compare
                  </label>
                </CardContent>

                <CardFooter className="flex-col gap-2">
                  <Button className="w-full" onClick={() => setActiveId(c.id)}>
                    View Profile
                  </Button>
                  <div className="flex w-full gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => scheduleInterview(c)}
                      disabled={c.availability === "hired"}
                    >
                      <Calendar className="mr-1.5 h-3.5 w-3.5" /> Interview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => toggleShortlist(c)}
                    >
                      <Heart
                        className={cn(
                          "mr-1.5 h-3.5 w-3.5",
                          isShortlisted && "fill-primary text-primary",
                        )}
                      />
                      {isShortlisted ? "Saved" : "Shortlist"}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail side panel */}
      <Sheet open={!!activeCandidate} onOpenChange={(o) => !o && setActiveId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {activeCandidate && (
            <>
              <SheetHeader className="space-y-0 text-left">
                <SheetTitle className="sr-only">{firstName(activeCandidate.name)} profile</SheetTitle>
              </SheetHeader>
              <div className="space-y-6">
                <TalentProfileContent name={activeCandidate.name} initials={activeCandidate.initials} title={activeCandidate.title} location={activeCandidate.location} bio={activeCandidate.bio} yearsExperience={activeCandidate.yearsExperience} valuesScore={activeCandidate.valuesScore} rating={activeCandidate.rating} skills={activeCandidate.skills} tools={activeCandidate.tools} profile={activeCandidate.profile} />

                <div className="flex flex-col gap-2 pb-2 sm:flex-row">
                  <Button
                    className="flex-1"
                    onClick={() => scheduleInterview(activeCandidate)}
                    disabled={activeCandidate.availability === "hired"}
                  >
                    <Calendar className="mr-1.5 h-4 w-4" /> Schedule Interview
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => toggleShortlist(activeCandidate)}
                  >
                    <Heart
                      className={cn(
                        "mr-1.5 h-4 w-4",
                        shortlist.has(activeCandidate.id) && "fill-primary text-primary",
                      )}
                    />
                    {shortlist.has(activeCandidate.id) ? "Shortlisted" : "Shortlist"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Comparison bar */}
      {compare.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-sm font-medium">
                {compare.length} selected
              </span>
              <div className="hidden gap-2 sm:flex">
                {compareCandidates.map((c) => (
                  <Badge key={c.id} variant="secondary" className="gap-1 font-normal">
                    {firstName(c.name)}
                    <button
                      type="button"
                      onClick={() => toggleCompare(c)}
                      aria-label={`Remove ${firstName(c.name)}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCompare([])}>
                Clear
              </Button>
              <Button size="sm" disabled={compare.length < 2} onClick={() => setCompareOpen(true)}>
                Compare ({compare.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison dialog */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Compare candidates</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="w-32 p-2 text-left font-medium text-muted-foreground">
                    Attribute
                  </th>
                  {compareCandidates.map((c) => (
                    <th key={c.id} className="min-w-44 p-2 text-left align-bottom">
                      <div className="flex items-center gap-2">
                        <InitialsAvatar initials={c.initials} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{firstName(c.name)}</p>
                          <p className="truncate text-xs font-normal text-muted-foreground">
                            {c.title}
                          </p>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&_td]:border-t [&_td]:p-2 [&_td]:align-top">
                <CompareRow label="Match score" cells={compareCandidates.map((c) => `${jdMatches?.get(c.id)?.score ?? c.matchScore}%`)} />
                <CompareRow
                  label="Availability"
                  cells={compareCandidates.map((c) => (
                    <StatusBadge key={c.id} label={c.availability} tone={toneFor(c.availability)} />
                  ))}
                />
                <CompareRow label="Experience" cells={compareCandidates.map((c) => `${c.yearsExperience} yrs`)} />
                <CompareRow label="Rating" cells={compareCandidates.map((c) => `${c.rating} ★`)} />
                <CompareRow label="Values score" cells={compareCandidates.map((c) => `${c.valuesScore}/100`)} />
                <CompareRow label="Rate" cells={compareCandidates.map((c) => `$${c.hourlyRate}/hr`)} />
                <CompareRow label="Location" cells={compareCandidates.map((c) => c.location)} />
                <CompareRow
                  label="Skills"
                  cells={compareCandidates.map((c) => (
                    <div key={c.id} className="flex flex-wrap gap-1">
                      {c.skills.map((s) => (
                        <Badge key={s} variant="secondary" className="font-normal">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  ))}
                />
                <CompareRow
                  label="Industries"
                  cells={compareCandidates.map((c) => (
                    <div key={c.id} className="flex flex-wrap gap-1">
                      {c.industries.map((i) => (
                        <Badge key={i} variant="outline" className="font-normal">
                          {i}
                        </Badge>
                      ))}
                    </div>
                  ))}
                />
                <tr>
                  <td className="border-t p-2" />
                  {compareCandidates.map((c) => (
                    <td key={c.id} className="border-t p-2">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setCompareOpen(false);
                          setActiveId(c.id);
                        }}
                      >
                        View Profile
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CompareRow({
  label,
  cells,
}: {
  label: string;
  cells: React.ReactNode[];
}) {
  return (
    <tr>
      <td className="font-medium text-muted-foreground">{label}</td>
      {cells.map((cell, i) => (
        <td key={i}>{cell}</td>
      ))}
    </tr>
  );
}
