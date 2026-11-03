import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import { readFileSync } from "node:fs";

import authorsRouter from "./routes/authors.routes.js";
import postsRouter from "./routes/posts.routes.js";

const app = express();

const openapiFile = readFileSync(
  new URL("../docs/openapi.yaml", import.meta.url),
  "utf8"
);

const openapiDocument = YAML.parse(openapiFile);

app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));

app.use("/authors", authorsRouter);
app.use("/posts", postsRouter);

export default app;
