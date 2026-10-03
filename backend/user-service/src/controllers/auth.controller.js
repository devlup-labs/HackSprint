import dotenv from "dotenv";
import { env } from "../config/env.js";
import authService from "../services/auth.service.js";
import oauthService from "../services/oauth.service.js";
import { setRefreshCookie, clearRefreshCookie } from "../utils/cookie.utils.js";
dotenv.config();

const sendAuthResult = (res, result) => {
  const { refreshToken, ...body } = result;

  if (refreshToken) {
    setRefreshCookie(res, refreshToken);
  }

  return res.status(result.statusCode).json(body);
};

export const signup = async (req, res, next) => {
  try {
    const result = await authService.signup(req.body);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const result = await authService.verifyEmail(req.query.token);

    if (result.success) {
      return res.redirect(`${env.FRONTEND_URL}/?verified=success`);
    }

    return res.redirect(`${env.FRONTEND_URL}/?verified=failed`);
  } catch (error) {
    next(error);
  }
};

export const sendResetLink = async (req, res, next) => {
  try {
    const result = await authService.sendResetLink(req.body.email);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(
      req.body.token,
      req.body.newPassword
    );

    return res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    return sendAuthResult(res, result);
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await oauthService.googleLogin(
        req.query.code
      );

    return sendAuthResult(res, result);
  } catch (error) {
    next(error);
  }
};

export const googleOneTap = async (req, res, next) => {
  try {
    const result = await oauthService.googleOneTap(req.body?.credential);

    return sendAuthResult(res, result);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const result = await authService.refreshAccessToken(req.cookies?.refreshToken);

    if (!result.success) {
      clearRefreshCookie(res);
    }

    return sendAuthResult(res, result);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const result = await authService.logout(req.cookies?.refreshToken);

    clearRefreshCookie(res);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    next(error);
  }
};