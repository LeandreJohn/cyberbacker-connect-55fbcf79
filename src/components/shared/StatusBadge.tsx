import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "primary";

const toneClasses: Record<Tone, string> = {
  success: "bg-success/12 text-success border-success/20",
  warning: "bg-warning/15 text-warning border-warning/25",
  danger: "bg-destructive/12 text-destructive border-destructive/20",
  info: "bg-info/12 text-info border-info/20",
  primary: "bg-primary/10 text-primary border-primary/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({
  label,
  tone = "neutral",
  dot = true,
  className,
}: {
  label: string;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        toneClasses[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {label}
    </span>
  );
}

// Shared mapping helpers so statuses look consistent across pages.
export function toneFor(status: string): Tone {
  const map: Record<string, Tone> = {
    active: "success",
    available: "success",
    paid: "success",
    placed: "success",
    present: "success",
    resolved: "success",
    completed: "success",
    closed: "neutral",
    assigned: "neutral",
    onboarding: "info",
    interviewing: "info",
    in_progress: "info",
    processing: "info",
    sent: "info",
    trial: "info",
    pending_signature: "warning",
    pending_client: "warning",
    waiting: "warning",
    due: "warning",
    due_soon: "warning",
    late: "warning",
    at_risk: "warning",
    invited: "warning",
    open: "info",
    auto_renew: "info",
    upcoming: "neutral",
    hired: "primary",
    paused: "neutral",
    draft: "neutral",
    leave: "neutral",
    offboarded: "neutral",
    overdue: "danger",
    absent: "danger",
    churned: "danger",
    suspended: "danger",
    expired: "danger",
    urgent: "danger",
    high: "danger",
    medium: "warning",
    low: "neutral",
  };
  return map[status] ?? "neutral";
}

export function prettify(status: string) {
  return status.replace(/_/g, " ");
}
