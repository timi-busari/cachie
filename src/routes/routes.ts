import express, { Request, Response } from "express";
const router = express.Router();

import cacheService from "../services/cache";
import rateLimiter from "../middleware/rate-limiter";
import {
  analyseSchema,
  searchSchema,
  validateRequest,
} from "../middleware/validation";

router.post(
  "/search",
  rateLimiter.middleware,
  validateRequest(searchSchema),
  (req: Request, res: Response) => {
    const response = cacheService.sayHello();
    res.status(200).json(response);
  }
);

router.get(
  "/analyse",
  rateLimiter.middleware,
  validateRequest(analyseSchema),
  (req: Request, res: Response) => {
    const response = cacheService.sayHello();
    res.status(200).json(response);
  }
);

export default router;
