import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, ChevronDown, Copy, Download, Plus, RotateCcw, Save, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createBlankJob, normalizeJob, type SavedJob } from "@/lib/data/jobs";
import { DEFAULT_SCORING_WEIGHTS, EXPERIENCE_TIERS, scoringTotal, setCappedWeight, type EducationLevel, type ExperienceTier, type ScoringWeights, type SkillLevel } from "@/lib/jobs/matching";
import { LanguageRequirements } from "./LanguageRequirements";
import { AssessmentPreferences } from "./AssessmentPreferences";
import { ROLE_DURATIONS, optionalNumber, preferenceText, validDuration } from "@/lib/jobs/requirements";
import { cn } from "@/lib/utils";

const INDUSTRIES = ["Real Estate", "Construction & Trades", "Financial Services", "Retail & E-commerce", "Legal Services", "Healthcare & Wellness", "Coaching & Consulting", "Marketing & Creative", "Technology & SaaS", "Professional Services", "Education & Online Training", "Hospitality & Events", "Insurance & Risk", "Nonprofit & Associations", "Personal Administration"];
const SKILLS = ["Calendar Management", "Email Management", "Lead Generation", "Social Media Management", "Bookkeeping", "Customer Service", "Transaction Coordination", "Data Entry", "Project Coordination", "Content Writing", "Graphic Design", "Recruiting", "Sales Outreach", "Research", "Reporting & Analytics", "Accounts Payable", "Process Documentation"];
const TOOLS = ["Monday.com", "GoHighLevel CRM", "HubSpot CRM", "Salesforce CRM", "Buildium", "Yardi Breeze", "RentRedi", "Google Workspace", "Slack", "Canva", "QuickBooks Online", "Zendesk", "Dialpad", "Asana", "Trello", "Notion", "Microsoft 365"];
const EXPERTISE = ["Administrative & Executive Support", "Operations, Reporting & Compliance", "Customer Service & Client Success", "Sales & Lead Generation", "Marketing & Creative", "Bookkeeping & Finance", "Real Estate Operations", "Software Engineering & Web Development"];
const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Italian", "Mandarin Chinese", "Cantonese", "Japanese", "Korean", "Arabic", "Hindi", "Bengali", "Tagalog", "Vietnamese", "Thai", "Indonesian", "Malay", "Dutch", "Swedish", "Norwegian", "Danish", "Finnish", "Polish", "Ukrainian", "Russian", "Turkish", "Hebrew", "Swahili"];
const EDUCATION: EducationLevel[] = ["No preference", "High school", "Some college / Undergraduate", "Associate degree", "Bachelor's degree", "Master's degree", "Doctorate"];
const SHIFTS = ["Standard business hours (9am–5pm)", "Early hours (6am–2pm)", "Evening coverage (12pm–8pm)", "Flexible / split shifts"];
const HOURS = ["10–15 hrs/week", "16–25 hrs/week", "26–39 hrs/week", "40+ hrs/week"];
const STARTS = ["Immediate", "1 week", "2 weeks", "30 Days", "60 Days", "90 Days"];
const LEVELS: SkillLevel[] = ["Basic", "Intermediate", "Advanced", "Expert"];

