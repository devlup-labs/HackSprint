import { BadRequestError } from "../../errors/BadRequestError.js";
import { flattenSkillCatalog } from "../../data/skillCatalog.js";

export const MAX_SKILLS_PER_PROFILE = 30;

export class SkillService {
  constructor(skillRepository, logger) {
    this.skillRepository = skillRepository;
    this.logger = logger;
  }

  // Runs on boot: adds any catalog entries missing from the DB, leaves
  // everything already there alone, so extending skillCatalog.js and
  // restarting is the whole "deploy" for new skills.
  async ensureSeeded() {
    const seen = new Set();
    const entries = flattenSkillCatalog().filter((e) => {
      const key = e.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    await this.skillRepository.seed(entries);
    this.logger.info({ total: entries.length }, "Skill catalog ensured");
  }

  async search(query, limit = 10) {
    const trimmed = (query || "").trim();
    if (!trimmed) return [];
    return this.skillRepository.search(trimmed, Math.min(limit, 25));
  }

  // Turns whatever the client sent into catalog-canonical names, rejecting
  // anything that isn't in the catalog — the profile only ever holds skills
  // that exist in the DB.
  async resolveCanonicalSkills(skills) {
    if (!Array.isArray(skills)) {
      throw new BadRequestError("Skills must be an array");
    }

    const keys = [
      ...new Set(
        skills
          .filter((s) => typeof s === "string")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
      ),
    ];

    if (keys.length > MAX_SKILLS_PER_PROFILE) {
      throw new BadRequestError(`You can add up to ${MAX_SKILLS_PER_PROFILE} skills`);
    }

    const found = await this.skillRepository.findByKeys(keys);
    const byKey = new Map(found.map((s) => [s.nameKey, s.name]));
    const unknown = keys.filter((k) => !byKey.has(k));

    if (unknown.length > 0) {
      throw new BadRequestError(`Unknown skill(s): ${unknown.join(", ")}`);
    }

    return keys.map((k) => byKey.get(k));
  }
}
