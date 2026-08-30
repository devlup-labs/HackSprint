import client from "./client";
import { API } from "./endpoints";

export const PeopleAPI = {
  getCluster() {
    return client.get(`${API.PROFILE}/people`);
  },

  sendMessage(userId, message) {
    return client.post(`${API.PROFILE}/id/${userId}/contact`, { message });
  },
};
