import client from "./client";
import { API } from "./endpoints";

export const AdminAuthAPI = {
  googleLogin(code) {
    return client.get(`${API.ADMIN_AUTH}/google`, { params: { code } });
  },
  googleOneTap(credential) {
    return client.post(`${API.ADMIN_AUTH}/google/one-tap`, { credential });
  },
  refreshToken() {
    return client.post(`${API.ADMIN_AUTH}/refresh-token`, {}, { adminRequest: true });
  },
  logout() {
    return client.post(`${API.ADMIN_AUTH}/logout`, {}, { adminRequest: true });
  },
};
