# Proyecto Node.js con Express y TypeScript

Este proyecto es un servidor web basado en **Node.js**, utilizando **Express** y **TypeScript**. Está configurado para facilitar el desarrollo y la ejecución en producción con `npm run dev` y `npm run build && npm start`.

---

## 📌 Instalación

### **1️⃣ Instalación de Node.js con NVM**

Para manejar múltiples versiones de Node.js utilizar **NVM (Node Version Manager)**.

- **Instalar y usar Node.js**

  ```sh
  nvm install lts
  nvm use lts
  ```

Se instalará la versión LTS de Node y luego le indicaremos a nvm que la usaremos.

### **2️⃣ Instalación de dependencias con npm**

Una vez instalado Node.js, se instalan los paquetes del proyecto con:

```sh
npm install
```

---

## 📦 Dependencias ya instaladas y por qué se agregaron

| Paquete            | Propósito                                                                     |
| ------------------ | ----------------------------------------------------------------------------- |
| **express**        | Framework para manejar rutas y peticiones HTTP.                               |
| **typescript**     | Permite usar TypeScript en el proyecto.                                       |
| **ts-node**        | Ejecuta archivos TypeScript sin necesidad de compilarlos. Útil en desarrollo. |
| **nodemon**        | Reinicia automáticamente el servidor cuando hay cambios en los archivos.      |
| **@types/express** | Proporciona tipado de TypeScript para Express.                                |
| **dotenv**         | Para manejar variables de entorno                                             |
| **cross-env**      | Establecer variables de entorno de forma compatible en todos los OS.          |

---

## Configuración de ambientes

El proyecto soporta tres ambientes:

1. **Develop (Desarrollo)**: Configuración local, el archivo `.env` está en el repositorio.
2. **Staging (Pruebas previas a producción)**: Simula producción con datos de prueba, el archivo `.env.staging` **no** está en el repo.
3. **Production (Producción)**: Entorno real, el archivo `.env.production` **no** está en el repo.

### Archivos de configuración

Ejemplo de `.env` (Desarrollo, en el repo):
```env
PORT=3000
NODE_ENV=develop
DB_URL=mongodb://localhost:27017/dev_db
```

Ejemplo de `.env.staging` (Staging, fuera del repo):
```env
PORT=4000
NODE_ENV=staging
DB_URL=mongodb://staging-db-url
```

Ejemplo de `.env.production` (Producción, fuera del repo):
```env
PORT=8080
NODE_ENV=production
DB_URL=mongodb://prod-db-url
```

Para evitar subir archivos sensibles, se agregó lo siguiente al `.gitignore`:
```
.env.staging
.env.production
```

## Scripts para ejecutar el servidor

Los scripts en `package.json` permiten ejecutar el servidor en diferentes entornos:

```json
"scripts": {
  "dev": "cross-env NODE_ENV=develop nodemon --exec ts-node src/server.ts",
  "build": "tsc",
  "start:staging": "cross-env NODE_ENV=staging node -r dotenv/config dist/server.js dotenv_config_path=.env.staging",
  "start:prod": "cross-env NODE_ENV=production node -r dotenv/config dist/server.js dotenv_config_path=.env.production"
}
```

### Comandos disponibles:
- **Desarrollo:** `npm run dev` → Usa `nodemon` y `ts-node`. `nodemon` reinicia automáticamente el servidor al detectar cambios en los archivos. `ts-node` ejecuta el servidor sin necesidad de compilar. Es útil para desarrollo, pero **no optimizado para producción**, porque `ts-node` es más lento que ejecutar código compilado.
- **Compilar TypeScript:** `npm run build` → compila TypeScript (`.ts`) a JavaScript (`.js`) en la carpeta `dist/`, según lo definido en `tsconfig.json`.
- **Staging:** `npm run build && npm run start:staging` → levanta el server con el archivo de ambiente .env.staging
- **Producción:** `npm run build && npm run start:prod` → levanta el server con el archivo de ambiente .env.prod

`start` ejecuta el código compilado con `node`, mejorando rendimiento y estabilidad. No es útil para desarrollo ya que no recarga automáticamente los cambios (tienes que recompilar manualmente con npm run build).

---

## ✨ Estructura del proyecto

```
📂 proyecto/
 ├── 📂 src/
 │   ├── server.ts  # Código principal del servidor
 ├── 📂 dist/       # Código compilado (generado tras `npm run build`)
 ├── package.json   # Configuración del proyecto y dependencias
 ├── tsconfig.json  # Configuración de TypeScript
 ├── README.md      # Este archivo 📄
 ├── .env           # Variables de ambiente para dev
```

---

## Uso en proyectos

Tener en cuenta que en package.json hay referencias a la url del repositorio original del template, modificarlo en cada caso para que coincida con la url del proyecto real.
