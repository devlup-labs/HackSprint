import client from "./client";
import { API } from "./endpoints";

export const ChatbotAPI = {
  sendMessage(message, history = []) {
    return client.post(`${API.CHATBOT}/chat`, { message, history });
  },
};
