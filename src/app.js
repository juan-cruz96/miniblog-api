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

// Responde cuando ninguna ruta coincide con la petición.
app.use((req, res) => {
  return res.status(404).json({
    error: "Ruta no encontrada",
  });
});

// Maneja los errores que llegan a Express.
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "El cuerpo de la petición debe ser un JSON válido",
    });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      error: "El cuerpo de la petición es demasiado grande",
    });
  }

  console.error("Error inesperado:", error.message);

  return res.status(500).json({
    error: "Error interno del servidor",
  });
});

export default app;
