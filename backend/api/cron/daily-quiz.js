import { runDailyQuizAutomation } from "../dailyQuizAutomation"

export default async function handler(req, res) {
  try {
    await runDailyQuizAutomation();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}