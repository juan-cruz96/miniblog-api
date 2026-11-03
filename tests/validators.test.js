import { describe, test, expect } from "vitest";
import {
  isValidId,
  isNonEmptyString,
  validateAuthor,
  validatePost,
} from "../src/utils/validators.js";

describe("isValidId", () => {
  test.each([1, 5, 2147483647])("acepta el ID %s", (id) => {
    expect(isValidId(id)).toBe(true);
  });

  test.each([
    0,
    -1,
    1.5,
    2147483648,
    NaN,
    Infinity,
    "5",
    null,
    undefined,
    true,
  ])("rechaza el ID %s", (id) => {
    expect(isValidId(id)).toBe(false);
  });
});

describe("isNonEmptyString", () => {
  test("acepta texto con espacios alrededor", () => {
    expect(isNonEmptyString("  Juan  ")).toBe(true);
  });

  test.each(["", "   ", "\n\t", 123, null, undefined, true])(
    "rechaza el valor %s",
    (value) => {
      expect(isNonEmptyString(value)).toBe(false);
    }
  );
});

describe("validateAuthor", () => {
  const validAuthor = {
    name: "Lucía Fernández",
    email: "lucia@example.com",
    bio: "Periodista y viajera",
  };

  test("acepta un autor válido", () => {
    expect(validateAuthor(validAuthor)).toBeNull();
  });

  test("acepta un autor sin biografía", () => {
    expect(
      validateAuthor({
        name: "Lucía Fernández",
        email: "lucia@example.com",
      })
    ).toBeNull();
  });

  test("acepta una biografía null", () => {
    expect(
      validateAuthor({ ...validAuthor, bio: null })
    ).toBeNull();
  });

  test("rechaza un nombre compuesto solo por espacios", () => {
    expect(
      validateAuthor({ ...validAuthor, name: "   " })
    ).toBe("El nombre es obligatorio y debe ser texto");
  });

  test("rechaza un email vacío", () => {
    expect(
      validateAuthor({ ...validAuthor, email: "" })
    ).toBe("El email es obligatorio y debe ser texto");
  });

  test("rechaza una biografía que no sea texto", () => {
    expect(
      validateAuthor({ ...validAuthor, bio: 123 })
    ).toBe("La biografía debe ser texto");
  });

  test("devuelve un error si no recibe datos", () => {
    expect(validateAuthor(undefined)).toBe(
      "El nombre es obligatorio y debe ser texto"
    );
  });
});

describe("validatePost", () => {
  const validPost = {
    author_id: 6,
    title: "Un fin de semana en el Delta de Tigre",
    content: "Pasamos el fin de semana en una cabaña sobre el río.",
    published: true,
  };

  test("acepta un post válido", () => {
    expect(validatePost(validPost)).toBeNull();
  });

  test("acepta un borrador", () => {
    expect(
      validatePost({ ...validPost, published: false })
    ).toBeNull();
  });

  test("permite omitir published", () => {
    const { published, ...postWithoutPublished } = validPost;

    expect(validatePost(postWithoutPublished)).toBeNull();
  });

  test("rechaza author_id enviado como texto", () => {
    expect(
      validatePost({ ...validPost, author_id: "6" })
    ).toBe("author_id debe ser un entero positivo válido");
  });

  test("rechaza un título vacío", () => {
    expect(
      validatePost({ ...validPost, title: "   " })
    ).toBe("El título es obligatorio y debe ser texto");
  });

  test("rechaza contenido que no sea texto", () => {
    expect(
      validatePost({ ...validPost, content: 123 })
    ).toBe("El contenido es obligatorio y debe ser texto");
  });

  test("rechaza published enviado como texto", () => {
    expect(
      validatePost({ ...validPost, published: "true" })
    ).toBe("published debe ser true o false");
  });

  test("rechaza published null", () => {
    expect(
      validatePost({ ...validPost, published: null })
    ).toBe("published debe ser true o false");
  });

  test("devuelve un error si no recibe datos", () => {
    expect(validatePost(undefined)).toBe(
      "author_id debe ser un entero positivo válido"
    );
  });
});