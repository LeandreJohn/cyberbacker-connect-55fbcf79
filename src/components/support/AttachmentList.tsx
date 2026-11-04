import { FileText, FileImage, FileSpreadsheet, File as FileIcon, Download } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { downloadFile } from "@/lib/api/client";
import type { Attachment } from "@/lib/types";

function iconFor(a: Attachment) {
  const type = a.content_type ?? "";
  if (type.startsWith("image/")) return FileImage;
  if (type.includes("pdf")) return FileText;
  if (type.includes("word")) return FileText;
  if (type.includes("sheet") || type.includes("excel") || type.includes("csv")) return FileSpreadsheet;
  const ext = a.file_name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return FileImage;
  if (["xls", "xlsx", "csv"].includes(ext)) return FileSpreadsheet;
  if (["pdf", "doc", "docx", "txt", "md"].includes(ext)) return FileText;
  return FileIcon;
}

function formatSize(bytes: number) {
  return bytes >= 1_048_576 ? `${(bytes / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function AttachmentChip({ attachment }: { attachment: Attachment }) {
  const Icon = iconFor(attachment);
  const open = () =>
    downloadFile(attachment.download_url, attachment.file_name).catch((e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Couldn't download the file"),
    );
  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Download ${attachment.file_name}`}
      className="group inline-flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-left text-xs transition-colors hover:border-primary/40 hover:bg-accent"
    >
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span className="max-w-[160px] truncate font-medium">{attachment.file_name}</span>
      <span className="text-muted-foreground">{formatSize(attachment.size_bytes)}</span>
      <Download className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

export function AttachmentList({
  attachments,
  className,
}: {
  attachments: Attachment[];
  className?: string;
}) {
  if (!attachments.length) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>No attachments.</p>
    );
  }
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {attachments.map((a) => (
        <AttachmentChip key={a.id} attachment={a} />
      ))}
    </div>
  );
}
