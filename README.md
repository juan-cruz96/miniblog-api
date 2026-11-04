# MiniBlog API

API REST desarrollada con Node.js, Express y PostgreSQL para gestionar autores y publicaciones.

Permite crear, consultar, actualizar y eliminar registros. Cada publicación pertenece a un autor.

## Proyecto desplegado

- Documentación y pruebas: https://miniblog-api-v1kz.onrender.com/docs
- Ejemplo de consulta: https://miniblog-api-v1kz.onrender.com/authors
- URL base: `https://miniblog-api-v1kz.onrender.com`

La URL base se utiliza junto con los endpoints. La ruta `/` no tiene una página definida.

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


## Uso de la IA

## CONSULTA 1: Modularización y estructura del proyecto

### Prompt

> **Estoy desarrollando una API REST con Node.js y Express y quiero entender cómo modular correctamente mi proyecto para mantener el código organizado y aplicar buenas prácticas.**
> **¿Podrías explicarme qué función cumple cada carpeta (routes, controllers, services, middlewares, utils y config), qué tipo de lógica debería ir en cada una y cómo se relacionan entre sí cuando llega una petición HTTP?**
> **Me gustaría entenderlo conceptualmente, con ejemplos sencillos, antes de implementarlo en mi proyecto.**

### Respuesta de la IA

La modularización consiste en dividir el código en diferentes carpetas y archivos según la responsabilidad de cada uno, en lugar de concentrar toda la lógica en un único archivo.

En una API REST desarrollada con Node.js y Express, esta organización permite mantener el código ordenado, facilitar su mantenimiento, reutilizar funciones y realizar pruebas de manera independiente.

#### Estructura de carpetas

```text
src/
├── routes/
├── controllers/
├── services/
├── middlewares/
├── utils/
├── config/
└── app.js
```

#### Responsabilidad de cada carpeta

