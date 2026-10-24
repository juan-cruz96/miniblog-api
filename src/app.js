import express from "express";
import authorsRouter from "./routes/authors.routes.js";

const app = express();

app.use("/authors", authorsRouter);


export default app;
