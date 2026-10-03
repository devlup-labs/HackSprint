import React, { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Shield, X, UploadCloud, Check, Loader2 } from "lucide-react";
import { AdminAPI } from "../../api/admin.api.js";
import { MediaAPI } from "../../api/media.api.js";
import "../../pages/Styles/AllHackathons.css";
import "./AdminForms.css";

// Mirrors the server's rules (utils/organizerVerification.js) so mistakes are
// caught before anything is uploaded.
const DOC_LABELS = {
  REGISTRATION_CERTIFICATE: "Registration / incorporation certificate",
  INSTITUTION_LETTER: "Authorisation letter from the institution (on letterhead)",
  STAFF_ID: "Staff or faculty ID card",
  GOVT_ID: "Government photo ID of the contact person",
  ADDRESS_PROOF: "Address proof (utility bill, bank statement, rental deed)",
  PORTFOLIO: "Portfolio or proof of past events",
};
const REQUIRED_GROUPS = {
  INDIVIDUAL: [["GOVT_ID"], ["ADDRESS_PROOF"]],
  COLLEGE: [["INSTITUTION_LETTER"], ["STAFF_ID"]],
  COMPANY: [["REGISTRATION_CERTIFICATE"], ["GOVT_ID"]],
  STARTUP: [["REGISTRATION_CERTIFICATE"], ["GOVT_ID"]],
  COMMUNITY: [["REGISTRATION_CERTIFICATE", "PORTFOLIO"], ["GOVT_ID"]],
  STUDIO: [["REGISTRATION_CERTIFICATE", "PORTFOLIO"], ["GOVT_ID"]],
};
const TYPE_NAME = { INDIVIDUAL: "individual organiser", COLLEGE: "college", COMPANY: "company", STARTUP: "startup", COMMUNITY: "community", STUDIO: "studio" };
const REG_LABEL = { COLLEGE: "Institution registration / AISHE code", COMPANY: "CIN / GST / registration number", STARTUP: "CIN / DPIIT / registration number", COMMUNITY: "Registration number or society ID", STUDIO: "Registration / GST number" };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9]{10,15}$/;
const URL_RE = /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i;

const Field = ({ label, required, error, hint, className = "", children }) => (
  <div className={`af-field ${className}`}>
    <label>{label}{required && <b>*</b>}</label>
    {children}
    {error ? <div className="af-err">{error}</div> : hint ? <div className="af-hint">{hint}</div> : null}
  </div>
);

