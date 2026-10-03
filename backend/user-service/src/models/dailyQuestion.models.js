import mongoose from "mongoose";

// Question bank for the daily challenge. `key` is a hash of the prompt so the
// boot seed can upsert without ever overwriting or duplicating entries.
const dailyQuestionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    field: { type: String, required: true, trim: true, index: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    prompt: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: { validator: (v) => v.length === 4, message: "Exactly 4 options required" },
    },
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String, default: "" },
    // Retired questions stay in the DB (old attempts point at them) but are
    // never handed out again.
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("dailyquestions", dailyQuestionSchema);
