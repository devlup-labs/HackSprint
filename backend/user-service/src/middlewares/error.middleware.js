import { logger } from "../utils/logger.js";
import { Sentry } from "../config/sentry.js";

export const errorHandler = (
  err,
  req,
  res,
  next
) => {

  logger.error(
    {
      err,
      method: req.method,
      url: req.originalUrl,
    },
    "Unhandled error"
  );

  const statusCode =
    err.statusCode || 500;

  if (statusCode >= 500) {
    Sentry.captureException(err);
  }

  return res.status(statusCode).json({
    success: false,

    message:
      statusCode === 500
        ? "Internal Server Error"
        : err.message,

    ...(process.env.NODE_ENV !==
      "production" && {
      stack: err.stack,
    }),
  });
};