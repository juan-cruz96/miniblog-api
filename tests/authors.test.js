import { test, expect, vi, afterEach } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import pool from "../config/db.js";

afterEach(() => {
  vi.restoreAllMocks();
});

test("GET /authors/hola devuelve 400 por ID inválido", async () => {
  const response = await request(app).get("/authors/hola");

  expect(response.status).toBe(400);
  expect(response.body.error).toBe(
    "El ID debe ser un numero entero positivo"
  );
});

test("GET /authors/2147483648 devuelve 400 por ID fuera de rango", async () => {
  const response = await request(app).get("/authors/2147483648");

  expect(response.status).toBe(400);
});

test("POST /authors devuelve 400 si el nombre está vacío", async () => {
  const response = await request(app)
    .post("/authors")
    .send({
      name: "   ",
      email: "prueba@example.com",
    });

  expect(response.status).toBe(400);
  expect(response.body.error).toBe(
    "El nombre es obligatorio y debe ser texto"
  );
});

test("POST /authors devuelve 400 si falta el email", async () => {
  const response = await request(app)
    .post("/authors")
    .send({
      name: "Lucía",
    });

  expect(response.status).toBe(400);
  expect(response.body.error).toBe(
    "El email es obligatorio y debe ser texto"
  );
});

test("GET /authors devuelve la lista de autores", async () => {
  const authors = [
    {
      id: 1,
      name: "Lucía Fernández",
      email: "lucia@example.com",
      bio: "Periodista y viajera",
    },
  ];

  vi.spyOn(pool, "query").mockResolvedValue({
    rows: authors,
  });

  const response = await request(app).get("/authors");

  expect(response.status).toBe(200);
  expect(response.body).toEqual(authors);
});

test("GET /authors/999 devuelve 404 si el autor no existe", async () => {
  vi.spyOn(pool, "query").mockResolvedValue({
    rows: [],
  });

  const response = await request(app).get("/authors/999");

  expect(response.status).toBe(404);
  expect(response.body.error).toBe("Autor no encontrado");
});

test("DELETE /authors/1 devuelve 400 si el autor tiene posts", async () => {
  const error = new Error("El autor tiene posts asociados");
  error.code = "23503";
  error.constraint = "posts_author_id_fkey";

  vi.spyOn(pool, "query").mockRejectedValue(error);

  const response = await request(app).delete("/authors/1");

  expect(response.status).toBe(400);
  expect(response.body.error).toBe(
    "No se puede eliminar un autor que tiene posts asociados"
  );
});

test("POST /authors devuelve 400 si el email ya existe", async () => {
  const error = new Error("Email duplicado");
  error.code = "23505";
  error.constraint = "authors_email_key";

  vi.spyOn(pool, "query").mockRejectedValue(error);

  const response = await request(app)
    .post("/authors")
    .send({
      name: "Lucía Fernández",
      email: "lucia@example.com",
    });

  expect(response.status).toBe(400);
  expect(response.body.error).toBe(
    "Ya existe un autor con ese email"
  );
});

test("PUT /authors/1 devuelve 200 y el autor actualizado", async () => {
  const data = {
    name: "Juan actualizado",
    email: "juan@example.com",
    bio: "Nueva biografía",
  };

  const author = { id: 1, ...data };

  const queryMock = vi.spyOn(pool, "query").mockResolvedValue({
    rows: [author],
  });

  const response = await request(app)
    .put("/authors/1")
    .send(data);

  expect(response.status).toBe(200);
  expect(response.body).toEqual(author);
  expect(queryMock).toHaveBeenCalledTimes(1);
  expect(queryMock).toHaveBeenCalledWith(
    expect.stringMatching(/UPDATE authors/i),
    [data.name, data.email, data.bio, 1]
  );
});

test("DELETE /authors/1 devuelve 200 al eliminar el autor", async () => {
  const queryMock = vi.spyOn(pool, "query").mockResolvedValue({
    rows: [{ id: 1 }],
  });

  const response = await request(app).delete("/authors/1");

  expect(response.status).toBe(200);
  expect(response.body).toEqual({
    message: "Autor eliminado con éxito",
  });
  expect(queryMock).toHaveBeenCalledTimes(1);
  expect(queryMock).toHaveBeenCalledWith(
    expect.stringMatching(/DELETE FROM authors/i),
    [1]
  );
});