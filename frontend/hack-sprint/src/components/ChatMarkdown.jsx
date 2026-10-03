import React from "react";

// Small, dependency-free Markdown renderer for chat replies. It builds React
// elements directly (never innerHTML), so model output can't inject markup.
// Supports: paragraphs, bullet/numbered lists, headings, fenced code, and
// inline **bold**, *italic*, `code` and [links](https://…).

const SAFE_URL = /^(https?:\/\/|mailto:)/i;
const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|\*[^*\s][^*]*\*)/g;

const renderInline = (text, keyBase) =>
  text.split(INLINE).map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4)
      return <strong key={key} className="font-semibold">{renderInline(part.slice(2, -2), key)}</strong>;
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2)
      return <code key={key} className="px-1 py-0.5 rounded bg-background/60 text-[0.85em] font-mono">{part.slice(1, -1)}</code>;
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link)
      return SAFE_URL.test(link[2]) ? (
        <a key={key} href={link[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">{link[1]}</a>
      ) : (
        link[1]
      );
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2)
      return <em key={key}>{renderInline(part.slice(1, -1), key)}</em>;
    return part;
  });

const parseBlocks = (src) => {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let para = [];
  let list = null;
  let code = null;

  const flushPara = () => { if (para.length) { blocks.push({ type: "p", text: para.join(" ") }); para = []; } };
  const flushList = () => { if (list) { blocks.push(list); list = null; } };

  for (const line of lines) {
    if (code) {
      if (line.trim().startsWith("```")) { blocks.push({ type: "code", text: code.join("\n") }); code = null; }
      else code.push(line);
      continue;
    }
    if (line.trim().startsWith("```")) { flushPara(); flushList(); code = []; continue; }
    const bullet = line.match(/^\s*[*\-+]\s+(.*)$/);
    const num = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const heading = line.match(/^\s{0,3}#{1,6}\s+(.*)$/);
    if (bullet || num) {
      flushPara();
      const ordered = !!num;
      if (!list || list.ordered !== ordered) { flushList(); list = { type: "list", ordered, items: [] }; }
      list.items.push((bullet || num)[1]);
    } else if (heading) {
      flushPara(); flushList();
      blocks.push({ type: "h", text: heading[1] });
    } else if (!line.trim()) {
      flushPara(); flushList();
    } else {
      flushList();
      para.push(line.trim());
    }
  }
  // A reply still streaming may stop inside an unclosed code fence.
  if (code) blocks.push({ type: "code", text: code.join("\n") });
  flushPara(); flushList();
  return blocks;
};

const ChatMarkdown = ({ text }) => (
  <div className="flex flex-col gap-2 text-sm leading-relaxed break-words">
    {parseBlocks(text).map((b, i) => {
      if (b.type === "list") {
        const Tag = b.ordered ? "ol" : "ul";
        return (
          <Tag key={i} className={`flex flex-col gap-1 pl-5 ${b.ordered ? "list-decimal" : "list-disc"} marker:text-primary`}>
            {b.items.map((it, j) => <li key={j}>{renderInline(it, `${i}-${j}`)}</li>)}
          </Tag>
        );
      }
      if (b.type === "code")
        return <pre key={i} className="overflow-x-auto rounded-lg bg-background/60 p-2.5 text-xs font-mono"><code>{b.text}</code></pre>;
      if (b.type === "h")
        return <p key={i} className="font-semibold">{renderInline(b.text, String(i))}</p>;
      return <p key={i}>{renderInline(b.text, String(i))}</p>;
    })}
  </div>
);

export default ChatMarkdown;
