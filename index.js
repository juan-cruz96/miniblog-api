import express from "express";

const app = express();

const PORT = 3000;

const authors = [
  {
    id: 1,
    name: "Juan",
    email: "juan@ejemplo.com"
  },
  {
    id: 2,
    name: "Pedro",
    email: "pedro@ejemplo.com"
  },
  {
    id: 3,
    name: "Ana",
    email: "ana@ejemplo.com"
  }
];

app.get("/authors", (req, res)=>{
    res.json(authors);
});

app.get("/authors/:id", (req, res)=>{
    const id = Number(req.params.id);

    if(!Number.isInteger(id) || id<= 0){
        return res.status(400).json({
            error: "El ID debe ser un numero entero positivo"
        });
    }

    const author = authors.find((author) => author.id === id);

    console.log(author);

    if(!author){
        return res.status(404).json({
            error: "Autor no encontrado"
        });
    }

    res.json(author);
})

app.listen(PORT, () => {
    console.log(`Servidor funcionando en puerto ${PORT}`)
});


