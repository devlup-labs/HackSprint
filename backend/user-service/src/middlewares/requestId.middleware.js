export const requestIdMiddleware = (req, res, next) => {
    req.requestId = req.headers["x-request-id"];

    next();
};