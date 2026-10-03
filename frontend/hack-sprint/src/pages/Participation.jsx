import React from "react";
import DocLayout from "../components/DocLayout.jsx";

const sections = [
  {
    title: "Your agreement",
    blocks: [
      { p: "By registering on HackSprint you agree to this policy and to any extra rules an event publishes on its own page. Where an event's rules and this policy differ, the event's rules apply to that event, provided they don't conflict with the fair play and conduct requirements below." },
      { ul: [
        "You are responsible for your account and for keeping your contact details correct. They are what organisers use to reach winners.",
        "Your profile must be complete before you can register for an event, join a team or submit.",
        "You can hold a student account or an organiser account in a browser, not both at once.",
      ] },
    ],
  },
  {
    title: "Eligibility and registration",
    blocks: [
      { ul: [
        "Follow each event's eligibility, such as region, student status or age. If none is stated, the event is open to everyone.",
        "Register before the registration window closes. Dates and times are on the event page.",
        "Use one account per person. Creating several accounts to gain an advantage leads to disqualification.",
        "When you add teammates, you confirm that each has agreed to take part.",
      ] },
    ],
  },
  {
    title: "Teams",
    blocks: [
      { ul: [
        "A team leader creates the team and shares the invite code. Members request to join and the leader approves them, up to the event's team-size limit.",
        "The leader is the main contact for the team and is responsible for its submission.",
        "You can leave a team before the team's submission is final. The leader can remove members and can delete a team that has no one else in it.",
        "You can only be in one team per event.",
      ] },
    ],
  },
  {
    title: "Submissions",
    blocks: [
      { ul: [
        "Submit exactly what the event asks for in each round, inside the submission window. Late or incomplete work may not be scored.",
        "Optional fields can be left blank. Required fields must be filled before you can submit.",
        "Build within the event window unless it explicitly allows earlier work. If you reuse code, declare it in your submission.",
        "Open-source libraries are fine unless the event forbids them. List your dependencies and their licences.",
        "You can edit a submission until the deadline. After that it is locked.",
      ] },
    ],
  },
  {
    title: "Judging and scoring",
    blocks: [
      { p: "Each event publishes its own rubric. Scores come from the judges who accepted an invitation to that event, and some events add a weighted community vote." },
      { ul: [
        "You see your score and feedback once the organiser releases results for the round or event.",
        "Judges' identities stay internal. Feedback is attached to your submission, not to a named judge.",
        "Where an event doesn't state its own tiebreaker, we use, in order: lower total time or penalty, the earlier qualifying submission, then a secondary judge criterion or a panel decision.",
      ] },
    ],
  },
  {
    title: "Rounds and qualification",
    blocks: [
      { ul: [
        "In multi-round events, a round's result decides who advances. You are notified if your status changes.",
        "If you didn't qualify you keep access to your submission and its feedback, but you can't submit to later rounds.",
        "An organiser may correct a result by hand. The corrected result is the one that counts.",
      ] },
    ],
  },
  {
    title: "Live and on-spot events",
    blocks: [
      { ul: [
        "Matches are scheduled by the organiser and the schedule can change. Check the live bracket and your notifications for the current time.",
        "Being present and ready when your match is called is your responsibility.",
        "Follow venue, safety and equipment rules at all times. Physical participation carries risk.",
      ] },
    ],
  },
  {
    title: "Prizes",
    blocks: [
      { ul: [
        "The organiser states prize types, amounts and the payout timeline on the event page.",
        "Winners must reply within the claim window and give any verification or payment details requested, or the prize may be forfeited.",
        "You are responsible for any tax due on a prize unless the event says otherwise.",
        "No genuine organiser asks you to pay to enter or to receive a prize. Report anyone who does.",
      ] },
    ],
  },
  {
    title: "Community and messages",
    blocks: [
      { ul: [
        "The Community page lets you meet other participants. A first message is a connection request; you are connected only if they reply, and a declined request can't be sent again.",
        "You can turn off your listing on the Community page from your dashboard.",
        "Be respectful. Spam, harassment, hate speech and unsolicited promotion are not allowed, in messages or in event discussions.",
      ] },
    ],
  },
  {
    title: "Fair play and enforcement",
    blocks: [
      { p: "Plagiarism, sharing answers, impersonation, automated cheating, vote manipulation and attacks on an event or on the platform are prohibited." },
      { ul: [
        "Reports are reviewed case by case.",
        "Confirmed violations can lead to score removal, disqualification from an event or suspension of your account.",
        "Severe or repeated violations can lead to a permanent ban and removal of your account and its data.",
      ] },
    ],
  },
  {
    title: "Appeals",
    blocks: [
      { ol: [
        "File an appeal with the organiser within 7 days of results being published, with evidence.",
        "Organisers and judges are expected to answer within 7 to 14 days.",
        "If it isn't resolved, it goes to HackSprint moderation for a neutral review. Our decision is final on platform-policy questions; organisers remain responsible for their own scoring and prize decisions.",
      ] },
    ],
  },
  {
    title: "Good practice",
    blocks: [
      { ul: [
        "Read the event page fully before you register, especially the rubric and submission format.",
        "Agree roles in your team early and keep a copy of what you submit.",
        "Turn on browser notifications so you don't miss a deadline.",
        "Ask the organiser early if something is unclear.",
      ] },
    ],
  },
];

export default function ParticipantPoliciesPage() {
  return (
    <DocLayout
      title="Participation Policy"
      intro="The rules for taking part in events on HackSprint: registering, forming teams, submitting, being judged, claiming prizes and behaving well alongside everyone else."
      updated="October 2026"
      appliesTo="Everyone who takes part in an event"
      sections={sections}
    />
  );
}
