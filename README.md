# Proyecto Node.js con Express y TypeScript

Este proyecto es un servidor web basado en **Node.js**, utilizando **Express** y **TypeScript** entre otras tecnologías.

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

## 📊 Monitoreo con Prometheus  

El servicio expone métricas en el endpoint `/metrics` utilizando `prom-client`. Se configuró la recolección automática de métricas del sistema (`collectDefaultMetrics()`) y se agregó una métrica personalizada para monitorear las solicitudes HTTP:  

- **`http_requests_total`**: Cuenta el total de solicitudes HTTP, etiquetadas por método, ruta y código de estado.  

  ```plaintext
  # HELP http_requests_total Total de solicitudes HTTP por endpoint y código de estado
  # TYPE http_requests_total counter
  http_requests_total{method="GET",route="/",status="200"} 42
  http_requests_total{method="POST",route="/login",status="401"} 3
  ```

Existe un archivo de configuración de Prometheus (prometheus.yml) en la raíz del proyecto.

Prometheus se ejecuta como un servicio dentro de `docker-compose`, en ambiente de desarrollo puede ser consultado en `http://localhost:9090`.

Tener en cuenta que Prometheus almacena los datos en disco local, por lo que si se cambia el server o se borran sus datos, se borran los datos de Proetheus. En un principio esto no es un problema, pero debería tenerse presente en el caso de querer escalar la solución.

TODO: falta agregar autenticación para los ambientes de prod y staging (parece que con un nginx)

---

## 📈 Visualización con Grafana  

Grafana está configurado en `docker-compose` y se conecta automáticamente a Prometheus como fuente de datos. Para el ambiente de desarrollo:  

1. Accede a Grafana en `http://localhost:3000` (usuario: `admin`, contraseña: `admin`).  
2. Agrega Prometheus como fuente de datos:  
   - **URL**: `http://prometheus:9090`  
3. Puedes crear un dashboard para visualizar `http_requests_total`, por ejemplo, con la siguiente consulta en **PromQL**:  

   ```promql
   sum by (status, route) (http_requests_total)
   ```

Esto mostrará el total de solicitudes agrupadas por código de estado y endpoint.

TODO: tener el dashboard ya definido, almacenado como un JSON para poder usarlo en todos los ambientes.

---

## 🟢 Exploración de MongoDB con Mongo Express  

Mongo Express permite visualizar y administrar la base de datos MongoDB desde una interfaz web. Para el ambiente de desarrollo está disponible en `http://localhost:8081`.  

- Se conecta automáticamente a la base de datos definida en `docker-compose`.  
- Permite visualizar colecciones, insertar documentos y ejecutar consultas en la base de datos local de desarrollo.  
- **Importante**: Solo está disponible en el entorno de desarrollo y **no debe ser usado en producción o staging**, en esos casos usar MongoDB Atlas o la herramienta que venga con el hosteo de la base de datos.  

---

## Configuración de ambientes

El proyecto soporta tres ambientes: Desarrollo, Staging y Producción. Para el caso del web server Node, usamos dot-env para levantar las variables de entorno de un archivo, por lo tanto vamos a tener un archivo por ambiente:

1. **Develop (Desarrollo)**: Configuración local, el archivo `.env.development` está en el repositorio.
2. **Staging (Prueba)**: Simula producción con datos de prueba, el archivo `.env.staging` **no** está en el repo ya que contiene información sensible.
3. **Production (Producción)**: Entorno real, el archivo `.env.production` **no** está en el repo ya que contiene información sensible.

Ejemplo de `.env.development`:

```env
PORT=3000
NODE_ENV=development
MONGO_URL=mongodb://mongo:27017/mydatabase
```

Los archivos de configuración de staging y production deben generarse a parte y almacenarse donde sea que se levante el web server, para poder ser usados por dot-env.

Para evitar subir estos archivos sensibles, se agregaron al `.gitignore`.

Estos archivos que vimos anteriormente sirven para definir las variables de entorno que necesita el web server, pero existen otras variables de entorno para el resto de los servicios que corren en paralelo al web server: Grafana y MongoExpress (este último solo en desarrollo).
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

# Ejecución con Docker

Este proyecto utiliza Docker para encapsular la aplicación en diferentes entornos de ejecución. Se han definido **Dockerfile** y **docker-compose** específicos para cada ambiente según sus necesidades.

---

## 1️⃣ **Ambiente de Desarrollo**

Este entorno permite desarrollar la aplicación con recarga automática de cambios. Levanta una base de datos MongoDB para desarrollo y Mongo Express para monitorearla. También levanta Prometheus y Grafana para visualización de métricas del web server. 

### 📌 **Levantar el entorno de desarrollo**
```sh
docker-compose -f docker-compose.development.yml up --build
```

### 🔹 **Funcionalidades**
- Se construye la imagen del web server según lo definido en `Dockerfile.development`, se define `NODE_ENV=development`.
- Se ejecuta el comando `npm run dev` al iniciar el contenedor, lo que corre el script `dev` definido en package.json.
- Se levanta un servicio de MongoDB junto con el web server.
- Se levanta un servicio de Mongo Express en el puerto 8081 junto con el web server.
- Se levanta un servicio de Prometheus en el puerto 9090 junto con el web server.
- Se levanta un servicio de Grafana en el puerto 3001 junto con el web server..

---

## 2️⃣ **Ambiente de Staging**

Este entorno simula un entorno de producción con las configuraciones necesarias, pero sin ser el entorno final de despliegue.

### 📌 **Levantar el entorno de staging (debe correrse en el propio servidor donde va a correr el web server)**

```sh
docker-compose -f docker-compose.staging.yml up --build -d
```

