import jwt from "jsonwebtoken";

export const verifyUploader = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (decoded._id) {
      req.user = decoded;
      req.uploaderType = "user";

      return next();
    }

    if (decoded.id) {
      req.admin = decoded;
      req.uploaderType = "admin";

      return next();
    }

    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token verification failed",
    });
  }
};
