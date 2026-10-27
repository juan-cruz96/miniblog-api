INSERT INTO authors (name, email, bio)
VALUES ('Juan', 'juan@example.com', 'Primer autor de ejemplo')
RETURNING *;
