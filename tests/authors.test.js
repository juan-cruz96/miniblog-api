import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

import pool from "../config/db.js";

test("GET /authors/hola devuelve 400 por ID inválido", async () => {
  const response = await request(app).get("/authors/hola");

  assert.equal(response.status, 400);
  assert.equal(
    response.body.error,
    "El ID debe ser un numero entero positivo"
  );
});

test("GET /authors/2147483648 devuelve 400 por ID fuera de rango", async () => {
  const response = await request(app).get("/authors/2147483648");

  assert.equal(response.status, 400);
});

test("POST /authors devuelve 400 si el nombre está vacío", async () => {
  const response = await request(app)
    .post("/authors")
    .send({
      name: "   ",
      email: "prueba@example.com",
    });

  assert.equal(response.status, 400);
  assert.equal(
    response.body.error,
    "El nombre es obligatorio y debe ser texto"
  );
});

test("POST /authors devuelve 400 si falta el email", async () => {
  const response = await request(app)
    .post("/authors")
    .send({
      name: "Lucía",
    });

  assert.equal(response.status, 400);
  assert.equal(
    response.body.error,
    "El email es obligatorio y debe ser texto"
  );
});



test("GET /authors devuelve la lista de autores", async (t) => {
  const authors = [
    {
      id: 1,
      name: "Lucía Fernández",
      email: "lucia@example.com",
      bio: "Periodista y viajera",
    },
  ];

  t.mock.method(pool, "query", async () => {
    return { rows: authors };
  });

  const response = await request(app).get("/authors");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, authors);
});

test("GET /authors/999 devuelve 404 si el autor no existe", async (t) => {
  t.mock.method(pool, "query", async () => {
    return { rows: [] };
  });

  const response = await request(app).get("/authors/999");

  assert.equal(response.status, 404);
  assert.equal(response.body.error, "Autor no encontrado");
});

test("DELETE /authors/1 devuelve 400 si el autor tiene posts", async (t) => {
  t.mock.method(pool, "query", async () => {
    const error = new Error("El autor tiene posts asociados");
    error.code = "23503";
    error.constraint = "posts_author_id_fkey";
    throw error;
  });

  const response = await request(app).delete("/authors/1");

  assert.equal(response.status, 400);
  assert.equal(
    response.body.error,
    "No se puede eliminar un autor que tiene posts asociados"
  );
});


test("POST /authors devuelve 400 si el email ya existe", async (t) => {
  t.mock.method(pool, "query", async () => {
    const error = new Error("Email duplicado");
    error.code = "23505";
    error.constraint = "authors_email_key";
    throw error;
  });

  const response = await request(app)
    .post("/authors")
    .send({
      name: "Lucía Fernández",
      email: "lucia@example.com",
    });

  assert.equal(response.status, 400);
  assert.equal(
    response.body.error,
    "Ya existe un autor con ese email"
  );
});