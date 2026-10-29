import pool from "../../config/db.js";

export const findAllPosts = async () => {
  const result = await pool.query("SELECT * FROM posts ORDER BY id;");
  return result.rows;
};

export const findPostById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM posts WHERE id = $1;",
    [id]
  );

  return result.rows[0];
};

export const findPostsByAuthorId = async (authorId) => {
  const result = await pool.query(
    `SELECT
        posts.*,
        authors.name AS author_name,
        authors.email AS author_email,
        authors.bio AS author_bio
     FROM posts
     JOIN authors ON posts.author_id = authors.id
     WHERE posts.author_id = $1
     ORDER BY posts.id;`,
    [authorId]
  );

  return result.rows;
};

export const insertPost = async (authorId, title, content, published) => {
  const result = await pool.query(
    `INSERT INTO posts (author_id, title, content, published)
     VALUES ($1, $2, $3, $4)
     RETURNING *;`,
    [authorId, title, content, published]
  );

  return result.rows[0];
};

export const updatePostById = async (
  id,
  authorId,
  title,
  content,
  published
) => {
  const result = await pool.query(
    `UPDATE posts
     SET author_id = $1,
         title = $2,
         content = $3,
         published = $4
     WHERE id = $5
     RETURNING *;`,
    [authorId, title, content, published, id]
  );

  return result.rows[0];
};

export const deletePostById = async (id) => {
  const result = await pool.query(
    "DELETE FROM posts WHERE id = $1 RETURNING id;",
    [id]
  );

  return result.rows[0];
};