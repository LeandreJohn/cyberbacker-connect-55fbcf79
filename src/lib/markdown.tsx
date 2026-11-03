// Minimal, safe Markdown renderer. Produces React nodes only — no
// dangerouslySetInnerHTML, so article bodies can never inject raw HTML.
import { Fragment, type ReactNode } from "react";

// Inline: **bold**, *italic*, `code`, [text](https://link)
function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|\[[^\]]+\]\((?:https?:\/\/|\/)[^)\s]*\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;
    if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      nodes.push(<code key={key} className="rounded bg-muted px-1 py-0.5 text-[0.85em]">{token.slice(1, -1)}</code>);
    } else if (token.startsWith("[")) {
      const m = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      const href = m?.[2] ?? "#";
      if (/^https?:\/\//.test(href)) {
        nodes.push(
          <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
            {m?.[1]}
          </a>,
        );
      } else {
        nodes.push(m?.[1] ?? token);
      }
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function renderMarkdown(source: string): ReactNode {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const content = inline(heading[2], `h${key}`);
      const cls = level <= 2 ? "text-lg font-bold" : "text-base font-semibold";
      blocks.push(
        level <= 2 ? <h2 key={key++} className={cls}>{content}</h2> : <h3 key={key++} className={cls}>{content}</h3>,
      );
      i++;
      continue;
    }
    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(<blockquote key={key++} className="rounded-r-md border-l-4 border-primary/40 bg-muted/40 px-4 py-2 text-sm text-muted-foreground">{inline(quote.join(" "), `q${key}`)}</blockquote>);
      continue;
    }
    if (/^\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+[.)]\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="list-decimal space-y-1.5 pl-6 text-sm">
          {items.map((item, j) => <li key={j}>{inline(item, `ol${key}-${j}`)}</li>)}
        </ol>,
      );
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="list-disc space-y-1.5 pl-6 text-sm">
          {items.map((item, j) => <li key={j}>{inline(item, `ul${key}-${j}`)}</li>)}
        </ul>,
      );
      continue;
    }
    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4})\s|^>\s?|^\d+[.)]\s|^[-*]\s/.test(lines[i])) {
      paragraph.push(lines[i]);
      i++;
    }
    blocks.push(<p key={key++} className="text-sm leading-relaxed text-foreground/90">{inline(paragraph.join(" "), `p${key}`)}</p>);
  }
  return <div className="space-y-4">{blocks.map((b, j) => <Fragment key={j}>{b}</Fragment>)}</div>;
}
