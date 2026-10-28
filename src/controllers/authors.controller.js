import { findAllAuthors , findAuthorById , insertAuthor } from "../services/authors.service.js";



export const getAllAuthors = async (req, res) => {
    try {
        const authors = await findAllAuthors();
        res.status(200).json(authors);
    } catch (error) {
        console.error( "Error al buscar autores:", error.message);

        res.status(500).json({
            error: "No se pudieron obtener los autores",
        })
    }
};



export const getAuthorById = async (req, res) => {
  try {
    const id = req.authorId;
    const author = await findAuthorById(id);

    if (!author) {
      return res.status(404).json({
        error: "Autor no encontrado",
      });
    }

    res.status(200).json(author);
  } catch (error) {
    console.error("Error al buscar autor:", error.message);

    res.status(500).json({
      error: "No se pudo obtener el autor",
    });
  }
};

export const createAuthor = async (req, res) => {
  const { name, email, bio = null } = req.body ?? {};

  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({
      error: "El nombre es obligatorio y debe ser texto",
    });
  }

  if (typeof email !== "string" || email.trim() === "") {
    return res.status(400).json({
      error: "El email es obligatorio y debe ser texto",
    });
  }

  if (bio !== null && typeof bio !== "string") {
    return res.status(400).json({
      error: "La biografía debe ser texto",
    });
  }

  try {
    const author = await insertAuthor(
      name.trim(),
      email.trim(),
      bio
    );

    return res.status(201).json(author);
  } catch (error) {
    if (
      error.code === "23505" &&
      error.constraint === "authors_email_key"
    ) {
      return res.status(400).json({
        error: "Ya existe un autor con ese email",
      });
    }

    console.error("Error al crear autor:", error.message);

    return res.status(500).json({
      error: "No se pudo crear el autor",
    });
  }
};