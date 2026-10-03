import client from "./client";
import { API } from "./endpoints";

export const MessagesAPI = {
  list(friendId, page = 1, limit = 50) {
    return client.get(`${API.MESSAGES}/${friendId}`, { params: { page, limit } });
  },

  // clientId makes a retry safe: the server returns the original message
  // instead of saving a second copy.
  send(friendId, content, clientId) {
    return client.post(`${API.MESSAGES}/${friendId}`, { content, clientId });
  },
};
