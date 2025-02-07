import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import logger from "../utils/logger.util";

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(
      req.method === "POST" ? req.body : req.query
    );

    if (error) {
      logger.warn(`Validation failed: ${error.details[0].message}`);
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    logger.info(`Validation passed for ${req.method} request`);
    next();
  };
};

// Validation schemas
export const searchSchema = Joi.object({
  search_query: Joi.string().required(),
  client_id: Joi.string().required(),
  session_id: Joi.string().required(),
});

export const analyseSchema = Joi.object({
  analysis_token: Joi.string().required(),
  match_type: Joi.string().valid("exact", "fuzzy").default("exact"),
  include_stats: Joi.boolean().default(false),
});
