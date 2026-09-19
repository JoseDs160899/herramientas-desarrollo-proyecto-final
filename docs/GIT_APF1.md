# Flujo Git sugerido para APF1

Este archivo describe cómo convertir el código entregado en un repositorio colaborativo real. Los commits deben ser ejecutados por los integrantes desde sus propias cuentas/equipos; no se deben simular autores.

## 1. Inicializar el repositorio

Desde la carpeta del proyecto:

```bash
git init
git branch -M main
git add .
git commit -m "Inicializar estructura base de RegistraU"
```

Después configura el repositorio remoto de la plataforma utilizada en clase:

```bash
git remote add origin <URL_REAL_DEL_REPOSITORIO>
git push -u origin main
```

## 2. Ramas de trabajo

Ejemplos coherentes con las funcionalidades implementadas:

```text
feature/interfaz-registro
feature/api-registros
feature/consulta-edicion
fix/validacion-correo
```

Cada integrante debe crear su rama desde una `main` actualizada:

```bash
git checkout main
git pull origin main
git checkout -b feature/nombre-funcionalidad
```

## 3. Commits significativos

Ejemplos:

```text
Agregar formulario de registro y validaciones visuales
Implementar persistencia SQLite de fichas
Implementar consulta y búsqueda de registros
Agregar edición de fichas existentes
Corregir validación de formato de correo
Actualizar README con instrucciones de ejecución
```

Evitar mensajes como `cambio`, `prueba`, `final`, `arreglo` o `commit 1`.

## 4. Merge

Tras verificar la funcionalidad:

```bash
git checkout main
git pull origin main
git merge feature/nombre-funcionalidad
git push origin main
```

## 5. Conflicto controlado

Para la evidencia de APF1, dos integrantes pueden modificar de forma coordinada un texto no crítico de la interfaz en ramas distintas. Luego se integra una rama y al intentar integrar la segunda aparecerá el conflicto. El equipo debe resolverlo revisando ambas versiones y validando la aplicación antes del commit de resolución.

No se recomienda provocar conflictos en `src/db.js` o en archivos críticos de persistencia.

## 6. Evidencias útiles

```bash
git branch -a
git log --oneline --graph --decorate --all
git status
git remote -v
```

Las capturas deben mostrar el repositorio real y la participación técnica efectiva de cada integrante.
