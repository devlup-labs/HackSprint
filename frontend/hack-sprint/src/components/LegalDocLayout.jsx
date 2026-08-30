import React from "react";

// Plain document-style layout for Terms & Conditions / Privacy Policy — no
// back link, no eyebrow badge, no per-section card/icon treatment. Reads
// top to bottom like an actual legal document rather than a feature-page
// grid of cards. PolicyLayout (with the cards) stays as-is for Participant
// Policies / Organizer Playbook, which weren't asked to change.
const LegalDocLayout = ({ title, accent, subtitle, meta, sections }) => (
  <div className="hk-bg font-jb min-h-screen bg-[#050505] text-[#e8ffe8] relative overflow-hidden py-20 px-5">
    <div className="relative z-10 max-w-3xl mx-auto">
      <h1
        className="font-syne font-extrabold text-white tracking-tight leading-[1.05] mb-4"
        style={{ fontSize: "clamp(2rem,5vw,3.2rem)" }}
      >
        {title} <span className="text-[#5fff60]">{accent}</span>
      </h1>
      <p className="font-jb text-[0.78rem] text-[rgba(180,220,180,0.55)] leading-relaxed max-w-xl mb-2">
        {subtitle}
      </p>
      {meta && (
        <p className="font-jb text-[0.6rem] text-[rgba(120,160,120,0.5)] mb-14 tracking-[0.03em]">
          {meta}
        </p>
      )}

      <div className="flex flex-col gap-10">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="font-syne text-[1.05rem] font-extrabold text-white tracking-tight mb-3 pb-2 border-b border-[rgba(95,255,96,0.1)]">
              <span className="text-[#5fff60]">{i + 1}.</span> {s.heading}
            </h2>
            <div className="font-jb text-[0.75rem] text-[rgba(180,220,180,0.65)] leading-relaxed space-y-3">
              {s.body}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-[rgba(95,255,96,0.08)] text-center">
        <p className="font-jb text-[0.62rem] text-[rgba(120,160,120,0.45)] tracking-[0.03em]">
          Questions? Reach us at{" "}
          <a
            href="mailto:devluplabs@iitj.ac.in"
            className="text-[#5fff60] hover:underline"
          >
            devluplabs@iitj.ac.in
          </a>
        </p>
      </div>
    </div>
  </div>
);

export default LegalDocLayout;
