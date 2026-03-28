import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const userAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer "); // Bearer <token>

  if (!token) {
    return res.status(401).json({
      message: "Not Authorized! Please log in again.",
      success: false,
    });
  }

  const jsonToken = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(jsonToken, process.env.SECRET_KEY);

    if (decoded.email) {
      req.email = decoded.email;
      next();
    } else {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }
  } catch (err) {
    return res.status(401).json({
      message: "Token verification failed",
      success: false,
    });
  }
};

const verifyAuth = async (req, res, next) => {
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

    // if (decoded._id) {
    //   // For GET requests, req.body might be undefined, so set it on req.user instead
    //   req.user = decoded;
    //   req.userId = decoded._id;
    //   // Also set on req.body for backward compatibility with POST requests
    //   if (!req.body) req.body = {};
    //   req.body.userId = decoded._id;
    //   next();
    // } else {
    //   return res.status(401).json({
    //     message: "Not Authorized! Signup Again",
    //     success: false,
    //   });
    // }
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

export { verifyAuth, userAuth };
