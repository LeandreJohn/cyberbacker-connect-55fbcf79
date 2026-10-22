import { useRouterState } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TUTORIALS, markSeen, saveTutorials, shouldShow, turnOff, useTutorials } from "@/lib/tutorials";

export function TutorialPopup() {
  const pathname = useRouterState({ select: (s) => s.location.pathname }).replace(/\/$/, "") || "/";
  const state = useTutorials();
  if (!state || !shouldShow(state, pathname)) return null;
  const t = TUTORIALS[pathname];
  const close = () => saveTutorials(markSeen(state, pathname));
  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" />{t.title}</DialogTitle>
          <DialogDescription>{t.body}</DialogDescription>
        </DialogHeader>
        <ul className="list-disc space-y-1 pl-5 text-sm">{t.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" onClick={() => saveTutorials(turnOff(state))}>Turn off all tutorials</Button>
          <Button onClick={close}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
