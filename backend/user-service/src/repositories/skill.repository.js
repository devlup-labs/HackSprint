import SkillModel from "../models/skill.models.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export class SkillRepository {
  async count() {
    return SkillModel.estimatedDocumentCount();
  }

  // Idempotent: inserts only entries whose nameKey doesn't exist yet, never
  // touches existing ones.
  async seed(entries) {
    const ops = entries.map((e) => ({
      updateOne: {
        filter: { nameKey: e.name.toLowerCase() },
        update: { $setOnInsert: { name: e.name, nameKey: e.name.toLowerCase(), category: e.category } },
        upsert: true,
      },
    }));
    if (ops.length === 0) return;
    await SkillModel.bulkWrite(ops, { ordered: false });
  }

  // Prefix matches first (what someone typing "rea" expects at the top),
  // then anything that merely contains the text.
  async search(query, limit) {
    const safe = escapeRegex(query.toLowerCase());
    const prefix = await SkillModel.find({ nameKey: { $regex: `^${safe}` } })
      .sort({ nameKey: 1 })
      .limit(limit)
      .select("name category")
      .lean();

    if (prefix.length >= limit) return prefix;

    const prefixIds = prefix.map((s) => s._id);
    // Second tier: the text starts any later word ("rec" -> Technical
    // Recruiting) rather than appearing anywhere mid-word, which would
    // surface noise like Creativity for "rea".
    const wordStart = await SkillModel.find({
      _id: { $nin: prefixIds },
      nameKey: { $regex: `(^|[^a-z0-9])${safe}` },
    })
      .sort({ nameKey: 1 })
      .limit(limit - prefix.length)
      .select("name category")
      .lean();

    return [...prefix, ...wordStart];
  }

  async findByKeys(keys) {
    return SkillModel.find({ nameKey: { $in: keys } })
      .select("name nameKey")
      .lean();
  }
}
