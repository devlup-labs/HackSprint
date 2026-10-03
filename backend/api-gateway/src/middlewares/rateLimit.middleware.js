import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { env } from "../config/env.js";
import { redisClient } from "../config/redis.js";

const isProd = env.NODE_ENV === "production";

const tooMany = {
  success: false,
  message: "Too many requests, please try again later.",
};

// Counters live in Redis when it's configured, so limits hold across several
// gateway instances. passOnStoreError fails open: if Redis drops, requests
// are let through rather than the whole API going down.
const build = (prefix, options) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    message: tooMany,
    passOnStoreError: true,
    ...(redisClient?.isReady && {
      store: new RedisStore({
        prefix: `rl:gw:${prefix}:`,
        sendCommand: (...args) => redisClient.sendCommand(args),
      }),
    }),
    ...options,
  });

const callerKey = (req) => (req.gatewayUser ? `u:${req.gatewayUser.id}` : ipKeyGenerator(req.ip));

// Built after Redis has had its chance to connect: the Redis store talks to
// Redis as soon as it is constructed.
export const createLimiters = () => ({
  // Per connection, whoever is behind it.
  ipLimiter: build("ip", {
    windowMs: 15 * 60 * 1000,
    max: isProd ? 500 : 2000,
  }),

  // Per signed-in account, so one user can't hog the API from many IPs and
  // people behind a shared network aren't throttled for each other.
  userLimiter: build("user", {
    windowMs: 60 * 1000,
    max: isProd ? 240 : 2000,
    skip: (req) => !req.gatewayUser,
    keyGenerator: callerKey,
  }),

  // Uploads are the most expensive calls the gateway proxies.
  mediaLimiter: build("media", {
    windowMs: 60 * 1000,
    max: isProd ? 60 : 600,
    keyGenerator: callerKey,
  }),
});
