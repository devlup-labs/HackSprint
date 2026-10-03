import { adminAuthService } from "../services/adminAuthService/adminAuth.service.instance.js";
import { setRefreshCookie, clearRefreshCookie } from "../utils/cookie.utils.js";

const sendAuthResult = (res, result) => {
  const { refreshToken, ...body } = result;

  if (refreshToken) {
    setRefreshCookie(res, refreshToken);
  }

  return res.status(200).json(body);
};

export const adminGoogleLogin = async (req, res, next) => {
  try {
    const result = await adminAuthService.googleLogin(req.query.code);

    return sendAuthResult(res, result);
  } catch (error) {
    next(error);
  }
};

export const adminGoogleOneTap = async (req, res, next) => {
  try {
    const result = await adminAuthService.googleOneTap(req.body?.credential);

    return sendAuthResult(res, result);
  } catch (error) {
    next(error);
  }
};

export const adminRefreshToken = async (req, res, next) => {
  try {
    const result = await adminAuthService.refreshAccessToken(
      req.cookies?.adminRefreshToken
    );

    return sendAuthResult(res, result);
  } catch (error) {
    clearRefreshCookie(res);
    next(error);
  }
};

export const adminLogout = async (req, res, next) => {
  try {
    const result = await adminAuthService.logout(req.cookies?.adminRefreshToken);

    clearRefreshCookie(res);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
