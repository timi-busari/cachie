import { Request, Response, NextFunction } from "express";
import logger from "../logger";

interface RateLimitData {
  count: number;
  lastReset: number;
}

class RateLimiter {
  private rateLimit: Map<string, RateLimitData>;
  private requestlimit: number;
  private resetInterval: number;

  constructor() {
    this.rateLimit = new Map<string, RateLimitData>();
    this.requestlimit = parseInt(process.env.REQUEST_LIMIT || "10", 5); // Default to 10 requests
    this.resetInterval = parseInt(
      process.env.RATE_LIMIT_RESET_INTERVAL || "60000",
      10
    ); // default to 60 seconds

    logger.info(
      `RateLimiter initialized with limit: ${this.requestlimit}, resetInterval: ${this.resetInterval}ms`
    );
  }
  middleware = (req: Request, res: Response, next: NextFunction): void => {
    const clientId = req.body?.client_id as string;

    const now = Date.now();

    const clientRateData = this.rateLimit.get(clientId) || {
      count: 0,
      lastReset: now,
    };

    // Reset every at every resetInterval
    if (now - clientRateData.lastReset > this.resetInterval) {
      clientRateData.count = 0;
      clientRateData.lastReset = now;
    }

    // Enforce the rate limit
    if (clientRateData.count >= this.requestlimit) {
      logger.error("Rate limit exceeded");
      res.status(429).json({ error: "Rate limit exceeded" });
      return;
    }

    clientRateData.count++;
    this.rateLimit.set(clientId, clientRateData);

    next();
  };
}

export default new RateLimiter();
