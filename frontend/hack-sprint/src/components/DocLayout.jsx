import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../pages/Styles/AllHackathons.css";

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const Block = ({ b }) => {
  if (b.p) return <p>{b.p}</p>;
  if (b.ul) return <ul>{b.ul.map((t, i) => <li key={i}>{t}</li>)}</ul>;
  if (b.ol) return <ol>{b.ol.map((t, i) => <li key={i}>{t}</li>)}</ol>;
  if (b.note) return <p className="doc-note">{b.note}</p>;
  return null;
};

// A plain, professional document: title block, a contents rail that follows
// the reader, numbered sections of running text and lists — no cards or boxes.
const DocLayout = ({ title, intro, updated, appliesTo, sections }) => {
  const [active, setActive] = useState(slug(sections[0].title));

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(slug(s.title))).filter(Boolean);
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [sections]);

  return (
    <div className="hk-bg bg-[var(--hk-bg)] text-[var(--hk-text)] relative">
      <style>{`
        .doc-body { font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif; }
        .doc-body p { margin: 0 0 0.95rem; line-height: 1.75; font-size: 0.95rem; color: rgba(var(--hk-text-rgb), 0.9); }
        .dark .doc-body p, .dark .doc-body li { color: rgba(var(--hk-text-rgb), 0.78); }
        .doc-body ul, .doc-body ol { margin: 0 0 1.1rem; padding-left: 1.35rem; }
        .doc-body ul { list-style: disc; }
        .doc-body ol { list-style: decimal; }
        .doc-body li { line-height: 1.7; font-size: 0.95rem; margin-bottom: 0.5rem; padding-left: 0.2rem; color: rgba(var(--hk-text-rgb), 0.9); }
        .doc-body li::marker { color: var(--hk-accent-solid); font-weight: 700; }
        .doc-body a { color: var(--hk-accent-solid); text-decoration: underline; text-underline-offset: 3px; }
        .doc-note { padding-left: 1rem; border-left: 3px solid var(--hk-accent-solid); }
        .doc-toc a { display: block; padding: 0.4rem 0 0.4rem 0.9rem; border-left: 2px solid rgba(var(--hk-card-border-rgb), 0.18); font-size: 0.8rem; line-height: 1.35; color: rgba(var(--hk-text-rgb), 0.75); text-decoration: none; transition: color .15s, border-color .15s; }
        .doc-toc a:hover { color: var(--hk-text); }
        .doc-toc a.on { color: var(--hk-accent-solid); border-left-color: var(--hk-accent-solid); font-weight: 600; }
        html { scroll-behavior: smooth; }
        .doc-sec { scroll-margin-top: 90px; }
      `}</style>

      <div className="relative z-10 max-w-6xl mx-auto px-5 pt-16 pb-24">
        <header className="max-w-3xl mb-14 pb-10 border-b border-[rgba(var(--hk-card-border-rgb),0.16)]">
          <h1 className="dark:text-[var(--hk-accent-solid)] font-display font-extrabold tracking-tight leading-[1.05] mb-5" style={{ fontSize: "clamp(2.1rem,5vw,3.3rem)" }}>
            {title}
          </h1>
          <p className="doc-body text-[1.05rem] leading-relaxed text-[rgba(var(--hk-text-rgb),0.75)] dark:text-[rgba(var(--hk-text-rgb),0.6)] max-w-2xl">{intro}</p>
          <dl className="doc-body mt-6 flex flex-wrap gap-x-10 gap-y-2 text-sm">
            <div><dt className="text-[rgba(var(--hk-text-rgb),0.55)] text-xs uppercase tracking-wider">Last updated</dt><dd className="font-semibold">{updated}</dd></div>
            <div><dt className="text-[rgba(var(--hk-text-rgb),0.55)] text-xs uppercase tracking-wider">Applies to</dt><dd className="font-semibold">{appliesTo}</dd></div>
          </dl>
        </header>

        <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-12">
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-24 doc-toc">
              <div className="text-[0.68rem] font-bold tracking-[0.16em] uppercase text-[rgba(var(--hk-text-rgb),0.55)] mb-3">On this page</div>
              {sections.map((s, i) => (
                <a key={s.title} href={`#${slug(s.title)}`} className={active === slug(s.title) ? "on" : ""}>
                  {i + 1}. {s.title}
                </a>
              ))}
            </div>
          </nav>

          <article className="doc-body max-w-3xl">
            {sections.map((s, i) => (
              <section key={s.title} id={slug(s.title)} className="doc-sec mb-12">
                <h2 className="font-display font-extrabold text-[1.35rem] tracking-tight mb-4">
                  <span className="text-[var(--hk-accent-solid)] mr-2">{i + 1}.</span>
                  {s.title}
                </h2>
                {s.blocks.map((b, k) => <Block key={k} b={b} />)}
              </section>
            ))}

            <div className="pt-8 border-t border-[rgba(var(--hk-card-border-rgb),0.16)]">
              <p className="!mb-0 text-sm">
                Questions about this document? <Link to="/contact">Contact us</Link> and we'll get back to you.
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default DocLayout;
