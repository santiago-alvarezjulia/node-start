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

---

## 🚀 Uso del servidor

### **1️⃣ Desarrollo** (`npm run dev`)

Se agrega el script dev a package.json.

```json
"dev": "nodemon --ext ts --exec ts-node src/server.ts"
```

- Ejecuta el servidor con `ts-node`, sin necesidad de compilar.
- `nodemon` reinicia automáticamente el servidor al detectar cambios en los archivos.
- Es útil para desarrollo, pero **no optimizado para producción**, porque `ts-node` es más lento que ejecutar código compilado.

**Levantar para desarrollo:**

```sh
npm run dev
```

### **2️⃣ Producción** (`npm run build && npm start`)

Se agregan los scripts build y start a package.json.

```json
"build": "tsc",
"start": "node dist/server.js"
```

- `tsc` compila TypeScript (`.ts`) a JavaScript (`.js`) en la carpeta `dist/`, según lo definido en `tsconfig.json`.
- `start` ejecuta el código compilado con `node`, mejorando rendimiento y estabilidad.
- No es útil para desarrollo ya que no recarga automáticamente los cambios (tienes que recompilar manualmente con npm run build).

**Levantar para producción:**

```sh
npm run build
npm start
```

---

## ✨ Estructura del proyecto

```
📂 proyecto/
 ├── 📂 src/
 │   ├── server.ts  # Código principal del servidor
 ├── 📂 dist/        # Código compilado (generado tras `npm run build`)
 ├── package.json   # Configuración del proyecto y dependencias
 ├── tsconfig.json  # Configuración de TypeScript
 ├── README.md      # Este archivo 📄
```

---

## 🌍 Despliegue

Para desplegar el servidor en producción:

```sh
npm install --omit=dev  # Instalar solo dependencias de producción
npm run build
npm start
```

## Uso en proyectos

Tener en cuenta que en package.json hay referencias a la url del repositorio original del template, modificarlo en cada caso para que coincida con la url del proyecto real.
