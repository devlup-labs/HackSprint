import client from "./client";
import { API } from "./endpoints";

// Several components on the same page (Navbar, HeroSection, ...) each fetch
// the logged-in user's profile independently on mount. Sharing one in-flight
// request instead of firing a duplicate collapses those into a single call.
let myProfileRequest = null;

export const ProfileAPI = {
  getMyProfile() {
    if (!myProfileRequest) {
      myProfileRequest = client
        .get(`${API.PROFILE}/me`)
        .finally(() => {
          myProfileRequest = null;
        });
    }
    return myProfileRequest;
  },
  updateProfile(data) {
    return client.patch(`${API.PROFILE}/me`, data);
  },
  addEducation(payload) {
    return client.post(`${API.PROFILE}/me/education`, payload);
  },
  updateEducation(id, payload) {
    return client.patch(`${API.PROFILE}/me/education/${id}`, payload);
  },
  removeEducation(id) {
    return client.delete(`${API.PROFILE}/me/education/${id}`);
  },
  addConnectedApp(payload) {
    return client.post(`${API.PROFILE}/me/apps`, payload);
  },
  updateConnectedApp(id, payload) {
    return client.patch(`${API.PROFILE}/me/apps/${id}`, payload);
  },
  removeConnectedApp(id) {
    return client.delete(`${API.PROFILE}/me/apps/${id}`);
  },
  updateSkills(skills) {
    return client.put(`${API.PROFILE}/me/skills`, { skills });
  },
  checkUserName(userName) {
    return client.get(`${API.PROFILE}/check-username/${encodeURIComponent(userName)}`);
  },
  updateAvatar(image) {
    return client.patch(`${API.PROFILE}/me/avatar`, { image });
  },
};
