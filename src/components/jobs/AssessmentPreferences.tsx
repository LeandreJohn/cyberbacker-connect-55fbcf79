import { useState } from "react";
import { ArrowRight, ChartNoAxesColumn, ChevronLeft, ChevronRight, GripVertical, Info, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { AssessmentPreferences as Preferences } from "@/lib/jobs/matching";
import { DISC_LIMIT, VALUES_LIMIT, addRanked, moveRanked, optionalNumber, rankedKeys, removeRanked, setScoreInPlace } from "@/lib/jobs/requirements";
import { cn } from "@/lib/utils";

const VALUES = ["AES", "ECO", "IND", "POL", "ALT", "REG", "THE"] as const;
const DISC = ["D", "I", "S", "C"] as const;
type Group = keyof Preferences;
type Scores = Record<string, number | null | undefined>;

function RankedRow({ group, label, options, limit, scores, onChange }: { group: Group; label?: string; options: readonly string[]; limit: number; scores: Scores; onChange: (next: Scores) => void }) {
  const [dragging, setDragging] = useState<string | null>(null);
  const keys = rankedKeys(scores);
  const full = keys.length >= limit;
  return <div className="space-y-3">
    {label && <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>}
    <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Most important</span><ArrowRight className="h-3.5 w-3.5"/><span>Least important</span></div>
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${limit}, minmax(0, 1fr))` }}>
      {Array.from({ length: limit }, (_, index) => {
        const key = keys[index];
        if (!key) return <div key={`empty-${index}`} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragging) onChange(moveRanked(scores, dragging, index)); setDragging(null); }} className="grid min-h-[132px] place-items-center rounded-lg border border-dashed text-xs text-muted-foreground">Empty slot</div>;
        return <div key={key} draggable onDragStart={() => setDragging(key)} onDragEnd={() => setDragging(null)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragging) onChange(moveRanked(scores, dragging, index)); setDragging(null); }} className={cn("min-w-0 space-y-2 rounded-lg bg-primary/10 p-2 ring-1 ring-primary", dragging === key && "opacity-50")}>
          <div className="flex items-center justify-between gap-1"><GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" aria-hidden/><Label htmlFor={`score-${group}-${key}`} className="font-semibold">{key}</Label><button type="button" aria-label={`Remove ${key}`} onClick={() => onChange(removeRanked(scores, key))} className="rounded p-0.5 text-muted-foreground hover:text-foreground"><X className="h-4 w-4"/></button></div>
          <Input id={`score-${group}-${key}`} aria-label={`${group} ${key} desired score`} type="number" min={0} max={100} step={1} placeholder="—" value={scores[key] ?? ""} className="h-10 bg-background px-0 text-center text-lg font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" onChange={(e) => onChange(setScoreInPlace(scores, key, optionalNumber(e.target.value, 100)))}/>
          <div className="flex justify-between"><Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label={`Move ${key} left`} disabled={index === 0} onClick={() => onChange(moveRanked(scores, key, index - 1))}><ChevronLeft className="h-4 w-4"/></Button><Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label={`Move ${key} right`} disabled={index === keys.length - 1} onClick={() => onChange(moveRanked(scores, key, index + 1))}><ChevronRight className="h-4 w-4"/></Button></div>
        </div>;
      })}
    </div>
    <div className="flex flex-wrap gap-2">{options.filter((o) => !keys.includes(o)).map((o) => <Button key={o} type="button" variant="outline" size="sm" disabled={full} aria-label={`Add ${label ?? ""} ${o}`.replace(/\s+/g, " ")} onClick={() => onChange(addRanked(scores, o, limit))}><Plus className="mr-1 h-3.5 w-3.5"/>{o}</Button>)}</div>
  </div>;
}

export function AssessmentPreferences({ enabled, value, onEnabledChange, onChange }: { enabled: boolean; value: Preferences; onEnabledChange: (value: boolean) => void; onChange: (value: Preferences) => void }) {
  const set = (group: Group) => (next: Scores) => onChange({ ...value, [group]: next });
  const header = (title: string) => <h3 className="flex items-center gap-3 text-lg font-semibold"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-primary"><ChartNoAxesColumn className="h-5 w-5"/></span>{title}</h3>;
  const note = (text: string) => <p className="flex items-start gap-2 rounded-md bg-secondary/60 p-3 text-sm text-muted-foreground"><Info className="mt-0.5 h-4 w-4 shrink-0 text-primary"/>{text}</p>;
  return <section className="space-y-4">
    <div className="flex items-center justify-between gap-3"><Label htmlFor="assessment-preferences" className="text-base">Specify desired assessment scores</Label><Switch id="assessment-preferences" checked={enabled} onCheckedChange={onEnabledChange}/></div>
    {enabled && <div className="space-y-4">
      <div className="space-y-4 rounded-lg border p-4 sm:p-5">{header("Values Assessment")}{note(`Add up to ${VALUES_LIMIT} values and arrange them left to right, with the most important on the left. Drag cards or use the arrows to reorder.`)}<RankedRow group="values" options={VALUES} limit={VALUES_LIMIT} scores={value.values} onChange={set("values")}/></div>
      <div className="space-y-4 rounded-lg border p-4 sm:p-5">{header("DISC Assessment")}{note(`For Natural and Modified, add your top ${DISC_LIMIT} traits each and place the most important on the left.`)}<div className="grid gap-6 @container sm:grid-cols-2">{(["natural", "modified"] as const).map((group) => <RankedRow key={group} group={group} label={group} options={DISC} limit={DISC_LIMIT} scores={value[group]} onChange={set(group)}/>)}</div></div>
    </div>}
  </section>;
}
