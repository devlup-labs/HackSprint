import bcrypt from "bcryptjs";
import userRepository from "../repositories/user.repository.js";
import tokenService from "./token.service.js";
import { addEmailJob } from "../jobs/email.job.js";
import { sha256 } from "../utils/hash.utils.js";

export class AuthService {
  async signup({ email, password, name }) {
    email = email.toLowerCase().trim();

    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      if (!existingUser.isVerified) {
        const verifyToken = tokenService.generateVerificationToken(
          existingUser._id
        );

        await addEmailJob({
          type: "verification",
          user: {
            id: existingUser._id,
            email: existingUser.email,
            name: existingUser.name,
          },
          token: verifyToken,
        });

        return {
          statusCode: 200,
          success: true,
          message: "Verification email sent again.",
        };
      }

      return {
        statusCode: 409,
        success: false,
        message: "Account already exist",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await userRepository.create({
      email,
      password: hashedPassword,
      name,
      isVerified: false,
    });

    const verifyToken = tokenService.generateVerificationToken(newUser._id);

    await addEmailJob({
      type: "verification",
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      },
      token: verifyToken,
    });

    return {
      statusCode: 201,
      success: true,
      message: "Signup successful. Please verify your email.",
    };
  }

  async login({ email, password }) {
    email = email.toLowerCase().trim();

    const user = await userRepository.findByEmailWithPassword(email);

    const errorMsg = "Authentication failed! Email or password is wrong";

    if (!user) {
      return {
        statusCode: 401,
        success: false,
        message: errorMsg,
      };
    }

    if (user.provider && user.provider !== "local") {
      return {
        statusCode: 400,
        success: false,
        message: `This email is registered using ${user.provider}. Please login with ${user.provider}.`,
      };
    }

    if (!user.password) {
      return {
        statusCode: 400,
        success: false,
        message: "Password login not available for this account",
      };
    }

    const isPasswordEqual = await bcrypt.compare(password, user.password);

    if (!isPasswordEqual) {
      return {
        statusCode: 401,
        success: false,
        message: errorMsg,
      };
    }

    if (!user.isVerified) {
      return {
        statusCode: 403,
        success: false,
        message: "Please verify your email first",
      };
    }

    const jwtToken = tokenService.generateAccessToken(user);
    const refreshToken = tokenService.generateRefreshToken(user);

    await userRepository.setRefreshTokenHash(user._id, sha256(refreshToken));
    await userRepository.updateLastLogin(user._id);

    return {
      statusCode: 200,
      success: true,
      message: "User logged in successfully",
      token: jwtToken,
      refreshToken,
      email: user.email,
      name: user.name,
    };
  }

  async verifyEmail(token) {
    if (!token) {
      return {
        statusCode: 400,
        success: false,
        message: "Token missing",
      };
    }

    let decoded;

    try {
      decoded = tokenService.verifyToken(token);
    } catch {
      return {
        statusCode: 400,
        success: false,
        message: "Invalid or expired token",
      };
    }

    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      return {
        statusCode: 400,
        success: false,
        message: "Invalid token",
      };
    }

    if (user.isVerified) {
      return {
        statusCode: 200,
        success: true,
        message: "User already verified",
      };
    }

    await userRepository.markVerified(user);

    await addEmailJob({
      type: "welcome",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: "User verified successfully",
    };
  }

  async sendResetLink(email) {
    email = email.toLowerCase().trim();

    const user = await userRepository.findByEmail(email);

    if (!user) {
      return {
        statusCode: 200,
        success: false,
        message: "A reset link has been sent to requested email",
      };
    }

    if (user.provider && user.provider !== "local") {
      return {
        statusCode: 400,
        success: false,
        message: `This account uses ${user.provider} login. Please login using ${user.provider}.`,
      };
    }

    if (!user.password) {
      return {
        statusCode: 400,
        success: false,
        message: "Password reset not available for this account.",
      };
    }

    const resetToken = tokenService.generateResetToken(user._id);

    await addEmailJob({
      type: "reset-password",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token: resetToken,
    });

    return {
      statusCode: 200,
      success: true,
      message: "If an account exists, a reset link has been sent.",
    };
  }

  async resetPassword(token, newPassword) {
    if (!token) {
      return {
        statusCode: 400,
        success: false,
        message: "Token missing",
      };
    }

    let decoded;

    try {
      decoded = tokenService.verifyToken(token);
    } catch {
      return {
        statusCode: 400,
        success: false,
        message: "Invalid or expired token",
      };
    }

    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      return {
        statusCode: 404,
        success: false,
        message: "User not found",
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await userRepository.updatePassword(user, hashedPassword);

    await addEmailJob({
      type: "password-reset-success",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: "Password reset successful",
    };
  }

  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      return {
        statusCode: 401,
        success: false,
        message: "No refresh token provided",
      };
    }

    let decoded;

    try {
      decoded = tokenService.verifyRefreshToken(refreshToken);
    } catch {
      return {
        statusCode: 401,
        success: false,
        message: "Invalid or expired refresh token",
      };
    }

    const user = await userRepository.findByIdWithRefreshHash(decoded._id);

    if (!user || !user.refreshTokenHash || sha256(refreshToken) !== user.refreshTokenHash) {
      if (user) {
        await userRepository.clearRefreshTokenHash(user._id);
      }

      return {
        statusCode: 401,
        success: false,
        message: "Invalid refresh token",
      };
    }

    const newAccessToken = tokenService.generateAccessToken(user);
    const newRefreshToken = tokenService.generateRefreshToken(user);

    await userRepository.setRefreshTokenHash(user._id, sha256(newRefreshToken));

    return {
      statusCode: 200,
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken) {
    if (refreshToken) {
      try {
        const decoded = tokenService.decodeIgnoringExpiry(refreshToken);

        await userRepository.clearRefreshTokenHash(decoded._id);
      } catch {
        // malformed/tampered cookie — nothing to clear server-side
      }
    }

    return {
      statusCode: 200,
      success: true,
      message: "Logged out",
    };
  }
}

export default new AuthService();
