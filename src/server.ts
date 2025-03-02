import express from "express"
import environment from './environment'

const app = express()

app.get("/", (req, res) => {
    res.send(`Hola, TypeScript con Express!`)
})

app.listen(environment.port, () => {
    console.log(`Servidor corriendo en http://localhost:${environment.port}`)
})
