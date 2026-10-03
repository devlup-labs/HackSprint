const isProd = process.env.NODE_ENV === "production";

export const REFRESH_COOKIE_NAME = "refreshToken";

const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

export const setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions());
};

export const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { ...refreshCookieOptions(), maxAge: undefined });
};
