CREATE TABLE authors (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL CHECK (TRIM(name) <> '') ,
    email TEXT NOT NULL UNIQUE ,
    bio TEXT ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE posts (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES authors(id),
    title TEXT NOT NULL CHECK (TRIM(title) <> ''),
    content TEXT NOT NULL CHECK (TRIM(content) <> ''),
    published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_author_id ON posts(author_id);