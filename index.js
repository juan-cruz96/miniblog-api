import express from "express";

const app = express();

const PORT = 3000;

app.get("/authors", (req, res)=>{
    res.json([{
        id: 1,
        name: "Juan",
        email: "ejemplo@ejemplo.com"
    }]);
});

app.listen(PORT, () => {
    console.log(`Servidor funcionando en puerto ${PORT}`)
});


