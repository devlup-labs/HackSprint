import { BadRequestError } from "../errors/BadRequestError.js";

// What an organizer has to put in front of the platform controller before they
// can publish hackathons. Documents are required per organizer type; each
// group lists the document types that satisfy it ("any one of").
export const DOCUMENT_TYPES = {
  REGISTRATION_CERTIFICATE: "Registration / incorporation certificate",
  INSTITUTION_LETTER: "Authorisation letter from the institution",
  STAFF_ID: "Staff or faculty ID card",
  GOVT_ID: "Government photo ID of the contact person",
  ADDRESS_PROOF: "Address proof",
  PORTFOLIO: "Portfolio or past-events proof",
  OTHER: "Other supporting document",
};

export const REQUIRED_DOCUMENT_GROUPS = {
  INDIVIDUAL: [["GOVT_ID"], ["ADDRESS_PROOF"]],
  COLLEGE: [["INSTITUTION_LETTER"], ["STAFF_ID"]],
  COMPANY: [["REGISTRATION_CERTIFICATE"], ["GOVT_ID"]],
  STARTUP: [["REGISTRATION_CERTIFICATE"], ["GOVT_ID"]],
  COMMUNITY: [["REGISTRATION_CERTIFICATE", "PORTFOLIO"], ["GOVT_ID"]],
  STUDIO: [["REGISTRATION_CERTIFICATE", "PORTFOLIO"], ["GOVT_ID"]],
};

const str = (v, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9]{10,15}$/;
const URL_RE = /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i;

const labelFor = (group) => group.map((t) => DOCUMENT_TYPES[t]).join(" or ");

// Returns the cleaned details + documents, or throws a BadRequestError that
// names the first thing that's missing so the form can show it.
export const validateVerificationSubmission = (organizerType, payload = {}) => {
  const raw = payload.details || {};
  const isIndividual = organizerType === "INDIVIDUAL";

  const details = {
    legalName: str(raw.legalName, 160),
    registrationNumber: str(raw.registrationNumber, 80),
    registeredAddress: {
      line1: str(raw.registeredAddress?.line1, 200),
      city: str(raw.registeredAddress?.city, 80),
      state: str(raw.registeredAddress?.state, 80),
      postalCode: str(raw.registeredAddress?.postalCode, 12),
      country: str(raw.registeredAddress?.country, 80),
    },
    officialEmail: str(raw.officialEmail, 160).toLowerCase(),
    organizationWebsite: str(raw.organizationWebsite, 200),
    contactPerson: {
      name: str(raw.contactPerson?.name, 100),
      designation: str(raw.contactPerson?.designation, 100),
      phone: str(raw.contactPerson?.phone, 20).replace(/[\s-]/g, ""),
    },
    eventExperience: str(raw.eventExperience, 1500),
    planDescription: str(raw.planDescription, 1500),
    declaration: raw.declaration === true,
  };

  const need = (ok, message) => { if (!ok) throw new BadRequestError(message); };

  need(details.legalName.length >= 2, "Legal name of the organisation (or your full name) is required");
  if (!isIndividual) need(details.registrationNumber.length >= 3, "Registration / ID number of the organisation is required");
  need(details.registeredAddress.line1.length >= 5, "Address is required");
  need(details.registeredAddress.city, "City is required");
  need(details.registeredAddress.state, "State is required");
  need(details.registeredAddress.postalCode.length >= 4, "Postal code is required");
  need(details.registeredAddress.country, "Country is required");
  need(EMAIL.test(details.officialEmail), "A valid official email is required");
  if (!isIndividual) need(URL_RE.test(details.organizationWebsite), "A valid website (starting with http:// or https://) is required");
  else if (details.organizationWebsite) need(URL_RE.test(details.organizationWebsite), "Website must start with http:// or https://");
  need(details.contactPerson.name.length >= 2, "Contact person's name is required");
  need(details.contactPerson.designation.length >= 2, "Contact person's role / designation is required");
  need(PHONE.test(details.contactPerson.phone), "A valid contact phone number is required");
  need(details.eventExperience.length >= 30, "Tell us about events you've run before (at least a couple of sentences)");
  need(details.planDescription.length >= 30, "Describe the events you plan to host (at least a couple of sentences)");
  need(details.declaration, "You must confirm the declaration");

  const documents = (Array.isArray(payload.documents) ? payload.documents : [])
    .slice(0, 8)
    .map((d) => ({ type: str(d?.type, 40), url: str(d?.url, 600), key: str(d?.key, 300), name: str(d?.name, 160) }))
    .filter((d) => DOCUMENT_TYPES[d.type] && /^https?:\/\//i.test(d.url) && d.key);

  const groups = REQUIRED_DOCUMENT_GROUPS[organizerType] || REQUIRED_DOCUMENT_GROUPS.INDIVIDUAL;
  groups.forEach((group) => {
    need(documents.some((d) => group.includes(d.type)), `Upload: ${labelFor(group)}`);
  });

  return { details, documents };
};
