import { authors } from "../data/authors.js";

export const findAllAuthors = () => {
    return authors;
}

export const findAuthorById = (id) => {
    return authors.find((author) => author.id === id);
};