**1. routes/**

Define los endpoints disponibles en la API y establece qué función debe ejecutarse cuando llega una petición HTTP.

Por ejemplo:

```js
router.get("/:id", getAuthorById);
```

Cuando un cliente realiza una petición `GET /authors/3`, Express identifica la ruta y ejecuta el controller correspondiente.

Las rutas no deberían contener consultas SQL ni lógica de negocio.

**2. controllers/**

Se encarga de gestionar las peticiones y respuestas HTTP.

Sus responsabilidades principales son:

- Recibir los datos de la petición mediante `req`.
- Llamar al service correspondiente.
- Interpretar el resultado de la operación.
- Devolver una respuesta mediante `res`.
- Gestionar códigos de estado HTTP como `200`, `400`, `404` y `500`.

Por ejemplo, al consultar un autor por ID, el controller solicita al service que lo busque y devuelve el resultado al cliente.

**3. services/**

Contiene la lógica principal de las operaciones de la aplicación.

En este proyecto, los services también se encargan de interactuar con PostgreSQL mediante consultas SQL.

Entre sus responsabilidades se encuentran:

- Buscar autores y publicaciones.
- Crear nuevos registros.
- Actualizar información.
- Eliminar registros.
- Ejecutar consultas a la base de datos.

Por ejemplo:

```js
const author = await findAuthorById(id);
```

Esto permite mantener separada la lógica de acceso a datos de la gestión de las respuestas HTTP.

**4. middlewares/**

Contiene funciones que se ejecutan durante el procesamiento de una petición, generalmente antes de llegar al controller.

Pueden utilizarse para:

- Validar parámetros.
- Verificar autenticación.
- Controlar permisos.
- Registrar peticiones.
- Gestionar errores.

Por ejemplo, un middleware puede comprobar que el ID recibido sea un número entero positivo.

Si el ID es inválido, puede devolver un error `400 Bad Request` sin continuar hacia el controller.

**5. utils/**

Almacena funciones auxiliares que pueden reutilizarse en diferentes partes del proyecto.

Por ejemplo:

```js
export const isValidId = (id) => {
  return Number.isInteger(id) && id > 0;
};
```

Esta función permite comprobar si un ID es válido sin repetir la misma lógica en diferentes archivos.

**6. config/**

Centraliza las configuraciones necesarias para el funcionamiento de la aplicación.

Puede incluir:

- Configuración de PostgreSQL.
- Variables de entorno.
- Parámetros generales de la aplicación.

Por ejemplo, un archivo `db.js` puede encargarse de configurar y exportar la conexión a PostgreSQL.

**7. app.js**

Es el archivo donde se configura la aplicación Express.

Entre sus responsabilidades se encuentran:

- Crear la instancia de Express.
- Registrar middlewares globales.
- Configurar el procesamiento de JSON.
- Registrar los routers.
- Configurar herramientas como Swagger.

#### Flujo de una petición HTTP

Cuando un cliente realiza una petición `GET /authors/3`, la aplicación sigue un recorrido similar al siguiente:

```text
           CLIENTE
              |
              | GET /authors/3
              v
           ROUTES
              |
              | Identifica el endpoint
              v
         MIDDLEWARE
              |
              | Valida el ID
              v
          CONTROLLER
              |
              | Solicita buscar el autor
              v
           SERVICE
              |
              | Ejecuta la consulta SQL
              v
          POSTGRESQL
              |
              | Devuelve los datos
              v
           SERVICE
              |
              | Retorna el resultado
              v
          CONTROLLER
              |
              | Construye la respuesta HTTP
              v
           CLIENTE

         200 OK + JSON
```

Durante este proceso, las funciones de `utils/` pueden utilizarse para realizar validaciones y la configuración de `config/` permite establecer la conexión con la base de datos.

#### Ventajas de la modularización

La principal ventaja de esta arquitectura es la separación de responsabilidades.

Cada módulo tiene una función específica, lo que permite:

- **Organización:** mantener el código distribuido de manera lógica.
- **Mantenimiento:** localizar rápidamente dónde realizar modificaciones.
- **Reutilización:** utilizar funciones desde diferentes partes de la aplicación.
- **Escalabilidad:** incorporar nuevas funcionalidades sin concentrar todo el código en un archivo.
- **Testing:** probar las distintas capas de manera independiente.
- **Trabajo en equipo:** facilitar que varios desarrolladores trabajen sobre diferentes módulos.

#### Conclusión

La modularización permite construir una API más organizada, mantenible y escalable.

Cada carpeta cumple una responsabilidad:

- **Routes:** determina qué función atiende cada endpoint.
- **Middlewares:** realiza validaciones y controles durante la petición.
- **Controllers:** coordina las peticiones y respuestas HTTP.
- **Services:** ejecuta las operaciones y consultas a la base de datos.
- **Utils:** proporciona funciones auxiliares reutilizables.
- **Config:** centraliza las configuraciones de la aplicación.
- **App.js:** configura e integra los componentes de Express.

Esta separación facilita comprender el funcionamiento de la API y permite incorporar nuevas funcionalidades manteniendo una estructura clara.

---

## CONSULTA 2: Relación entre PostgreSQL y psql

### Prompt

> **Estoy trabajando con PostgreSQL como base de datos para mi API REST desarrollada con Node.js y Express, pero todavía no termino de entender qué relación tiene con psql.**
>
> **¿Podrías explicarme cuál es la diferencia entre PostgreSQL y psql, qué función cumple cada uno y cómo se comunican entre sí? También me gustaría entender si psql es necesario para utilizar PostgreSQL desde mi aplicación o si existen otras formas de interactuar con la base de datos.**

### Respuesta de la IA

PostgreSQL y `psql` están relacionados, pero no son lo mismo. La diferencia principal es que **PostgreSQL es el sistema que administra la base de datos, mientras que `psql` es una herramienta que permite comunicarnos con él mediante la terminal**.

#### 1. ¿Qué es PostgreSQL?

PostgreSQL es un sistema de gestión de bases de datos relacionales (RDBMS).

Su función es almacenar, organizar y administrar la información de nuestra aplicación.

En el proyecto MiniBlog, PostgreSQL se encarga de almacenar los datos de los autores y sus publicaciones en tablas como `authors` y `posts`.

También permite ejecutar consultas SQL para crear, buscar, actualizar y eliminar registros.

Por ejemplo:

```sql
SELECT * FROM authors;
```

Esta consulta solicita todos los registros de la tabla `authors`.

#### 2. ¿Qué es psql?

`psql` es una herramienta de línea de comandos que permite conectarnos a PostgreSQL desde una terminal y ejecutar instrucciones SQL directamente.

Por ejemplo, podemos conectarnos mediante:

```bash
psql -U postgres -d miniblog
```

Donde:

- `-U postgres`: indica el usuario con el que queremos conectarnos.
- `-d miniblog`: indica el nombre de la base de datos.

Una vez conectados, podemos ejecutar consultas SQL o comandos propios de `psql`.

Por ejemplo:

```sql
\dt
```

Este comando muestra las tablas de la base de datos a la que estamos conectados.

#### 3. ¿Cómo se relacionan PostgreSQL y psql?

La relación entre PostgreSQL y `psql` es de **cliente-servidor**.

`psql` actúa como cliente: envía instrucciones al servidor PostgreSQL, que las procesa y devuelve los resultados.

```text
         psql
  (Cliente de terminal)
           |
           | Envía consultas SQL
           v
       PostgreSQL
  (Servidor de base de datos)
           |
           | Procesa la consulta
           v
      Devuelve datos
           |
           v
         psql
  (Muestra los resultados)
```

Por lo tanto, `psql` no almacena los datos ni administra las tablas por sí mismo. Simplemente proporciona una interfaz para interactuar con PostgreSQL.

#### 4. ¿Es necesario utilizar psql desde Node.js?

**No. Una aplicación Node.js puede comunicarse directamente con PostgreSQL sin utilizar `psql`.**

En MiniBlog utilizamos la biblioteca `pg`, que permite establecer conexiones y ejecutar consultas SQL desde JavaScript.

Por ejemplo:

```js
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
```

De esta manera, nuestra API utiliza `pg` para comunicarse con PostgreSQL.

El recorrido sería:

```text
       API REST
   (Node.js + Express)
           |
           v
          pg
 (Biblioteca de Node.js)
           |
           | Envía consultas SQL
           v
       PostgreSQL
   (Base de datos)
           |
           | Devuelve resultados
           v
          pg
           |
           v
       API REST
```

#### 5. ¿Existen otras formas de interactuar con PostgreSQL?

Sí. Además de `psql` y `pg`, existen herramientas con interfaces gráficas que permiten administrar bases de datos sin utilizar directamente la terminal.

Algunos ejemplos son:

- **pgAdmin:** herramienta gráfica de administración de PostgreSQL.
- **DBeaver:** aplicación para gestionar diferentes sistemas de bases de datos.
- **TablePlus:** cliente gráfico para consultar y administrar bases de datos.

Todas permiten conectarse a PostgreSQL, visualizar tablas, ejecutar consultas SQL y administrar registros.

#### 6. Resumen de las diferencias

| Herramienta | Función |
|---|---|
| PostgreSQL | Sistema que almacena y administra los datos. |
| `psql` | Cliente de terminal para ejecutar consultas SQL. |
| `pg` | Biblioteca que conecta Node.js con PostgreSQL. |
| pgAdmin | Interfaz gráfica para administrar PostgreSQL. |

#### 7. Conclusión

PostgreSQL es el sistema encargado de almacenar y administrar la información, mientras que `psql` y `pg` son dos maneras diferentes de comunicarnos con él.

En nuestro proyecto MiniBlog:

- **PostgreSQL** almacena los autores y publicaciones.
- **psql** permite administrar y comprobar manualmente la base de datos desde la terminal.
- **pg** permite que nuestra API REST realice consultas automáticamente desde Node.js.

Por lo tanto, **no necesitamos utilizar `psql` para que nuestra aplicación funcione**, ya que Node.js puede conectarse directamente a PostgreSQL mediante la biblioteca `pg`.

---

## CONSULTA 3: Middleware global de errores en Node.js y Express

### Prompt

> **Estoy desarrollando una API REST con Node.js y Express y quiero entender para qué sirve un middleware global de errores.**
>
> **¿Podrías explicarme qué función cumple, cómo funciona y qué diferencia tiene con manejar los errores directamente dentro de cada controller utilizando try/catch?**
>
> **También me gustaría entender qué diferencia existe entre un middleware y un validator, qué responsabilidad tiene cada uno y en qué situaciones conviene utilizar uno u otro. ¿Un validator puede formar parte de un middleware o son conceptos completamente independientes?**
>
> **Por último, me gustaría comprender en qué momento intervienen dentro del recorrido de una petición HTTP, qué ventajas tiene centralizar el manejo de errores y si es una buena práctica implementar esta estructura en mi proyecto MiniBlog.**
>
> **Preferiría una explicación conceptual, con ejemplos sencillos, antes de ver una implementación completa en código.**

### Respuesta de la IA

En una API REST desarrollada con Node.js y Express, los errores pueden ocurrir en diferentes momentos: al recibir una petición, validar datos, consultar la base de datos o ejecutar una operación.

Para gestionar estas situaciones existen diferentes mecanismos, como los bloques `try/catch`, los middlewares y las funciones de validación.

Aunque están relacionados, **cada uno cumple una responsabilidad diferente**.

#### 1. ¿Qué es un middleware global de errores?

Un middleware global de errores es una función de Express que se encarga de **recibir y gestionar los errores que ocurren durante el procesamiento de las peticiones HTTP**.

Su objetivo es centralizar el manejo de errores para evitar repetir la misma lógica en diferentes controllers.

Por ejemplo, imaginemos que nuestra API MiniBlog tiene estos endpoints:

```http
GET /authors
GET /authors/:id
POST /authors
GET /posts
POST /posts
```

En cualquiera de ellos podría ocurrir un error al consultar PostgreSQL.

Sin un middleware global, cada controller tendría que decidir cómo responder ante ese error.

Con un middleware global, podemos delegar esa responsabilidad a una única función.

Esto permite mantener respuestas consistentes y evitar duplicación de código.

#### 2. ¿Qué diferencia existe entre `try/catch` y un middleware global de errores?

##### Manejo de errores con `try/catch`

Un bloque `try/catch` permite capturar errores dentro de una función.

Por ejemplo:

```js
export const getAllAuthors = async (req, res) => {
  try {
    const authors = await findAllAuthors();

    return res.status(200).json(authors);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Error al obtener los autores",
    });
  }
};
```

Este código funciona correctamente.

Sin embargo, si tenemos diez controllers, probablemente terminemos repitiendo estructuras similares en todos ellos.

##### Manejo de errores con un middleware global

En lugar de responder directamente desde cada `catch`, podemos enviar el error al middleware global.

Por ejemplo:

```js
export const getAllAuthors = async (req, res, next) => {
  try {
    const authors = await findAllAuthors();

    return res.status(200).json(authors);
  } catch (error) {
    next(error);
  }
};
```

La diferencia está en:

```js
next(error);
```

Esta instrucción le indica a Express que ocurrió un error y que debe enviarlo al sistema de manejo de errores.

El middleware global podría ser:

```js
export const errorHandler = (err, req, res, next) => {
  console.error(err);

  return res.status(500).json({
    error: "Error interno del servidor",
  });
};
```

En este ejemplo, el middleware devuelve una respuesta genérica con estado `500`.

En una implementación más completa también podría distinguir errores de validación, recursos inexistentes y conflictos.

**Importante:** en Express 5, los errores de funciones asíncronas que devuelven promesas rechazadas se propagan automáticamente al manejador de errores. Por eso, en muchos casos no es necesario escribir un `try/catch` únicamente para llamar a `next(error)`.

#### 3. ¿Qué es un middleware y qué es un validator?

Aunque pueden trabajar juntos, no significan lo mismo.

##### Middleware

Un middleware es una función que participa en el procesamiento de una petición HTTP.

Tiene acceso a:

- `req`: información de la petición.
- `res`: objeto utilizado para enviar la respuesta.
- `next`: función que permite continuar el procesamiento.

Un middleware puede realizar diferentes tareas, como verificar autenticación, registrar peticiones, validar parámetros o gestionar errores.

##### Validator

Un validator es una función o conjunto de reglas cuya responsabilidad es **comprobar que determinados datos cumplen las condiciones esperadas**.

Por ejemplo, en MiniBlog, cuando recibimos:

```http
GET /authors/3
```

Necesitamos comprobar que el ID sea un entero positivo.

Podemos crear una función:

```js
export const isValidId = (id) => {
  return Number.isInteger(id) && id > 0;
};
```

Esta función es un validator.

Su única responsabilidad es determinar si el dato es válido.

No necesita conocer Express, ni acceder a `req` o `res`.

#### 4. ¿Un validator puede formar parte de un middleware?

Sí. De hecho, es una práctica habitual.

Un validator y un middleware no son conceptos excluyentes.

Por ejemplo, podemos tener un validator en `utils/validators.js`:

```js
export const isValidId = (id) => {
  return Number.isInteger(id) && id > 0;
};
```

Y utilizarlo dentro de un middleware:

```js
import { isValidId } from "../utils/validators.js";

export const validateAuthorId = (req, res, next) => {
  const id = Number(req.params.id);

  if (!isValidId(id)) {
    return res.status(400).json({
      error: "El ID debe ser un entero positivo",
    });
  }

  req.authorId = id;

  next();
};
```

En este caso:

- El **validator** determina si el ID cumple las condiciones.
- El **middleware** obtiene el ID de la petición, utiliza el validator y decide si la petición puede continuar.

Esto permite reutilizar la función `isValidId()` en diferentes partes del proyecto.

También es posible crear un middleware que contenga directamente las reglas de validación, especialmente cuando son simples.

#### 5. ¿En qué momento intervienen dentro de una petición HTTP?

Imaginemos que un cliente realiza esta petición:

```http
GET /authors/3
```

El recorrido podría ser:

```text
CLIENTE
   |
   v
EXPRESS
   |
   v
ROUTES
   |
   v
MIDDLEWARE DE VALIDACIÓN
   |
   |-- ID inválido --> Respuesta 400
   |
   v
CONTROLLER
   |
   v
SERVICE
   |
   v
POSTGRESQL
   |
   v
CONTROLLER
   |
   |-- Operación exitosa --> Respuesta 200
   |
   |-- Error propagado
   v
MIDDLEWARE GLOBAL DE ERRORES
   |
   v
RESPUESTA HTTP DE ERROR
```

Este esquema representa un recorrido posible. Los errores también pueden originarse en los middlewares o services, y llegar al manejador global si se propagan correctamente.

Además, una validación puede enviar directamente una respuesta `400`, como en el ejemplo anterior, o delegar el error al middleware global.

#### 6. ¿Qué ventajas tiene centralizar el manejo de errores?

Centralizar los errores aporta varias ventajas.

**Evita repetir código:** no necesitamos escribir la misma respuesta `500` en todos los controllers.

**Mantiene respuestas consistentes:** podemos establecer un formato común para los errores de nuestra API.

Por ejemplo:

```json
{
  "error": "Autor no encontrado"
}
```

**Facilita el mantenimiento:** si queremos modificar cómo registramos los errores, podemos hacerlo desde un único lugar.

**Separa responsabilidades:** los controllers se concentran en procesar peticiones, mientras que el middleware global se encarga de construir las respuestas de error.

**Mejora la seguridad:** permite evitar que detalles internos, como consultas SQL o mensajes sensibles de PostgreSQL, se envíen al cliente.

Sin embargo, centralizar los errores no significa que todos deban devolver `500`.

La API debe seguir diferenciando los códigos HTTP según el problema.

| Código | Significado | Ejemplo en MiniBlog |
|---|---|---|
| `400` | Petición inválida | ID con formato incorrecto |
| `404` | Recurso inexistente | Autor que no existe |
| `409` | Conflicto | Intento de crear un registro duplicado |
| `500` | Error interno | Fallo inesperado del servidor |

#### 7. ¿Es una buena práctica implementarlo en MiniBlog?

Sí. Para una API REST como MiniBlog, que utiliza Express y PostgreSQL, implementar un middleware global de errores es una buena práctica.

Una posible organización sería:

```text
src/
├── routes/
│   ├── authors.routes.js
│   └── posts.routes.js
│
├── controllers/
│   ├── authors.controller.js
│   └── posts.controller.js
│
├── services/
│   ├── authors.service.js
│   └── posts.service.js
│
├── middlewares/
│   ├── validateId.js
│   └── errorHandler.js
│
├── utils/
│   └── validators.js
│
├── config/
│   └── db.js
│
└── app.js
```

En esta estructura:

- `validators.js` contiene funciones que comprueban datos.
- `validateId.js` utiliza esas funciones para controlar las peticiones.
- `errorHandler.js` centraliza las respuestas ante errores propagados.
- Los controllers coordinan las operaciones y delegan la lógica a los services.
- Los services realizan las operaciones necesarias, incluyendo las consultas a PostgreSQL.

El middleware global de errores normalmente se registra en `app.js`, después de las rutas, para que pueda recibir los errores propagados desde ellas.

#### 8. Conclusión

Los tres conceptos cumplen funciones distintas, pero complementarias.

| Concepto | Responsabilidad |
|---|---|
| `try/catch` | Capturar errores dentro de una operación |
| Middleware | Intervenir en el procesamiento de una petición HTTP |
| Validator | Comprobar que los datos cumplen determinadas reglas |
| Middleware global de errores | Centralizar el tratamiento de errores propagados |

La idea principal es que **un validator comprueba datos, un middleware controla parte del recorrido de una petición y un middleware global de errores gestiona los errores que llegan hasta él**.

Para MiniBlog, esta separación permite mantener el proyecto modular, reducir la duplicación de código y facilitar futuras modificaciones.

No es necesario eliminar todos los bloques `try/catch`. Siguen siendo útiles cuando necesitamos recuperar una operación, realizar una limpieza o transformar un error específico. Lo importante es evitar que cada controller repita innecesariamente la misma lógica de respuesta.

---

## CONSULTA 4: Cómo compartir información entre un middleware y un controller en Express

### Prompt

> **Si tengo un middleware que se encarga de validar que el ID recibido en req.params.id sea un número entero positivo, ¿por qué el controller necesita volver a acceder a ese ID para realizar la consulta a la base de datos?**
>
> **¿Podrías explicarme cómo se comparte la información entre un middleware y un controller, qué función cumple next() y si existe alguna manera de aprovechar el ID que ya fue validado sin tener que procesarlo nuevamente?**
>
> **Me gustaría entender cuál es la mejor práctica para evitar duplicar lógica y mantener una separación clara de responsabilidades, con ejemplos sencillos aplicados a mi API MiniBlog.**

### Respuesta de la IA

En una API REST desarrollada con Node.js y Express, los middlewares y controllers cumplen responsabilidades diferentes, pero pueden compartir información durante el procesamiento de una petición HTTP.

La idea principal es que **si un middleware ya validó y transformó un ID, el controller no necesita repetir ese trabajo**.

#### 1. ¿Por qué el controller necesita el ID?

Imaginemos que un cliente realiza la siguiente petición:

```http
GET /authors/3
```

Express recibe el valor `3` mediante:

```js
req.params.id
```

Sin embargo, hay algo importante: **los parámetros de una URL llegan como strings**.

Por lo tanto:

```js
req.params.id; // "3"
```

Pero nuestra base de datos utiliza IDs numéricos, por lo que necesitamos convertirlo:

```js
const id = Number(req.params.id);
```

También debemos comprobar que sea un entero positivo.

El problema aparece cuando realizamos estas operaciones tanto en el middleware como en el controller.

Eso genera lógica duplicada innecesariamente.

#### 2. ¿Cómo se comparte información entre un middleware y un controller?

Express permite que los middlewares y controllers accedan al mismo objeto `req` durante una petición.

Esto significa que **un middleware puede agregar propiedades a `req` y los siguientes middlewares o controllers podrán utilizarlas**.

Por ejemplo, nuestro middleware podría ser:

```js
export const validateAuthorId = (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "El ID debe ser un entero positivo",
    });
  }

  req.authorId = id;

  next();
};
```

La línea fundamental es:

```js
req.authorId = id;
```

Con esta instrucción estamos guardando el ID convertido y validado dentro del objeto `req`.

Por lo tanto, cuando la petición llegue al controller, podremos utilizar directamente:

```js
const id = req.authorId;
```

Sin necesidad de volver a convertirlo ni validarlo.

#### 3. ¿Qué función cumple `next()`?

`next()` es una función proporcionada por Express que permite continuar con el procesamiento de la petición.

Por ejemplo:

```js
router.get("/:id", validateAuthorId, getAuthorById);
```

Express ejecuta las funciones en el orden establecido.

El recorrido sería:

```text
CLIENTE
   |
   v
GET /authors/3
   |
   v
MIDDLEWARE: validateAuthorId
   |
   |-- Convierte el ID a número
   |
   |-- Comprueba que sea un entero positivo
   |
   |-- ID inválido --> Respuesta 400
   |
   |-- ID válido
   v
req.authorId = id
   |
   v
next()
   |
   v
CONTROLLER: getAuthorById
   |
   v
SERVICE: findAuthorById
   |
   v
POSTGRESQL
   |
   v
RESPUESTA HTTP
```

Si el ID es válido, ejecutamos:

```js
next();
```

Esto permite que Express continúe con `getAuthorById`.

Si el ID es inválido, devolvemos una respuesta `400` y no llamamos a `next()`.

También existe `next(error)`, que se utiliza para propagar un error hacia los middlewares de manejo de errores.

#### 4. ¿Cómo quedaría el controller?

Una vez que el middleware validó el ID, el controller puede concentrarse exclusivamente en gestionar la operación.

Por ejemplo:

```js
export const getAuthorById = async (req, res) => {
  const id = req.authorId;

  const author = await findAuthorById(id);

  if (!author) {
    return res.status(404).json({
      error: "Autor no encontrado",
    });
  }

  return res.status(200).json(author);
};
```

En este ejemplo, el controller no necesita comprobar si el ID es válido porque esa responsabilidad ya fue asumida por el middleware.

Su trabajo consiste en:

1. Obtener el ID validado.
2. Solicitar al service que busque el autor.
3. Comprobar si el autor existe.
4. Devolver la respuesta HTTP correspondiente.

El ejemplo supone que utilizamos Express 5, que propaga automáticamente los errores de funciones asíncronas al manejador global de errores.

#### 5. ¿Qué responsabilidad tiene cada archivo?

En MiniBlog podríamos organizar esta funcionalidad de la siguiente manera:

| Archivo | Responsabilidad |
|---|---|
| `authors.routes.js` | Define la ruta y conecta middleware y controller |
| `validateAuthorId.js` | Convierte, valida y guarda el ID |
| `authors.controller.js` | Gestiona la petición y construye la respuesta |
| `authors.service.js` | Realiza la consulta a PostgreSQL |

Por ejemplo, el service podría contener:

```js
export const findAuthorById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM authors WHERE id = $1",
    [id]
  );

  return result.rows[0];
};
```

El service recibe directamente un ID numérico válido, sin necesidad de conocer `req`, `res` ni los detalles de la petición HTTP.

#### 6. ¿Es una buena práctica guardar información en `req`?

Sí. Es una práctica habitual en Express agregar información procesada al objeto `req` para que pueda utilizarse en las siguientes funciones.

Por ejemplo:

```js
req.authorId = id;
```

También es frecuente encontrar propiedades como:

```js
req.user = authenticatedUser;
```

En este caso, un middleware de autenticación podría guardar los datos del usuario autenticado para que los controllers puedan acceder a ellos.

Sin embargo, conviene tener en cuenta algunas recomendaciones:

- Utilizar nombres claros para las propiedades agregadas.
- Evitar modificar propiedades originales de Express innecesariamente.
- Mantener las validaciones en los middlewares correspondientes.
- Asegurarse de que las rutas ejecuten el middleware antes del controller que depende de sus datos.

Otra alternativa es utilizar `res.locals`, que Express proporciona específicamente para almacenar información disponible durante una petición.

Ambas opciones son válidas, siempre que se utilicen de manera consistente.

#### 7. Conclusión

La mejor práctica para MiniBlog es **validar y convertir el ID una sola vez**, dentro del middleware, y compartir el resultado con el controller.

De esta manera:

- El middleware se encarga de verificar que el ID sea válido.
- `next()` permite continuar con el procesamiento de la petición.
- El controller utiliza el ID que ya fue validado.
- El service recibe ese ID y ejecuta la consulta a PostgreSQL.

Esto evita duplicar lógica y mantiene una separación clara de responsabilidades.

La diferencia fundamental es que **el middleware determina si la petición puede continuar, mientras que el controller utiliza los datos ya procesados para resolver lo que solicita el cliente**.

---

## CONSULTA 5: Tests con mocks vs. tests con base de datos real en Node.js y Express

### Prompt

> **En algunos tests estoy simulando las respuestas de la base de datos mediante mocks de pool.query, en lugar de ejecutar consultas reales contra PostgreSQL.**
> **Si todos los tests pasan correctamente, ¿significa que mi API funciona bien o podrían existir errores que estas pruebas no estén detectando?**
> **¿Podrías explicarme qué aspectos estoy comprobando realmente al utilizar mocks, qué problemas podrían pasar desapercibidos y cuál es la diferencia entre los tests unitarios y los tests de integración?**
> **También me gustaría entender si es recomendable complementar estas pruebas con tests que utilicen una base de datos real y qué ventajas y desventajas tiene cada enfoque.**
> **Preferiría una explicación conceptual, con ejemplos sencillos aplicados a mi proyecto MiniBlog, para comprender hasta qué punto puedo confiar en los resultados de mis tests.**

### Respuesta de la IA

Cuando desarrollamos una API REST con Node.js, Express y PostgreSQL, es importante comprobar que los endpoints funcionan correctamente.

Para hacerlo, podemos utilizar herramientas como Vitest y Supertest, y simular determinadas dependencias mediante *mocks*.

Sin embargo, **que todos los tests pasen no significa necesariamente que toda la API funcione correctamente en un entorno real**.

Esto se debe a que cada tipo de test comprueba aspectos diferentes del sistema.

#### 1. ¿Qué es un mock de `pool.query`?

Un *mock* es una simulación que reemplaza temporalmente el comportamiento de una función o dependencia real durante una prueba.

En MiniBlog utilizamos PostgreSQL mediante la librería `pg`, que permite ejecutar consultas SQL utilizando `pool.query()`.

Por ejemplo, un service podría realizar esta consulta:

```js
export const findAuthorById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM authors WHERE id = $1",
    [id]
  );

  return result.rows[0];
};
```

En condiciones normales, `pool.query()` se conecta a PostgreSQL, ejecuta la consulta y devuelve los resultados.

Pero durante un test podemos reemplazar esa función por un mock:

```js
pool.query.mockResolvedValue({
  rows: [
    {
      id: 3,
      name: "Ana",
    },
  ],
});
```

Esto significa que estamos indicando:

> **Cuando se ejecute `pool.query()`, devolvé estos datos simulados sin conectarte realmente a PostgreSQL.**

De esta manera, podemos comprobar cómo se comporta nuestro código frente a determinados resultados sin depender de una base de datos.

#### 2. ¿Qué estamos comprobando realmente con los mocks?

Los mocks permiten verificar que nuestra aplicación procesa correctamente las respuestas esperadas de sus dependencias.

Por ejemplo, podemos comprobar diferentes situaciones.

##### Caso 1: El autor existe

Simulamos que PostgreSQL devuelve un autor:

```js
{
  rows: [{ id: 3, name: "Ana" }]
}
```

Podemos comprobar que el endpoint:

```http
GET /authors/3
```

Devuelve:

```http
200 OK
```

Y los datos correspondientes al autor.

##### Caso 2: El autor no existe

Simulamos que PostgreSQL devuelve un arreglo vacío:

```js
{
  rows: []
}
```

Podemos comprobar que el controller responde:

```http
404 Not Found
```

##### Caso 3: Ocurre un error en la consulta

Simulamos que `pool.query()` falla:

```js
pool.query.mockRejectedValue(
  new Error("Error de conexión")
);
```

Podemos comprobar que nuestra API gestiona correctamente ese error y devuelve una respuesta adecuada, como `500 Internal Server Error`.

En todos estos casos estamos verificando **cómo reacciona nuestra aplicación ante diferentes comportamientos simulados de PostgreSQL**.

Pero no estamos comprobando que PostgreSQL realmente produzca esos resultados.

#### 3. ¿Qué errores pueden pasar desapercibidos?

Este es uno de los aspectos más importantes.

Imaginemos que nuestro service contiene esta consulta:

```js
const result = await pool.query(
  "SELECT * FROM autor WHERE id = $1",
  [id]
);
```

Existe un error: escribimos `autor` en lugar de `authors`.

Si nuestra tabla real se llama `authors`, PostgreSQL rechazará la consulta.

Sin embargo, si utilizamos un mock que devuelve directamente:

```js
{
  rows: [{ id: 3, name: "Ana" }]
}
```

El test podría pasar correctamente.

¿Por qué?

Porque **el mock no ejecuta ni interpreta la consulta SQL**. Simplemente devuelve la respuesta que configuramos.

Por lo tanto, los tests con mocks podrían no detectar problemas como:

- Nombres incorrectos de tablas o columnas.
- Errores de sintaxis SQL.
- Restricciones de claves primarias o foráneas.
- Diferencias entre los tipos de datos esperados y los reales.
- Problemas de conexión o configuración de PostgreSQL.
- Errores en las migraciones o en la estructura de la base de datos.
- Comportamientos inesperados al insertar, actualizar o eliminar registros.

Algunos de estos problemas pueden detectarse mediante verificaciones adicionales sobre las llamadas al mock, pero no se comprueba su comportamiento real en PostgreSQL.

#### 4. ¿Qué diferencia existe entre tests unitarios y tests de integración?

La diferencia principal está en **qué parte del sistema estamos comprobando y qué dependencias participan realmente**.

##### Tests unitarios

Un test unitario comprueba una unidad de código de forma aislada.

Por ejemplo, podemos probar la función:

```js
export const isValidId = (id) => {
  return Number.isInteger(id) && id > 0;
};
```

Queremos comprobar que:

```js
isValidId(3);    // true
isValidId(-2);   // false
isValidId(2.5);  // false
isValidId(NaN);  // false
```

No necesitamos iniciar Express ni conectarnos a PostgreSQL.

Estamos probando una función individual.

También podemos probar un service utilizando mocks de `pool.query`, aislándolo de la base de datos real.

##### Tests de integración

Un test de integración comprueba que diferentes componentes funcionan correctamente cuando interactúan entre sí.

Por ejemplo, podemos realizar una petición HTTP mediante Supertest:

```http
GET /authors/3
```

Y comprobar el recorrido:

```text
Supertest
   |
   v
Express
   |
   v
Routes
   |
   v
Middlewares
   |
   v
Controllers
   |
   v
Services
   |
   v
PostgreSQL
```

Si utilizamos una base de datos real, podemos comprobar que las consultas SQL funcionan correctamente y que los resultados se procesan como esperamos.

**Importante:** un test que utiliza Supertest y mocks de `pool.query` también puede considerarse un test de integración parcial, porque comprueba la interacción entre Express, las rutas, los middlewares y los controllers.

La diferencia es que la base de datos continúa simulada.

Por lo tanto, no todos los tests de integración necesitan utilizar una base de datos real.

#### 5. Comparación entre ambos enfoques

| Característica | Tests con mocks | Tests con PostgreSQL real |
|---|---|---|
| Velocidad | Generalmente más rápidos | Generalmente más lentos |
| Configuración | Más sencilla | Requiere preparar una base de datos |
| Conexión real | No | Sí |
| Validación de SQL | Limitada | Sí |
| Prueba de controllers | Sí | Sí, si se ejecutan los endpoints |
| Restricciones de PostgreSQL | Simuladas | Reales |
| Aislamiento | Alto | Menor |
| Detección de errores de integración | Parcial | Mayor |

Ambos enfoques tienen ventajas y limitaciones.

Los mocks permiten ejecutar pruebas rápidas y controladas.

Las pruebas con PostgreSQL permiten verificar que la aplicación funciona correctamente con una dependencia real.

#### 6. ¿Conviene utilizar una base de datos real para los tests?

Sí, especialmente cuando nuestra API depende de operaciones SQL.

Sin embargo, esto no significa que debamos reemplazar todos los mocks por consultas reales.

Lo recomendable es **combinar diferentes tipos de pruebas**.

Por ejemplo, para MiniBlog podríamos organizar los tests de esta manera:

##### Nivel 1: Tests unitarios

Comprobar funciones individuales.

Ejemplos:

- `isValidId()` acepta enteros positivos.
- `isValidId()` rechaza valores negativos.
- Un validator detecta campos obligatorios faltantes.

Son pruebas rápidas y no requieren PostgreSQL.

##### Nivel 2: Tests con mocks

Comprobar el comportamiento de los controllers y services frente a diferentes resultados simulados.

Ejemplos:

- Si un autor existe, devolver `200`.
- Si no existe, devolver `404`.
- Si la consulta falla, devolver `500`.
- Si el ID es inválido, devolver `400`.

Estas pruebas permiten verificar cómo responde la aplicación ante diferentes escenarios.

##### Nivel 3: Tests de integración con PostgreSQL

Comprobar que las operaciones funcionan realmente contra la base de datos.

Ejemplos:

- Crear un autor y comprobar que quedó guardado.
- Consultar un autor existente.
- Actualizar una publicación y verificar los cambios.
- Eliminar un registro y comprobar que ya no existe.
- Intentar crear un post con un `author_id` inexistente y verificar que PostgreSQL aplica la restricción de clave foránea.

Estas pruebas permiten detectar problemas que los mocks no necesariamente identifican.

Para evitar modificar datos importantes, conviene utilizar una **base de datos exclusiva para testing**, separada de desarrollo y producción.

#### 7. ¿Qué significa que todos mis tests pasen?

Supongamos que ejecutamos:

```bash
npm test
```

Y obtenemos:

```text
Test Files  4 passed (4)
Tests       28 passed (28)
```

Esto significa que los 28 tests ejecutados cumplieron las condiciones que definimos.

Es una señal positiva, pero no demuestra que toda la aplicación esté libre de errores.

Los tests solo pueden detectar problemas dentro de los escenarios que efectivamente comprueban.

Por ejemplo, si nuestros tests únicamente verifican que `GET /authors` devuelve `200`, no podemos concluir que `POST /authors`, `PUT /authors/:id` o `DELETE /authors/:id` funcionen correctamente.

Tampoco podemos asegurar que la conexión con PostgreSQL sea correcta si todas las consultas fueron simuladas.

Por eso, es importante evaluar no solamente cuántos tests pasan, sino también **qué funcionalidades y situaciones están cubiertas**.

#### 8. ¿Qué enfoque conviene para MiniBlog?

Para una API como MiniBlog, desarrollada con Express, PostgreSQL, Vitest y Supertest, una estrategia razonable sería:

1. Mantener los tests unitarios de validaciones y funciones auxiliares.
2. Utilizar mocks para comprobar respuestas HTTP y escenarios de error.
3. Incorporar algunos tests de integración con una base de datos PostgreSQL exclusiva para pruebas.
4. Verificar manualmente los endpoints principales mediante Swagger UI u otra herramienta HTTP.
5. Comprobar que las operaciones CRUD funcionan correctamente en un entorno similar al de producción.

No es necesario que todos los tests utilicen PostgreSQL real.

Podemos reservar las pruebas con base de datos para las operaciones más importantes o aquellas que dependen especialmente de restricciones y relaciones entre tablas.

Esto permite obtener un equilibrio entre velocidad, simplicidad y confianza.

#### 9. Conclusión

Los tests con mocks son útiles porque permiten comprobar el comportamiento de nuestra aplicación de forma rápida, controlada y aislada.

Sin embargo, **un mock de `pool.query` no garantiza que las consultas SQL funcionen realmente en PostgreSQL**.

Los tests unitarios permiten verificar componentes individuales, mientras que los tests de integración comprueban cómo interactúan diferentes partes del sistema.

Para MiniBlog, lo recomendable es combinar ambos enfoques.

De esta manera, podemos comprobar tanto que nuestros controllers y services responden correctamente como que las consultas y operaciones funcionan contra una base de datos real.

**La idea fundamental es que tener todos los tests en verde significa que el código superó las pruebas definidas, no que la API esté completamente libre de errores.**

Cuanto más representativos sean los escenarios probados y más componentes reales participen en las pruebas de integración, mayor será la confianza que podremos tener en el funcionamiento de nuestra API.
