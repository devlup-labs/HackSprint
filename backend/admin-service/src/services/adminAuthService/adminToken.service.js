import jwt from "jsonwebtoken";

export class AdminTokenService {
  generateAccessToken(admin) {
    return jwt.sign(
      {
        id: admin._id,
        role: admin.role,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );
  }

  generateRefreshToken(admin) {
    return jwt.sign(
      {
        id: admin._id,
        type: "refresh",
        svc: "admin",
      },
      process.env.SECRET_KEY,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRE_TIME || "30d",
      }
    );
  }

  verifyRefreshToken(token) {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (decoded.type !== "refresh" || decoded.svc !== "admin") {
      throw new Error("Not a valid refresh token");
    }

    return decoded;
  }

  decodeIgnoringExpiry(token) {
    return jwt.verify(token, process.env.SECRET_KEY, { ignoreExpiration: true });
  }
}

export default new AdminTokenService();
