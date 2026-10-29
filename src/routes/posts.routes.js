import { Router } from "express";
import { getAllPosts , getPostById , getPostsByAuthorId , createPost , updatePost , deletePost } from "../controllers/posts.controller.js";

const postsRouter = Router();

postsRouter.get("/", getAllPosts);
postsRouter.get("/author/:authorId", getPostsByAuthorId);
postsRouter.get("/:id", getPostById);

postsRouter.post("/", createPost);

postsRouter.put("/:id", updatePost);

postsRouter.delete("/:id", deletePost);

export default postsRouter;