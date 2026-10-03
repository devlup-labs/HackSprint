import client from "./client";
import { API } from "./endpoints";

export const DailyAPI = {
  getToday() {
    return client.get(`${API.DAILY}/today`);
  },
  answer(questionId, selectedIndex) {
    return client.post(`${API.DAILY}/answer`, { questionId, selectedIndex });
  },
  getActivity(days = 365) {
    return client.get(`${API.DAILY}/activity`, { params: { days } });
  },
};
