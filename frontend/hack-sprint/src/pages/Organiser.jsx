import React from "react";
import DocLayout from "../components/DocLayout.jsx";

const sections = [
  {
    title: "Before you begin",
    blocks: [
      { p: "This playbook is the standard we expect every organiser on HackSprint to meet. It covers how to get verified, how to set an event up, how to run it fairly and how to close it out. Read it once before you create your first event; the checklists are meant to be revisited each time." },
      { ul: [
        "Organiser accounts are separate from student accounts. You can't be signed in as both at once: log out of one before using the other.",
        "Creating events requires a completed organiser profile and an approved verification. Platform controllers are exempt from verification.",
        "Every event is reviewed by the HackSprint team before it goes public.",
      ] },
    ],
  },
  {
    title: "Getting verified",
    blocks: [
      { p: "Verification protects participants from fake or abandoned events. You submit it once from your organiser dashboard, and the team reviews it before you can publish. If your account was verified earlier, you will be asked to submit the full details and documents once so your record is complete." },
      { ul: [
        "Organisation details: legal name, registration or ID number, registered address, official email and website.",
        "A contact person with their role and phone number.",
        "A short account of events you've run before and the events you plan to host.",
        "Supporting documents that depend on your organiser type: an institution letter and staff ID for colleges, a registration certificate and a government ID for companies and startups, an ID and address proof for individuals, and a registration or past-events proof for communities and studios.",
        "A declaration that everything you submitted is genuine. An account can be removed if any of it is false.",
      ] },
      { note: "Requests are reviewed in the order received. You'll get a notification when a decision is made, and a rejection always includes the reason so you can resubmit." },
    ],
  },
  {
    title: "Setting up an event",
    blocks: [
      { p: "Complete every item below before you submit the event for approval. Anything you leave vague becomes a dispute later." },
      { ul: [
        "Title and description: a clear theme, who it is for and what participants should deliver.",
        "Timeline: registration, each submission round, judging and results, with dates and timezones stated.",
        "Eligibility: region, student or professional status, and age limits, if any.",
        "Team rules: minimum and maximum team size, whether solo entries are allowed and whether members can change.",
        "Registration form: collect only what you need to run the event.",
        "Submission format for every round: repository link, live demo, documents or video. State exactly what is required and the accepted file types.",
        "Scoring: the criteria, their weight and the judging scale, published before registration opens.",
        "Prizes: what each place wins, how many winners there are and when prizes are paid out.",
        "Support: a contact address participants can reach during the event.",
      ] },
    ],
  },
  {
    title: "Rounds and qualification",
    blocks: [
      { p: "Multi-round events let you narrow the field. Decide how teams advance before the first round starts and publish the rule." },
      { ul: [
        "Qualification can be by top N entries or by a minimum score. Each round has its own rule and weight.",
        "Concluding a round applies the rule and notifies everyone whose status changes. Entries you set by hand are left exactly as you set them.",
        "Use manual overrides only to correct a clear error, and record the reason in your own notes.",
        "Give participants enough time between a result and the next submission window.",
      ] },
    ],
  },
  {
    title: "Judges",
    blocks: [
      { p: "Judges are invited, not assigned. A person only becomes a judge for your event after they accept." },
      { ol: [
        "Invite a judge by the email on their HackSprint organiser account.",
        "They receive a notification and decide whether to accept or decline from their dashboard.",
        "You are told their answer. A declined invitation can be sent again later.",
        "Accepted judges can review submissions and score them. They see only their own scores until results are released.",
      ] },
      { ul: [
        "Brief your judges on the rubric before scoring starts and agree what each score band means.",
        "Use at least two judges where scores are subjective, so one opinion doesn't decide the result.",
        "A judge who has a conflict of interest with a team should decline the invitation.",
      ] },
    ],
  },
  {
    title: "Scoring and results",
    blocks: [
      { ul: [
        "Final scores average the judges' scores, plus any community vote at the weight you published.",
        "If you enable community voting, disclose its weight up front. Self-voting is blocked by the platform.",
        "Preview the scoreboard before you release it. Results can't be taken back once released, and participants are notified immediately.",
        "Publish your tiebreaker before the event opens: lower cumulative time, earliest qualifying submission, a declared secondary criterion, or a panel decision that you document.",
      ] },
    ],
  },
  {
    title: "Live and on-spot events",
    blocks: [
      { ul: [
        "Bracket events run in rounds. Create the matches, set their order and times, and enter scores as they finish.",
        "A tied score needs you to choose the winner explicitly.",
        "Participants follow the live bracket and standings on the event page, so keep scores current.",
        "Brief participants on venue, safety and equipment rules in advance. Physical events carry physical risk, and that responsibility sits with the organiser on site.",
      ] },
    ],
  },
  {
    title: "Prizes",
    blocks: [
      { ul: [
        "Pay cash prizes within 30 days of confirming winners, and say so on the event page.",
        "Ask winners for any identification or payment details within a stated window, and keep that data secure.",
        "If a winner doesn't respond in that window, the prize may be forfeited under your published rules.",
        "Organisers, not HackSprint, are responsible for fulfilling the prizes they announce.",
      ] },
    ],
  },
  {
    title: "Integrity and conduct",
    blocks: [
      { ul: [
        "Combine automated checks, such as duplicate or unusual submissions, with manual review where it matters.",
        "Keep judging comments and scores. They are the record any appeal will be decided on.",
        "Treat every participant equally. Don't enter your own organisation's team without disclosing the conflict.",
        "Never ask participants for payment to enter or to receive a prize.",
      ] },
    ],
  },
  {
    title: "Disputes and moderation",
    blocks: [
      { p: "Resolve disputes at the event level first, within 7 to 14 days of the complaint. If it can't be settled, it escalates to HackSprint moderation, whose decision on platform-policy questions is final." },
      { p: "HackSprint may pause, edit or remove an event, or suspend an organiser account, for breaches of this playbook, the Terms or the Participation Policy." },
    ],
  },
  {
    title: "Running a great event",
    blocks: [
      { ul: [
        "Publish a sample submission and, for technical tasks, a public test set.",
        "Hold office hours or a live Q&A, and keep an FAQ current on the event page.",
        "Run a short calibration with your judges so standards match before real scoring.",
        "Send clear reminders before each deadline. The platform also notifies participants as deadlines approach.",
      ] },
    ],
  },
];

export default function OrganizerPlaybookPage() {
  return (
    <DocLayout
      title="Organiser Playbook"
      intro="How to get verified, set up, run and close out an event on HackSprint, written as a working standard rather than a set of suggestions."
      updated="October 2026"
      appliesTo="Everyone who hosts or judges events"
      sections={sections}
    />
  );
}
