import { ChartNoAxesColumn, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { AssessmentPreferences as Preferences } from "@/lib/jobs/matching";
import { DISC_LIMIT, VALUES_LIMIT, optionalNumber, rankOf, setRankedScore } from "@/lib/jobs/requirements";
import { cn } from "@/lib/utils";

const VALUES = ["AES", "ECO", "IND", "POL", "ALT", "REG", "THE"] as const;
const DISC = ["D", "I", "S", "C"] as const;
const ORDINAL = ["1st", "2nd", "3rd", "4th"];

export function AssessmentPreferences({ enabled, value, onEnabledChange, onChange }: { enabled: boolean; value: Preferences; onEnabledChange: (value: boolean) => void; onChange: (value: Preferences) => void }) {
  const fields = (group: keyof Preferences, keys: readonly string[], limit: number) => {
    const scores = value[group] as Record<string, number | undefined>;
    const full = Object.values(scores).filter((v) => v != null).length >= limit;
    return keys.map((key) => {
      const rank = rankOf(scores, key);
      const disabled = full && rank == null;
      return <div key={key} className={cn("relative min-w-0 rounded-lg bg-muted/30 p-2 text-center", rank && "bg-primary/10 ring-1 ring-primary", disabled && "opacity-50")}>
        {rank && <span className="absolute -right-1.5 -top-2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">{ORDINAL[rank - 1]}</span>}
        <Label htmlFor={`score-${group}-${key}`} className="mb-2 block font-normal text-muted-foreground">{key}</Label>
        <Input id={`score-${group}-${key}`} aria-label={`${group} ${key} desired score`} type="number" min={0} max={100} step={1} placeholder="—" disabled={disabled} value={scores[key] ?? ""} className="h-11 bg-background px-0 text-center text-lg font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" onChange={(event) => onChange({ ...value, [group]: setRankedScore(scores, key, optionalNumber(event.target.value, 100), limit) })}/>
      </div>;
    });
  };
  const header = (title: string) => <h3 className="flex items-center gap-3 text-lg font-semibold"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-primary"><ChartNoAxesColumn className="h-5 w-5"/></span>{title}</h3>;
  const note = (text: string) => <p className="flex items-start gap-2 rounded-md bg-secondary/60 p-3 text-sm text-muted-foreground"><Info className="mt-0.5 h-4 w-4 shrink-0 text-primary"/>{text}</p>;
  return <section className="space-y-4">
    <div className="flex items-center justify-between gap-3"><Label htmlFor="assessment-preferences" className="text-base">Specify desired assessment scores</Label><Switch id="assessment-preferences" checked={enabled} onCheckedChange={onEnabledChange}/></div>
    {enabled && <div className="space-y-4">
      <div className="space-y-4 rounded-lg border p-4 sm:p-5">{header("Values Assessment")}{note(`Enter up to ${VALUES_LIMIT} values in order of importance. The first one you enter is ranked 1st, the next 2nd, and so on. Clear a score to free a slot — later ranks move up.`)}<div className="grid grid-cols-3 gap-3 sm:grid-cols-7">{fields("values", VALUES, VALUES_LIMIT)}</div></div>
      <div className="space-y-4 rounded-lg border p-4 sm:p-5">{header("DISC Assessment")}{note(`For both Natural and Modified, enter only the top ${DISC_LIMIT} traits. The first you enter is ranked 1st and the second 2nd.`)}<div className="grid gap-5 sm:grid-cols-2">{(["natural", "modified"] as const).map((group) => <div key={group} className="space-y-2"><p className="text-xs font-semibold uppercase text-muted-foreground">{group}</p><div className="grid grid-cols-4 gap-3">{fields(group, DISC, DISC_LIMIT)}</div></div>)}</div></div>
    </div>}
  </section>;
}
