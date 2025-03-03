import express from "express"
import environment from './environment'
import { metricsMiddleware, exposeMetrics } from './metrics/prometheus'

const app = express()

// Usar el middleware de métricas
app.use(metricsMiddleware)

// Endpoint para exponer las métricas
app.get('/metrics', exposeMetrics)

app.get("/", (req, res) => {
    res.send(`Hola, TypeScript con Express!`)
})

app.get('/error', (req, res) => {
    res.status(500).send('Error simulado');
  });

app.listen(environment.port, () => {
    console.log(`Servidor corriendo en http://localhost:${environment.port}`)
})
