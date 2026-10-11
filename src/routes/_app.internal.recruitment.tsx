import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { q } from "@/lib/data/queries";
import { firstName } from "@/lib/utils";
import type { PipelineStageId } from "@/lib/data/types";

export const Route = createFileRoute("/_app/internal/recruitment")({
  head: () => ({
    meta: [
      { title: "Recruitment Pipeline — Cyberbacker" },
      { name: "description", content: "Track candidates through the recruitment pipeline stages." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q.pipeline()),
  component: Recruitment,
});

const stages: { id: PipelineStageId; label: string }[] = [
  { id: "applied", label: "Applied" },
  { id: "screening", label: "Screening" },
  { id: "interview", label: "Interview" },
  { id: "assessment", label: "Assessment" },
  { id: "offer", label: "Offer" },
  { id: "placed", label: "Placed" },
];

function Recruitment() {
  const { data: candidates } = useSuspenseQuery(q.pipeline());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recruitment Pipeline"
        description={`${candidates.length} candidates across ${stages.length} stages`}
        actions={
          <Button>
            <Plus className="mr-1.5 h-4 w-4" /> Add candidate
          </Button>
        }
      />

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const items = candidates.filter((c) => c.stage === stage.id);
          return (
            <div key={stage.id} className="flex w-72 shrink-0 flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-semibold">{stage.label}</span>
                <Badge variant="secondary" className="font-normal">
                  {items.length}
                </Badge>
              </div>
              <div className="flex flex-col gap-3 rounded-xl bg-muted/40 p-3">
                {items.length === 0 && (
                  <p className="py-6 text-center text-xs text-muted-foreground">No candidates</p>
                )}
                {items.map((c) => (
                  <Card key={c.id} className="shadow-card cursor-grab">
                    <CardContent className="space-y-2 p-3">
                      <div className="flex items-center gap-2.5">
                        <InitialsAvatar initials={c.initials} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{firstName(c.name)}</p>
                          <p className="truncate text-xs text-muted-foreground">{c.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{c.recruiter}</span>
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                          {c.score}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
