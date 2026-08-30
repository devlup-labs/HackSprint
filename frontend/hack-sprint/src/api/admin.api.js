import client from "./client";
import { API } from "./endpoints";

export const AdminAPI = {
  getProfile(config = {}) {
    return client.get(`${API.ADMIN}/profile`, config);
  },

  updateProfile(data) {
    return client.patch(
      `${API.ADMIN}/profile`,
      data
    );
  },

  submitVerificationRequest(data) {
    return client.post(
      `${API.ADMIN}/verification-request`,
      data
    );
  },

  getPendingVerificationRequests(config = {}) {
    return client.get(
      `${API.ADMIN}/verification-requests`,
      config
    );
  },

  approveVerification(adminId) {
    return client.post(
      `${API.ADMIN}/admins/${adminId}/approve`
    );
  },

  rejectVerification(adminId, data) {
    return client.post(
      `${API.ADMIN}/admins/${adminId}/reject`,
      data
    );
  },

  getAllAdmins(config = {}) {
    return client.get(`${API.ADMIN}/admins`, config);
  },

  deleteAdmin(adminId) {
    return client.delete(`${API.ADMIN}/admins/${adminId}`);
  },

  lookupAdminByEmail(email) {
    return client.get(`${API.ADMIN}/admins/lookup`, { params: { email } });
  },
};