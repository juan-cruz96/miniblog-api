import { findAllAuthors , findAuthorById } from "../services/authors.service.js";



export const getAllAuthors = (req, res) => {
    const authors = findAllAuthors();
    res.json(authors);
};

export const getAuthorById = (req, res) => {

    const id = req.authorId;

    const author = findAuthorById(id);

    if(!author){
        return res.status(404).json({
            error: "Autor no encontrado"
        });
    }

    res.json(author);

};