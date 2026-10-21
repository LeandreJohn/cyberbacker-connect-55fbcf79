import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { IMPORT_DRAFT_KEY } from "@/lib/jobs/import";
import { ClipboardPaste, FilePlus2, Pencil, Plus } from "lucide-react";
import { JobDescriptionBuilder } from "@/components/jobs/JobDescriptionBuilder";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createBlankJob, getSavedJobs, saveJob, type SavedJob } from "@/lib/data/jobs";
import { EXPERIENCE_TIERS } from "@/lib/jobs/matching";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/job-builder")({ head: () => ({ meta: [{ title: "Job Description Builder — Cyberbacker" }, { name: "description", content: "Create, save, and manage structured job descriptions for Cyberbacker hiring." }, { property: "og:title", content: "Job Description Builder — Cyberbacker" }, { property: "og:description", content: "Create structured roles and find matching Cyberbacker candidates." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: JobWorkspace });
type View = "list" | "new" | "builder";
function JobWorkspace() {
  const [jobs, setJobs] = useState<SavedJob[]>(() => getSavedJobs());
  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<SavedJob | undefined>();
  const navigate = useNavigate();
  useEffect(() => { const raw = sessionStorage.getItem(IMPORT_DRAFT_KEY); if (!raw) return; sessionStorage.removeItem(IMPORT_DRAFT_KEY); try { setSelected({ ...createBlankJob(), ...JSON.parse(raw) }); setView("builder"); } catch { /* ignore bad draft */ } }, []);
  const openBlank = () => { setSelected(createBlankJob()); setView("builder"); };
  const edit = (job: SavedJob) => { setSelected(job); setView("builder"); };
  const persist = (job: SavedJob) => { const next = saveJob(job); setJobs(next); setSelected(job); toast.success("Job description saved"); setView("list"); };
  if (view === "builder" && selected) return <div className="space-y-6"><PageHeader title={selected.title || "New job"} description="Build the role requirements and matching rules."/><JobDescriptionBuilder key={selected.id} initialJob={selected} onSave={persist} onBack={() => setView("list")}/></div>;
  if (view === "new") return <div className="space-y-6"><div className="flex items-center justify-between"><PageHeader title="New job" description="Start from scratch, or paste an existing job description."/><Button variant="ghost" onClick={() => setView("list")}>Back to jobs</Button></div><div className="grid gap-5 md:grid-cols-2"><button type="button" onClick={openBlank} className="rounded-lg border bg-card p-8 text-left shadow-sm transition-colors hover:border-primary hover:bg-primary/5"><span className="mb-8 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary"><FilePlus2 className="h-6 w-6"/></span><span className="block text-xl font-semibold">Start blank</span><span className="mt-2 block text-muted-foreground">Fill in each step yourself, starting with the candidate tier.</span></button><button type="button" onClick={() => navigate({ to: "/job-builder/import" })} className="rounded-lg border bg-card p-8 text-left shadow-sm transition-colors hover:border-primary hover:bg-primary/5"><span className="mb-8 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary"><ClipboardPaste className="h-6 w-6"/></span><span className="block text-xl font-semibold">Paste existing job description</span><span className="mt-2 block text-muted-foreground">Paste text or upload a PDF, DOC, or DOCX to pre-fill a draft.</span></button></div></div></div>;
  return <div className="space-y-6"><PageHeader title="Job Description Builder" description="Create and manage the roles used to match Cyberbacker candidates." actions={<Button onClick={() => setView("new")}><Plus className="mr-2 h-4 w-4"/>New Job</Button>}/><Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Job title</TableHead><TableHead>Department</TableHead><TableHead>Tier</TableHead><TableHead>Status</TableHead><TableHead>Updated</TableHead><TableHead>Candidates</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>{jobs.map((job) => <TableRow key={job.id}><TableCell className="font-medium">{job.title || "Untitled job"}</TableCell><TableCell>{job.department || "—"}</TableCell><TableCell>{EXPERIENCE_TIERS[job.tier].label}</TableCell><TableCell><Badge variant={job.status === "Active" ? "secondary" : "outline"}>{job.status}</Badge></TableCell><TableCell>{new Date(job.updatedAt).toLocaleDateString()}</TableCell><TableCell>{job.candidateCount}</TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => edit(job)}><Pencil className="mr-2 h-4 w-4"/>Edit</Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card></div>;
}
