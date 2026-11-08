# Techsmart B2B — Web

Portal web de Techsmart (El Salvador), mayorista de productos tecnológicos y suministros informáticos para clientes empresariales y personales: catálogo B2B, cotizador con precios por volumen e IVA (13 %), y reclamos de garantía (RMA).

Comparte el mismo proyecto de Firebase que la app Android ([Davies2025/techsmart-b2b-app](https://github.com/Davies2025/techsmart-b2b-app)): las cuentas, cotizaciones y reclamos se ven en ambas.

## 🛠️ Tecnologías

- **Next.js 16** (App Router) con React y TypeScript.
- **Tailwind CSS**, Lucide React y `sonner` para notificaciones.
- **Firebase**: Authentication (correo y contraseña), Firestore y Storage.

## 🚀 Instalación y configuración

### Requisitos

- **Node.js 20.9 o superior** (comprobar con `node -v`).
- **Git** y acceso a este repositorio.

### Pasos

1. Clonar el repositorio e instalar dependencias:

   ```bash
   git clone https://github.com/CarlosRuizHub/techsmart-b2b.git
   cd techsmart-b2b
   npm install
   ```

2. Crear el archivo **`.env.local`** en la raíz del proyecto con la configuración de Firebase. Las variables y sus valores están en el documento de configuración que comparte el equipo.
   - Este archivo **no se sube a Git** (está en `.gitignore`) y sus valores no deben publicarse en el repositorio ni en grupos.

3. Levantar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   y abrir [http://localhost:3000](http://localhost:3000).

> Si se modifica `.env.local`, hay que detener el servidor (Ctrl + C) y volver a ejecutar `npm run dev`: Next.js solo lee las variables al arrancar.

### Comandos útiles

| Comando | Para qué sirve |
|---|---|
| `npm run dev` | Servidor de desarrollo en http://localhost:3000 |
| `npm run build` | Compilación de producción (sirve para comprobar que no hay errores) |
| `npm run start` | Ejecuta la compilación de producción |
| `npm run lint` | Revisión de código con ESLint |

## 👤 Cuentas de usuario

- El registro y el inicio de sesión usan **Firebase Authentication**. Una cuenta creada en la web funciona en la app Android y viceversa.
- Las cuentas antiguas (las que guardaban un hash de la contraseña en Firestore) ya no sirven: hay que registrarse de nuevo.
- Todos usamos la **misma base de datos**: lo que se cree al probar es real. Usen cuentas de prueba y borren desde la consola de Firebase lo que no sirva.
- El catálogo (`productos`) es de solo lectura para la web: el botón "Sincronizar con Firestore" ya no puede escribir. Los productos se cargan desde la consola de Firebase o con el Admin SDK.

## 🤝 Cómo trabajar en equipo

1. Antes de empezar, actualizar `master`:

   ```bash
   git checkout master
   git pull
   ```

2. Crear una rama por tarea:

   ```bash
   git checkout -b feature/nombre-de-la-tarea
   ```

3. Hacer commits en esa rama, subirla (`git push -u origin feature/nombre-de-la-tarea`) y abrir un **Pull Request** hacia `master` para que el equipo lo revise antes de unirlo. No subir cambios directo a `master`.
