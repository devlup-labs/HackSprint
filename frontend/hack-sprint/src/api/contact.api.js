import client from "./client";
import { API } from "./endpoints";

export const ContactAPI = {
  feedback(data) {
    return client.post(`${API.ADMIN_PUBLIC}/feedback`, data);
  },

  send(data) {
    return client.post(`${API.ADMIN_PUBLIC}/contact`, data);
  },
};
