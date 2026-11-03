# MiniBlog API

API REST desarrollada con Node.js, Express y PostgreSQL para gestionar autores y publicaciones.

Permite crear, consultar, actualizar y eliminar registros. Cada publicación pertenece a un autor.

## Tecnologías

- Node.js y Express
- PostgreSQL y pg
- Vitest y Supertest
- OpenAPI y Swagger UI

Las consultas SQL están parametrizadas y organizadas en servicios.

## Requisitos

- Node.js 24
- PostgreSQL 18
- npm
- Git

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/juan-cruz96/miniblog.git
cd miniblog
```

Instalar las dependencias:

```bash
npm ci
```

Crear el archivo de variables de entorno:

```bash
cp .env.example .env
```

Editar `.env` con los datos de la instalación local:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=miniblog_db
DB_USER=postgres
DB_PASSWORD=tu_password
```

Reemplazar `tu_password` por la contraseña del usuario de PostgreSQL.

El archivo `.env` está excluido de Git. `.env.example` contiene únicamente valores de ejemplo.

## Base de datos

Conectarse a PostgreSQL:

```bash
psql -U postgres -d postgres
```

Crear la base y salir de psql:

```sql
CREATE DATABASE miniblog_db;
\q
```

Desde la raíz del proyecto, ejecutar:

```bash
psql -U postgres -d miniblog_db -v ON_ERROR_STOP=1 -f sql/setup.sql
psql -U postgres -d miniblog_db -v ON_ERROR_STOP=1 -f sql/seed.sql
```

- `setup.sql` crea las tablas, las restricciones y el índice por autor.
- `seed.sql` carga autores y publicaciones de ejemplo.

El setup debe ejecutarse sobre una base sin estas tablas. Si la base y las tablas ya existen, no es necesario volver a crearlas.

Si `psql` no está disponible como comando, usar la ruta correspondiente a la instalación. Por ejemplo, en macOS con el instalador de PostgreSQL 18:

```bash
/Library/PostgreSQL/18/bin/psql
```

## Ejecutar localmente

```bash
npm run dev
```

Este comando carga las variables de `.env` y reinicia el servidor cuando se guardan cambios.

La API estará disponible en:

http://localhost:3000

Para consultar los autores:

http://localhost:3000/authors

El comando `npm start` inicia la aplicación sin cargar `.env` automáticamente. Está preparado para un entorno que proporcione las variables, como el servicio de hosting.

## Endpoints

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET | /authors | Listar autores |
| GET | /authors/:id | Consultar un autor |
| POST | /authors | Crear un autor |
| PUT | /authors/:id | Actualizar un autor |
| DELETE | /authors/:id | Eliminar un autor |
| GET | /posts | Listar publicaciones |
| GET | /posts/:id | Consultar una publicación |
| GET | /posts/author/:authorId | Consultar publicaciones con datos de su autor |
| POST | /posts | Crear una publicación |
| PUT | /posts/:id | Actualizar una publicación |
| DELETE | /posts/:id | Eliminar una publicación |

Las peticiones POST y PUT deben enviar JSON con el encabezado `Content-Type: application/json`.

## Validaciones y comportamiento

### Autores

- `name` y `email` deben ser textos no vacíos.
- `email` debe ser único.
- `bio` puede ser texto o null.
- No se puede eliminar un autor que tenga publicaciones asociadas.

### Publicaciones

- `author_id` debe ser un entero positivo y corresponder a un autor existente.
- `title` y `content` deben ser textos no vacíos.
- `published` debe ser booleano. Si se omite, se guarda false.
- Las consultas incluyen publicaciones con `published` en true y en false.

### Actualizaciones

PUT requiere todos los campos obligatorios.

Al omitir `bio` en un PUT de autores, se guarda null.
Al omitir `published` en un PUT de publicaciones, se guarda false.

### Respuestas

- 200: consulta, actualización o eliminación exitosa.
- 201: registro creado.
- 400: datos inválidos, JSON mal formado o restricciones conocidas.
- 404: autor o publicación no encontrados.
- 500: error inesperado del servidor.

Las eliminaciones exitosas devuelven un mensaje en JSON.

## Tests

Ejecutar:

```bash
npm test
```

Se utiliza Vitest para ejecutar las pruebas y Supertest para realizar peticiones a la aplicación.

Las pruebas incluyen:

- Validación de IDs y campos obligatorios.
- Respuestas para recursos inexistentes.
- Creación de publicaciones.
- Email duplicado.
- Autor inexistente o con publicaciones asociadas.
- Manejo de JSON mal formado.

Los tests de endpoints simulan las respuestas de PostgreSQL mediante mocks de `pool.query`. No requieren una base activa ni comprueban la persistencia real de los datos.

Las consultas y la persistencia también se probaron manualmente con PostgreSQL y Thunder Client.

## Documentación OpenAPI

La especificación está en:

`docs/openapi.yaml`

Con la aplicación iniciada, abrir Swagger UI:

http://localhost:3000/docs

Desde esa interfaz se pueden consultar y probar los endpoints. Las operaciones de escritura modifican la base conectada a la aplicación.

## Deployment en Render

