import { Router } from "express";
import { getAllAuthors, getAuthorById , createAuthor , updateAuthor , deleteAuthor } from "../controllers/authors.controller.js";
import { validateId } from "../middlewares/validateId.js";

const authorsRouter = Router();

authorsRouter.get("/", getAllAuthors);
authorsRouter.get("/:id", validateId, getAuthorById);

authorsRouter.post("/", createAuthor);

authorsRouter.put("/:id", validateId, updateAuthor);

authorsRouter.delete("/:id", validateId, deleteAuthor);

export default authorsRouter;

