import mongoose from "mongoose";

// One row per user per calendar day (dateKey = YYYY-MM-DD in the platform
// timezone). The unique index is what makes "one answer per day" safe even
// when two tabs submit at once.
const dailyAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    dateKey: { type: String, required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "dailyquestions", required: true },
    selectedIndex: { type: Number, required: true, min: 0, max: 3 },
    correct: { type: Boolean, required: true },
  },
  { timestamps: true }
);

dailyAttemptSchema.index({ userId: 1, dateKey: 1 }, { unique: true });

export default mongoose.model("dailyattempts", dailyAttemptSchema);
