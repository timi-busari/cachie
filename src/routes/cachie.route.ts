import express, { Request, Response } from "express";
import cachieService from "../services/cachie.service";
import rateLimiter from "../middlewares/rate-limiter.middleware";
import {
  analyseSchema,
  searchSchema,
  validateRequest,
} from "../middlewares/validation.middleware";
import { MatchType } from "../interfaces/cachie.interface";
import logger from "../utils/logger.util";

const router = express.Router();

router.post(
  "/search",
  rateLimiter.middleware,
  validateRequest(searchSchema),
  (req: Request, res: Response) => {
    const { search_query, client_id, session_id } = req.body;

    logger.info(
      `POST /search - Client ID: ${client_id}, Session ID: ${session_id}, Search Query: ${search_query}`
    );

    try {
      const response = cachieService.recordSearch({
        clientId: client_id,
        searchQuery: search_query,
        sessionId: session_id,
      });

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`POST /search - Error: ${error.message}`);
      res
        .status(500)
        .json({ error: "An error occurred while processing the search" });
    }
  }
);

router.get(
  "/analyse",
  rateLimiter.middleware,
  validateRequest(analyseSchema),
  (req: Request, res: Response) => {
    const { analysis_token, match_type, include_stats } = req.query;

    logger.info(
      `GET /analyse - Analysis Token: ${analysis_token}, Match Type: ${match_type}, Include Stats: ${include_stats}`
    );

    try {
      const response = cachieService.analyzeToken({
        analysisToken: analysis_token as string,
        includeStats: include_stats === "true",
        matchType: match_type as MatchType,
      });

      res.status(200).json(response);
    } catch (error: any) {
      logger.error(`GET /analyse - Error: ${error.message}`);
      res
        .status(500)
        .json({ error: "An error occurred while analyzing the token" });
    }
  }
);

export default router;
