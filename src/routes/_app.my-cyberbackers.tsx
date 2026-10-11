import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Clock, Mail, Star } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/shared/PageHeader";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { StatusBadge, toneFor, prettify } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { q } from "@/lib/data/queries";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TalentProfileContent } from "@/components/shared/TalentProfileContent";
import { firstName } from "@/lib/utils";

export const Route = createFileRoute("/_app/my-cyberbackers")({
  head: () => ({
    meta: [
      { title: "My Cyberbackers — Cyberbacker" },
      { name: "description", content: "Manage your dedicated Cyberbacker team members." },
    ],
  }),
  loader: async ({ context }) => { await Promise.all([context.queryClient.ensureQueryData(q.cyberbackers()), context.queryClient.ensureQueryData(q.reviews())]); },
  component: MyCyberbackers,
});

function MyCyberbackers() {
  const { data: team } = useSuspenseQuery(q.cyberbackers());
  const { data: reviews } = useSuspenseQuery(q.reviews());
  const [activeId, setActiveId] = useState<string | null>(null);
  const navigate = useNavigate();
  const active = team.find((cb) => cb.id === activeId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Cyberbackers"
        description={`${team.length} dedicated team members working with you`}
        actions={
          <Button onClick={() => navigate({ to: "/reviews" })}>
            <Star className="mr-1.5 h-4 w-4" /> Rate my Cyberbacker
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {team.map((cb) => (
          <Card key={cb.id} className="shadow-card">
            <CardHeader className="flex-row items-start gap-3 space-y-0">
              <InitialsAvatar initials={cb.initials} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{firstName(cb.name)}</p>
                <p className="truncate text-sm text-muted-foreground">{cb.role}</p>
                <div className="mt-1.5">
                  <StatusBadge label={prettify(cb.status)} tone={toneFor(cb.status)} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {cb.skills.map((s) => (
                  <Badge key={s} variant="secondary" className="font-normal">
                    {s}
                  </Badge>
                ))}
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Performance</span>
                  <span className="font-medium">{cb.performance}%</span>
                </div>
                <Progress value={cb.performance} className="h-1.5" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" /> This week
                </span>
                <span className="font-medium">
                  {cb.hoursThisWeek}/{cb.weeklyCapacity} hrs
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{cb.timezone}</p>
              {(() => {
                const latest = reviews.find((review) => review.cyberbackerId === cb.id);
                return latest ? <div className="rounded-md bg-muted/40 p-3"><div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold">Latest review</p><span className="flex items-center gap-1 text-xs font-medium"><Star className="h-3 w-3 fill-warning text-warning" />{latest.overall}.0</span></div>{latest.comment && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">“{latest.comment}”</p>}</div> : null;
              })()}
            </CardContent>
            <CardFooter className="gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Mail className="mr-1.5 h-4 w-4" /> Message
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setActiveId(cb.id)}>
                View profile
              </Button>
              <Button variant="ghost" size="sm" aria-label={`Rate ${firstName(cb.name)}`} onClick={() => navigate({ to: "/reviews", search: { cyberbacker: cb.id } })}><Star className="h-4 w-4" /></Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <Sheet open={Boolean(active)} onOpenChange={(open) => !open && setActiveId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl"><SheetHeader><SheetTitle className="sr-only">Cyberbacker profile</SheetTitle></SheetHeader>{active && <TalentProfileContent name={active.name} initials={active.initials} title={active.role} location={active.location ?? "Philippines"} bio={active.bio ?? `${firstName(active.name)} is a trusted member of your Cyberbacker team with a strong record of reliable delivery.`} valuesScore={active.performance} skills={active.skills} />}</SheetContent>
      </Sheet>
    </div>
  );
}
