# Aporte del Integrante 2 — Persistencia SQLite

## Rol técnico
Responsable de persistencia de datos y operaciones de acceso a registros.

## Rama sugerida
`feature/persistencia-sqlite`

## Objetivo del aporte
Implementar la base SQLite de RegistraU, las operaciones para crear, consultar y actualizar fichas, la restricción de documento único y los scripts de datos de demostración.

## Archivos del aporte
- `src/db.js`: creación de tablas, consultas, inserción, actualización, búsqueda, estadísticas y control de duplicados.
- `scripts/seed.js`: carga de datos para demostración.
- `scripts/reset-db.js`: limpieza de registros de la base local.
- `data/.gitkeep`: conserva el directorio de datos sin versionar el archivo `.db`.
- `docs/ARQUITECTURA.md`: descripción técnica de componentes.

## Commits sugeridos
1. `Implementar persistencia SQLite de fichas`
2. `Agregar búsqueda estadísticas y control de documento único`
3. `Agregar scripts para datos de demostración y reinicio`

## Verificación
Con los archivos del backend ya integrados:

```bash
npm run seed
npm start
```

Registrar una nueva ficha y verificar que aparezca en la consulta. La base se generará en `data/registrau.db` y no debe subirse al repositorio.

## Evidencia recomendada
Mostrar la rama `feature/persistencia-sqlite`, historial de commits y el funcionamiento real de registro/consulta usando SQLite.
