import express from "express"
import dotenv from 'dotenv'

const envFile = process.env.NODE_ENV === 'production' ? '.env.production'
  : process.env.NODE_ENV === 'staging' ? '.env.staging'
  : '.env'
dotenv.config({ path: envFile })

const app = express()
const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
    res.send(`Hola, TypeScript con Express!`)
})

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
