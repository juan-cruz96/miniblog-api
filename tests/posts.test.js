import { test, expect, vi, afterEach } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import pool from "../config/db.js";

afterEach(() => {
  vi.restoreAllMocks();
});

test("POST /posts devuelve 400 si falta el título", async () => {
  const response = await request(app)
    .post("/posts")
    .send({
      author_id: 1,
      content: "Una escapada de fin de semana al Delta.",
    });

  expect(response.status).toBe(400);
  expect(response.body.error).toBe(
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

  expect(response.status).toBe(400);
  expect(response.body.error).toBe(
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

  expect(response.status).toBe(400);
  expect(response.body.error).toBe(
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

  expect(response.status).toBe(400);
  expect(response.body.error).toBe(
    "published debe ser true o false"
  );
});

test("GET /posts/999 devuelve 404 si el post no existe", async () => {
  vi.spyOn(pool, "query").mockResolvedValue({
    rows: [],
  });

  const response = await request(app).get("/posts/999");

  expect(response.status).toBe(404);
  expect(response.body.error).toBe("Post no encontrado");
});

test("POST /posts devuelve 201 y el post creado", async () => {
  const post = {
    id: 10,
    author_id: 1,
    title: "Un fin de semana en Tigre",
    content: "Una escapada de fin de semana al Delta.",
    published: false,
  };

  const queryMock = vi.spyOn(pool, "query").mockResolvedValue({
    rows: [post],
  });

  const response = await request(app)
    .post("/posts")
    .send({
      author_id: 1,
      title: "  Un fin de semana en Tigre  ",
      content: "  Una escapada de fin de semana al Delta.  ",
    });

  expect(response.status).toBe(201);
  expect(response.body).toEqual(post);

  expect(queryMock).toHaveBeenCalledTimes(1);
  expect(queryMock).toHaveBeenCalledWith(
    expect.any(String),
    [
      1,
      "Un fin de semana en Tigre",
      "Una escapada de fin de semana al Delta.",
      false,
    ]
  );
});

test("POST /posts devuelve 400 si el autor no existe", async () => {
  const error = new Error("El autor no existe");
  error.code = "23503";
  error.constraint = "posts_author_id_fkey";

  vi.spyOn(pool, "query").mockRejectedValue(error);

  const response = await request(app)
    .post("/posts")
    .send({
      author_id: 999,
      title: "Un fin de semana en Tigre",
      content: "Una escapada de fin de semana al Delta.",
    });

  expect(response.status).toBe(400);
  expect(response.body.error).toBe(
    "El autor indicado no existe"
  );
});


test("POST /posts devuelve 400 en JSON si el body está mal formado", async () => {
  const response = await request(app)
    .post("/posts")
    .set("Content-Type", "application/json")
    .send('{"title":"Prueba",}');

  expect(response.status).toBe(400);
  expect(response.headers["content-type"]).toMatch(/application\/json/);
  expect(response.body).toEqual({
    error: "El cuerpo de la petición debe ser un JSON válido",
  });
});

test("PUT /posts/1 devuelve 200 y el post actualizado", async () => {
  const data = {
    author_id: 2,
    title: "Título actualizado",
    content: "Contenido actualizado",
    published: true,
  };

  const post = { id: 1, ...data };

  const queryMock = vi.spyOn(pool, "query").mockResolvedValue({
    rows: [post],
  });

  const response = await request(app)
    .put("/posts/1")
    .send(data);

  expect(response.status).toBe(200);
  expect(response.body).toEqual(post);
  expect(queryMock).toHaveBeenCalledTimes(1);
  expect(queryMock).toHaveBeenCalledWith(
    expect.stringMatching(/UPDATE posts/i),
    [data.author_id, data.title, data.content, data.published, 1]
  );
});

test("DELETE /posts/1 devuelve 200 al eliminar el post", async () => {
  const queryMock = vi.spyOn(pool, "query").mockResolvedValue({
    rows: [{ id: 1 }],
  });

  const response = await request(app).delete("/posts/1");

  expect(response.status).toBe(200);
  expect(response.body).toEqual({
    message: "Post eliminado con éxito",
  });
  expect(queryMock).toHaveBeenCalledTimes(1);
  expect(queryMock).toHaveBeenCalledWith(
    expect.stringMatching(/DELETE FROM posts/i),
    [1]
  );
});