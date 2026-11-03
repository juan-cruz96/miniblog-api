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

app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "El cuerpo de la petición debe ser un JSON válido",
    });
  }

  next(error);
});

export default app;
