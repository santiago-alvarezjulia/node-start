import express from "express"
import environment from './environment'
import { metricsMiddleware, exposeMetrics } from './metrics/prometheus'
import mongoose from "mongoose"

const app = express()

// Middleware para parsear JSON
app.use(express.json())

// Usar el middleware de métricas
app.use(metricsMiddleware)

// Endpoint para exponer las métricas
app.get('/metrics', exposeMetrics)

app.get("/", (req, res) => {
    res.send(`Hola, TypeScript con Express!`)
})

app.get('/error', (req, res) => {
    res.status(500).send('Error simulado')
})

// Conectar a MongoDB
mongoose.connect(environment.mongoUrl)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión:', err))

// Definir un esquema simple de usuario
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    createdAt: { type: Date, default: Date.now }
})

const User = mongoose.model('User', userSchema)

// Endpoint de prueba
app.get('/test', async (req, res) => {
    try {
      // Crear un usuario de prueba
      const testUser = new User({
        name: 'Usuario Test',
        email: 'test@example.com'
      })
  
      // Guardar en la base de datos
      await testUser.save()
  
      // Devolver el usuario creado
      res.status(200).json({
        message: 'Conexión exitosa',
        user: testUser
      })
    } catch (error) {
      res.status(500).json({
        message: 'Error en la conexión o al crear usuario',
        error: error
      })
    }
})

app.listen(environment.port, () => {
    console.log(`Servidor corriendo en http://localhost:${environment.port}`)
})
