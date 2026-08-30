import React from "react";
import {
  FileText,
  UserCheck,
  UploadCloud,
  BarChart3,
  Trophy,
  ShieldAlert,
  Gavel,
  Users,
  Lightbulb,
} from "lucide-react";
import PolicyLayout, { PolicyList } from "../components/PolicyLayout.jsx";

export default function ParticipantPoliciesPage() {
  const sections = [
    {
      icon: FileText,
      heading: "User Agreement",
      body: (
        <p>
          Registering on HackSprint means agreeing to follow platform rules
          and any event-specific guidelines on top of this policy. You're
          responsible for your account's security and for keeping your
          contact details accurate — that's what we use for winner
          notifications and prize fulfillment.
        </p>
      ),
    },
    {
      icon: UserCheck,
      heading: "Eligibility & Registration",
      body: (
        <PolicyList
          items={[
            "Follow the event's stated eligibility (age, region, student status). If none is specified, the event is open globally.",
            "Register before the deadline. Team registrations must list every member and confirm each person's consent.",
            "One account per person — creating multiple accounts to manipulate results leads to disqualification.",
          ]}
        />
      ),
    },
    {
      icon: UploadCloud,
      heading: "Submissions",
      body: (
        <PolicyList
          items={[
            "Follow the event's submission instructions exactly (repo link, live demo, documents) — check the required fields before submitting.",
            "Unless an event explicitly allows pre-existing work, build within the contest window. If you do reuse prior code, declare it in your submission.",
            "Public and open-source libraries are fine unless an event disallows them — list your dependencies and their licenses.",
          ]}
        />
      ),
    },
    {
      icon: BarChart3,
      heading: "Scoring & Tiebreakers",
      body: (
        <>
          <p>
            Each event publishes its own scoring rubric — typically a mix of
            correctness, design, creativity, and judge scoring. Where an
            event doesn't specify its own tiebreak rule, we fall back to:
          </p>
          <PolicyList
            ordered
            items={[
              "Lower total time / penalty, for timed formats.",
              "Earliest submission that reached the final score.",
              "A pre-declared secondary judge metric, or a panel decision.",
            ]}
          />
        </>
      ),
    },
    {
      icon: Trophy,
      heading: "Prizes & Rewards",
      body: (
        <PolicyList
          items={[
            "Organizers declare prize types, quantities, and payout timelines directly on the event page.",
            "Winners must respond within the stated claim window and provide any verification or payment details requested — missing that window can forfeit the prize.",
            "Winners are responsible for any local tax obligations on prizes unless the event states otherwise.",
          ]}
        />
      ),
    },
    {
      icon: ShieldAlert,
      heading: "Fair Play & Enforcement",
      body: (
        <p>
          Plagiarism, sharing answers, impersonation, automated cheating, and
          attacks on hackathon or platform infrastructure are all prohibited.
          Reports are reviewed case by case; confirmed violations can mean
          score removal, disqualification, or account suspension, and severe
          or repeated violations may be permanently banned.
        </p>
      ),
    },
    {
      icon: Gavel,
      heading: "Appeals & Disputes",
      body: (
        <PolicyList
          items={[
            "File an appeal within 7 days of results being published, with supporting evidence.",
            "Organizers and judges are expected to respond within 7–14 days.",
            "If it's still unresolved, it escalates to HackSprint moderation for a neutral review — our decision is final on platform-policy questions, while organizers remain responsible for prize fulfillment.",
          ]}
        />
      ),
    },
    {
      icon: Users,
      heading: "Code of Conduct",
      body: (
        <p>
          Treat everyone with respect, on the platform and in person.
          Harassment, hate speech, doxxing, and threats are never tolerated —
          keep it professional in discussions, chats, and presentations.
          Violations can lead to warnings, removal from an event, or a ban.
        </p>
      ),
    },
    {
      icon: Lightbulb,
      heading: "Quick Tips for Participants",
      body: (
        <PolicyList
          items={[
            "Read an event's specific rules before you start building — this policy covers the platform-wide baseline, not every event's fine print.",
            "Keep your repo clean with a README, license, and a working deployment link.",
            "Check your notifications regularly — deadline reminders and judge feedback both come through the platform.",
          ]}
        />
      ),
    },
  ];

  return (
    <PolicyLayout
      eyebrow="Platform Policy"
      title="Participant"
      accent="Policies"
      subtitle="The baseline rules every participant agrees to on HackSprint — eligibility, submissions, scoring, prizes, and how disputes get resolved. Individual events may add their own rules on top of this."
      meta="Applies platform-wide, alongside any event-specific rules published on that event's page."
      sections={sections}
    />
  );
}
