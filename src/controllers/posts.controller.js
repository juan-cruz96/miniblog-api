import { findAllPosts , findPostById , findPostsByAuthorId , insertPost , updatePostById , deletePostById } from "../services/posts.service.js";

import { findAuthorById } from "../services/authors.service.js";

export const getAllPosts = async (req, res) => {
  try {
    const posts = await findAllPosts();
    return res.status(200).json(posts);
  } catch (error) {
    console.error("Error al obtener posts:", error.message);
    return res.status(500).json({
      error: "No se pudieron obtener los posts",
    });
  }
};

export const getPostById = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0 || id > 2147483647) {
    return res.status(400).json({
      error: "El ID debe ser un entero positivo válido",
    });
  }

  try {
    const post = await findPostById(id);

    if (!post) {
      return res.status(404).json({
        error: "Post no encontrado",
      });
    }

    return res.status(200).json(post);
  } catch (error) {
    console.error("Error al obtener post:", error.message);

    return res.status(500).json({
      error: "No se pudo obtener el post",
    });
  }
};

export const getPostsByAuthorId = async (req, res) => {
  const authorId = Number(req.params.authorId);

  if (
    !Number.isInteger(authorId) ||
    authorId <= 0 ||
    authorId > 2147483647
  ) {
    return res.status(400).json({
      error: "El ID del autor debe ser un entero positivo válido",
    });
  }

  try {
    const author = await findAuthorById(authorId);

    if (!author) {
      return res.status(404).json({
        error: "Autor no encontrado",
      });
    }

    const posts = await findPostsByAuthorId(authorId);

    return res.status(200).json(posts);
  } catch (error) {
    console.error("Error al obtener posts del autor:", error.message);

    return res.status(500).json({
      error: "No se pudieron obtener los posts del autor",
    });
  }
};

export const createPost = async (req, res) => {
  const {
    author_id,
    title,
    content,
    published = false,
  } = req.body ?? {};

  if (
    !Number.isInteger(author_id) ||
    author_id <= 0 ||
    author_id > 2147483647
  ) {
    return res.status(400).json({
      error: "author_id debe ser un entero positivo válido",
    });
  }

  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({
      error: "El título es obligatorio y debe ser texto",
    });
  }

  if (typeof content !== "string" || content.trim() === "") {
    return res.status(400).json({
      error: "El contenido es obligatorio y debe ser texto",
    });
  }

  if (typeof published !== "boolean") {
    return res.status(400).json({
      error: "published debe ser true o false",
    });
  }

  try {
    const post = await insertPost(
      author_id,
      title.trim(),
      content.trim(),
      published
    );

    return res.status(201).json(post);
  } catch (error) {
    if (
      error.code === "23503" &&
      error.constraint === "posts_author_id_fkey"
    ) {
      return res.status(400).json({
        error: "El autor indicado no existe",
      });
    }

    console.error("Error al crear post:", error.message);

    return res.status(500).json({
      error: "No se pudo crear el post",
    });
  }
};

export const updatePost = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0 || id > 2147483647) {
    return res.status(400).json({
      error: "El ID debe ser un entero positivo válido",
    });
  }

  const {
    author_id,
    title,
    content,
    published = false,
  } = req.body ?? {};

  if (
    !Number.isInteger(author_id) ||
    author_id <= 0 ||
    author_id > 2147483647
  ) {
    return res.status(400).json({
      error: "author_id debe ser un entero positivo válido",
    });
  }

  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({
      error: "El título es obligatorio y debe ser texto",
    });
  }

  if (typeof content !== "string" || content.trim() === "") {
    return res.status(400).json({
      error: "El contenido es obligatorio y debe ser texto",
    });
  }

  if (typeof published !== "boolean") {
    return res.status(400).json({
      error: "published debe ser true o false",
    });
  }

  try {
    const post = await updatePostById(
      id,
      author_id,
      title.trim(),
      content.trim(),
      published
    );

    if (!post) {
      return res.status(404).json({
        error: "Post no encontrado",
      });
    }

    return res.status(200).json(post);
  } catch (error) {
    if (
      error.code === "23503" &&
      error.constraint === "posts_author_id_fkey"
    ) {
      return res.status(400).json({
        error: "El autor indicado no existe",
      });
    }

    console.error("Error al actualizar post:", error.message);

    return res.status(500).json({
      error: "No se pudo actualizar el post",
    });
  }
};

export const deletePost = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0 || id > 2147483647) {
    return res.status(400).json({
      error: "El ID debe ser un entero positivo válido",
    });
  }

  try {
    const post = await deletePostById(id);

    if (!post) {
      return res.status(404).json({
        error: "Post no encontrado",
      });
    }

    return res.status(200).json({
      message: "Post eliminado con éxito",
    });
  } catch (error) {
    console.error("Error al eliminar post:", error.message);

    return res.status(500).json({
      error: "No se pudo eliminar el post",
    });
  }
};