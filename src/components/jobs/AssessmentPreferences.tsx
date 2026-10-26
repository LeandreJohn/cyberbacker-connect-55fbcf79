import { useState } from "react";
import { ArrowRight, ChartNoAxesColumn, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { AssessmentPreferences as Preferences } from "@/lib/jobs/matching";
import { DISC_LIMIT, VALUES_LIMIT, moveRanked, normalizeRanked, optionalNumber, rankedKeys, setScoreInPlace } from "@/lib/jobs/requirements";
import { cn } from "@/lib/utils";

const VALUES = ["AES", "ECO", "IND", "POL", "ALT", "REG", "THE"] as const;
const DISC = ["D", "I", "S", "C"] as const;
type Group = keyof Preferences;
type Scores = Record<string, number | null | undefined>;

function RankedRow({ group, label, options, limit, scores: raw, onChange }: { group: Group; label?: string; options: readonly string[]; limit: number; scores: Scores; onChange: (next: Scores) => void }) {
  const [dragging, setDragging] = useState<string | null>(null);
  const scores = normalizeRanked(raw, options, limit);
  const keys = rankedKeys(scores);
  const move = (key: string, to: number) => onChange(normalizeRanked(moveRanked(scores, key, to), options, limit));
  return <div className="space-y-3">
    {label && <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>}
    <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Most important</span><ArrowRight className="h-3.5 w-3.5"/><span>Least important</span></div>
    <div className="grid grid-cols-4 gap-3">
      {keys.map((key, index) => {
        const scored = index < limit;
        return <div key={key} draggable onDragStart={() => setDragging(key)} onDragEnd={() => setDragging(null)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragging) move(dragging, index); setDragging(null); }} className={cn("min-w-0 space-y-2 rounded-lg p-2", scored ? "bg-primary/10 ring-1 ring-primary" : "border border-dashed bg-muted/30", dragging === key && "opacity-50")}>
          <div className="flex cursor-grab flex-col items-center"><span className="text-[10px] font-semibold text-muted-foreground">#{index + 1}</span><Label htmlFor={`score-${group}-${key}`} className="font-semibold">{key}</Label></div>
          {scored ? <Input id={`score-${group}-${key}`} aria-label={`${group} ${key} desired score`} type="number" min={0} max={100} step={1} placeholder="—" value={scores[key] ?? ""} className="h-10 bg-background px-0 text-center text-lg font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" onChange={(e) => onChange(setScoreInPlace(scores, key, optionalNumber(e.target.value, 100)))}/> : <div className="grid h-10 place-items-center text-[11px] text-muted-foreground">Ranked only</div>}
          <div className="flex justify-between"><Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label={`Move ${key} left`} disabled={index === 0} onClick={() => move(key, index - 1)}><ChevronLeft className="h-4 w-4"/></Button><Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label={`Move ${key} right`} disabled={index === keys.length - 1} onClick={() => move(key, index + 1)}><ChevronRight className="h-4 w-4"/></Button></div>
        </div>;
      })}
    </div>
    <p className="text-xs text-muted-foreground">Desired scores apply to the top {limit}; the rest are ranked only.</p>
  </div>;
}

export function AssessmentPreferences({ enabled, value, onEnabledChange, onChange }: { enabled: boolean; value: Preferences; onEnabledChange: (value: boolean) => void; onChange: (value: Preferences) => void }) {
  const set = (group: Group) => (next: Scores) => onChange({ ...value, [group]: next });
  const header = (title: string) => <h3 className="flex items-center gap-3 text-lg font-semibold"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-primary"><ChartNoAxesColumn className="h-5 w-5"/></span>{title}</h3>;
  const note = (text: string) => <p className="flex items-start gap-2 rounded-md bg-secondary/60 p-3 text-sm text-muted-foreground"><Info className="mt-0.5 h-4 w-4 shrink-0 text-primary"/>{text}</p>;
  return <section className="space-y-4">
    <div className="flex items-center justify-between gap-3"><Label htmlFor="assessment-preferences" className="text-base">Specify desired assessment scores</Label><Switch id="assessment-preferences" checked={enabled} onCheckedChange={onEnabledChange}/></div>
    {enabled && <div className="space-y-4">
      <div className="space-y-4 rounded-lg border p-4 sm:p-5">{header("Values Assessment")}{note(`Arrange all values from most important (left) to least important (right). Set desired scores for the top ${VALUES_LIMIT}, rating each scored item from 0 to 100. Drag cards or use the arrows to reorder.`)}<RankedRow group="values" options={VALUES} limit={VALUES_LIMIT} scores={value.values} onChange={set("values")}/></div>
      <div className="space-y-4 rounded-lg border p-4 sm:p-5">{header("DISC Assessment")}{note(`For Natural and Modified, arrange all traits from most important (left) to least important (right). Set desired scores for the top ${DISC_LIMIT}, rating each scored item from 0 to 100.`)}<div className="grid gap-6">{(["natural", "modified"] as const).map((group) => <RankedRow key={group} group={group} label={group} options={DISC} limit={DISC_LIMIT} scores={value[group]} onChange={set(group)}/>)}</div></div>
    </div>}
  </section>;
}
