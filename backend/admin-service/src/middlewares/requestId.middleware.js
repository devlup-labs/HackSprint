import crypto from "crypto";

export const requestIdMiddleware = (req, res, next) => {
  req.requestId =
    req.headers["x-request-id"] || crypto.randomUUID();
    
  res.setHeader("x-request-id", req.requestId);

  next();
};