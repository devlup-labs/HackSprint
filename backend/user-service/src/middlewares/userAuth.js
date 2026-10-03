import { gatewayClaims } from "../utils/gatewayIdentity.js";
import tokenService from "../services/token.service.js";

export const verifyAuth = async (req, res, next) => {
  try {
    const trusted = gatewayClaims(req);
    if (trusted?._id) {
      req.user = trusted;
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized! Please log in again.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = tokenService.verifyToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
