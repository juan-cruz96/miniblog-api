import { Router } from "express";
import { getAllAuthors, getAuthorById , createAuthor } from "../controllers/authors.controller.js";
import { validateId } from "../middlewares/validateId.js";

const authorsRouter = Router();

authorsRouter.get("/", getAllAuthors);
authorsRouter.get("/:id", validateId, getAuthorById);

authorsRouter.post("/", createAuthor);

export default authorsRouter;

