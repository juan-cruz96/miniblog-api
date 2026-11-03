# MiniBlog API

API REST desarrollada con Node.js, Express y PostgreSQL para gestionar autores y publicaciones.

Permite crear, consultar, actualizar y eliminar registros. Cada publicación pertenece a un autor.

## Proyecto desplegado

- API: https://miniblog-api-v1kz.onrender.com
- Swagger UI: https://miniblog-api-v1kz.onrender.com/docs
- Ejemplo de consulta: https://miniblog-api-v1kz.onrender.com/authors

## Tecnologías

- Node.js y Express
- PostgreSQL y pg
- Vitest y Supertest
- OpenAPI y Swagger UI
- Render

Las consultas SQL están parametrizadas y organizadas en servicios.

## Requisitos

- Node.js 24
- PostgreSQL 18
- npm
- Git

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/juan-cruz96/miniblog-api.git
cd miniblog-api
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

Crear la base:

```sql
CREATE DATABASE miniblog_db;
```

Salir de psql:

```text
\q
```

Desde la raíz del proyecto, ejecutar:

```bash
psql -U postgres -d miniblog_db -v ON_ERROR_STOP=1 -f sql/setup.sql
psql -U postgres -d miniblog_db -v ON_ERROR_STOP=1 -f sql/seed.sql
```

- `setup.sql` crea las tablas, las restricciones y el índice por autor.
- `seed.sql` carga cuatro autores y tres publicaciones de ejemplo.

El setup debe ejecutarse sobre una base sin estas tablas. Si las tablas ya existen, no es necesario volver a crearlas.

Si `psql` no está disponible como comando, usar la ruta correspondiente a la instalación. Por ejemplo, en macOS con el instalador de PostgreSQL 18:

```bash
/Library/PostgreSQL/18/bin/psql
```

### Modelo de datos

- `authors`: id, name, email, bio, created_at.
- `posts`: id, author_id, title, content, published, created_at.

La columna `posts.author_id` referencia a `authors.id`. Un autor puede tener muchas publicaciones.

El email es único y existe un índice sobre `posts.author_id` para facilitar las consultas por autor.

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

### Ejemplo: crear un autor

POST `/authors`

```json
{
  "name": "Ana",
  "email": "ana@example.com",
  "bio": "Escribo sobre viajes y tecnología."
}
```

### Ejemplo: crear una publicación

POST `/posts`

```json
{
  "author_id": 1,
  "title": "Mi primera publicación",
  "content": "Contenido de ejemplo para MiniBlog.",
  "published": true
}
```

El `author_id` debe corresponder a un autor existente.

## Validaciones y comportamiento

### Autores

- `name` y `email` deben ser textos no vacíos.
- `email` debe ser único.
- `bio` puede ser texto o `null`.
- No se puede eliminar un autor que tenga publicaciones asociadas.

### Publicaciones

- `author_id` debe ser un entero positivo y corresponder a un autor existente.
- `title` y `content` deben ser textos no vacíos.
- `published` debe ser booleano. Si se omite, se guarda `false`.
- Las consultas incluyen publicaciones con `published` en `true` y en `false`.
- La consulta por autor incluye `author_name`, `author_email` y `author_bio`.
- Si el autor existe pero no tiene publicaciones, devuelve un array vacío.
- Si el autor no existe, devuelve `404`.

### Actualizaciones

PUT requiere todos los campos obligatorios.

Al omitir `bio` en un PUT de autores, se guarda `null`.
Al omitir `published` en un PUT de publicaciones, se guarda `false`.

### Respuestas

| Código | Significado |
| ------ | ----------- |
| 200 | Consulta, actualización o eliminación exitosa |
| 201 | Registro creado |
| 400 | Datos inválidos, JSON mal formado o restricciones conocidas |
| 404 | Autor o publicación no encontrados |
| 500 | Error inesperado del servidor |

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

También se realizaron pruebas manuales con PostgreSQL, Thunder Client y Swagger UI. En Render se comprobaron consultas, creación, actualización y eliminación de publicaciones, además de respuestas para autores inexistentes.

