import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { gatewayClaims } from "../utils/gatewayIdentity.js";

dotenv.config();

const verifyAuth = async (req, res, next) => {
  const trusted = gatewayClaims(req);
  if (trusted?._id) {
    req.user = trusted;
    return next();
  }

  const authHeader = req.headers.authorization;
  const verifyToken = authHeader && authHeader.split(" ")[1]; // Format: Bearer <token>

  if (!verifyToken) {
    return res.status(401).json({
      message: "Not Authorized! Signup Again",
      success: false,
    });
  }

  try {
    const decoded = jwt.verify(verifyToken, process.env.SECRET_KEY);

    if (!decoded._id) {
      return res.status(401).json({
        message: "Not Authorized! Signup Again",
        success: false,
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      message: err.message || "Token invalid",
      success: false,
    });
  }
};

export { verifyAuth };
