// Every field on the Edit Profile form. Hackathon participation (register,
// create/join team, submit) is blocked until all of these are filled — the
// same rule is duplicated in hackathon-service/src/utils/profileCompleteness.js
// (the two services don't share code), so change both together.
export const REQUIRED_PROFILE_FIELDS = [
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
