export const validateId = (req, res , next) => {

    const id = Number(req.params.id);


    if(!Number.isInteger(id) || id<= 0){
            return res.status(400).json({
                error: "El ID debe ser un numero entero positivo"
            });
        }

    req.authorId = id;    

    next();
} 