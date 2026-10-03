import client from "./client";
import { API } from "./endpoints";

export const ConnectionsAPI = {
  sendRequest(userId, message) {
    return client.post(`${API.CONNECTIONS}/${userId}/request`, { message });
  },

  accept(connectionId, message) {
    return client.post(`${API.CONNECTIONS}/${connectionId}/accept`, { message });
  },

  decline(connectionId) {
    return client.post(`${API.CONNECTIONS}/${connectionId}/decline`);
  },

  statuses(ids) {
    return client.get(`${API.CONNECTIONS}/statuses`, { params: { ids: ids.join(",") } });
  },

  listFriends() {
    return client.get(API.CONNECTIONS);
  },
};
