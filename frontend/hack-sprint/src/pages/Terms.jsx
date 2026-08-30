import React from "react";
import LegalDocLayout from "../components/LegalDocLayout.jsx";
import { PolicyList } from "../components/PolicyLayout.jsx";

export default function TermsPage() {
  const sections = [
    {
      heading: "Acceptance & Eligibility",
      body: (
        <PolicyList
          items={[
            "Creating an account or registering for any hackathon on HackSprint means you agree to these Terms, our Privacy Policy, and any event-specific rules published on that event's page.",
            "You must provide accurate registration information — the email and profile details we hold are what we use for account access, results, and prize/logistics contact.",
            "If you're registering as part of a team, you're confirming every member you add has agreed to participate.",
          ]}
        />
      ),
    },
    {
      heading: "Your Account",
      body: (
        <PolicyList
          items={[
            "Sign-in is via Google OAuth or email/password. You're responsible for keeping your credentials secure and for all activity under your account.",
            "One account per person. Creating multiple accounts to manipulate registration, voting, or results is grounds for disqualification and suspension.",
            "Student and admin/organizer accounts are separate sessions with independent tokens — being logged in as one doesn't grant access as the other.",
          ]}
        />
      ),
    },
    {
      heading: "The Platform's Role",
      body: (
        <>
          <p>
            HackSprint provides the platform — registration, team formation, submissions,
            judging tools, live brackets, notifications, and results. Individual hackathons
            are created and run by their own organizers/admins, subject to platform-admin
            approval before going live.
          </p>
          <PolicyList
            items={[
              "Organizers are responsible for their event's rules, judging decisions, and prize fulfillment.",
              "HackSprint is not a party to an organizer's prize commitments and isn't liable for an organizer's failure to deliver one, except where we've explicitly stated otherwise.",
              "Platform-level policy questions (fair play, account issues, disputes that escalate beyond an organizer) are handled by HackSprint moderation — see the Participant Policies and Organizer Playbook pages for the detailed process.",
            ]}
          />
        </>
      ),
    },
    {
      heading: "Submission-Based Hackathons",
      body: (
        <PolicyList
          items={[
            "These run through registration → project submission → judging/results, each on its own published timeline.",
            "Submit exactly what the event asks for (repo link, live demo, documents) within the submission window — late or incomplete submissions may not be scored.",
            "An event's judging configuration decides whether results are visible immediately or held back until the organizer releases them.",
          ]}
        />
      ),
    },
    {
      heading: "On-Spot (Bracket) Events",
      body: (
        <>
          <p>
            Some hackathons on HackSprint are in-person, physical competitions — combat
            robotics, drone events, and similar formats — run as a single-elimination
            bracket instead of a project submission.
          </p>
          <PolicyList
            items={[
              "There is no project submission for these events — teams are paired into matches by the admin, and scores are entered live by admins/judges at the venue.",
              "A tied score requires the admin to explicitly pick a winner; standings and the live bracket are visible to everyone in real time and are not held back the way submission results can be.",
              "Match schedules are set and can be changed by the admin at any time — check the event's live bracket page and your notifications for the current time, since being physically present when your match is called is your responsibility.",
              "Physical participation carries physical risk. Follow venue safety rules and any equipment/safety requirements the event publishes — HackSprint is not liable for injury or property damage at a physical venue run by a third-party organizer.",
            ]}
          />
        </>
      ),
    },
    {
      heading: "Teams",
      body: (
        <PolicyList
          items={[
            "Team hackathons use a shareable invite code — the team leader creates the team, and members join with that code up to the event's stated team-size limit.",
            "The team leader is responsible for the team's submission (where applicable) and is the primary point of contact for team-related notifications.",
            "Removing yourself from or being removed from a team follows whatever team-management flow the event's dashboard provides at the time.",
          ]}
        />
      ),
    },
    {
      heading: "Submissions, Judging & Intellectual Property",
      body: (
        <PolicyList
          items={[
            "You retain ownership of the work you submit. By submitting, you grant organizers a non-exclusive license to access, evaluate, and showcase it for the purposes of that event.",
            "Declare any pre-existing code or third-party libraries you build on, unless the event explicitly allows unrestricted reuse.",
            "Judge scores, feedback, and comments are recorded against your submission for that event's records and for any dispute review.",
          ]}
        />
      ),
    },
    {
      heading: "Notifications & Communications",
      body: (
        <PolicyList
          items={[
            "By using HackSprint you agree to receive operational notifications relevant to your participation — registration confirmations, deadline reminders, match schedules, results, and similar account activity — through in-app notifications, email, and browser push (if you enable it).",
            "Browser push notifications are opt-in and can be turned off at any time from your browser's site settings or the notification bell's toggle — this never affects your in-app notification history.",
            "Account-critical email (password resets, security notices) is sent regardless of your notification preferences, since we can't deliver those any other way.",
          ]}
        />
      ),
    },
    {
      heading: "Conduct & Enforcement",
      body: (
        <p>
          Plagiarism, cheating, harassment, impersonation, and attacks on hackathon or
          platform infrastructure are all prohibited. The full baseline rules — eligibility,
          fair play, appeals, and code of conduct — are published on the{" "}
          <a href="/participation-policies" className="text-[#5fff60] hover:underline">
            Participant Policies
          </a>{" "}
          page and apply alongside these Terms. Violations can mean score removal,
          disqualification from an event, or account suspension.
        </p>
      ),
    },
    {
      heading: "Platform Availability & Changes",
      body: (
        <PolicyList
          items={[
            "We aim for the platform to be available when you need it, especially during live events, but we don't guarantee uninterrupted access — maintenance, high load, or issues outside our control can cause downtime.",
            "Features, including this Terms page's own scope, may change as the platform evolves. Material changes will be reflected here with an updated date.",
          ]}
        />
      ),
    },
    {
      heading: "Suspension & Termination",
      body: (
        <p>
          We may suspend or terminate an account for violating these Terms, the
          Participant Policies, or an event's specific rules — including cheating,
          harassment, or attempts to manipulate registration or results. You can also
          request deletion of your own account at any time by contacting us.
        </p>
      ),
    },
    {
      heading: "Liability, Disputes & Governing Law",
      body: (
        <PolicyList
          items={[
            "HackSprint is provided as-is. To the maximum extent permitted by law, we disclaim liability for indirect or consequential damages arising from your use of the platform or participation in an event run on it.",
            "Event-level disputes follow the process on the Participant Policies page; anything that escalates beyond an organizer goes to HackSprint moderation for a neutral review.",
            "These Terms are governed by the laws of India. Formal disputes are subject to the jurisdiction of the courts where HackSprint (DevLup Labs, IIT Jodhpur) operates.",
          ]}
        />
      ),
    },
    {
      heading: "Changes to These Terms",
      body: (
        <p>
          We may update these Terms as the platform changes — new event formats, new
          features, or legal requirements. Continued use of HackSprint after an update
          means you accept the revised Terms. Check back periodically if you want to stay
          current.
        </p>
      ),
    },
  ];

  return (
    <LegalDocLayout
      title="Terms &"
      accent="Conditions"
      subtitle="The agreement between you and HackSprint for using the platform — accounts, hackathon participation (both submission-based and on-spot events), submissions, notifications, and how disputes get handled."
      meta="Last updated August 2026. See also: Participant Policies and the Privacy Policy."
      sections={sections}
    />
  );
}
