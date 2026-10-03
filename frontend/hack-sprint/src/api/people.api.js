import client from "./client";
import { API } from "./endpoints";

export const PeopleAPI = {
  search(q, signal) {
    return client.get(`${API.PROFILE}/people`, { params: { q, limit: 6 }, signal });
  },
  campus() {
    return client.get(`${API.PROFILE}/people/campus`);
  },
  district(districtId, page = 1, limit = 5) {
    return client.get(`${API.PROFILE}/people/district/${districtId}`, { params: { page, limit } });
  },
};
