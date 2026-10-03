import crypto from "crypto";

// The api-gateway verifies the access token once and forwards the caller's
// claims. They are only believed when accompanied by the shared internal
// secret, which the gateway sets and clients can't know. Returns null when the
// request didn't come through a configured gateway; callers then fall back to
// verifying the bearer token themselves.
export const gatewayClaims = (req) => {
  const secret = process.env.INTERNAL_SERVICE_SECRET;
  const sent = req.headers["x-gateway-secret"];
  const raw = req.headers["x-user-claims"];
  if (!secret || typeof sent !== "string" || typeof raw !== "string") return null;

  const a = Buffer.from(sent);
  const b = Buffer.from(secret);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  } catch {
    return null;
  }
};
