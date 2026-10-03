import crypto from "crypto";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { ConflictError } from "../../errors/ConflictError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { DAILY_QUESTIONS } from "../../data/dailyQuestions.js";

const TIME_ZONE = "Asia/Kolkata";
const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const toDateKey = (date = new Date()) => dayFormatter.format(date);

// Pure date-key arithmetic (noon UTC avoids any DST edge) — keys are
// YYYY-MM-DD so lexical order is chronological.
const shiftKey = (key, days) => {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

const hashKey = (text) => crypto.createHash("sha1").update(text).digest("hex");

export const computeStreak = (attempts, todayKey) => {
  const correctDays = new Set(attempts.filter((a) => a.correct).map((a) => a.dateKey));

  // Today not answered yet doesn't break the streak — it ends yesterday.
  let cursor = correctDays.has(todayKey) ? todayKey : shiftKey(todayKey, -1);
  let current = 0;
  while (correctDays.has(cursor)) {
    current += 1;
    cursor = shiftKey(cursor, -1);
  }

  const sorted = [...correctDays].sort();
  let longest = 0;
  let run = 0;
  let prev = null;
  for (const day of sorted) {
    run = prev && shiftKey(prev, 1) === day ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = day;
  }

  return { current, longest, totalCorrect: correctDays.size };
};

export class DailyService {
  constructor(dailyRepository, logger) {
    this.dailyRepository = dailyRepository;
    this.logger = logger;
  }

  async ensureSeeded() {
    const entries = DAILY_QUESTIONS.map(([field, difficulty, prompt, options, correctIndex, explanation]) => ({
      key: hashKey(prompt),
      field,
      difficulty,
      prompt,
      options,
      correctIndex,
      explanation,
    }));
    await this.dailyRepository.seedQuestions(entries);
    this.logger.info({ total: entries.length }, "Daily question bank ensured");
  }

  // Same user + same day always resolves to the same question; questions the
  // user already answered are skipped until the whole bank has been used.
  async pickQuestionId(userId, dateKey) {
    const [all, past] = await Promise.all([
      this.dailyRepository.listQuestionIds(),
      this.dailyRepository.listAllAttempts(userId),
    ]);
    if (all.length === 0) throw new NotFoundError("No daily questions available");

    const seen = new Set(past.map((a) => String(a.questionId)));
    const unseen = all.filter((q) => !seen.has(String(q._id)));
    const pool = unseen.length > 0 ? unseen : all;

    const n = parseInt(hashKey(`${userId}:${dateKey}`).slice(0, 8), 16);
    return pool[n % pool.length]._id;
  }

  async getStreak(userId, todayKey) {
    const attempts = await this.dailyRepository.listAllAttempts(userId);
    return computeStreak(attempts, todayKey);
  }

  async getToday(userId) {
    const dateKey = toDateKey();
    const attempt = await this.dailyRepository.findAttempt(userId, dateKey);

    if (attempt) {
      const question = await this.dailyRepository.getQuestion(attempt.questionId);
      return {
        dateKey,
        answered: true,
        question: this.publicQuestion(question),
        result: this.resultFor(question, attempt),
        streak: await this.getStreak(userId, dateKey),
      };
    }

    const questionId = await this.pickQuestionId(userId, dateKey);
    const question = await this.dailyRepository.getQuestion(questionId);
    return {
      dateKey,
      answered: false,
      question: this.publicQuestion(question),
      result: null,
      streak: await this.getStreak(userId, dateKey),
    };
  }

  async answer(userId, questionId, selectedIndex) {
    const idx = Number(selectedIndex);
    if (!Number.isInteger(idx) || idx < 0 || idx > 3) {
      throw new BadRequestError("Pick one of the four options");
    }

    const dateKey = toDateKey();
    if (await this.dailyRepository.findAttempt(userId, dateKey)) {
      throw new ConflictError("You've already answered today's question");
    }

    const expectedId = await this.pickQuestionId(userId, dateKey);
    // Only today's assigned question can be answered, so answers can't be
    // brute-forced by cycling through question ids.
    if (String(expectedId) !== String(questionId)) {
      throw new BadRequestError("That isn't today's question");
    }

    const question = await this.dailyRepository.getQuestion(expectedId);
    let attempt;
    try {
      attempt = await this.dailyRepository.createAttempt({
        userId,
        dateKey,
        questionId: expectedId,
        selectedIndex: idx,
        correct: idx === question.correctIndex,
      });
    } catch (error) {
      if (error?.code === 11000) throw new ConflictError("You've already answered today's question");
      throw error;
    }

    return {
      dateKey,
      answered: true,
      question: this.publicQuestion(question),
      result: this.resultFor(question, attempt),
      streak: await this.getStreak(userId, dateKey),
    };
  }

  // Oldest → newest, one entry per day with activity, for the heatmap.
  async getActivity(userId, days = 365) {
    const span = Math.min(Math.max(parseInt(days, 10) || 365, 7), 400);
    const todayKey = toDateKey();
    const since = shiftKey(todayKey, -(span - 1));
    const [rows, streak] = await Promise.all([
      this.dailyRepository.listAttemptsSince(userId, since),
      this.getStreak(userId, todayKey),
    ]);

    return {
      today: todayKey,
      since,
      days: rows.map((r) => ({ date: r.dateKey, correct: r.correct })),
      streak,
    };
  }

  publicQuestion(q) {
    return { id: q._id, field: q.field, difficulty: q.difficulty, prompt: q.prompt, options: q.options };
  }

  resultFor(question, attempt) {
    return {
      selectedIndex: attempt.selectedIndex,
      correctIndex: question.correctIndex,
      correct: attempt.correct,
      explanation: question.explanation,
    };
  }
}
