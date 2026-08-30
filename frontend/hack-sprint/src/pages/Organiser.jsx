import React from "react";
import {
  ClipboardList,
  Target,
  Scale,
  Wallet,
  ShieldAlert,
  Gavel,
  Sparkles,
} from "lucide-react";
import PolicyLayout, { PolicyList } from "../components/PolicyLayout.jsx";

export default function OrganizerPlaybookPage() {
  const sections = [
    {
      icon: ClipboardList,
      heading: "Event Setup Checklist",
      body: (
        <PolicyList
          items={[
            "Title & description — a clear theme, target audience, and expected deliverables.",
            "Timeline — registration, submission, judging, and results dates, with timezones spelled out.",
            "Eligibility — geographic, student/professional, or age constraints, if any.",
            "Team rules — team size limits, whether substitutions are allowed, and whether solo entries are permitted.",
            "Submission format — repo links, live demo, documents — state exactly what's required.",
            "Scoring rubric — the exact formula and weighting per criterion (functionality, design, originality, documentation), published up front.",
            "Prizes — types, values, number of winners, and payout timeline.",
            "Tiebreakers & penalties — decide and publish these before the event starts, not after.",
            "Contact & support — a clear channel for participants to reach you during the event.",
          ]}
        />
      ),
    },
    {
      icon: Target,
      heading: "Recommended Scoring Model",
      body: (
        <>
          <p>
            For coding-format events, combine automatic verification
            (correctness) with secondary metrics like time or memory, and be
            explicit about which test cases are public versus hidden.
          </p>
          <p>
            For project-style hackathons, score idea, execution, demo
            quality, and impact separately, and use 2–3 judges so subjective
            scores get averaged rather than resting on one opinion.
          </p>
          <p>
            If you add an audience vote, disclose its weight up front and
            take steps to prevent duplicate voting.
          </p>
        </>
      ),
    },
    {
      icon: Scale,
      heading: "Tiebreaker Examples",
      body: (
        <>
          <PolicyList
            ordered
            items={[
              "Time-based — lower cumulative time penalty wins (ICPC-style).",
              "Earliest correct — the earlier timestamp on the final accepted submission wins.",
              "Judge secondary metric — a pre-declared metric (e.g. execution quality) breaks the tie.",
              "Panel review — if still tied, the organizing panel decides and documents its reasoning.",
            ]}
          />
          <p>
            Whichever you choose, publish it on the event page before the
            contest opens — not after judging starts.
          </p>
        </>
      ),
    },
    {
      icon: Wallet,
      heading: "Prize Disbursement & Verification",
      body: (
        <PolicyList
          items={[
            "Aim to disburse cash prizes within 30 days of winner confirmation, and state that timeline on the event page.",
            "Ask winners for identification or payment details within a stated window, and handle that data securely.",
            "If a winner doesn't respond within the window, the prize may be forfeited per your published rules.",
          ]}
        />
      ),
    },
    {
      icon: ShieldAlert,
      heading: "Anti-Cheat & Integrity",
      body: (
        <p>
          Combine automated checks (plagiarism detection, unusual submission
          patterns) with manual review where it matters. Log submission
          metadata — timestamps, IPs — for audits, and disclose that logging
          in your event's privacy notice. Keep the appeals process
          evidence-based, not a judgment call made from memory.
        </p>
      ),
    },
    {
      icon: Gavel,
      heading: "Disputes & Moderation",
      body: (
        <p>
          Aim to resolve organizer-level disputes within 7–14 days.
          HackSprint moderation is available for anything that escalates
          beyond your event — so keep judging comments and scores archived,
          since that record is what any review will be based on.
        </p>
      ),
    },
    {
      icon: Sparkles,
      heading: "Running a Premium Event",
      body: (
        <PolicyList
          items={[
            "Publish a sample submission and, for coding tasks, a public test set.",
            "Hold office hours or a live Q&A, and keep an FAQ updated.",
            "Share sample rubrics and scoring examples so participants know what 'good' looks like.",
            "Run a judge calibration pass before scoring starts, so standards are consistent across judges.",
            "Communicate timelines, support channels, and your data-retention policy clearly and early.",
          ]}
        />
      ),
    },
  ];

  return (
    <PolicyLayout
      eyebrow="For Organizers"
      title="Organizer"
      accent="Playbook"
      subtitle="A practical checklist for running a hackathon on HackSprint — setup, scoring, prize disbursement, and how to handle disputes without it becoming a mess."
      meta="Contact for organizers: devluplabs@iitj.ac.in — or use the organizer dashboard's support link."
      sections={sections}
    />
  );
}
