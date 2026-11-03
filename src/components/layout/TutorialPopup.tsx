import { useRouterState } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Lightbulb } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TUTORIALS } from "@/lib/tutorials";
import { portalQ } from "@/lib/api/queries";
import { completeTutorial, replayTutorials, updatePreferences } from "@/lib/api/settings";

/** First-visit tutorial per page, driven by the account's tutorial state. */
export function TutorialPopup() {
  const pathname = useRouterState({ select: (s) => s.location.pathname }).replace(/\/$/, "") || "/";
  const queryClient = useQueryClient();
  const { data: state } = useQuery(portalQ.tutorials());

  const complete = useMutation({
    mutationFn: () => completeTutorial(pathname),
    onSuccess: (next) => queryClient.setQueryData(["tutorials"], next),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't save tutorial progress"),
  });
  const turnOff = useMutation({
    mutationFn: () => updatePreferences({ tutorials_enabled: false }),
    onSuccess: (prefs) => {
      queryClient.setQueryData(["preferences"], prefs);
      queryClient.setQueryData(["tutorials"], (old: { enabled: boolean; completed_pages: string[] } | undefined) => ({ enabled: false, completed_pages: old?.completed_pages ?? [] }));
      void replayTutorials();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't update settings"),
  });

  if (!state || !state.enabled || !TUTORIALS[pathname] || state.completed_pages.includes(pathname)) return null;
  const t = TUTORIALS[pathname];
  return (
    <Dialog open onOpenChange={(open) => !open && !complete.isPending && complete.mutate()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" />{t.title}</DialogTitle>
          <DialogDescription>{t.body}</DialogDescription>
        </DialogHeader>
        <ul className="list-disc space-y-1 pl-5 text-sm">{t.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" onClick={() => turnOff.mutate()} disabled={turnOff.isPending}>Turn off all tutorials</Button>
          <Button onClick={() => complete.mutate()} disabled={complete.isPending}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
