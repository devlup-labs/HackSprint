import * as Sentry from "@sentry/node";

// Entirely opt-in: with no SENTRY_DSN set, this is a no-op and every
// Sentry.* call elsewhere in the service (imported from here) silently does
// nothing — safe to ship before a Sentry project/DSN exists, and to run in
// dev without one.
export const initSentry = () => {
  if (!process.env.SENTRY_DSN) return;

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 0.1,
  });
};

export { Sentry };
