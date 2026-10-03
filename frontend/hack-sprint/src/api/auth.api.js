import client from "./client";
import { API } from "./endpoints";

export const AuthAPI = {
  signup(data) {
    return client.post(`${API.AUTH}/signup`, data);
  },
  login(data) {
    return client.post(`${API.AUTH}/login`, data);
  },
  googleLogin(code) {
    return client.get(`${API.AUTH}/google`, { params: { code } });
  },
  // One Tap / auto sign-in: Google's signed ID token, no popup involved.
  googleOneTap(credential) {
    return client.post(`${API.AUTH}/google/one-tap`, { credential });
  },
  verifyEmail(token) {
    return client.get(`${API.AUTH}/verify-email?token=${token}`);
  },
  sendResetLink(data) {
    return client.post(`${API.AUTH}/send-reset-link`, data);
  },
  resetPassword(data) {
    return client.post(`${API.AUTH}/reset-password`, data);
  },
  refreshToken() {
    return client.post(`${API.AUTH}/refresh-token`);
  },
  logout() {
    return client.post(`${API.AUTH}/logout`);
  },
};