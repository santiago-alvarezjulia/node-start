import dotenv from 'dotenv'

// Detectar el entorno actual y cargar el archivo correcto
const envFile = `.env.${process.env.NODE_ENV || 'development'}`
dotenv.config({ path: envFile })

export default {
  port: process.env.PORT || 3000,
  mongoUrl: process.env.MONGO_URL || '',
  env: process.env.NODE_ENV || 'development',
}