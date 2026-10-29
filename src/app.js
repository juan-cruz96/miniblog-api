import express from "express";
import authorsRouter from "./routes/authors.routes.js";
import postsRouter from "./routes/posts.routes.js";

const app = express();

app.use(express.json());

app.use("/authors", authorsRouter);

app.use("/posts", postsRouter);


export default app;
