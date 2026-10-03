import React, { useEffect, useRef, useState } from "react";
import { TriangleAlert, HelpCircle } from "lucide-react";
import { registerDialogHost } from "../utils/dialogs.js";
import "../pages/Styles/AllHackathons.css";

const DialogHost = () => {
  const [dlg, setDlg] = useState(null);
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  useEffect(() => registerDialogHost((d) => { setText(d.initial || ""); setDlg(d); }), []);

  const close = (value) => {
    dlg?.resolve(value);
    setDlg(null);
  };
  const dismissValue = dlg?.kind === "confirm" ? false : null;

  useEffect(() => {
    if (!dlg) return;
    const onKey = (e) => { if (e.key === "Escape") close(dismissValue); };
    window.addEventListener("keydown", onKey);
    if (dlg.kind === "text") setTimeout(() => inputRef.current?.select(), 30);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!dlg) return null;
  const danger = dlg.kind === "confirm" && dlg.danger;
  const Icon = danger ? TriangleAlert : HelpCircle;

  const primary = "inline-flex items-center justify-center text-sm font-semibold px-4 py-2 rounded-md cursor-pointer hover:brightness-110 transition";
  const ghost = "inline-flex items-center justify-center text-sm font-medium px-4 py-2 rounded-md border border-border text-foreground hover:bg-secondary cursor-pointer transition-colors";

  return (
    <div
      className="fixed inset-0 z-[100001] bg-black/45 backdrop-blur-sm flex items-center justify-center px-4"
      onMouseDown={(e) => e.target === e.currentTarget && close(dismissValue)}
    >
      <div role="dialog" aria-modal="true" aria-label={dlg.title} className="w-full max-w-[420px] bg-card text-card-foreground border border-border rounded-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className={`h-[3px] ${danger ? "bg-destructive" : "bg-primary"}`} />
        <div className="px-6 pt-5 pb-4 flex gap-3.5">
          <div className={`mt-0.5 flex-shrink-0 ${danger ? "text-destructive" : "text-primary"}`}><Icon size={20} /></div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display font-extrabold text-base leading-tight tracking-tight">{dlg.title}</h2>
            {dlg.message && <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed whitespace-pre-line">{dlg.message}</p>}
            {dlg.kind === "text" && (
              <div className="mt-3">
                {dlg.label && <label className="block text-xs font-medium text-muted-foreground mb-1.5">{dlg.label}</label>}
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && close(text.trim())}
                  placeholder={dlg.placeholder}
                  className="w-full h-10 bg-background border border-border rounded-md px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2 px-6 py-3.5 border-t border-border bg-secondary/40">
          {dlg.kind === "confirm" && (
            <>
              <button className={ghost} onClick={() => close(false)}>{dlg.cancelLabel}</button>
              <button autoFocus className={`${primary} ${danger ? "bg-destructive text-white" : "bg-primary text-primary-foreground"}`} onClick={() => close(true)}>{dlg.confirmLabel}</button>
            </>
          )}
          {dlg.kind === "choose" && (
            <>
              <button className={ghost} onClick={() => close(null)}>Cancel</button>
              {dlg.options.map((o) => (
                <button key={o.value} className={`${primary} bg-primary text-primary-foreground`} onClick={() => close(o.value)}>{o.label}</button>
              ))}
            </>
          )}
          {dlg.kind === "text" && (
            <>
              <button className={ghost} onClick={() => close(null)}>Cancel</button>
              <button className={`${primary} bg-primary text-primary-foreground`} onClick={() => close(text.trim())}>{dlg.confirmLabel}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DialogHost;