## Documentación OpenAPI

La especificación está en:

`docs/openapi.yaml`

Con la aplicación iniciada, abrir Swagger UI:

http://localhost:3000/docs

Documentación desplegada:

https://miniblog-api-v1kz.onrender.com/docs

La especificación utiliza `/` como URL del servidor, por lo que Swagger realiza las peticiones al mismo servidor desde el que se abre la documentación.

Desde esa interfaz se pueden consultar y probar los endpoints. Las operaciones de escritura modifican la base conectada a la aplicación.

## Deployment en Render

El proyecto se desplegó utilizando dos servicios:

- Una base de datos PostgreSQL.
- Un Web Service para ejecutar la API Node.js.

### 1. Crear PostgreSQL

Crear una instancia de PostgreSQL en Render y guardar sus datos de conexión.

La base de datos y el Web Service deben estar en la misma región para utilizar la conexión interna. En este proyecto se utilizó Oregon.

### 2. Crear las tablas y cargar los datos

Desde la terminal local, conectarse utilizando la URL externa que proporciona Render:

```bash
psql "URL_EXTERNA_DE_POSTGRESQL"
```

Reemplazar el marcador por la URL real, sin publicarla en el repositorio.

Si la terminal se abrió desde la raíz del proyecto, ejecutar dentro de psql:

```text
\set ON_ERROR_STOP on
\i sql/setup.sql
\i sql/seed.sql
```

El setup se ejecuta una sola vez sobre la base sin tablas.

Para comprobar los datos:

```sql
SELECT id, name, email FROM authors;
SELECT id, author_id, title, published FROM posts;
```

Salir con:

```text
\q
```

### 3. Crear el Web Service

Conectar el repositorio de GitHub y configurar:

| Campo | Valor |
| ----- | ----- |
| Language | Node |
| Branch | main |
| Region | Oregon |
| Root Directory | Vacío, porque package.json está en la raíz |
| Build Command | npm ci |
| Start Command | npm start |

### 4. Configurar las variables de entorno

Agregar en el Web Service los valores proporcionados por la instancia de PostgreSQL:

| Variable | Valor |
| -------- | ----- |
| DB_HOST | Hostname interno de PostgreSQL |
| DB_PORT | 5432 |
| DB_NAME | Nombre de la base creada en Render |
| DB_USER | Usuario de PostgreSQL |
| DB_PASSWORD | Contraseña de PostgreSQL |

`DB_HOST` debe contener únicamente el hostname, no una URL completa.

La aplicación utiliza estas variables individuales para configurar `pg`; no utiliza `DATABASE_URL`.

Como configuración recomendada, se pueden agregar:

```env
NODE_ENV=production
NODE_VERSION=24
```

Render proporciona `PORT` y la aplicación lo utiliza mediante `process.env.PORT`.

Las credenciales se configuran en Render y no se suben a GitHub.

### 5. Desplegar y verificar

Presionar **Deploy web service** y revisar los logs hasta que el servicio esté disponible.

Abrir la URL pública y comprobar los endpoints desde `/docs`.

En este proyecto:

- API: https://miniblog-api-v1kz.onrender.com
- Swagger UI: https://miniblog-api-v1kz.onrender.com/docs

### Conexiones internas y externas

- La conexión interna de PostgreSQL se utiliza desde la API alojada en Render.
- La conexión externa de PostgreSQL se utiliza desde la computadora local, por ejemplo con `psql`.
- La URL pública del Web Service permite acceder a la API mediante HTTP/HTTPS.

Las URLs de conexión de PostgreSQL contienen credenciales y no deben publicarse.

### Alcance del despliegue

Este proyecto es una API educativa sin autenticación. Los endpoints de escritura están disponibles públicamente y los datos utilizados son de ejemplo.

La instancia gratuita de PostgreSQL creada para esta entrega muestra una fecha de vencimiento del 3 de diciembre de 2026. La disponibilidad posterior requiere revisar el servicio en Render.
