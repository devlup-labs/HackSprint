import { generateReply, streamReply } from "../services/gemini.service.js";
import { BadRequestError } from "../errors/BadRequestError.js";

export const chat = async (req, res, next) => {
  try {
    const { message, history } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      throw new BadRequestError("Kindly provide a message");
    }

    const reply = await generateReply(message.trim(), history);

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    next(error);
  }
};

// Server-sent events: each Gemini chunk is forwarded as it arrives so the
// widget can render the answer while it is still being written.
export const chatStream = async (req, res, next) => {
  try {
    const { message, history } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      throw new BadRequestError("Kindly provide a message");
    }

    const stream = streamReply(message.trim(), history);

    // Pull the first chunk before committing to a 200, so a failed model call
    // still returns a normal JSON error instead of an empty event stream.
    const first = await stream.next();

    res.status(200).set({
      "Content-Type": "text/event-stream; charset=utf-8",
      // no-transform stops compression middleware (here and at the gateway)
      // from buffering the stream; X-Accel-Buffering does the same for nginx.
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.flushHeaders();

    let closed = false;
    res.on("close", () => {
      closed = true;
    });
    const send = (payload) => !closed && res.write(`data: ${JSON.stringify(payload)}\n\n`);

    try {
      if (!first.done) send({ delta: first.value });
      for await (const delta of stream) {
        if (closed) break;
        send({ delta });
      }
      send({ done: true });
    } catch {
      send({ error: "Chat model request failed" });
    }
    res.end();
  } catch (error) {
    next(error);
  }
};
