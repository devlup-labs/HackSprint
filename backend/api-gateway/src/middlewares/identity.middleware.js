import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const TRUSTED_HEADERS = ["x-gateway-secret", "x-user-claims", "x-user-type"];

// Verifies the access token once, here, and tells the services who the caller
// is. Services accept these headers only together with the shared internal
// secret, so a client can't forge them: they are stripped from every incoming
// request before anything is set.
//
// Never rejects. A missing, expired or malformed token just means "no
// identity" and the service answers 401 itself, so public routes, refresh and
// logout behave exactly as before.
export const gatewayIdentity = (req, res, next) => {
  for (const h of TRUSTED_HEADERS) delete req.headers[h];
  req.gatewayUser = null;

  if (!env.SECRET_KEY || !env.INTERNAL_SERVICE_SECRET) return next();

  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return next();

  try {
    const claims = jwt.verify(auth.slice(7), env.SECRET_KEY);
    // Refresh tokens are not access tokens.
    if (claims.type === "refresh") return next();

    const type = claims._id ? "student" : claims.id ? "admin" : null;
    if (!type) return next();

    req.gatewayUser = { id: String(claims._id || claims.id), type };
    req.headers["x-gateway-secret"] = env.INTERNAL_SERVICE_SECRET;
    req.headers["x-user-type"] = type;
    req.headers["x-user-claims"] = Buffer.from(JSON.stringify(claims)).toString("base64url");
  } catch {
    // invalid/expired: fall through as anonymous
  }
  next();
};
