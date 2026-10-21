import { useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FileUp, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IMPORT_DRAFT_KEY, parseJobText } from "@/lib/jobs/import";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/job-builder_/import")({
  head: () => ({ meta: [{ title: "Import Job Description — Cyberbacker" }, { name: "description", content: "Paste or upload an existing job description to start a structured draft." }, { property: "og:title", content: "Import Job Description — Cyberbacker" }, { property: "og:description", content: "Turn an existing PDF or Word job description into a structured draft." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ImportJob,
});

async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const buffer = await file.arrayBuffer();
  if (name.endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist");
    const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const pdf = await pdfjs.getDocument({ data: buffer }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const content = await (await pdf.getPage(i)).getTextContent();
      let line = ""; const out: string[] = [];
      for (const item of content.items as { str: string; hasEOL?: boolean }[]) { line += item.str; if (item.hasEOL) { out.push(line); line = ""; } }
      if (line) out.push(line);
      pages.push(out.join("\n"));
    }
    return pages.join("\n");
  }
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  if (!result.value.trim()) throw new Error("empty");
  return result.value;
}

function ImportJob() {
  const navigate = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [fileName, setFileName] = useState("");
  const handle = async (file?: File) => {
    if (!file) return;
    if (!/\.(pdf|docx?|DOCX?)$/i.test(file.name)) return toast.error("Please upload a PDF, DOC, or DOCX file.");
    setLoading(true);
    try { setText(await extractText(file)); setFileName(file.name); toast.success(`Read ${file.name}`); }
    catch { toast.error(file.name.toLowerCase().endsWith(".doc") ? "This older .DOC file couldn't be read. Save it as DOCX or PDF, or paste the text." : "We couldn't read this file. Try another file or paste the text."); }
    finally { setLoading(false); }
  };
  const create = () => { sessionStorage.setItem(IMPORT_DRAFT_KEY, JSON.stringify(parseJobText(text))); navigate({ to: "/job-builder" }); };
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-2"><PageHeader title="Paste existing job description" description="Paste the text or upload a PDF, DOC, or DOCX. We'll pre-fill what we can detect."/><Button variant="ghost" onClick={() => navigate({ to: "/job-builder" })}><ArrowLeft className="mr-2 h-4 w-4"/>Back to jobs</Button></div>
    <Card><CardContent className="space-y-5 p-6">
      <button type="button" onClick={() => input.current?.click()} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); void handle(e.dataTransfer.files[0]); }} className={cn("flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary hover:bg-primary/5", drag && "border-primary bg-primary/5")}>
        {loading ? <Loader2 className="h-8 w-8 animate-spin text-primary"/> : <FileUp className="h-8 w-8 text-primary"/>}
        <span className="font-semibold">Drop a file here or click to browse</span>
        <span className="text-sm text-muted-foreground">{fileName || "PDF, DOC or DOCX"}</span>
      </button>
      <input ref={input} type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={(e) => { void handle(e.target.files?.[0]); e.target.value = ""; }}/>
      <div className="space-y-2"><Label htmlFor="jd-text">Job description text</Label><Textarea id="jd-text" value={text} onChange={(e) => setText(e.target.value)} rows={16} placeholder={"Job Title: Executive Virtual Assistant\n\nResponsibilities:\n• Manage calendar and inbox\n• Update HubSpot CRM records"}/></div>
      <div className="flex justify-end"><Button onClick={create} disabled={!text.trim() || loading}><Sparkles className="mr-2 h-4 w-4"/>Create draft</Button></div>
    </CardContent></Card>
  </div>;
}
