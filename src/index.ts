import express from "express";
import { initialize } from "express-openapi";
import path from "path";
import router from "./routes/routes";
import "dotenv/config";
import logger from "./logger";

const app = express();

// Initialize express-openapi
initialize({
  app,
  apiDoc: path.join(__dirname, "routes", "openapi.yaml"),
  paths: path.join(__dirname, "routes"),
});

const port = process.env.PORT;

app.use(express.json());
app.use(router);

app.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);
});
