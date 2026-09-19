# Arquitectura de RegistraU — APF1

## Vista general

La solución mantiene una separación básica de responsabilidades para facilitar el trabajo colaborativo y el versionado por funcionalidades.

```text
Navegador
   │
   │ HTTP / JSON
   ▼
Frontend (public/)
   │
   │ API REST
   ▼
Backend Node.js (src/server.js)
   │
   ├── Validaciones (src/validation.js)
   │
   ▼
Persistencia SQLite (src/db.js)
   │
   ▼
data/registrau.db
```

## Componentes

### Frontend

`public/index.html`, `public/styles.css` y `public/app.js` implementan el panel principal, formulario, listado, búsqueda, edición y mensajes de validación.

### Backend

`src/server.js` expone endpoints HTTP para salud del sistema, indicadores y operaciones sobre registros. Cuando Express está instalado se utiliza como servidor principal; para facilitar la ejecución local también existe un modo de compatibilidad con `node:http`.

### Validación

`src/validation.js` contiene reglas reutilizables para campos obligatorios, documento, correo, teléfono y condición.

### Persistencia

`src/db.js` utiliza SQLite y crea automáticamente la tabla `registros`. El campo `documento` es único para evitar duplicidades.

## Decisiones de APF1

La arquitectura se mantiene intencionalmente simple. Autenticación, roles avanzados, CI/CD, despliegue en nube y contenedores se reservan para etapas posteriores del mismo proyecto.
