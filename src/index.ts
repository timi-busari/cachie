import express from "express";
import { initialize } from "express-openapi";
import path from "path";
import router from "./routes/routes";

const app = express();

// Initialize express-openapi
initialize({
  app,
  apiDoc: path.join(__dirname, "routes", "openapi.yaml"),
  paths: path.join(__dirname, "routes"),
});

const PORT = 3000;

app.use(express.json());
app.use(router)


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
