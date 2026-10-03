import React, { useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import SEO from "../components/SEO.jsx";
import { ContactAPI } from "../api/contact.api.js";
import "./Styles/AllHackathons.css";

const ABOUT = ["Events", "Community", "Registration & teams", "Judging & results", "Design & ease of use", "Something else"];
const SCALE = [
  { v: 1, label: "Poor" },
  { v: 2, label: "Fair" },
  { v: 3, label: "Good" },
  { v: 4, label: "Very good" },
  { v: 5, label: "Excellent" },
];

const field =
  "w-full rounded-lg px-3.5 text-sm bg-[rgba(var(--hk-input-bg),0.8)] text-[var(--hk-text)] border placeholder:text-[rgba(var(--hk-text-rgb),0.4)] outline-none focus:border-[var(--hk-accent-solid)] focus:ring-2 focus:ring-[rgba(var(--hk-accent-rgb),0.15)] transition [color-scheme:light] dark:[color-scheme:dark]";
const border = (bad) => (bad ? "border-[rgb(var(--hk-red-rgb))]" : "border-[rgba(var(--hk-card-border-rgb),0.25)] dark:border-[rgba(var(--hk-card-border-rgb),0.16)]");

const Label = ({ htmlFor, children, optional }) => (
  <label htmlFor={htmlFor} className="block text-[0.82rem] font-semibold mb-1.5">
    {children}
    {optional && <span className="font-normal text-[rgba(var(--hk-text-rgb),0.5)] ml-1.5">(optional)</span>}
  </label>
);
const Err = ({ children }) => (children ? <p className="text-xs text-[rgb(var(--hk-red-rgb))] mt-1.5">{children}</p> : null);

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [about, setAbout] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  const submit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!rating) e.rating = "Please choose a rating";
    if (message.trim().length < 10) e.message = `Please add a few more words (${message.trim().length}/10 characters)`;
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) e.email = "Enter a valid email or leave it blank";
    setErrors(e);
    if (Object.keys(e).length) return;
    setSending(true);
    try {
      await ContactAPI.feedback({ rating, about, message, name, email, website });
      toast.success("Thanks, your feedback has been sent.");
      setRating(0); setAbout(""); setMessage(""); setName(""); setEmail(""); setErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't send your feedback. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="hk-bg bg-[var(--hk-bg)] text-[var(--hk-text)] min-h-[calc(100vh-56px)]">
      <SEO title="Feedback" description="Tell us how HackSprint is working for you." path="/feedback" noindex />

      <div className="relative z-10 max-w-3xl mx-auto px-5 pt-20 pb-24">
        <header className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="dark:text-[var(--hk-accent-solid)] text-4xl sm:text-5xl font-semibold tracking-tight leading-tight mb-4">
            Share your feedback
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-[rgba(var(--hk-text-rgb),0.72)] dark:text-[rgba(var(--hk-text-rgb),0.6)]">
            Tell us what you think about HackSprint. Your feedback helps us improve.
          </p>
        </header>

          <form onSubmit={submit} noValidate className="flex flex-col gap-7">
            <fieldset>
              <legend className="text-[0.82rem] font-semibold mb-2.5">How would you rate your experience?</legend>
              <div role="radiogroup" className="grid grid-cols-5 gap-2 sm:gap-3">
                {SCALE.map(({ v, label }) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={rating === v}
                    onClick={() => setRating(v)}
                    className={`flex flex-col items-center gap-1 py-3.5 rounded-lg border cursor-pointer transition ${
                      rating === v
                        ? "border-[var(--hk-accent-solid)] bg-[rgba(var(--hk-accent-rgb),0.1)] ring-2 ring-[rgba(var(--hk-accent-rgb),0.14)]"
                        : `${border(errors.rating)} hover:border-[rgba(var(--hk-accent-rgb),0.5)]`
                    }`}
                  >
                    <span className={`text-xl font-bold tabular-nums ${rating === v ? "text-[var(--hk-accent-solid)]" : ""}`}>{v}</span>
                    <span className="text-[0.7rem] sm:text-xs text-[rgba(var(--hk-text-rgb),0.65)]">{label}</span>
                  </button>
                ))}
              </div>
              <Err>{errors.rating}</Err>
            </fieldset>

            <div>
              <Label htmlFor="fb-about" optional>What is your feedback about?</Label>
              <select id="fb-about" value={about} onChange={(e) => setAbout(e.target.value)} className={`${field} ${border()} h-11`}>
                <option value="">Select a topic</option>
                {ABOUT.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <Label htmlFor="fb-msg">Your feedback</Label>
              <textarea
                id="fb-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={3000}
                placeholder="What worked well, and what could be better?"
                className={`${field} ${border(errors.message)} py-3 min-h-[10rem] resize-y leading-relaxed`}
              />
              <Err>{errors.message}</Err>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="fb-name" optional>Name</Label>
                <input id="fb-name" className={`${field} ${border()} h-11`} value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder="Your name" autoComplete="name" />
              </div>
              <div>
                <Label htmlFor="fb-email" optional>Email</Label>
                <input id="fb-email" type="email" className={`${field} ${border(errors.email)} h-11`} value={email} onChange={(e) => setEmail(e.target.value)} maxLength={160} placeholder="Only if you'd like a reply" autoComplete="email" />
                <Err>{errors.email}</Err>
              </div>
            </div>

            <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
              <label>Website <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="h-12 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold bg-[var(--hk-accent-solid)] text-[var(--hk-accent-solid-text)] hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition"
            >
              {sending ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : "Submit feedback"}
            </button>
          </form>
      </div>
    </div>
  );
}
