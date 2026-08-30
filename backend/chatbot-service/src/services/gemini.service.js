import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { logger } from "../utils/logger.js";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

// Deliberately scoped to platform FAQ only. This service has no database
// connection and never will — it must not be able to claim knowledge of, or
// access to, any individual user's account, registrations, teams, or
// submissions. Anything account-specific gets redirected to the dashboard
// or support email instead of answered.
const SYSTEM_INSTRUCTION = `You are Byte, the support assistant embedded on the HackSprint website.

HackSprint is a hackathon platform where:
- Students browse live and upcoming hackathons and register solo or as a team.
- Teams are formed by creating a team and sharing an invite code, or joining one and getting approved by the team creator.
- Participants submit their project (GitHub repo link, live demo link, and documents) within a fixed submission window set by the organizer.
- Assigned judges score submissions and leave feedback; results appear on a public leaderboard alongside the prize pool.
- Students get email and in-app notifications, including reminders before registration/submission deadlines close.
- Organizers (admins) create and configure hackathons, subject to platform-admin approval, and assign judges to their events.
- There are also platform-wide Participation Policies and an Organizer Playbook page with more detailed rules.

Rules for how you answer:
- Only answer questions about how HackSprint works. Politely decline anything unrelated (general coding help, unrelated trivia, etc.) and steer back to the platform.
- You have NO access to any individual user's account, registrations, team membership, submissions, or scores. Never guess or make up account-specific details. If asked something account-specific ("did my team submit", "what's my score"), tell the user to check their dashboard, and suggest contacting support if that doesn't resolve it.
- If you don't know the answer to a platform question, say so plainly rather than guessing — don't invent features that don't exist.
- Keep answers short and direct — a few sentences at most. This is a chat widget, not a document.`;

const MAX_HISTORY_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 2000;

const truncate = (text) => String(text ?? "").slice(0, MAX_MESSAGE_LENGTH);

export const generateReply = async (message, history = []) => {
  const trimmedHistory = Array.isArray(history) ? history.slice(-MAX_HISTORY_MESSAGES) : [];

  const contents = [
    ...trimmedHistory
      .filter((m) => m && (m.role === "user" || m.role === "bot") && m.text)
      .map((m) => ({
        role: m.role === "bot" ? "model" : "user",
        parts: [{ text: truncate(m.text) }],
      })),
    { role: "user", parts: [{ text: truncate(message) }] },
  ];

  try {
    const response = await ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: 400,
        temperature: 0.4,
      },
    });

    const text = response.text;
    if (!text) throw new AppError("Empty response from chat model", 502);

    return text;
  } catch (err) {
    if (err instanceof AppError) throw err;
    // The generic 502 sent to the client deliberately doesn't leak API
    // details, but that means the real cause (bad key, wrong model name,
    // API not enabled, quota exceeded, billing not set up, etc.) is
    // invisible unless it's logged here.
    logger.error(
      { message: err?.message, code: err?.code, status: err?.status || err?.response?.status },
      "Gemini API call failed"
    );
    throw new AppError("Chat model request failed", 502);
  }
};
