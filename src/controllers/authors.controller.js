import { findAllAuthors , findAuthorById } from "../services/authors.service.js";



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