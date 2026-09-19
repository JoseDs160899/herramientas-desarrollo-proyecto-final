# Aporte Técnico - Integrante 4: Ronald Copaticona Nolasco
**Rama:** `feature/edicion-registro`
**Rol:** Edición de registros, validación y persistencia de actualización.

### Funcionalidades implementadas:
- **`src/db.js`**: Implementación de la función `updateRecord(id, data)` utilizando sentencia SQL `UPDATE` sobre la tabla `registros`.
- **`src/server.js`**: Definición de la ruta HTTP `PUT /api/registros/:id` con validaciones de campos requeridos y control de errores.