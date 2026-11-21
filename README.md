# RegistraU — Sistema de Registro y Gestión de Estudiantes

## 1. Descripción del proyecto

RegistraU es una aplicación web desarrollada para facilitar el registro, la consulta y la administración de información de estudiantes o postulantes. El proyecto busca reducir errores en el ingreso de datos mediante validaciones y proporcionar una interfaz sencilla para gestionar los registros.

Este proyecto se desarrolla como parte del curso **Herramientas de Desarrollo**, aplicando buenas prácticas de programación, pruebas y trabajo colaborativo mediante Git y GitHub.

## 2. Objetivo

Desarrollar una aplicación web que permita gestionar registros de manera organizada, validar la información ingresada y facilitar la consulta y exportación de los datos.

## 3. Funcionalidades principales

- Registro de estudiantes o postulantes.
- Validación de campos obligatorios y formatos de datos.
- Validación de documentos y correos electrónicos.
- Prevención de registros duplicados.
- Consulta y búsqueda de registros.
- Edición de registros existentes.
- Visualización de indicadores generales.
- Exportación de registros a archivos CSV.
- Almacenamiento de información mediante SQLite.
- Pruebas automatizadas para comprobar las validaciones.

La disponibilidad de cada funcionalidad depende de la versión integrada de la aplicación.

## 4. Tecnologías utilizadas

- **JavaScript:** lógica de la aplicación.
- **HTML5:** estructura de la interfaz.
- **CSS3:** presentación y estilos.
- **Node.js:** entorno de ejecución.
- **Express:** servidor y API HTTP.
- **SQLite:** almacenamiento de datos.
- **Git:** control de versiones.
- **GitHub:** colaboración y alojamiento del repositorio.
- **Node.js Test Runner:** ejecución de pruebas automatizadas.

## 5. Estructura del proyecto

```text
herramientas-desarrollo-proyecto-final/
├── data/
├── docs/
├── public/
├── scripts/
├── src/
│   ├── db.js
│   ├── server.js
│   └── validation.js
├── tests/
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## 6. Requisitos previos

Antes de ejecutar el proyecto, se necesita:

- Node.js 22.5.0 o una versión compatible con las dependencias.
- npm.
- Git.
- Un editor de código, como Visual Studio Code.

## 7. Instalación

Clonar el repositorio:

```bash
git clone https://github.com/JoseDs160899/herramientas-desarrollo-proyecto-final.git
```

Ingresar al directorio del proyecto:

```bash
cd herramientas-desarrollo-proyecto-final
```

Instalar las dependencias:

```bash
npm install
```

## 8. Ejecución de la aplicación

Iniciar el servidor:

```bash
npm start
```

Abrir en el navegador:

```text
http://127.0.0.1:3000
```

Para iniciar el modo de desarrollo, si está configurado en `package.json`:

```bash
npm run dev
```

## 9. Pruebas automatizadas

Ejecutar las pruebas:

```bash
npm test
```

Las pruebas permiten comprobar los comportamientos definidos por el proyecto, incluyendo las validaciones de los datos ingresados.

Antes de publicar una versión, también se recomienda verificar manualmente el registro, la búsqueda, la edición y la exportación de información.

## 9.1. Integración Continua (CI)

El repositorio incluye un workflow de GitHub Actions en `.github/workflows/ci.yml`.

Se ejecuta en `push` y `pull_request` hacia `main` y realiza:

1. Checkout del código.
2. Configuración de Node.js 22.
3. Instalación de dependencias con `npm ci`.
4. Verificación de la estructura de archivos requeridos.
5. Ejecución de `npm test`.

Historial de ejecuciones:

https://github.com/JoseDs160899/herramientas-desarrollo-proyecto-final/actions

## 9.2. Entrega Continua (CD) y cloud

El workflow `.github/workflows/cd.yml` despliega automáticamente en el servidor cloud cuando hay cambios en `main` (también se puede lanzar manualmente con `workflow_dispatch`).

El despliegue:

1. Se conecta por SSH al usuario `deploy`.
2. Actualiza el código en `/home/deploy/apps/herramientas-desarrollo-proyecto-final`.
3. Instala dependencias y reinicia la app con PM2 (`registrau`).
4. Verifica el endpoint `/api/health`.

URL del entorno de prueba en cloud:

```text
http://167.148.33.105:3000
```

Documentación detallada: `docs/CICD_APF3.md`.

## 10. API del sistema

La aplicación dispone de rutas HTTP para consultar y administrar registros. Entre las rutas previstas se encuentran:

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/health` | Consultar el estado del servidor |
| GET | `/api/stats` | Consultar indicadores generales |
| GET | `/api/registros` | Listar registros |
| GET | `/api/registros/:id` | Consultar un registro por identificador |
| POST | `/api/registros` | Crear un registro |
| PUT | `/api/registros/:id` | Actualizar un registro |

Los endpoints deben verificarse contra la versión actual del servidor antes de utilizarse como referencia definitiva.

## 11. Trabajo colaborativo con Git y GitHub

El desarrollo utiliza Git y GitHub para organizar los cambios realizados por los integrantes.

El flujo de trabajo contempla:

1. Crear ramas para desarrollar funcionalidades específicas.
2. Registrar cambios mediante commits descriptivos.
3. Subir las ramas al repositorio remoto.
4. Revisar e integrar los cambios mediante pull requests.
5. Resolver conflictos de integración cuando sea necesario.
6. Verificar la versión integrada antes de preparar una publicación.

## 12. Versionado y publicación

Las versiones del proyecto se documentan mediante etiquetas y publicaciones en GitHub Releases.

La versión objetivo de esta entrega es `v0.2.0`, cuya publicación debe realizarse después de integrar y verificar los cambios correspondientes.

Las notas de versión deben describir las funcionalidades incluidas y las verificaciones realizadas.

## 13. Documentación complementaria

La documentación adicional del proyecto se organiza en el directorio `docs/`. Puede incluir:

- Arquitectura y estructura del sistema.
- Evidencias del trabajo colaborativo.
- Notas de versión.
- Informe de actividades.
- Evidencias de pruebas y publicación.

## 14. Equipo de desarrollo

Proyecto académico desarrollado colaborativamente en el curso Herramientas de Desarrollo.

Repositorio oficial:

https://github.com/JoseDs160899/herramientas-desarrollo-proyecto-final

## 15. Estado del proyecto

El proyecto se encuentra en desarrollo y mejora continua. Antes de considerar terminada una entrega, se deben integrar los cambios, ejecutar las pruebas pertinentes y verificar que la documentación corresponda con la versión publicada.
