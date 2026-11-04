import { useRef, useState } from "react";
import { Send, Paperclip, Lock, Loader2 } from "lucide-react";

import { cn, firstName } from "@/lib/utils";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AttachmentList } from "./AttachmentList";
import type { TicketMessage } from "@/lib/types";

const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "CB";

export function ConversationThread({
  messages,
  allowInternalNote = false,
  sending = false,
  onSend,
  className,
}: {
  messages: TicketMessage[];
  allowInternalNote?: boolean;
  sending?: boolean;
  onSend: (body: string, files: File[], isInternal: boolean) => void;
  className?: string;
}) {
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const send = () => {
    if (!reply.trim()) return;
    onSend(reply.trim(), files, internal);
    setReply("");
    setInternal(false);
    setFiles([]);
  };

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.map((m) => {
          const isAgent = m.sender_role === "admin";
          return (
            <div
              key={m.id}
              className={cn("flex gap-3", isAgent ? "flex-row-reverse" : "flex-row")}
            >
              <InitialsAvatar
                initials={initialsOf(m.sender_name)}
                size="sm"
                className={isAgent ? "bg-success/15 text-success" : undefined}
              />
              <div className={cn("max-w-[80%] space-y-1", isAgent && "items-end text-right")}>
                <div
                  className={cn(
                    "flex items-center gap-2 text-xs",
                    isAgent ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <span className="font-semibold text-foreground">{firstName(m.sender_name)}</span>
                  <span className="text-muted-foreground">
                    {new Date(m.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </span>
                  {m.is_internal && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                      <Lock className="h-2.5 w-2.5" /> Internal
                    </span>
                  )}
                </div>
                <div
                  className={cn(
                    "whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-left text-sm leading-relaxed",
                    m.is_internal
                      ? "bg-warning/10 text-foreground"
                      : isAgent
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground",
                  )}
                >
                  {m.body}
                </div>
                {m.attachments.length > 0 && (
                  <AttachmentList
                    attachments={m.attachments}
                    className={isAgent ? "justify-end" : undefined}
                  />
                )}
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No messages yet.</p>
        )}
      </div>

      <div className="mt-4 space-y-2 border-t border-border pt-3">
        <Textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={3}
          placeholder={internal ? "Add an internal note (not visible to client)…" : "Write a reply…"}
          className={cn(internal && "border-warning/40 bg-warning/5")}
        />
        {files.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {files.length} file{files.length > 1 ? "s" : ""} attached: {files.map((f) => f.name).join(", ")}
          </p>
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <input
              ref={fileInput}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])]);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInput.current?.click()}
            >
              <Paperclip className="h-4 w-4" /> Attach
            </Button>
            {allowInternalNote && (
              <Button
                type="button"
                variant={internal ? "default" : "outline"}
                size="sm"
                onClick={() => setInternal((v) => !v)}
              >
                <Lock className="h-4 w-4" /> Internal note
              </Button>
            )}
          </div>
          <Button type="button" size="sm" disabled={sending || !reply.trim()} onClick={send}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {internal ? "Add note" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
