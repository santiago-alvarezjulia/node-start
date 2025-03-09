import express, { NextFunction, Request, Response } from "express"
import environment from './environment/environment'
import { metricsMiddleware, exposeMetrics } from './metrics/prometheus'
import mongoose from "mongoose"
import logger from './logger/winston'

const app = express()

// Middleware para parsear JSON
app.use(express.json())

// Usar el middleware de métricas
app.use(metricsMiddleware)

// Endpoint para exponer las métricas
app.get('/metrics', exposeMetrics)

app.get("/", (req, res) => {
    res.status(200).json({ message: `Hola, TypeScript con Express!` })
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

// Ruta de ejemplo que lanza un error
app.get('/error', (req, res) => {
  throw new Error('Algo salió mal!')
})

// Ruta de ejemplo que lanza un error
app.get('/error2', (req, res) => {
  throw new Error('Algo salió mal 2!')
})

// Middleware para capturar errores no manejados (debe estar desps de todas las rutas!)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    message: `Error no manejado en ${req.method} ${req.path}`,
    error: err.message,
    stack: err.stack, // Stacktrace completo
    query: req.query,
    params: req.params,
    path: req.path
  })

  res.status(500).json({
    error: 'Internal Server Error'
  })
})

app.listen(environment.port, () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${environment.port}`)
})
