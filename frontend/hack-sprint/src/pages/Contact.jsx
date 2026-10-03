import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Mail, MapPin, Clock, Loader2, Github, Instagram, Linkedin, Twitter } from "lucide-react";
import SEO from "../components/SEO.jsx";
import { ContactAPI } from "../api/contact.api.js";
import { ProfileAPI } from "../api/profile.api.js";
import "./Styles/AllHackathons.css";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9]{10,15}$/;

const social = [
  { name: "GitHub", icon: Github, url: "https://github.com/devlup-labs/HackSprint" },
  { name: "Instagram", icon: Instagram, url: "https://www.instagram.com/hack.sprint?igsh=MWN6bjlldTV2Z2Nqdg==" },
  { name: "LinkedIn", icon: Linkedin, url: "https://www.linkedin.com/company/hacksprintiitj/" },
  { name: "Twitter", icon: Twitter, url: "https://x.com/devluplabs" },
];

const field =
  "w-full h-11 rounded-lg px-3.5 text-sm bg-[rgba(var(--hk-input-bg),0.8)] text-[var(--hk-text)] border placeholder:text-[rgba(var(--hk-text-rgb),0.4)] outline-none focus:border-[var(--hk-accent-solid)] focus:ring-2 focus:ring-[rgba(var(--hk-accent-rgb),0.15)] transition [color-scheme:light] dark:[color-scheme:dark]";
const border = (bad) => (bad ? "border-[rgb(var(--hk-red-rgb))]" : "border-[rgba(var(--hk-card-border-rgb),0.25)] dark:border-[rgba(var(--hk-card-border-rgb),0.16)]");

const Label = ({ htmlFor, children, optional }) => (
  <label htmlFor={htmlFor} className="block text-[0.82rem] font-semibold mb-1.5">
    {children}
    {optional && <span className="font-normal text-[rgba(var(--hk-text-rgb),0.5)] ml-1.5">(optional)</span>}
  </label>
);
const Err = ({ children }) => (children ? <p className="text-xs text-[rgb(var(--hk-red-rgb))] mt-1.5">{children}</p> : null);

