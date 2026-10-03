import client from "./client";
import { API } from "./endpoints";

export const SkillsAPI = {
  search(q, limit = 8, signal) {
    return client.get(`${API.SKILLS}/search`, { params: { q, limit }, signal });
  },
};
