import client from "./client";
import { API } from "./endpoints";

export const ChatbotAPI = {
  sendMessage(message, history = []) {
    return client.post(`${API.CHATBOT}/chat`, { message, history });
  },

  // Streams the reply over server-sent events. axios can't expose a response
  // body incrementally in the browser, so this uses fetch. `onDelta` is called
  // with each text chunk; the promise resolves when the reply is complete and
  // rejects with an Error carrying `.status` on failure.
  async streamMessage(message, history = [], { onDelta, signal } = {}) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}${API.CHATBOT}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
      signal,
    });

    if (!res.ok || !res.body) {
      const err = new Error("Chat request failed");
      err.status = res.status;
      throw err;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finished = false;

    while (!finished) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const event = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const line = event.split("\n").find((l) => l.startsWith("data: "));
        if (!line) continue;
        let payload;
        try { payload = JSON.parse(line.slice(6)); } catch { continue; }
        if (payload.error) throw new Error(payload.error);
        if (payload.delta) onDelta?.(payload.delta);
        if (payload.done) finished = true;
      }
    }
  },
};
