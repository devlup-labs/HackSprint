import mongoose from "mongoose";

// Master catalog behind the profile skill picker — people choose from these
// (typeahead search), they don't free-type arbitrary strings. nameKey is the
// lowercase form used for lookups/dedupe so "react" and "React" resolve to
// the same entry.
const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    nameKey: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
  },
  { timestamps: true }
);

const SkillModel = mongoose.model("skills", skillSchema);

export default SkillModel;
