export const isValidId = (id) => {
  return Number.isInteger(id) && id > 0 && id <= 2147483647;
};

export const isNonEmptyString = (value) => {
  return typeof value === "string" && value.trim() !== "";
};

export const validateAuthor = (data) => {
  const { name, email, bio = null } = data ?? {};

  if (!isNonEmptyString(name)) {
    return "El nombre es obligatorio y debe ser texto";
  }

  if (!isNonEmptyString(email)) {
    return "El email es obligatorio y debe ser texto";
  }

  if (bio !== null && typeof bio !== "string") {
    return "La biografía debe ser texto";
  }

  return null;
};

export const validatePost = (data) => {
  const { author_id, title, content, published = false } = data ?? {};

  if (!isValidId(author_id)) {
    return "author_id debe ser un entero positivo válido";
  }

  if (!isNonEmptyString(title)) {
    return "El título es obligatorio y debe ser texto";
  }

  if (!isNonEmptyString(content)) {
    return "El contenido es obligatorio y debe ser texto";
  }

  if (typeof published !== "boolean") {
    return "published debe ser true o false";
  }

  return null;
};