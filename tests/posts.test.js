import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import pool from "../config/db.js";

test("POST /posts devuelve 400 si falta el título", async () => {
  const response = await request(app)
    .post("/posts")
    .send({
      author_id: 1,
      content: "Una escapada de fin de semana al Delta.",
    });

  assert.equal(response.status, 400);
  assert.equal(
    response.body.error,
    "El título es obligatorio y debe ser texto"
  );
});

test("POST /posts devuelve 400 si el contenido está vacío", async () => {
  const response = await request(app)
    .post("/posts")
    .send({
      author_id: 1,
      title: "Un fin de semana en Tigre",
      content: "   ",
    });

  assert.equal(response.status, 400);
  assert.equal(
    response.body.error,
    "El contenido es obligatorio y debe ser texto"
  );
});

test("POST /posts devuelve 400 si falta author_id", async () => {
  const response = await request(app)
    .post("/posts")
    .send({
      title: "Un fin de semana en Tigre",
      content: "Una escapada de fin de semana al Delta.",
    });

  assert.equal(response.status, 400);
  assert.equal(
    response.body.error,
    "author_id debe ser un entero positivo válido"
  );
});

test("POST /posts devuelve 400 si published no es booleano", async () => {
  const response = await request(app)
    .post("/posts")
    .send({
      author_id: 1,
      title: "Un fin de semana en Tigre",
      content: "Una escapada de fin de semana al Delta.",
      published: "true",
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "published debe ser true o false");
});

test("GET /posts/999 devuelve 404 si el post no existe", async (t) => {
  t.mock.method(pool, "query", async () => {
    return { rows: [] };
  });

  const response = await request(app).get("/posts/999");

  assert.equal(response.status, 404);
  assert.equal(response.body.error, "Post no encontrado");
});

test("POST /posts devuelve 201 y el post creado", async (t) => {
  const post = {
    id: 10,
    author_id: 1,
    title: "Un fin de semana en Tigre",
    content: "Una escapada de fin de semana al Delta.",
    published: false,
  };

  const queryMock = t.mock.method(pool, "query", async () => {
    return { rows: [post] };
  });

  const response = await request(app)
    .post("/posts")
    .send({
      author_id: 1,
      title: "  Un fin de semana en Tigre  ",
      content: "  Una escapada de fin de semana al Delta.  ",
    });

  assert.equal(response.status, 201);
  assert.deepEqual(response.body, post);

  assert.equal(queryMock.mock.callCount(), 1);
  assert.deepEqual(queryMock.mock.calls[0].arguments[1], [
    1,
    "Un fin de semana en Tigre",
    "Una escapada de fin de semana al Delta.",
    false,
  ]);
});

test("POST /posts devuelve 400 si el autor no existe", async (t) => {
  t.mock.method(pool, "query", async () => {
    const error = new Error("El autor no existe");
    error.code = "23503";
    error.constraint = "posts_author_id_fkey";
    throw error;
  });

  const response = await request(app)
    .post("/posts")
    .send({
      author_id: 999,
      title: "Un fin de semana en Tigre",
      content: "Una escapada de fin de semana al Delta.",
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "El autor indicado no existe");
});