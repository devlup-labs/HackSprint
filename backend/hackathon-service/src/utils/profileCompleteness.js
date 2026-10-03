import { ForbiddenError } from "../errors/ForbiddenError.js";

// Every field on the Edit Profile form. Mirrors
// user-service/src/utils/profileCompleteness.js (the services don't share
// code) — change both together.
const REQUIRED_PROFILE_FIELDS = [
  { key: "name", label: "Name", isFilled: (u) => !!u.name?.trim() },
  { key: "userName", label: "Username", isFilled: (u) => !!u.userName?.trim() },
  { key: "gender", label: "Gender", isFilled: (u) => !!u.gender },
  { key: "bio", label: "Bio", isFilled: (u) => !!u.bio?.trim() },
  { key: "location", label: "Location", isFilled: (u) => !!u.location?.trim() },
  {
    key: "contactNumber",
    label: "Contact number",
    isFilled: (u) => !!u.contactNumber?.trim(),
  },
  { key: "image", label: "Profile photo", isFilled: (u) => !!u.image?.url },
];

export const getMissingProfileFields = (user) =>
  REQUIRED_PROFILE_FIELDS.filter((f) => !f.isFilled(user)).map((f) => ({
    key: f.key,
    label: f.label,
  }));

// 403 with a stable `code` the frontend keys off to send people to the
// Edit Profile form instead of showing a generic error.
export class ProfileIncompleteError extends ForbiddenError {
  constructor(missingFields) {
    super(
      `Complete your profile to take part in hackathons. Missing: ${missingFields
        .map((f) => f.label)
        .join(", ")}`
    );
    this.code = "PROFILE_INCOMPLETE";
    this.details = { missingFields };
  }
}

// Participation gate — used by every entry point that commits someone to a
// hackathon (register, create/join team, submit). Reads the profile straight
// from the shared users collection, so it's always current.
export const assertProfileComplete = async (userRepository, userId) => {
  const user = await userRepository.getById(userId);

  if (!user) {
    throw new ForbiddenError("User not found");
  }

  const missing = getMissingProfileFields(user);

  if (missing.length > 0) {
    throw new ProfileIncompleteError(missing);
  }
};
