import { authors } from "../data/authors.js";
import pool from "../../config/db.js"

export const findAllAuthors = async () => {
    const result = await pool.query(
        "SELECT * FROM authors ORDER BY id;"
    );

    return result.rows;
}

export const findAuthorById = (id) => {
    return authors.find((author) => author.id === id);
};