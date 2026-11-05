import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Download,
  Eye,
  FileSpreadsheet,
  Pencil,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge, toneFor } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { portalQ } from "@/lib/api/queries";
import {
  createKbArticle,
  createKbCategory,
  deleteKbArticle,
  downloadKbTemplate,
  importKbArticles,
  updateKbArticle,
  updateKbCategory,
} from "@/lib/api/knowledge-base";
import type { ArticleStatus, KbArticleAdminListItem, KbCategoryAdmin } from "@/lib/types";

export const Route = createFileRoute("/_app/internal/knowledge-base")({
  head: () => ({
    meta: [
      { title: "Knowledge Base Management — Cyberbacker" },
      { name: "description", content: "Manage Knowledge Base categories, articles and Excel imports." },
    ],
  }),
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(portalQ.kbCategoriesAdmin());
    void context.queryClient.ensureQueryData(portalQ.kbArticlesAdmin({}));
  },
  component: AdminKnowledgeBase,
});

const STATUS_LABEL: Record<ArticleStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

function AdminKnowledgeBase() {
  return (
    <div className="space-y-6">
      <PageHeader title="Knowledge Base Management" description="Categories, articles and Excel imports" />
      <Tabs defaultValue="articles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
        </TabsList>
        <TabsContent value="articles"><ArticlesTab /></TabsContent>
        <TabsContent value="categories"><CategoriesTab /></TabsContent>
        <TabsContent value="import"><ImportTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// --------------------------------------------------------------- Articles

function ArticlesTab() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>("all");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const categories = useQuery(portalQ.kbCategoriesAdmin());
  const articles = useQuery(portalQ.kbArticlesAdmin({
    status: status === "all" ? undefined : (status as ArticleStatus),
    category_id: categoryId === "all" ? undefined : Number(categoryId),
    search: search.trim() || undefined,
  }));
  const [editing, setEditing] = useState<KbArticleAdminListItem | "new" | null>(null);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["kb-articles-admin"] });
    void queryClient.invalidateQueries({ queryKey: ["kb-categories-admin"] });
    void queryClient.invalidateQueries({ queryKey: ["kb-categories"] });
    void queryClient.invalidateQueries({ queryKey: ["kb-articles"] });
  };

  const remove = useMutation({
    mutationFn: (id: number) => deleteKbArticle(id),
    onSuccess: () => { refresh(); toast.success("Article deleted"); },
    onError: (e) => toast.error(errorMessage(e, "Couldn't delete the article")),
  });

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles…" className="w-48" />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {(categories.data ?? []).map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setEditing("new")}><Plus className="mr-1 h-4 w-4" /> New article</Button>
      </CardHeader>
      <CardContent className="p-0">
        {articles.isPending ? (
          <div className="space-y-3 p-6">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : (articles.data ?? []).length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No articles match. Create one to get started.</p>
        ) : (
          <ul className="divide-y divide-border">
            {(articles.data ?? []).map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 px-6 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.category_name} · {a.view_count.toLocaleString()} views · updated {new Date(a.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <StatusBadge label={STATUS_LABEL[a.status]} tone={a.status === "published" ? "success" : a.status === "draft" ? "warning" : "neutral"} />
                {a.status === "published" && (
                  <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                    <Link to="/knowledge-base/$slug" params={{ slug: a.slug }} target="_blank"><Eye className="h-4 w-4" /></Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setEditing(a)} aria-label={`Edit ${a.title}`}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive" aria-label={`Delete ${a.title}`} disabled={remove.isPending} onClick={() => remove.mutate(a.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      {editing && (
        <ArticleDialog
          article={editing === "new" ? null : editing}
          categories={categories.data ?? []}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </Card>
  );
}

function ArticleDialog({ article, categories, onClose, onSaved }: {
  article: KbArticleAdminListItem | null;
  categories: KbCategoryAdmin[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [categoryId, setCategoryId] = useState(String(article?.category_id ?? categories[0]?.id ?? ""));
  const [title, setTitle] = useState(article?.title ?? "");
  const [summary, setSummary] = useState(article?.summary ?? "");
  const [body, setBody] = useState("");
  // Editing starts from the stored body: fetch the admin detail so a save
  // never overwrites existing content with an empty field.
  const detail = useQuery({ ...portalQ.kbArticleAdmin(article?.id ?? 0), enabled: Boolean(article) });
  useEffect(() => {
    if (article && detail.data) setBody((current) => (current ? current : detail.data.body));
  }, [article, detail.data]);
  const [status, setStatus] = useState<ArticleStatus>(article?.status ?? "draft");
  const save = useMutation({
    mutationFn: () => {
      const payload = { category_id: Number(categoryId), title: title.trim(), summary: summary.trim() || undefined, body: body.trim(), status, read_time_minutes: article?.read_time_minutes };
      return article ? updateKbArticle(article.id, payload) : createKbArticle(payload);
    },
    onSuccess: (saved) => {
      // PUT returns the full detail; keep the dialog open with the body filled in
      // when creating, then close.
      setBody(saved.body);
      toast.success(article ? "Article updated" : "Article created");
      onSaved();
    },
    onError: (e) => toast.error(errorMessage(e, "Couldn't save the article")),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{article ? "Edit article" : "New article"}</DialogTitle>
          <DialogDescription>Body supports plain text and simple Markdown (headings, lists, bold, links).</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ArticleStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kb-title">Title</Label>
            <Input id="kb-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kb-summary">Summary</Label>
            <Input id="kb-summary" value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kb-body">Body</Label>
            <Textarea id="kb-body" rows={12} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending || !title.trim() || !body.trim() || !categoryId}>
            {save.isPending ? "Saving…" : "Save article"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ------------------------------------------------------------- Categories

function CategoriesTab() {
  const queryClient = useQueryClient();
  const categories = useQuery(portalQ.kbCategoriesAdmin());
  const [editing, setEditing] = useState<KbCategoryAdmin | "new" | null>(null);
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["kb-categories-admin"] });
    void queryClient.invalidateQueries({ queryKey: ["kb-categories"] });
  };
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Order controls the position on the client Knowledge Base page.</CardDescription>
        </div>
        <Button onClick={() => setEditing("new")}><Plus className="mr-1 h-4 w-4" /> New category</Button>
      </CardHeader>
      <CardContent className="p-0">
        {categories.isPending ? (
          <div className="space-y-3 p-6">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : (
          <ul className="divide-y divide-border">
            {(categories.data ?? []).map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 px-6 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">/{c.slug} · {c.article_count} published · {c.total_articles} total · order {c.sort_order}</p>
                </div>
                <Switch checked={c.is_active} onCheckedChange={(on) => updateKbCategory(c.id, { is_active: on }).then(refresh).catch((e) => toast.error(errorMessage(e, "Couldn't update the category")))} />
                <Button variant="ghost" size="sm" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}><Pencil className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      {editing && (
        <CategoryDialog
          category={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </Card>
  );
}

function CategoryDialog({ category, onClose, onSaved }: {
  category: KbCategoryAdmin | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "");
  const save = useMutation({
    mutationFn: () => {
      const payload = { name: name.trim(), description: description.trim() || undefined, icon: icon || undefined };
      return category ? updateKbCategory(category.id, payload) : createKbCategory(payload);
    },
    onSuccess: () => { toast.success(category ? "Category updated" : "Category created"); onSaved(); },
    onError: (e) => toast.error(errorMessage(e, "Couldn't save the category")),
  });
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>Icon keys: rocket, users, credit-card, zap.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="kb-cat-name">Name</Label><Input id="kb-cat-name" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="kb-cat-desc">Description</Label><Input id="kb-cat-desc" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="kb-cat-icon">Icon</Label><Input id="kb-cat-icon" placeholder="rocket" value={icon} onChange={(e) => setIcon(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending || !name.trim()}>{save.isPending ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------- Import

const actionTone: Record<string, "success" | "primary" | "warning" | "danger"> = {
  created: "success",
  updated: "primary",
  skipped: "warning",
  error: "danger",
};

function ImportTab() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [report, setReport] = useState<Awaited<ReturnType<typeof importKbArticles>> | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const run = useMutation({
    mutationFn: () => importKbArticles(file!, { updateExisting, dryRun }),
    onSuccess: (r) => {
      setReport(r);
      if (r.committed) {
        void queryClient.invalidateQueries({ queryKey: ["kb-articles-admin"] });
        void queryClient.invalidateQueries({ queryKey: ["kb-categories-admin"] });
        void queryClient.invalidateQueries({ queryKey: ["kb-articles"] });
        void queryClient.invalidateQueries({ queryKey: ["kb-categories"] });
        toast.success(r.dry_run ? "Validation finished" : "Import finished");
      } else {
        toast.error("Nothing was saved — fix the highlighted rows and try again.");
      }
    },
    onError: (e) => toast.error(errorMessage(e, "Import failed")),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import articles from Excel</CardTitle>
        <CardDescription>Upload an .xlsx file (max 5 MB) with columns title, summary, body, category, status. One article per row.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => downloadKbTemplate().catch((e) => toast.error(errorMessage(e, "Not available in demo")))}>
            <Download className="mr-1.5 h-4 w-4" /> Download template
          </Button>
        </div>
        <div
          role="button"
          tabIndex={0}
          onClick={() => input.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && input.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-10 text-center transition-colors hover:border-primary/40 hover:bg-accent"
        >
          <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm font-medium">{file ? file.name : "Drop an .xlsx file here or click to browse"}</span>
          <span className="text-xs text-muted-foreground">Max 5 MB</span>
          <input
            ref={input}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => { setFile(e.target.files?.[0] ?? null); e.target.value = ""; }}
          />
        </div>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <Switch id="kb-update" checked={updateExisting} onCheckedChange={setUpdateExisting} />
            <Label htmlFor="kb-update">Update existing articles</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="kb-dry" checked={dryRun} onCheckedChange={setDryRun} />
            <Label htmlFor="kb-dry">Validate only (dry run)</Label>
          </div>
        </div>
        <Button disabled={!file || run.isPending} onClick={() => run.mutate()}>
          <UploadCloud className="mr-1.5 h-4 w-4" /> {run.isPending ? "Importing…" : "Import"}
        </Button>

        {report && (
          <div className="space-y-3 rounded-lg border p-4">
            {report.dry_run && <Badge variant="outline">Dry run — nothing was saved</Badge>}
            {!report.committed && !report.dry_run && (
              <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm font-medium text-destructive">
                Nothing was saved — the file had errors.
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-sm">
              <span>Created: <strong>{report.created}</strong></span>
              <span>Updated: <strong>{report.updated}</strong></span>
              <span>Skipped: <strong>{report.skipped}</strong></span>
              <span className={report.errors ? "text-destructive" : undefined}>Errors: <strong>{report.errors}</strong></span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3">Row</th>
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Action</th>
                  <th className="py-2">Message</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((r) => (
                  <tr key={r.row} className={r.action === "error" ? "border-b text-destructive" : "border-b"}>
                    <td className="py-2 pr-3">{r.row}</td>
                    <td className="max-w-[240px] truncate py-2 pr-3">{r.title ?? "—"}</td>
                    <td className="py-2 pr-3"><StatusBadge label={r.action} tone={actionTone[r.action] ?? "neutral"} dot={false} /></td>
                    <td className="py-2 text-xs text-muted-foreground">{r.message ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