const VerificationForm = ({ admin, onClose, onSubmitted }) => {
  const type = admin.organizerType || "INDIVIDUAL";
  const isIndividual = type === "INDIVIDUAL";
  const groups = REQUIRED_GROUPS[type] || REQUIRED_GROUPS.INDIVIDUAL;

  const [f, setF] = useState({
    legalName: admin.organizationName || admin.adminName || "",
    registrationNumber: "",
    line1: "", city: "", state: "", postalCode: "", country: admin.country || "",
    officialEmail: admin.email || "",
    organizationWebsite: admin.website || "",
    contactName: admin.adminName || "", designation: "", phone: admin.contactNumber || "",
    eventExperience: "", planDescription: "", declaration: false,
  });
  const [docs, setDocs] = useState(() => groups.map((g) => ({ type: g[0], file: null })));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const inputs = useRef([]);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const validate = useMemo(() => () => {
    const e = {};
    if (f.legalName.trim().length < 2) e.legalName = "Required";
    if (!isIndividual && f.registrationNumber.trim().length < 3) e.registrationNumber = "Required";
    if (f.line1.trim().length < 5) e.line1 = "Enter the full address";
    if (!f.city.trim()) e.city = "Required";
    if (!f.state.trim()) e.state = "Required";
    if (f.postalCode.trim().length < 4) e.postalCode = "Required";
    if (!f.country.trim()) e.country = "Required";
    if (!EMAIL.test(f.officialEmail.trim())) e.officialEmail = "Enter a valid email";
    if (!isIndividual && !URL_RE.test(f.organizationWebsite.trim())) e.organizationWebsite = "Enter a valid link starting with https://";
    if (isIndividual && f.organizationWebsite.trim() && !URL_RE.test(f.organizationWebsite.trim())) e.organizationWebsite = "Must start with https://";
    if (f.contactName.trim().length < 2) e.contactName = "Required";
    if (f.designation.trim().length < 2) e.designation = "Required";
    if (!PHONE.test(f.phone.replace(/[\s-]/g, ""))) e.phone = "Enter 10–15 digits";
    if (f.eventExperience.trim().length < 30) e.eventExperience = "A couple of sentences, at least 30 characters";
    if (f.planDescription.trim().length < 30) e.planDescription = "A couple of sentences, at least 30 characters";
    docs.forEach((d, i) => { if (!d.file) e[`doc${i}`] = "Upload this document"; });
    if (!f.declaration) e.declaration = "Please confirm to continue";
    return e;
  }, [f, docs, isIndividual]);

  const submit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Some details are missing or invalid.");
      return;
    }
    setSubmitting(true);
    try {
      const uploaded = [];
      for (const d of docs) {
        const res = await MediaAPI.uploadFile(d.file, "resource", undefined, undefined, true);
        const { url, key } = res.data.file;
        uploaded.push({ type: d.type, url, key, name: d.file.name });
      }
      const res = await AdminAPI.submitVerificationRequest({
        details: {
          legalName: f.legalName, registrationNumber: f.registrationNumber,
          registeredAddress: { line1: f.line1, city: f.city, state: f.state, postalCode: f.postalCode, country: f.country },
          officialEmail: f.officialEmail, organizationWebsite: f.organizationWebsite,
          contactPerson: { name: f.contactName, designation: f.designation, phone: f.phone },
          eventExperience: f.eventExperience, planDescription: f.planDescription, declaration: f.declaration,
        },
        documents: uploaded,
      });
      toast.success(res.data.message || "Verification request submitted");
      onSubmitted();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't submit your request. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const text = (k, label, props = {}) => (
    <Field label={label} required={props.required !== false} error={errors[k]} hint={props.hint} className={props.full ? "af-full" : ""}>
      <input className={`af-input ${errors[k] ? "bad" : ""}`} value={f[k]} onChange={set(k)} placeholder={props.placeholder} maxLength={props.max || 200} />
    </Field>
  );

  return (
    <div className="af-overlay" role="dialog" aria-modal="true" aria-label="Organiser verification">
      <div className="af-backdrop" onClick={submitting ? undefined : onClose} />
      <div className="af-modal">
        <div className="af-head">
          <div style={{ color: "var(--green)", paddingTop: 2 }}><Shield size={20} /></div>
          <div>
            <div className="af-head-title">Organiser verification</div>
            <div className="af-head-sub">
              You're registered as a <b>{TYPE_NAME[type]}</b>. The HackSprint team reviews this before you can publish events. Every field marked * is required.
            </div>
          </div>
          <button className="af-close" onClick={onClose} disabled={submitting} aria-label="Close"><X size={16} /></button>
        </div>

        <div className="af-body">
          <section>
            <div className="af-section-title">{isIndividual ? "About you" : "The organisation"}</div>
            <div className="af-grid">
              {text("legalName", isIndividual ? "Full legal name" : "Legal name of the organisation", { full: true, max: 160 })}
              {!isIndividual && text("registrationNumber", REG_LABEL[type] || "Registration number", { full: true, max: 80 })}
              {text("officialEmail", "Official email", { max: 160, hint: !isIndividual ? "Prefer an address on the organisation's own domain." : undefined })}
              {text("organizationWebsite", isIndividual ? "Website or portfolio (optional)" : "Website", { required: !isIndividual, placeholder: "https://", max: 200 })}
            </div>
          </section>

          <section>
            <div className="af-section-title">{isIndividual ? "Your address" : "Registered address"}</div>
            <div className="af-grid">
              {text("line1", "Address", { full: true, placeholder: "Building, street, area" })}
              {text("city", "City", { max: 80 })}
              {text("state", "State", { max: 80 })}
              {text("postalCode", "Postal code", { max: 12 })}
              {text("country", "Country", { max: 80 })}
            </div>
          </section>

          <section>
            <div className="af-section-title">Contact person</div>
            <div className="af-grid">
              {text("contactName", "Full name", { max: 100 })}
              {text("designation", "Role / designation", { max: 100, placeholder: "e.g. Founder, Faculty coordinator" })}
              {text("phone", "Phone number", { max: 20, placeholder: "+91…", full: true })}
            </div>
          </section>

          <section>
            <div className="af-section-title">Your events</div>
            <div className="af-grid">
              <Field label="Events you've organised before" required error={errors.eventExperience} hint="Name, size, year — or say it's your first and why you're ready." className="af-full">
                <textarea className={`af-textarea ${errors.eventExperience ? "bad" : ""}`} value={f.eventExperience} onChange={set("eventExperience")} maxLength={1500} />
              </Field>
              <Field label="What you plan to host on HackSprint" required error={errors.planDescription} hint="Themes, audience, expected size and timing." className="af-full">
                <textarea className={`af-textarea ${errors.planDescription ? "bad" : ""}`} value={f.planDescription} onChange={set("planDescription")} maxLength={1500} />
              </Field>
            </div>
          </section>

          <section>
            <div className="af-section-title">Documents</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              {groups.map((g, i) => (
                <div key={i}>
                  <div className={`af-doc ${docs[i].file ? "done" : ""} ${errors[`doc${i}`] ? "bad" : ""}`}>
                    <div className="af-doc-main">
                      {g.length > 1 ? (
                        <select className="af-select" style={{ marginBottom: "0.4rem" }} value={docs[i].type} onChange={(e) => setDocs((p) => p.map((d, k) => (k === i ? { ...d, type: e.target.value } : d)))}>
                          {g.map((t) => <option key={t} value={t}>{DOC_LABELS[t]}</option>)}
                        </select>
                      ) : (
                        <div className="af-doc-label">{DOC_LABELS[g[0]]} <b style={{ color: "var(--red)" }}>*</b></div>
                      )}
                      <div className="af-doc-file">{docs[i].file ? docs[i].file.name : "PDF, JPG or PNG · up to 10 MB"}</div>
                    </div>
                    <button type="button" className="af-btn af-btn--sm" onClick={() => inputs.current[i]?.click()}>
                      {docs[i].file ? <><Check size={12} /> Replace</> : <><UploadCloud size={12} /> Upload</>}
                    </button>
                    <input
                      ref={(el) => (inputs.current[i] = el)}
                      type="file"
                      className="sr-only"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 10 * 1024 * 1024) { toast.error("That file is over 10 MB."); return; }
                        setDocs((p) => p.map((d, k) => (k === i ? { ...d, file } : d)));
                      }}
                    />
                  </div>
                  {errors[`doc${i}`] && <div className="af-err">{errors[`doc${i}`]}</div>}
                </div>
              ))}
            </div>
          </section>

          <section>
            <label className="af-check">
              <input type="checkbox" checked={f.declaration} onChange={set("declaration")} />
              <span>I confirm the information and documents above are genuine and that I'm authorised to organise events for this {TYPE_NAME[type]}. I understand the account can be removed if any of it is false.</span>
            </label>
            {errors.declaration && <div className="af-err">{errors.declaration}</div>}
          </section>
        </div>

        <div className="af-foot">
          <button className="af-btn" onClick={onClose} disabled={submitting}>Cancel</button>
          <button className="af-btn af-btn--primary" onClick={submit} disabled={submitting}>
            {submitting ? <><Loader2 size={13} className="animate-spin" /> Submitting…</> : "Submit for review"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationForm;