export default function ContactPage() {
  const [f, setF] = useState({ first: "", last: "", email: "", phone: "", organization: "", message: "", website: "" });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    ProfileAPI.getMyProfile()
      .then((res) => {
        const p = res.data.profile;
        const [first = "", ...rest] = (p.name || "").split(" ");
        setF((prev) => ({ ...prev, first: prev.first || first, last: prev.last || rest.join(" "), email: prev.email || p.email || "", phone: prev.phone || p.contactNumber || "" }));
      })
      .catch(() => {});
  }, []);

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!f.first.trim()) e.first = "Required";
    if (!EMAIL.test(f.email.trim())) e.email = "Enter a valid email address";
    if (f.phone.trim() && !PHONE.test(f.phone.replace(/[\s-]/g, ""))) e.phone = "Enter 10 to 15 digits, or leave it blank";
    if (f.message.trim().length < 20) e.message = `Please add a little more detail (${f.message.trim().length}/20 characters)`;
    setErrors(e);
    if (Object.keys(e).length) return;
    setSending(true);
    try {
      await ContactAPI.send({
        type: "OTHER",
        name: `${f.first.trim()} ${f.last.trim()}`.trim(),
        email: f.email.trim(),
        phone: f.phone,
        organization: f.organization,
        message: f.message,
        website: f.website,
      });
      toast.success("Message sent. We'll get back to you within two working days.");
      setF({ first: "", last: "", email: "", phone: "", organization: "", message: "", website: "" });
      setErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't send your message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="hk-bg bg-[var(--hk-bg)] text-[var(--hk-text)]">
      <SEO title="Contact" description="Get in touch with the HackSprint team." path="/contact" />

      <div className="relative z-10 max-w-6xl mx-auto px-5 pt-20 pb-24">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="dark:text-[var(--hk-accent-solid)] text-4xl sm:text-5xl font-semibold tracking-tight leading-tight mb-4 whitespace-nowrap">
            Contact our team
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-[rgba(var(--hk-text-rgb),0.72)] dark:text-[rgba(var(--hk-text-rgb),0.6)]">
            Have a question about taking part, hosting an event or working with HackSprint? Send us a message and we'll get back to you within two working days.
          </p>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] gap-16 lg:gap-24 items-start">
            <form onSubmit={submit} noValidate className="flex flex-col gap-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="c-first">First name</Label>
                  <input id="c-first" className={`${field} ${border(errors.first)}`} value={f.first} onChange={set("first")} maxLength={50} placeholder="First name" autoComplete="given-name" />
                  <Err>{errors.first}</Err>
                </div>
                <div>
                  <Label htmlFor="c-last" optional>Last name</Label>
                  <input id="c-last" className={`${field} ${border()}`} value={f.last} onChange={set("last")} maxLength={50} placeholder="Last name" autoComplete="family-name" />
                </div>
              </div>

              <div>
                <Label htmlFor="c-email">Email</Label>
                <input id="c-email" type="email" className={`${field} ${border(errors.email)}`} value={f.email} onChange={set("email")} maxLength={160} placeholder="you@company.com" autoComplete="email" />
                <Err>{errors.email}</Err>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="c-phone" optional>Phone number</Label>
                  <input id="c-phone" className={`${field} ${border(errors.phone)}`} value={f.phone} onChange={set("phone")} maxLength={20} placeholder="+91 98765 43210" autoComplete="tel" />
                  <Err>{errors.phone}</Err>
                </div>
                <div>
                  <Label htmlFor="c-org" optional>College or organisation</Label>
                  <input id="c-org" className={`${field} ${border()}`} value={f.organization} onChange={set("organization")} maxLength={160} placeholder="Where you study or work" />
                </div>
              </div>

              <div>
                <Label htmlFor="c-msg">Message</Label>
                <textarea
                  id="c-msg"
                  className={`${field} ${border(errors.message)} h-auto py-3 min-h-[10rem] resize-y leading-relaxed`}
                  value={f.message}
                  onChange={set("message")}
                  maxLength={3000}
                  placeholder="Leave us a message…"
                />
                <Err>{errors.message}</Err>
              </div>

              <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
                <label>Website <input tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} /></label>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="h-12 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold bg-[var(--hk-accent-solid)] text-[var(--hk-accent-solid-text)] hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition"
              >
                {sending ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : "Send message"}
              </button>
            </form>

          <aside className="flex flex-col gap-8 lg:pt-1">
            {[
              { icon: Mail, title: "Email us", text: "Write to the team directly.", link: "mailto:devluplabs@iitj.ac.in", label: "devluplabs@iitj.ac.in" },
              { icon: Clock, title: "Response time", text: "We reply to every message within two working days." },
              { icon: MapPin, title: "Visit us", text: "DevLup Labs, our home on campus.", link: "https://www.google.com/maps/place/Indian+Institute+of+Technology+(IIT),+Jodhpur/@26.4710162,73.1085513", label: "IIT Jodhpur, Rajasthan", ext: true },
            ].map(({ icon, title, text, link, label, ext }) => (
              <section key={title} className="flex gap-4">
                <span className="shrink-0 w-10 h-10 rounded-lg bg-[rgba(var(--hk-accent-rgb),0.1)] text-[var(--hk-accent-solid)] flex items-center justify-center">
                  {React.createElement(icon, { size: 18 })}
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold">{title}</h2>
                  <p className="text-sm text-[rgba(var(--hk-text-rgb),0.68)] dark:text-[rgba(var(--hk-text-rgb),0.55)] mt-0.5">{text}</p>
                  {link && (
                    <a href={link} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="inline-block mt-1.5 text-sm font-semibold text-[var(--hk-accent-solid)] hover:underline underline-offset-4 break-all">{label}</a>
                  )}
                </div>
              </section>
            ))}
            <section className="pt-6 border-t border-[rgba(var(--hk-card-border-rgb),0.2)]">
              <h2 className="text-base font-semibold mb-3">Follow us</h2>
              <div className="flex gap-2.5">
                {social.map(({ name, icon, url }) => (
                  <a key={name} href={url} target="_blank" rel="noopener noreferrer" title={name} aria-label={name} className="w-10 h-10 rounded-lg border border-[rgba(var(--hk-card-border-rgb),0.25)] flex items-center justify-center text-[rgba(var(--hk-text-rgb),0.7)] hover:text-[var(--hk-accent-solid)] hover:border-[var(--hk-accent-solid)] transition-colors">{React.createElement(icon, { size: 16 })}</a>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
