import express, { Request, Response } from "express";
const router = express.Router();

import cacheService from "../services/cache";

router.post("/search", (req: Request, res: Response) => {
  const response = cacheService.sayHello();
  res.status(200).json(response);
});

export default router;
