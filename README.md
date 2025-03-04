# Proyecto Node.js con Express y TypeScript

Este proyecto es un servidor web basado en **Node.js**, utilizando **Express** y **TypeScript**.

---

## 📌 Instalación

### **1️⃣ Instalación de NPM con NVM**

Para instalar paquetes sin Docker (ejemplo: npm install antes de hacer un docker build), podemos utilizar **NVM (Node Version Manager)**.

- **Instalar y usar NPM**

  ```sh
  nvm install lts
  nvm use lts
  ```

Ademas se instalará la versión LTS de Node, que en nuestro caso no es necesaria ya que usaremos docker (en el Dockerfile especificamos la version de node que usaremos).

### **2️⃣ Instalación de dependencias con npm**

Una vez instalado NPM, se instalan los paquetes del proyecto con:

```sh
npm install <paquete>
```

Para el caso de dependencias que solo deban usarse en desarrollo (como ts-node y nodemon), instalarlas de la siguiente manera:

```sh
npm install --save-dev <paquete>
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
| **dotenv**         | Carga variables de entorno desde un archivo .env file en process.env.         |
| **mongoose**       | MongoDB object modeling para node.js                                          |
| **prom-client**    | Cliente de Prometheus para node.js                                            |

---

## Configuración de ambientes

El proyecto soporta tres ambientes:

1. **Develop (Desarrollo)**: Configuración local, el archivo `.env.development` está en el repositorio.
2. **Staging (Prueba)**: Simula producción con datos de prueba, el archivo `.env.staging` **no** está en el repo.
3. **Production (Producción)**: Entorno real, el archivo `.env.production` **no** está en el repo.

### Archivos de configuración

Ejemplo de `.env.development` (Desarrollo, en el repo):
```env
PORT=3000
NODE_ENV=development
MONGO_URL=mongodb://mongo:27017/mydatabase
```

Ejemplo de `.env.staging` (Staging, fuera del repo):
```env
PORT=4000
NODE_ENV=staging
MONGO_URL=mongodb+srv://user:password@mi-mongo-host.mongodb.net/mi_basededatos
```

Ejemplo de `.env.production` (Producción, fuera del repo):
```env
PORT=8080
NODE_ENV=production
MONGO_URL=mongodb+srv://user:password@mi-mongo-host.mongodb.net/mi_basededatos
```

Para evitar subir archivos sensibles, se agregó lo siguiente al `.gitignore`:
```
.env
.env.staging
.env.production
```

Tener en cuenta que para el caso de development, el .env.development se encuentra en el repositorio ya que no contiene información sensible, pero para staging y production no podemos hacer lo mismo, deben estar en el entorno donde se ejecute su respectivo docker-compose. Mas adelante veremos como se configura esto usando Github Actions.

Estos archivos que vimos sirven para definir las variables de entorno que necesita el web server y nos ayuda definirlas así para poder levantarlas de manera amigable con dotenv, pero existen otras variables de entorno para el resto de los servicios que corren en paralelo al web server: Grafana y MongoExpress.
Deben estar definidas las siguientes variables de entorno en el sistema al correr esos servicios:

```env
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin
ME_URL=mongodb://mongo:27017
ME_ADMIN_USER=admin
ME_ADMIN_PASSWORD=admin
```

Donde las primeras dos son el usuario y contraseña utilizados para ingresar a Grafana. Luego tenemos ME_URL que es la url del mongo y luego el usuario y contraseña utilizados para ingresar a MongoExpress.
Se recomienda crearse un archivo .env para almacenarlas (veremos luego que se hacer esto mismo en Github Actions)

---

## Scripts para ejecutar el servidor

Los scripts en `package.json` permiten ejecutar el servidor en diferentes entornos:

```json
"scripts": {
  "dev": "nodemon --exec ts-node src/server.ts",
  "build": "tsc",
  "staging": "node -r dotenv/config dist/server.js dotenv_config_path=.env.staging",
  "production": "node -r dotenv/config dist/server.js dotenv_config_path=.env.production"
}
```

### Comandos disponibles:

- **Desarrollo:** `npm run dev` → Usa `nodemon` y `ts-node`. `nodemon` reinicia automáticamente el web server al detectar cambios en los archivos .ts dentro de src. `ts-node` ejecuta el web server sin necesidad de compilar. Es útil para desarrollo, pero **no optimizado para producción**, porque `ts-node` es más lento que ejecutar código compilado.
- **Compilar TypeScript:** `npm run build` → compila TypeScript (`.ts`) a JavaScript (`.js`) y almacena los .js en la carpeta `dist/`, según lo definido en `tsconfig.json`.
- **Staging:** `npm run staging` (**requiere llamada previa a build**) → levanta el web server con el archivo de ambiente .env.staging
- **Producción:** `npm run production` (**requiere llamada previa a build**) →  levanta el web server con el archivo de ambiente .env.prod

`staging` y `production` ejecutan el código compilado con `node`, mejorando rendimiento y estabilidad. No es útil para desarrollo ya que no recarga automáticamente los cambios (habría que recompilar manualmente con npm run build).

---

## ✨ Estructura del proyecto

```
📂 proyecto/
 ├── 📂 .github/workflows
 │   ├── deploy-*.yml          # Script de deploy para correr en GitHub Actions segun el ambiente (development no tiene deploy)
 ├── 📂 dist/                 # Código compilado en .js (generado tras `npm run build`)
 ├── 📂 src/
 │   ├── server.ts             # Código principal del web server
 ├── nodemon.json              # Configuración de NodeMon 
 ├── .env                      # Variables de entorno para Grafana y MongoExpress
 ├── docker-compose.*.yml      # Compose para levantar los containers necesarios según el ambiente 
 ├── Dockerfile.*              # Dockerfile con la definición de como generar la imagen del web server según el ambiente
 ├── package*.json             # Configuración del proyecto y dependencias
 ├── prometheus.yml            # Configuración de Prometheus
 ├── README.md                 # Este archivo 📄
 ├── tsconfig.json             # Configuración de TypeScript 
