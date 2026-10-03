import React from "react";
import { FileText } from "lucide-react";
import "./AdminForms.css";

const DOC_LABELS = {
  REGISTRATION_CERTIFICATE: "Registration certificate",
  INSTITUTION_LETTER: "Institution authorisation letter",
  STAFF_ID: "Staff / faculty ID",
  GOVT_ID: "Government photo ID",
  ADDRESS_PROOF: "Address proof",
  PORTFOLIO: "Portfolio / past events",
  OTHER: "Other",
};

// What the controller sees when reviewing an organiser's verification request.
const VerificationDetails = ({ admin }) => {
  const d = admin.verificationDetails || {};
  const a = d.registeredAddress || {};
  const c = d.contactPerson || {};
  const docs = admin.verificationDocuments?.length ? admin.verificationDocuments : admin.verificationDocument?.url ? [{ type: "OTHER", ...admin.verificationDocument, name: "Verification document" }] : [];
  const rows = [
    ["Legal name", d.legalName],
    ["Registration no.", d.registrationNumber],
    ["Address", [a.line1, a.city, a.state, a.postalCode, a.country].filter(Boolean).join(", ")],
    ["Official email", d.officialEmail],
    ["Website", d.organizationWebsite],
    ["Contact person", [c.name, c.designation].filter(Boolean).join(" — ")],
    ["Contact phone", c.phone],
    ["Past events", d.eventExperience],
    ["Plans", d.planDescription],
  ].filter(([, v]) => v);

  if (!rows.length && !docs.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
      {rows.length > 0 && (
        <dl className="af-kv">
          {rows.map(([k, v]) => (<React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>))}
        </dl>
      )}
      {docs.length > 0 && (
        <div>
          <div className="af-section-title">Documents</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {docs.map((doc) => (
              <a key={doc.key || doc.url} href={doc.url} target="_blank" rel="noopener noreferrer" className="af-btn af-btn--sm">
                <FileText size={12} /> {DOC_LABELS[doc.type] || "Document"}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationDetails;
