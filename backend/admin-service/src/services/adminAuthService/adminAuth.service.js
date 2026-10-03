import axios from "axios";
import { oauth2client } from "../../utils/googleAuth.utils.js";
import { BadRequestError } from "../../errors/BadRequestError.js";
import { UnauthorizedError } from "../../errors/UnauthorizedError.js";
import adminTokenService from "./adminToken.service.js";
import { sha256 } from "../../utils/hash.utils.js";

export class AdminAuthService {
  constructor(adminRepository, logger, notificationClient) {
    this.adminRepository = adminRepository;

    this.logger = logger;
    this.notificationClient = notificationClient;
  }

  async googleLogin(code) {
    if (!code) {
      throw new BadRequestError("Google authorization code required");
    }

    const googleRes = await oauth2client.getToken(code);

    oauth2client.setCredentials(googleRes.tokens);

    const userRes = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${googleRes.tokens.access_token}`,
        },
      }
    );

    const { name, email, picture } = userRes.data;

    return this.signInWithGoogleProfile({ name, email, picture });
  }

  // One Tap / auto sign-in: a Google-signed ID token instead of a popup and
  // code exchange. Google's library verifies signature, audience and expiry.
  async googleOneTap(credential) {
    if (!credential || typeof credential !== "string") {
      throw new BadRequestError("Google credential required");
    }

    let payload;
    try {
      const ticket = await oauth2client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedError("Google sign-in could not be verified");
    }

    if (!payload?.email || !payload.email_verified) {
      throw new UnauthorizedError("Google account email is not verified");
    }

    return this.signInWithGoogleProfile({
      name: payload.name || payload.email.split("@")[0],
      email: payload.email,
      picture: payload.picture,
    });
  }

  async signInWithGoogleProfile({ name, email, picture }) {
    let admin = await this.adminRepository.getByEmail(email);

    if (!admin) {
      admin = await this.adminRepository.create({
        adminName: name,
        email,
        avatar: picture || "",
        role: "ADMIN",
        profileCompleted: false,
        isVerified: false,
        verificationStatus: "NOT_SUBMITTED",
      });

      this.logger.info(
        {
          adminId: admin._id,
          email,
        },
        "Admin account created"
      );

      await this.notificationClient.sendEmail({
        type: "admin-welcome",
        user: { email: admin.email, name: admin.adminName },
      });
    } else {
      admin.lastLogin = new Date();

      if (picture && !admin.avatar) {
        admin.avatar = picture;
      }

      await this.adminRepository.save(admin);
    }

    const token = adminTokenService.generateAccessToken(admin);
    const refreshToken = adminTokenService.generateRefreshToken(admin);

    await this.adminRepository.setRefreshTokenHash(admin._id, sha256(refreshToken));

    return {
      success: true,
      token,
      refreshToken,
      admin: {
        id: admin._id,
        adminName: admin.adminName,
        email: admin.email,
        avatar: admin.avatar,
        role: admin.role,
        profileCompleted: admin.profileCompleted,
        isVerified: admin.isVerified,
        verificationStatus: admin.verificationStatus,
      },
    };
  }

  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new UnauthorizedError("No refresh token provided");
    }

    let decoded;

    try {
      decoded = adminTokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const admin = await this.adminRepository.getByIdWithRefreshHash(decoded.id);

    if (!admin || !admin.refreshTokenHash || sha256(refreshToken) !== admin.refreshTokenHash) {
      if (admin) {
        await this.adminRepository.clearRefreshTokenHash(admin._id);
      }

      throw new UnauthorizedError("Invalid refresh token");
    }

    const newAccessToken = adminTokenService.generateAccessToken(admin);
    const newRefreshToken = adminTokenService.generateRefreshToken(admin);

    await this.adminRepository.setRefreshTokenHash(admin._id, sha256(newRefreshToken));

    return {
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken) {
    if (refreshToken) {
      try {
        const decoded = adminTokenService.decodeIgnoringExpiry(refreshToken);

        await this.adminRepository.clearRefreshTokenHash(decoded.id);
      } catch {
        // malformed/tampered cookie — nothing to clear server-side
      }
    }

    return {
      success: true,
      message: "Logged out",
    };
  }
}
