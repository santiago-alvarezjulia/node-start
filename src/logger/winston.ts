import winston from 'winston'
import LokiTransport from 'winston-loki'

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp({
        format: () => new Intl.DateTimeFormat('es-AR', {
          timeZone: 'America/Argentina/Buenos_Aires',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(new Date()).replace(/,/, ''), // Quita la coma si aparece
    }),
    winston.format.errors({ stack: true }), // Incluye stacktrace
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
        filename: 'logs/errors.log',
        handleExceptions: true, // Captura excepciones en el transporte
        maxsize:  25 * 1024 * 1024, // 25 MB (en bytes)
        maxFiles: 4 // Máximo 4 archivos rotados
    }),
    new LokiTransport({
      host: 'http://loki:3100',
      labels: (info: any) => ({ app: 'nodejs', path: info.path }),
      json: true
    })
  ]
})

export default logger