### 🔹 **Funcionalidades**
- Se construye la imagen del web server según lo definido en `Dockerfile.staging`, se define `NODE_ENV=staging`.
- Primero compila todo el código TypeScript del proyecto a JavaScript con el comando `npm run build`.
- Se ejecuta el comando `npm run staging` al iniciar el contenedor, lo que corre el script `staging` definido en package.json.
- No se levanta MongoDB porque se asume que la base de datos está en un servicio externo, y tampoco Mongo Express ya que no es apto para ambientes que no son de desarrollo.
- Se levanta un servicio de Prometheus en el puerto 9090 junto con el web server.
- Se levanta un servicio de Grafana en el puerto 3001 junto con el web server.

---

## 3️⃣ **Ambiente de Producción**
Este entorno está optimizado para ejecución en servidores y servicios en la nube.

### 📌 **Levantar el entorno de producción (debe correrse en el propio servidor donde va a correr el web server)**
```sh
docker-compose -f docker-compose.production.yml up --build -d
```

### 🔹 **Funcionalidades**
- Se construye la imagen del web server según lo definido en `Dockerfile.production`, se define `NODE_ENV=production`.
- Primero compila todo el código TypeScript del proyecto a JavaScript con el comando `npm run build`.
- Se ejecuta el comando `npm run production` al iniciar el contenedor, lo que corre el script `production` definido en package.json.
- No se levanta MongoDB porque se asume que la base de datos está en un servicio externo, y tampoco Mongo Express ya que no es apto para ambientes que no son de desarrollo.
- Se levanta un servicio de Prometheus en el puerto 9090 junto con el web server.
- Se levanta un servicio de Grafana en el puerto 3001 junto con el web server.

---

## 4️⃣ **Parar los Contenedores**

Para detener y eliminar los contenedores de cualquier ambiente:

```sh
docker-compose -f docker-compose.<ambiente>.yml down
```

---

## Scripts para ejecutar al iniciar el contenedor

Los scripts que se ejecutan al iniciar el contenedor, se encuentran definidos en `package.json`:

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

# Uso de Github Actions para Deploy (Staging y Producción)

Este proyecto utiliza **GitHub Actions** para automatizar el proceso de deploy en los entornos de **staging** y **producción**. Vamos a ver la configuración para Staging (es casi idéntica que la de producción). La configuración se encuentra en `.github/workflows/deploy-staging.yml` y se activa automáticamente cuando se realiza un **push** a la rama `staging`.

## Flujo del Deployment en Staging

El workflow consta de dos trabajos principales:

### 1. **Construcción y subida de la imagen Docker** (`build-and-push`)

Este job se encarga de:
- Descargar el código del repositorio.
- Generar un archivo `.env.staging` con variables de entorno desde `secrets`, el dashboard de Github Actions que se accede desde la web de GitHub.
- Loguearse en Docker Hub con credenciales seguras (previamente hay que crearse un usuario en Docker).
- Construir la imagen Docker usando `Dockerfile.staging`.
- Subir la imagen al Docker Hub.

### 2. **Deploy en el Servidor** (`deploy`)

Este job se ejecuta solo si el job `build-and-push` finaliza con éxito y se encarga de:
- Generar el archivo `.env` con las credenciales de Grafana.
- Transferir los archivos `.env` y `docker-compose.staging.yml` al servidor vía SCP.
- Conectarse al servidor vía SSH y realizar:
  - Descarga de la última imagen de Docker, es decir la subida en el job `build-and-push` previo.
  - Reinicio de los contenedores con `docker-compose`.
  - Eliminación de imágenes antiguas para liberar espacio.

## Configuración de Secretos en GitHub

Para garantizar seguridad, las credenciales y configuraciones sensibles están almacenadas en **GitHub Secrets** y se utilizan en el workflow mediante `${{ secrets.VARIABLE }}`.

Los secretos configurados incluyen:
- **Credenciales de Docker Hub:** `STAGING_DOCKER_USERNAME`, `STAGING_DOCKER_PASSWORD`
- **Variables de entorno:** `STAGING_PORT`, `STAGING_NODE_ENV`, `STAGING_MONGO_URL`
- **Acceso SSH al servidor:** `STAGING_SERVER_IP`, `STAGING_USER`, `STAGING_SSH_PRIVATE_KEY`
- **Credenciales de Grafana:** `STAGING_GRAFANA_ADMIN_USER`, `STAGING_GRAFANA_ADMIN_PASSWORD`

## Cómo Probar el Workflow Localmente

Si deseas probar el script de GitHub Actions en tu máquina antes de hacer un push, puedes hacer lo siguiente:

1. **Correr manualmente los pasos:**
   - Ejecuta cada comando definido en el workflow directamente en tu terminal.
   - Asegúrate de reemplazar `${{ secrets.VARIABLE }}` con valores locales.

2. **Usar la herramienta `act`**
   - Instala `act` ([documentación aquí](https://github.com/nektos/act)).
   - Corre el workflow localmente con:
     ```sh
     act -j build-and-push
     ```
   - Esto simula la ejecución de GitHub Actions en tu máquina.

## Flujo del Deployment en Producción

En si es el mismo flujo, lo único que cambia son los nombres de las credenciales almacenadas en **GitHub Secrets**, se cambia el prefijo `STAGING` por `PRODUCTION` y toma los valores de producción que deben ser diferentes a los de Staging (mejores servicios para el ambiente productivo).

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
En los workflow de deploy de GitHub actions hay referencias al nombre de la imagen del web server, modificarlo en cada caso para que coincida con el nombre elegido con el que se almacena en Docker Hub.
