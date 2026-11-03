import { FlaskConical } from "lucide-react";

import { useIsDemo } from "@/lib/demo-auth";

/** Slim banner shown on every page while a demo session is active. */
export function DemoBanner() {
  const isDemo = useIsDemo();
  if (!isDemo) return null;
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 border-b border-warning/30 bg-warning/10 px-4 py-1.5 text-xs font-medium text-foreground"
    >
      <FlaskConical className="h-3.5 w-3.5 shrink-0" />
      Demo mode: sample data, nothing is saved.
    </div>
  );
}
