import express from "express";
import { initialize } from "express-openapi";
import path from "path";
import router from "./routes/cachie.route";
import "dotenv/config";
import logger from "./logger";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import yaml from "js-yaml";

const app = express();

// Load OpenAPI spec using js-yaml and type assert it as OpenAPIV3.Document
const apiSpec = yaml.load(
  fs.readFileSync(path.join(__dirname, "routes", "openapi.yaml"), "utf8")
) as any;

// Initialize express-openapi
initialize({
  app,
  apiDoc: apiSpec,
  paths: path.join(__dirname, "routes"),
});

// Serve Swagger UI at '/api-docs'
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(apiSpec));

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(router);

app.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);
});
