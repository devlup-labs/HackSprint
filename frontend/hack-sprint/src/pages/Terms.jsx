import React from "react";
import DocLayout from "../components/DocLayout.jsx";

const sections = [
  {
    title: "Acceptance and eligibility",
    blocks: [
      { p: "By creating an account or registering for an event on HackSprint you agree to these Terms, the Participation Policy and any rules published on an event's page. If you don't agree, don't use the platform." },
      { ul: [
        "You must give accurate information. We use your email and profile details for account access, results and prize contact.",
        "You must be old enough to enter a contract where you live, or have a parent or guardian's consent to use the platform.",
        "If you register a team, you confirm that every member has agreed to take part.",
      ] },
    ],
  },
  {
    title: "Accounts",
    blocks: [
      { ul: [
        "You can sign in with Google or with an email and password. You are responsible for your credentials and everything done under your account.",
        "One account per person. Making several to manipulate registration, voting or results leads to suspension.",
        "Student and organiser accounts are separate. A browser holds one of them at a time, so log out of one before using the other.",
        "Your profile must be complete before you can register for events, join teams or submit work.",
        "Usernames are unique and can't impersonate another person or organisation.",
      ] },
    ],
  },
  {
    title: "What HackSprint provides",
    blocks: [
      { p: "HackSprint provides the platform: event pages, registration, team formation, submissions, judging tools, live brackets, a community directory, notifications and results. Events are created and run by independent organisers, and every event is reviewed by HackSprint before it goes public." },
      { ul: [
        "Organisers are responsible for their event's rules, judging decisions and prizes.",
        "HackSprint is not a party to an organiser's prize commitments and isn't liable if an organiser fails to deliver one, unless we have said so in writing.",
        "Platform questions such as fair play, account problems and disputes that can't be settled by the organiser are handled by HackSprint moderation.",
      ] },
    ],
  },
  {
    title: "Organiser accounts",
    blocks: [
      { ul: [
        "Organisers must complete their profile and be verified before publishing events. Verification requires accurate organisation details and genuine supporting documents.",
        "Giving false information or documents is grounds for removing the account and its events.",
        "Judges are invited by organisers and only act once they accept.",
        "Organisers must follow the Organiser Playbook.",
      ] },
    ],
  },
  {
    title: "Events and submissions",
    blocks: [
      { ul: [
        "Submission-based events run from registration through project submission to judging and results, each on its own timeline.",
        "Submit what the event asks for, inside the window. Late or incomplete submissions may not be scored.",
        "Whether results are visible immediately or held until the organiser releases them depends on the event's settings.",
        "Multi-round events decide who advances after each round, using the rule the organiser published.",
      ] },
    ],
  },
  {
    title: "Live and on-spot events",
    blocks: [
      { ul: [
        "Some events are in-person competitions run as brackets, with no project submission. The organiser pairs teams into matches and enters scores live.",
        "A tied match needs the organiser to pick a winner. Standings and brackets are public in real time.",
        "Match times can change. Check the bracket page and your notifications.",
        "Physical events carry physical risk. Follow venue and safety rules. HackSprint isn't liable for injury or damage at a physical venue run by an organiser.",
      ] },
    ],
  },
  {
    title: "Teams",
    blocks: [
      { ul: [
        "A team leader creates a team and shares its invite code. Members request to join and the leader approves them, up to the event's team-size limit.",
        "The leader is responsible for the team's submission and is its main contact.",
        "Leaving or being removed from a team follows the team page's tools at the time.",
      ] },
    ],
  },
  {
    title: "Your content and intellectual property",
    blocks: [
      { ul: [
        "You keep ownership of what you submit. By submitting you give the organiser and HackSprint a non-exclusive licence to access, evaluate and showcase it for that event.",
        "Declare pre-existing code or third-party material you build on, unless the event allows unrestricted reuse.",
        "Don't submit anything you don't have the right to share.",
        "Scores, feedback and comments are recorded against your submission for the event's records and for any dispute review.",
      ] },
    ],
  },
  {
    title: "Community and messaging",
    blocks: [
      { ul: [
        "The Community page lists people who have chosen to appear. You can turn your listing off from your dashboard.",
        "A first message is a connection request. You are connected only if the other person replies, and a declined request can't be sent again.",
        "Don't use messaging or event discussions for spam, harassment, hate speech or unsolicited promotion. We may remove content and accounts that do.",
      ] },
    ],
  },
  {
    title: "Notifications",
    blocks: [
      { ul: [
        "We send in-app notifications and, if you allow them, browser notifications about your participation: registrations, deadlines, match times, reviews, results and similar activity.",
        "Browser notifications are optional. You can turn them off at any time from the notification bell or your browser's site settings.",
        "Account-critical emails, such as password resets and security notices, are sent regardless of your settings.",
      ] },
    ],
  },
  {
    title: "Your data",
    blocks: [
      { ul: [
        "We keep your account and event data while your account is active and for as long as an event's records need it.",
        "We share the information an organiser needs to run an event, such as your name and email, with that event's organisers and judges.",
        "You can ask us to delete your account at any time through the Contact page. Records that an event needs, such as aggregate results, may remain without identifying you.",
        "We don't sell your personal data.",
      ] },
    ],
  },
  {
    title: "Conduct and enforcement",
    blocks: [
      { p: "Plagiarism, cheating, harassment, impersonation, vote manipulation and attacks on events or the platform are prohibited. The full rules are in the Participation Policy and apply alongside these Terms." },
      { p: "Violations can lead to removal of scores, disqualification from an event, suspension or permanent removal of an account. A platform controller can remove an account that is abusive or fake, together with the registrations, messages and connections attached to it." },
    ],
  },
  {
    title: "Availability and changes",
    blocks: [
      { ul: [
        "We work to keep HackSprint available, especially during live events, but we can't promise uninterrupted access. Maintenance, heavy load and events outside our control can cause downtime.",
        "Features change as the platform grows. We'll update this page and its date when something material changes.",
      ] },
    ],
  },
  {
    title: "Liability and governing law",
    blocks: [
      { ul: [
        "HackSprint is provided as is. To the extent the law allows, we aren't liable for indirect or consequential loss arising from your use of the platform or an event run on it.",
        "Event-level disputes follow the process in the Participation Policy. Anything that escalates beyond an organiser goes to HackSprint moderation.",
        "These Terms are governed by the laws of India. Disputes fall under the courts of the place where HackSprint (DevLup Labs, IIT Jodhpur) operates.",
      ] },
    ],
  },
  {
    title: "Changes to these Terms",
    blocks: [
      { p: "We may update these Terms as the platform and the law change. If you keep using HackSprint after an update, you accept the revised Terms. Check the date at the top of this page to see when it last changed." },
    ],
  },
];

export default function TermsPage() {
  return (
    <DocLayout
      title="Terms & Conditions"
      intro="The agreement between you and HackSprint for using the platform: accounts, events, submissions, the community, notifications and how disputes are handled."
      updated="October 2026"
      appliesTo="Everyone who uses HackSprint"
      sections={sections}
    />
  );
}
