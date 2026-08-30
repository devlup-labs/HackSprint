import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PolicyLayout = ({ eyebrow, title, accent, subtitle, meta, sections }) => (
  <div className="hk-bg font-jb min-h-screen bg-[#050505] text-[#e8ffe8] relative overflow-hidden py-20 px-5">
    <div className="relative z-10 max-w-3xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-[0.65rem] tracking-[0.1em] uppercase text-[rgba(180,220,180,0.45)] hover:text-[#5fff60] transition-colors mb-10"
      >
        <ArrowLeft size={13} /> Back to Home
      </Link>

      <div className="mb-14">
        <div className="font-jb inline-block text-[0.6rem] tracking-[0.2em] uppercase text-[#5fff60] border border-[rgba(95,255,96,0.22)] px-3 py-[0.22rem] rounded-[2px] mb-4">
          {eyebrow}
        </div>
        <h1
          className="font-syne font-extrabold text-white tracking-tight leading-[1.05] mb-4"
          style={{ fontSize: "clamp(2rem,5vw,3.2rem)" }}
        >
          {title} <span className="text-[#5fff60]">{accent}</span>
        </h1>
        <p className="font-jb text-[0.75rem] text-[rgba(180,220,180,0.5)] leading-relaxed max-w-xl">
          {subtitle}
        </p>
        {meta && (
          <p className="font-jb text-[0.6rem] text-[rgba(120,160,120,0.5)] mt-4 tracking-[0.03em]">
            {meta}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-5">
        {sections.map((s, i) => {
          const Icon = s.icon;
          return (
            <section
              key={i}
              className="hm-card relative bg-[rgba(10,12,10,0.88)] border border-[rgba(95,255,96,0.1)] rounded-[4px] p-6 md:p-7"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-[3px] bg-[rgba(95,255,96,0.07)] border border-[rgba(95,255,96,0.18)] flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-[#5fff60]" />
                </div>
                <h2 className="font-syne text-[1rem] font-extrabold text-white tracking-tight">
                  {s.heading}
                </h2>
              </div>
              <div className="font-jb text-[0.72rem] text-[rgba(180,220,180,0.55)] leading-relaxed space-y-3 md:pl-12">
                {s.body}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-14 pt-8 border-t border-[rgba(95,255,96,0.08)] text-center">
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

export const PolicyList = ({ items, ordered = false }) => {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="font-jb text-[0.6rem] text-[#5fff60] mt-[3px] flex-shrink-0">
            {ordered ? `${i + 1}.` : "▸"}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </Tag>
  );
};

export default PolicyLayout;