```

---

## Uso en proyectos

Tener en cuenta que en package.json hay referencias a la url del repositorio original del template, modificarlo en cada caso para que coincida con la url del proyecto real.

# Ejecutar el Proyecto en Diferentes Ambientes con Docker

Este proyecto utiliza Docker para encapsular la aplicación en diferentes entornos de ejecución. Se han definido **Dockerfile** y **docker-compose** específicos para cada ambiente: **development, staging y production**.

---

## 1️⃣ **Ambiente de Desarrollo**
Este entorno permite desarrollar la aplicación con recarga automática de cambios. También levanta una base de datos MongoDB para desarrollo.

### 📌 **Levantar el entorno de desarrollo**
```sh
docker-compose -f docker-compose.development.yml up --build
```

### 🔹 **Explicación**
- Se construye la imagen desde `Dockerfile.dev`.
- Se define `NODE_ENV=development`.
- Se ejecuta `npm run dev` dentro del contenedor.
- Se levanta un servicio de MongoDB junto con la aplicación.

---

## 2️⃣ **Ambiente de Staging**
Este entorno simula un entorno de producción con las configuraciones necesarias, pero sin ser el entorno final de despliegue.

### 📌 **Levantar el entorno de staging**
```sh
docker-compose -f docker-compose.staging.yml up --build -d
```

### 🔹 **Explicación**
- Se construye la imagen desde `Dockerfile.staging`.
- Se define `NODE_ENV=staging`.
- Se ejecuta `npm run staging`, lo que primero compila TypeScript a JavaScript (`npm run build`).
- No se levanta MongoDB porque se asume que la base de datos está en un servicio externo.
- Se usa `-d` para correr los contenedores en segundo plano.

---

## 3️⃣ **Ambiente de Producción**
Este entorno está optimizado para ejecución en servidores y servicios en la nube.

### 📌 **Levantar el entorno de producción**
```sh
docker-compose -f docker-compose.production.yml up --build -d
```

### 🔹 **Explicación**
- Se construye la imagen desde `Dockerfile.production`.
- Se define `NODE_ENV=production`.
- Se ejecuta `npm run production`, que primero compila el código (`npm run build`).
- No se levanta MongoDB ya que la aplicación debería conectarse a una base de datos externa.
- Se ejecuta en modo **detached** (`-d`).

---

## 4️⃣ **Parar los Contenedores**
Para detener y eliminar los contenedores de cualquier ambiente:
```sh
docker-compose -f docker-compose.<ambiente>.yml down
```
Ejemplo para **staging**:
```sh
docker-compose -f docker-compose.staging.yml down
```

---

## 🔥 **Consideraciones Finales**
✔ **El entorno de desarrollo** incluye MongoDB y recarga automática.
✔ **Los entornos de staging y producción** no incluyen MongoDB; se espera que usen una base de datos externa.
✔ **Cada ambiente tiene su propio Dockerfile y docker-compose** para mayor flexibilidad y control.

---

Con estos comandos, puedes levantar y probar cada ambiente en tu máquina local de forma rápida y sencilla. 🚀