function ListEditor({ label, items, setItems, placeholder }: { label: string; items: string[]; setItems: (value: string[]) => void; placeholder: string }) { const [value, setValue] = useState(""); const add = () => { const next = value.trim(); if (next) setItems([...items, next]); setValue(""); }; return <div className="space-y-2"><Label>{label}</Label><div className="flex gap-2"><Input value={value} placeholder={placeholder} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}/><Button type="button" variant="outline" size="icon" onClick={add} aria-label={`Add ${label}`}><Plus className="h-4 w-4"/></Button></div><div className="space-y-1">{items.map((item, index) => <div key={`${item}-${index}`} className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2 text-sm"><span>{item}</span><Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setItems(items.filter((_, i) => i !== index))}><X className="h-3.5 w-3.5"/></Button></div>)}</div></div>; }
function ChoiceRow({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) { return <div className="flex flex-wrap gap-2">{options.map((option) => <Button key={option} type="button" size="sm" variant={value === option ? "default" : "outline"} onClick={() => onChange(option)}>{option}</Button>)}</div>; }
function SelectField({ label, value, onValueChange, options }: { label: string; value: string; onValueChange: (value: string) => void; options: string[] }) { return <div className="space-y-2"><Label>{label}</Label><Select value={value} onValueChange={onValueChange}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>; }

export function JobDescriptionBuilder({ compact, initialJob, onSave, onBack }: { compact?: boolean; initialJob?: SavedJob; onSave?: (job: SavedJob) => void; onBack?: () => void }) {
  const navigate = useNavigate();
  const [job, setJob] = useState<SavedJob>(() => normalizeJob(initialJob ?? createBlankJob()));
  const [picker, setPicker] = useState("");
  const [pickerLevel, setPickerLevel] = useState<SkillLevel>("Intermediate");
  const [pickerYears, setPickerYears] = useState("");
  const update = <K extends keyof SavedJob>(key: K, value: SavedJob[K]) => setJob((current) => ({ ...current, [key]: value }));
  const addRequirement = (name: string, type: "must" | "preferred", kind?: "skill" | "tool") => { const clean = name.trim(); if (!clean || job.skillRequirements.some((item) => item.name === clean)) return; const inferredKind = kind ?? (TOOLS.includes(clean) ? "tool" : "skill"); const next = [...job.skillRequirements, { name: clean, level: pickerLevel, kind: inferredKind, necessity: type, yearsExperience: optionalNumber(pickerYears) }]; update("skillRequirements", next); update("requiredSkills", type === "must" ? [...job.requiredSkills, clean] : job.requiredSkills); update("preferredSkills", type === "preferred" ? [...job.preferredSkills, clean] : job.preferredSkills); update("tools", inferredKind === "tool" ? [...job.tools, clean] : job.tools); setPicker(""); };
  const removeRequirement = (name: string) => { update("skillRequirements", job.skillRequirements.filter((item) => item.name !== name)); update("requiredSkills", job.requiredSkills.filter((item) => item !== name)); update("preferredSkills", job.preferredSkills.filter((item) => item !== name)); update("tools", job.tools.filter((item) => item !== name)); };
  const setRequirementLevel = (name: string, level: SkillLevel) => update("skillRequirements", job.skillRequirements.map((item) => item.name === name ? { ...item, level } : item));
  const setRequirementYears = (name: string, value: string) => update("skillRequirements", job.skillRequirements.map((item) => item.name === name ? { ...item, yearsExperience: optionalNumber(value) } : item));
  const setWeight = (key: keyof ScoringWeights, value: number) => update("weights", setCappedWeight(job.weights, key, value));
  const complete = Boolean(validDuration(job.duration) && job.title && job.industry && job.tasks.length && job.responsibilities.length && job.skillRequirements.length && job.shift);
  const text = useMemo(() => [`${job.title || "Untitled role"} — ${job.department || "Team not specified"}`, `Industry: ${job.industry} · Duration: ${job.duration}`, `Experience: ${EXPERIENCE_TIERS[job.tier].label} (${EXPERIENCE_TIERS[job.tier].experience}), minimum ${job.minimumYears} years`, "", EXPERIENCE_TIERS[job.tier].blurb, "", "Key Tasks:", ...job.tasks.map((item) => `• ${item}`), "", "Responsibilities:", ...job.responsibilities.map((item) => `• ${item}`), "", `Must-have: ${job.requiredSkills.join(", ") || "None"}`, `Preferred: ${job.preferredSkills.join(", ") || "None"}`, `Tools: ${job.tools.join(", ") || "None"}`, `Languages: ${job.languages.map((item) => `${item.language} (${item.proficiency}/5)`).join(", ") || "No preference"}`, `Education: ${job.education}${job.educationRequired ? " (required)" : ""}`, "", `Availability: ${job.engagementType} · ${job.shift} · ${job.startTiming}`, `Time zone: ${job.timezone} · ${job.hours} hrs/week`, `Communication: ${job.communication} · Work style: ${job.workStyle}`, "", preferenceText(job)].join("\n"), [job]);
  const download = () => { const url = URL.createObjectURL(new Blob([text], { type: "text/plain" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${(job.title || "job-description").replace(/\s+/g, "-").toLowerCase()}-jd.txt`; anchor.click(); URL.revokeObjectURL(url); };
  const submitMarketplace = () => navigate({ to: "/marketplace", search: { title: job.title, industry: job.industry, tier: job.tier, requiredSkills: job.requiredSkills, preferredSkills: job.preferredSkills, responsibilities: job.responsibilities, deliverables: job.deliverables, tools: job.tools, timezone: job.timezone, availabilityHours: job.shift, workStyle: job.workStyle, language: job.languages[0]?.language, certification: job.certification, profile: JSON.stringify(job) } });
  return <div className={cn("grid grid-cols-1 gap-6", !compact && "xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]")}>
    <div className="space-y-5">
      {(onBack || onSave) && <div className="flex flex-wrap justify-between gap-2"><Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4"/>Back to jobs</Button><Button onClick={() => onSave?.(job)} disabled={!complete}><Save className="mr-2 h-4 w-4"/>{initialJob ? "Update job" : "Save job"}</Button></div>}
      <Card><CardHeader><CardTitle>1. Role basics</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Job title</Label><Input value={job.title} onChange={(e) => update("title", e.target.value)}/></div><div className="space-y-2"><Label>Department / team</Label><Input value={job.department} onChange={(e) => update("department", e.target.value)}/></div><SelectField label="Area of support" value={job.industry} onValueChange={(v) => update("industry", v)} options={INDUSTRIES}/><SelectField label="Role duration" value={job.duration} onValueChange={(v) => update("duration", v)} options={ROLE_DURATIONS}/><div className="space-y-2 sm:col-span-2"><Label>Experience tier</Label><div className="grid gap-3 md:grid-cols-3">{(Object.keys(EXPERIENCE_TIERS) as ExperienceTier[]).map((key) => { const item = EXPERIENCE_TIERS[key]; return <Button key={key} type="button" variant="outline" onClick={() => update("tier", key)} className={cn("h-auto min-h-28 flex-col items-start justify-start whitespace-normal p-4 text-left", job.tier === key && "border-primary bg-primary/5 ring-1 ring-primary")}><span className="font-semibold">{item.label}</span><span className="text-xs font-medium text-primary">{item.experience}</span><span className="mt-1 text-xs text-muted-foreground">{item.description}</span></Button>; })}</div></div></CardContent></Card>
      <Card><CardHeader><CardTitle>2. Work scope</CardTitle></CardHeader><CardContent className="space-y-5"><ListEditor label="Task areas" items={job.tasks} setItems={(v) => update("tasks", v)} placeholder="e.g. Schedule client meetings"/><ListEditor label="Responsibilities" items={job.responsibilities} setItems={(v) => update("responsibilities", v)} placeholder="e.g. Own weekly reporting"/><ListEditor label="Expected deliverables / outcomes" items={job.deliverables} setItems={(v) => update("deliverables", v)} placeholder="e.g. Inbox cleared daily"/></CardContent></Card>
      <Card className="@container/requirements min-w-0">
        <CardHeader><CardTitle>3. Requirements</CardTitle></CardHeader>
        <CardContent className="space-y-8">
          <section aria-label="Add a skill or tool" className="space-y-5">
            <h3 className="font-semibold">Skills &amp; software</h3>
            <div className="space-y-2">
              <Label htmlFor="requirement-name">Skill or tool name</Label>
              <Input id="requirement-name" value={picker} onChange={(e) => setPicker(e.target.value)} placeholder="Search skills, tools, or type your own"/>
            </div>
            <div className="grid gap-4 @min-[420px]/requirements:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <Label htmlFor="requirement-proficiency">Skill proficiency</Label>
                <Select value={pickerLevel} onValueChange={(v) => setPickerLevel(v as SkillLevel)}>
                  <SelectTrigger id="requirement-proficiency" className="w-full"><SelectValue/></SelectTrigger>
                  <SelectContent>{LEVELS.map((level) => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="min-w-0 space-y-2">
                <Label htmlFor="requirement-years">Years of experience <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <Input id="requirement-years" aria-label="New skill or tool years of experience" type="number" min={0} step={0.5} placeholder="e.g. 2" value={pickerYears} onChange={(e) => setPickerYears(e.target.value)}/>
              </div>
            </div>
            <div className="grid gap-3 border-t pt-4 @min-[420px]/requirements:grid-cols-2">
              <Button type="button" disabled={!picker.trim()} onClick={() => addRequirement(picker, "must")}><Plus className="h-4 w-4 shrink-0"/>Add to Must-have</Button>
              <Button type="button" variant="outline" disabled={!picker.trim()} onClick={() => addRequirement(picker, "preferred")}><Plus className="h-4 w-4 shrink-0"/>Add to Preferred</Button>
            </div>
          </section>
          <div className="divide-y border-y">
            {([{ label: "Suggested skills", items: SKILLS, kind: "skill" }, { label: "Suggested software & tools", items: TOOLS, kind: "tool" }] as const).map(({ label, items, kind }) => {
              const available = items.filter((item) => !job.skillRequirements.some((current) => current.name === item));
              return <Collapsible key={kind}>
                <CollapsibleTrigger asChild>
                  <Button type="button" variant="ghost" className="group grid h-auto w-full grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-none px-0 py-4 text-left">
                    <span className="min-w-0 whitespace-normal font-medium">{label}</span>
                    <span className="flex shrink-0 items-center gap-3"><Badge variant="outline">{available.length}</Badge><ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"/></span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent><div className="flex flex-wrap gap-2 pb-5">{available.map((item) => <Button key={item} type="button" variant="outline" size="sm" className="h-auto min-h-9 max-w-full whitespace-normal py-2 text-left" onClick={() => addRequirement(item, "preferred", kind)}><Plus className="h-3.5 w-3.5 shrink-0"/>{item}</Button>)}</div></CollapsibleContent>
              </Collapsible>;
            })}
          </div>
          <div className="space-y-8">
            {(["must", "preferred"] as const).map((group) => {
              const names = group === "must" ? job.requiredSkills : job.preferredSkills;
              return <section key={group} aria-label={group === "must" ? "Must-have requirements" : "Preferred requirements"} className="min-w-0 space-y-3">
                <div className={cn("grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b pb-3", group === "must" && "border-primary/30")}>
                  <h3 className={cn("font-semibold", group === "must" && "text-primary")}>{group === "must" ? "Must-have" : "Preferred"}</h3>
                  <Badge variant="outline">{names.length}</Badge>
                </div>
                <div className="divide-y">
                  {names.map((name, index) => {
                    const requirement = job.skillRequirements.find((item) => item.name === name);
                    const id = `requirement-${group}-${index}`;
                    return <div key={name} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-4 py-4 @min-[620px]/requirements:grid-cols-[minmax(0,1fr)_150px_150px_auto] @min-[620px]/requirements:items-end">
                      <div className="min-w-0 @min-[620px]/requirements:pb-2"><p className="break-words text-sm font-semibold">{name}</p><p className="mt-1 text-xs text-muted-foreground">{requirement?.kind === "tool" ? "Software / tool" : "Skill"}</p></div>
                      <div className="col-span-2 row-start-2 grid min-w-0 gap-4 @min-[360px]/requirements:grid-cols-2 @min-[620px]/requirements:col-span-2 @min-[620px]/requirements:col-start-2 @min-[620px]/requirements:row-start-1">
                        <div className="min-w-0 space-y-2"><Label htmlFor={`${id}-level`} className="text-xs text-muted-foreground">Proficiency</Label><Select value={requirement?.level ?? "Intermediate"} onValueChange={(v) => setRequirementLevel(name, v as SkillLevel)}><SelectTrigger id={`${id}-level`} aria-label={`${name} proficiency`} className="w-full"><SelectValue/></SelectTrigger><SelectContent>{LEVELS.map((level) => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent></Select></div>
                        <div className="min-w-0 space-y-2"><Label htmlFor={`${id}-years`} className="text-xs text-muted-foreground">Years of experience</Label><Input id={`${id}-years`} aria-label={`${name} years of experience`} type="number" min={0} step={0.5} placeholder="Optional" value={requirement?.yearsExperience ?? ""} onChange={(e) => setRequirementYears(name, e.target.value)}/></div>
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="col-start-2 row-start-1 shrink-0 text-muted-foreground @min-[620px]/requirements:col-start-4" aria-label={`Remove ${name}`} title={`Remove ${name}`} onClick={() => removeRequirement(name)}><X className="h-4 w-4"/></Button>
                    </div>;
                  })}
                  {!names.length && <p className="py-4 text-sm text-muted-foreground">No {group === "must" ? "must-have" : "preferred"} skills or tools added.</p>}
                </div>
              </section>;
            })}
          </div>
          <section className="space-y-4 border-t pt-6" aria-label="Experience and credentials">
            <h3 className="font-semibold">Experience &amp; credentials</h3>
            <div className="grid gap-4 @min-[420px]/requirements:grid-cols-2">
              <div className="min-w-0 space-y-2"><Label>Minimum years of experience</Label><Input type="number" min={0} max={40} value={job.minimumYears} onChange={(e) => update("minimumYears", Math.max(0, Number(e.target.value)))}/></div>
              <div className="min-w-0 space-y-2"><Label>Certification or credential</Label><Input value={job.certification} placeholder="No preference" onChange={(e) => update("certification", e.target.value)}/></div>
            </div>
          </section>
          <section className="space-y-4 border-t pt-6" aria-label="Functional expertise">
            <Label className="text-base">Functional expertise</Label>
            <div className="flex flex-wrap gap-2">{EXPERTISE.map((item) => <Button key={item} type="button" size="sm" className="h-auto min-h-9 max-w-full whitespace-normal py-2 text-left" variant={job.functionalExpertise.includes(item) ? "default" : "outline"} onClick={() => update("functionalExpertise", job.functionalExpertise.includes(item) ? job.functionalExpertise.filter((current) => current !== item) : [...job.functionalExpertise, item])}>{item}</Button>)}</div>
          </section>
          <section className="space-y-4 border-t pt-6" aria-label="Education requirements">
            <h3 className="font-semibold">Education</h3>
            <SelectField label="Minimum education level" value={job.education} onValueChange={(v) => update("education", v as EducationLevel)} options={EDUCATION}/>
            <label className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 text-sm"><span>Candidates must have this level</span><Switch checked={job.educationRequired} onCheckedChange={(v) => update("educationRequired", v)}/></label>
          </section>
          <div className="border-t pt-6"><LanguageRequirements items={job.languages} options={LANGUAGES} onChange={(items) => update("languages", items)}/></div>
        </CardContent>
      </Card>
      <Card><CardHeader><CardTitle>4. Work style & availability</CardTitle></CardHeader><CardContent className="space-y-6"><div><Label className="mb-2 block">Type</Label><ChoiceRow options={["Full-time", "Part-time"]} value={job.engagementType} onChange={(v) => update("engagementType", v)}/></div><div><Label className="mb-2 block">Hours per week</Label><ChoiceRow options={HOURS} value={job.hours >= 40 ? "40+ hrs/week" : job.hours >= 26 ? "26–39 hrs/week" : job.hours >= 16 ? "16–25 hrs/week" : "10–15 hrs/week"} onChange={(v) => update("hours", v === "40+ hrs/week" ? 40 : v === "26–39 hrs/week" ? 32 : v === "16–25 hrs/week" ? 20 : 12)}/></div><div><Label className="mb-2 block">Shift</Label><ChoiceRow options={SHIFTS} value={job.shift ?? ""} onChange={(v) => { update("shift", v); update("availabilityHours", v); }}/></div><div><Label className="mb-2 block">Start</Label><ChoiceRow options={STARTS} value={job.startTiming} onChange={(v) => update("startTiming", v)}/></div><div className="space-y-2"><Label>Availability notes <span className="font-normal text-muted-foreground">(optional)</span></Label><Textarea value={job.availabilityNotes} onChange={(e) => update("availabilityNotes", e.target.value)} placeholder="e.g. Must overlap 9am–1pm with the client's team"/></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Operating time zone</Label><Input value={job.timezone} onChange={(e) => update("timezone", e.target.value)}/></div><SelectField label="Day-to-day communication" value={job.communication} onValueChange={(v) => update("communication", v)} options={["Email", "Slack", "Dialpad", "Phone", "Zoom / video calls", "Text / WhatsApp", "Project management platform"]}/><SelectField label="Check-ins and updates" value={job.checkIns} onValueChange={(v) => update("checkIns", v)} options={["Daily summary", "Twice weekly check-in", "Weekly sync meeting", "As-needed updates only"]}/><SelectField label="Preferred work style" value={job.workStyle} onValueChange={(v) => update("workStyle", v)} options={["Proactive", "Reactive", "Combination"]}/></div></CardContent></Card>
      <Card><CardHeader><CardTitle>5. Matching rules & scoring</CardTitle></CardHeader><CardContent className="space-y-6"><AssessmentPreferences enabled={job.assessmentPreferencesEnabled ?? false} value={job.assessmentPreferences ?? { values: {}, authentic: {}, modified: {} }} onEnabledChange={(value) => update("assessmentPreferencesEnabled", value)} onChange={(value) => update("assessmentPreferences", value)}/><div><Label className="mb-2 block">When a candidate is missing a must-have skill</Label><div className="grid gap-3 sm:grid-cols-2"><Button type="button" variant="outline" onClick={() => update("mustHaveBehavior", "filter")} className={cn("h-auto items-start justify-start whitespace-normal p-4 text-left", job.mustHaveBehavior === "filter" && "border-primary bg-primary/5 ring-1 ring-primary")}><span><strong>Filter out <span className="font-normal text-muted-foreground">(default)</span></strong><br/><span className="text-xs text-muted-foreground">Exclude candidates missing a must-have.</span></span></Button><Button type="button" variant="outline" onClick={() => update("mustHaveBehavior", "lower-score")} className={cn("h-auto items-start justify-start whitespace-normal p-4 text-left", job.mustHaveBehavior === "lower-score" && "border-primary bg-primary/5 ring-1 ring-primary")}><span><strong>Lower the score</strong><br/><span className="text-xs text-muted-foreground">Keep them ranked with a lower score.</span></span></Button></div></div><div className="flex items-center justify-between"><div><p className="font-medium">Scoring weights</p><p className="text-sm text-muted-foreground">The total can never exceed 100%.</p></div><Button type="button" variant="outline" size="sm" onClick={() => update("weights", { ...DEFAULT_SCORING_WEIGHTS })}><RotateCcw className="mr-2 h-4 w-4"/>Reset</Button></div><div className="overflow-hidden rounded-md border">{(Object.keys(job.weights) as (keyof ScoringWeights)[]).map((key) => <div key={key} className="grid items-center gap-3 border-b p-4 last:border-b-0 sm:grid-cols-[150px_1fr_90px]"><div><p className="capitalize font-medium">{key}</p><p className="text-xs text-muted-foreground">Default {DEFAULT_SCORING_WEIGHTS[key]}%</p></div><Slider value={[job.weights[key]]} max={100} step={1} onValueChange={([value]) => setWeight(key, value ?? 0)}/><div className="flex items-center gap-1"><Input type="number" min={0} max={100} value={job.weights[key]} onChange={(e) => setWeight(key, Number(e.target.value))}/><span>%</span></div></div>)}<div className="flex items-center justify-between bg-success/10 p-4 font-semibold"><span>Total</span><span className="text-success">{scoringTotal(job.weights)}%</span></div></div>{scoringTotal(job.weights) < 100 && <p className="text-sm text-muted-foreground">{100 - scoringTotal(job.weights)}% remains available to assign.</p>}</CardContent></Card>
    </div>
    <Card className="h-fit xl:sticky xl:top-20"><CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>Job description preview</CardTitle><Badge variant={complete ? "secondary" : "outline"} className="gap-1"><CheckCircle2 className="h-3.5 w-3.5"/>{complete ? "Ready" : "Needs details"}</Badge></CardHeader><CardContent className="space-y-4"><pre className="max-h-[560px] overflow-auto whitespace-pre-wrap rounded-lg bg-muted/60 p-4 font-sans text-sm leading-relaxed">{text}</pre><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => { void navigator.clipboard.writeText(text); toast.success("Copied to clipboard"); }}><Copy className="mr-1.5 h-4 w-4"/>Copy</Button><Button variant="outline" onClick={download}><Download className="mr-1.5 h-4 w-4"/>Download</Button><Button disabled={!complete} onClick={submitMarketplace}><Search className="mr-1.5 h-4 w-4"/>Find matching candidates</Button></div></CardContent></Card>
  </div>;
}
