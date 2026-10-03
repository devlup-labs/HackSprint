import client from "./client";
import { API } from "./endpoints";

export const JudgeAPI = {
  assignJudge(hackathonId, data) {
    return client.post(
      `${API.JUDGE}/hackathons/${hackathonId}/judges`,
      data
    );
  },

  getHackathonJudges(hackathonId) {
    return client.get(
      `${API.JUDGE}/hackathons/${hackathonId}/judges`
    );
  },

  removeJudge(hackathonId, judgeId) {
    return client.delete(
      `${API.JUDGE}/hackathons/${hackathonId}/judges/${judgeId}`
    );
  },

  getAssignedHackathons(config = {}) {
    return client.get(
      `${API.JUDGE}/judges/assigned-hackathons`,
      config
    );
  },

  getMyInvitations(config = {}) {
    return client.get(`${API.JUDGE}/judges/invitations`, config);
  },

  acceptInvitation(invitationId) {
    return client.post(`${API.JUDGE}/judges/invitations/${invitationId}/accept`);
  },

  declineInvitation(invitationId) {
    return client.post(`${API.JUDGE}/judges/invitations/${invitationId}/decline`);
  },

  reviewSubmission(submissionId, data) {
    return client.post(
      `${API.JUDGE}/judges/submissions/${submissionId}/review`,
      data
    );
  },
};