import client from "prom-client";

export const register = new client.Registry();

client.collectDefaultMetrics({
  register,
});

export const httpRequests = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP Requests",
  labelNames: ["method", "route", "status"],
});

export const httpDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP Requests",
  labelNames: ["method", "route", "status"],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5],
});

register.registerMetric(httpRequests);
register.registerMetric(httpDuration);

export const metricsMiddleware = (req, res, next) => {
  const start = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(start);

    const duration = diff[0] + diff[1] / 1e9;

    httpRequests.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode,
    });

    httpDuration.observe(
      {
        method: req.method,
        route: req.route?.path || req.path,
        status: res.statusCode,
      },
      duration
    );
  });

  next();
};

export const metricsHandler = async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
};
