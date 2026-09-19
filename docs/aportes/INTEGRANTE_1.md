# Aporte del Integrante 1 — Backend y API

## Rol técnico
Responsable de backend/API y apoyo al flujo del repositorio.

## Rama sugerida
`feature/api-registros`

## Objetivo del aporte
Implementar el servidor de RegistraU, publicar la interfaz web, exponer las rutas de la API REST y configurar la ejecución del proyecto con Node.js/Express.

## Archivos del aporte
- `src/server.js`: servidor, rutas API, manejo de solicitudes y publicación de archivos estáticos.
- `package.json`: dependencias, versión y scripts de ejecución.
- `.gitignore`: exclusión de dependencias, base local y archivos temporales.
- `docs/GIT_APF1.md`: flujo Git recomendado para el equipo.

## Commits sugeridos
Realiza los commits desde tu propia cuenta de Git. Una secuencia válida es:

1. `Configurar proyecto Node y scripts de ejecución`
2. `Implementar servidor y rutas API de registros`
3. `Documentar flujo Git de trabajo para APF1`

No uses mensajes como `cambio`, `prueba`, `final` o `commit 1`.

## Verificación
Después de integrar también los aportes de persistencia y validaciones, ejecutar:

```bash
npm install
npm start
```

Comprobar en el navegador `http://127.0.0.1:3000` y probar `/api/health`.

## Evidencia recomendada
Captura la rama `feature/api-registros`, tus commits, los archivos modificados y el push al repositorio remoto.

## Tarea para conflicto controlado
Cuando el equipo esté listo para documentar el conflicto de APF1, coordinar con el Integrante 4. Ambos deben crear ramas distintas desde el mismo punto de `main` y modificar, de forma deliberada, la misma línea de un texto no crítico del `README.md`. Primero se integra una rama y luego se intenta integrar la segunda. Conservar captura del conflicto y del commit de resolución.
