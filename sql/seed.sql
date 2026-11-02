BEGIN;

INSERT INTO authors (name, email, bio)
VALUES
  (
    'Juan',
    'juan@example.com',
    'Comparto experiencias de viajes y de la vida en Australia.'
  ),
  (
    'Lucía Fernández',
    'lucia.fernandez@example.com',
    'Periodista y viajera. Escribo sobre escapadas y gastronomía.'
  ),
  (
    'Martín Acosta',
    'martin.acosta@example.com',
    'Fotógrafo de Buenos Aires, apasionado por la naturaleza.'
  ),
  (
    'Diego Angel',
    'diegoangel@example.com',
    'Apasionado por la naturaleza y el mar.'
  )
ON CONFLICT (email) DO NOTHING;

INSERT INTO posts (author_id, title, content, published)
SELECT
  id,
  'Lo que aprendí después de vivir tres años en Australia',
  'Llegué a Sydney buscando una experiencia distinta y terminé quedándome tres años. Trabajar en gastronomía y compartir casa con personas de otros países me ayudó a ganar confianza para empezar de cero.',
  true
FROM authors
WHERE email = 'juan@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM posts
    WHERE posts.author_id = authors.id
      AND posts.title =
        'Lo que aprendí después de vivir tres años en Australia'
  );

INSERT INTO posts (author_id, title, content, published)
SELECT
  id,
  'Un fin de semana en el Delta de Tigre',
  'Salimos el sábado y tomamos una lancha hacia una cabaña sobre el río. Pasamos el día caminando, leyendo en el muelle y cocinando sin apuro.',
  true
FROM authors
WHERE email = 'lucia.fernandez@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM posts
    WHERE posts.author_id = authors.id
      AND posts.title = 'Un fin de semana en el Delta de Tigre'
  );

INSERT INTO posts (author_id, title, content, published)
SELECT
  id,
  'Portugal en tren: el recorrido que estoy preparando',
  'Estoy organizando un viaje desde Lisboa hasta Porto, con una parada en Coimbra. Todavía me falta definir los alojamientos y decidir si sumo una noche en el valle del Duero.',
  false
FROM authors
WHERE email = 'lucia.fernandez@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM posts
    WHERE posts.author_id = authors.id
      AND posts.title =
        'Portugal en tren: el recorrido que estoy preparando'
  );

COMMIT;