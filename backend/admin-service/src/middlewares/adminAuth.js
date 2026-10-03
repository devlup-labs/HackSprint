import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { gatewayClaims } from "../utils/gatewayIdentity.js";
import Admin from "../models/admin.model.js";

export const adminAuth = async (req, res, next) => {
  try {
    let decoded = gatewayClaims(req);

    if (!decoded?.id) {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError("Authentication required");
      }

      const token = authHeader.split(" ")[1];

      try {
        decoded = jwt.verify(token, process.env.SECRET_KEY);
        // A refresh token is not an access token.
        if (decoded.type === "refresh") throw new Error("refresh token");
      } catch {
        // Expired/forged tokens are a 401 (the client refreshes on that), not a 500.
        throw new UnauthorizedError("Invalid or expired token");
      }
    }

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      throw new UnauthorizedError("Admin not found");
    }

    if (!admin.isActive) {
      throw new UnauthorizedError("Account disabled");
    }

    req.admin = admin;

    next();
  } catch (error) {
    next(error);
  }
};
