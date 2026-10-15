import { useState } from "react";
import { Languages, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { LanguageRequirement } from "@/lib/jobs/matching";
import { makePrimary, normalizeLanguages } from "@/lib/jobs/requirements";
import { cn } from "@/lib/utils";

const PROFICIENCY = ["Beginner", "Intermediate", "Advanced", "Proficient", "Native/Fluent"];
export function LanguageRequirements({ items, options, onChange }: { items: LanguageRequirement[]; options: string[]; onChange: (items: LanguageRequirement[]) => void }) {
  const [language, setLanguage] = useState("");
  const change = (name: string, fields: Partial<LanguageRequirement>) => onChange(items.map((item) => item.language === name ? { ...item, ...fields } : item));
  return <section className="space-y-4" aria-label="Language requirements">
    <Label className="text-base">Languages Spoken &amp; Proficiency</Label>
    <div className="space-y-3 rounded-lg border bg-muted/30 p-4 sm:p-5">
      <p className="font-medium">Add a New Language</p>
      <div className="flex flex-col gap-3 sm:flex-row"><Select value={language} onValueChange={setLanguage}><SelectTrigger className="h-12 flex-1 bg-background" aria-label="Language to add"><Languages className="h-4 w-4 text-muted-foreground"/><SelectValue placeholder="Select language to add..."/></SelectTrigger><SelectContent>{options.filter((option) => !items.some((item) => item.language === option)).map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select><Button className="h-12 shrink-0" disabled={!language} onClick={() => { onChange(normalizeLanguages([...items, { language, proficiency: 3 }])); setLanguage(""); }}><Plus className="h-4 w-4"/>Add Language</Button></div>
    </div>
    {items.map((item) => <div key={item.language} className="space-y-5 rounded-lg border bg-background p-4 sm:p-5">
      <div className="flex items-center gap-2"><h3 className="font-sans text-lg font-bold">{item.language}</h3>{item.primary ? <Badge variant="secondary" className="gap-1 text-primary"><Star className="h-3 w-3 fill-current"/>Primary</Badge> : <Button variant="link" className="h-auto p-0 text-xs underline" onClick={() => onChange(makePrimary(items, item.language))}>Make Primary</Button>}<Button variant="ghost" size="icon" className="ml-auto shrink-0 text-muted-foreground" aria-label={`Remove ${item.language}`} title={`Remove ${item.language}`} onClick={() => onChange(normalizeLanguages(items.filter((current) => current.language !== item.language)))}><Trash2 className="h-4 w-4"/></Button></div>
      <div className="max-w-md space-y-2"><Label className="text-xs uppercase text-muted-foreground">Overall proficiency level</Label><Select value={String(item.proficiency)} onValueChange={(value) => change(item.language, { proficiency: Number(value) })}><SelectTrigger className="h-12" aria-label={`${item.language} overall proficiency`}><SelectValue/></SelectTrigger><SelectContent>{PROFICIENCY.map((label, index) => <SelectItem key={label} value={String(index + 1)}>{index + 1} – {label}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-3 rounded-lg bg-muted/40 p-4"><p className="text-xs font-semibold uppercase text-muted-foreground">Detailed competency ratings (1–5)</p><div className="grid gap-4 sm:grid-cols-3">{(["speaking", "reading", "writing"] as const).map((competency) => { const score = item[competency] ?? item.proficiency; return <div key={competency}><div className="mb-1.5 flex justify-between gap-2 text-sm"><span className="capitalize">{competency}</span><span className="font-semibold text-primary">{score}/5</span></div><div className="grid grid-cols-5 gap-1">{[1,2,3,4,5].map((value) => <Button key={value} type="button" variant="ghost" className="h-6 min-w-0 p-0" aria-label={`${item.language} ${competency} ${value} of 5`} aria-pressed={score === value} title={`${value}/5`} onClick={() => change(item.language, { [competency]: value })}><span className={cn("h-2 w-full rounded-full", value <= score ? "bg-primary" : "bg-border")}/></Button>)}</div></div>; })}</div></div>
    </div>)}
  </section>;
}