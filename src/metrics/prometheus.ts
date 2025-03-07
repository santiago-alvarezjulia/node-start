import { Request, Response, NextFunction } from 'express'
import promClient from 'prom-client'

// Habilitar la recolección de métricas predeterminadas de Node.js (CPU, memoria, etc.)
promClient.collectDefaultMetrics()

// Definir el contador para las respuestas HTTP
const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total de solicitudes HTTP por endpoint y código de estado',
  labelNames: ['method', 'route', 'status'],
});

// Middleware para capturar métricas
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    const route = req.route ? req.route.path : req.path; // Obtener la ruta del endpoint

    // Evitar registrar métricas para la ruta /metrics
    if (route !== '/metrics') {
      httpRequestCounter.inc({
        method: req.method,
        route: route,
        status: res.statusCode.toString(), // Convertir a string para consistencia
      })
    }
  })
  next()
}

// Función para exponer las métricas en el endpoint /metrics
export const exposeMetrics = async (req: Request, res: Response) => {
  res.set('Content-Type', promClient.register.contentType)
  res.end(await promClient.register.metrics())
}

// Exportar el cliente de Prometheus por si necesitas usarlo en otro lugar
export { promClient }
