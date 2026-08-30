import React from "react";
import LegalDocLayout from "../components/LegalDocLayout.jsx";
import { PolicyList } from "../components/PolicyLayout.jsx";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      heading: "Overview",
      body: (
        <p>
          This explains what HackSprint collects, why, and what control you have over it.
          It applies to every part of the platform — student accounts, admin/organizer
          accounts, hackathon registration, submissions, on-spot events, and notifications.
        </p>
      ),
    },
    {
      heading: "Information We Collect",
      body: (
        <PolicyList
          items={[
            "Account information — name, email, and profile photo from Google OAuth, or the email/password you register with directly.",
            "Hackathon activity — the events you register for, team memberships, project submissions (repo links, files, documents), and, for on-spot events, your team's match participation and scores.",
            "Notification data — a browser push subscription (a device endpoint, not readable content) if you enable browser notifications; nothing here identifies you beyond linking back to your account.",
            "Usage data — pages visited and general traffic patterns via Google Analytics, used in aggregate, not tied to your hackathon activity.",
            "Technical data — IP address and basic request metadata, logged for security and abuse investigation.",
          ]}
        />
      ),
    },
    {
      heading: "How We Use Your Information",
      body: (
        <PolicyList
          items={[
            "To run the platform — authenticate you, register you for events, form and manage teams, accept submissions, and score matches.",
            "To notify you — registration confirmations, deadline reminders, match schedules, results, and account-security notices.",
            "To keep things fair and secure — investigating cheating, abuse, or suspicious account activity.",
            "To improve HackSprint — aggregate usage patterns help us prioritize what to build next; this never involves reading your submission content for anything other than judging.",
          ]}
        />
      ),
    },
    {
      heading: "Cookies & Local Storage",
      body: (
        <PolicyList
          items={[
            "A single httpOnly refresh-token cookie keeps you signed in without exposing the token to page scripts.",
            "Your short-lived access token is kept in your browser's local storage — clearing it, or logging out, ends that session.",
            "Google Analytics sets its own cookies to distinguish visitors; you can opt out platform-wide using a browser extension like Google's Analytics Opt-out Add-on, or block third-party cookies in your browser.",
          ]}
        />
      ),
    },
    {
      heading: "Browser Push Notifications",
      body: (
        <PolicyList
          items={[
            "If you allow it, your browser gives us a push subscription (an endpoint URL plus encryption keys) that lets us deliver a notification even when HackSprint isn't open — we never see the content of other sites' notifications, and this subscription can't be used to identify you outside your HackSprint account.",
            "You can revoke this at any time from your browser's notification settings for the site, or by turning it off in the notification bell — either way, we stop sending to that device immediately and the stored subscription is deleted the next time it's found to be expired or revoked.",
          ]}
        />
      ),
    },
    {
      heading: "Third-Party Services We Use",
      body: (
        <PolicyList
          items={[
            "Google OAuth — for sign-in, if you choose that option.",
            "Google Analytics — aggregate site-usage statistics.",
            "Google Gemini API — powers the FAQ chatbot; your chat messages and the visible conversation are sent to Gemini to generate a reply, but the chatbot has no access to your account, registrations, or submissions, and nothing from that conversation is stored on our servers between sessions.",
            "Brevo — sends transactional email (verification, password reset, deadline reminders) on our behalf; it only receives what's needed to send that specific email.",
            "Amazon Web Services (S3) — stores uploaded files and submission attachments; access is controlled by server-side IAM roles, not credentials embedded in the app.",
          ]}
        />
      ),
    },
    {
      heading: "How We Share Information",
      body: (
        <PolicyList
          items={[
            "With an event's organizers/admins — limited to what they need to run that event (your registration, team, submission, and match data for their hackathon).",
            "We do not sell your personal information, ever.",
            "We may disclose information if required by law, or to investigate a genuine security incident or violation of these policies.",
          ]}
        />
      ),
    },
    {
      heading: "Data Retention",
      body: (
        <p>
          We keep your account and hackathon data while your account is active. If you
          delete your account, we remove personally identifying data within a reasonable
          period, except where an event's results or aggregate records need to persist for
          organizer record-keeping — those are retained without personally identifying
          detail wherever practical.
        </p>
      ),
    },
    {
      heading: "Data Security",
      body: (
        <PolicyList
          items={[
            "Passwords are never stored in plain text. Sessions use short-lived JWT access tokens paired with a refresh-token flow, kept separate for student and admin accounts.",
            "File storage uses IAM-role-based access to AWS rather than static credentials embedded anywhere in the app.",
            "No system is perfectly secure — if you believe you've found a vulnerability or a data issue, tell us before disclosing it publicly so we can fix it first.",
          ]}
        />
      ),
    },
    {
      heading: "Your Rights & Choices",
      body: (
        <PolicyList
          items={[
            "Access or correct your information — most of it is editable directly from your profile.",
            "Request a copy of your data, or request deletion of your account, by contacting us.",
            "Turn off browser push at any time without affecting your access to the platform or in-app notifications.",
          ]}
        />
      ),
    },
    {
      heading: "Children's Privacy",
      body: (
        <p>
          HackSprint is intended for students and professionals participating in
          hackathons, not for children. We don't knowingly collect data from anyone under
          13. If you believe a child has created an account, contact us and we'll remove it.
        </p>
      ),
    },
    {
      heading: "Changes to This Policy",
      body: (
        <p>
          We may update this policy as the platform changes — new features (like on-spot
          events or push notifications) sometimes mean new categories of data. Material
          changes will be reflected here with an updated date; continued use after an
          update means you accept the revised policy.
        </p>
      ),
    },
  ];

  return (
    <LegalDocLayout
      title="Privacy"
      accent="Policy"
      subtitle="What HackSprint collects, why, who it's shared with, and the choices you have — covering accounts, hackathon activity, on-spot events, and browser notifications."
      meta="Last updated August 2026. See also: Terms & Conditions."
      sections={sections}
    />
  );
}
