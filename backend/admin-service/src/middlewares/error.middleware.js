import { logger } from "../utils/logger.js";

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
      requestId: req.requestId
    },
    "Unhandled error"
  );

  const statusCode =
    err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,

    message:
      statusCode === 500
        ? "Internal Server Error"
        : err.message,

    // Stable machine-readable code (e.g. PROFILE_INCOMPLETE) + structured
    // detail for errors that define them; string-only so Mongo's numeric
    // driver codes never leak through.
    ...(typeof err.code === "string" && { code: err.code }),
    ...(err.details && { details: err.details }),

    ...(process.env.NODE_ENV !==
      "production" && {
      stack: err.stack,
    }),
  });
};