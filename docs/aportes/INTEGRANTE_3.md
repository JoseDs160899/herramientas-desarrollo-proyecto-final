# Aporte del Integrante 3 — Validaciones y pruebas

## Rol técnico
Responsable de calidad, validaciones y pruebas básicas del primer incremento.

## Rama sugerida
`feature/validaciones-registro`

## Objetivo del aporte
Implementar las reglas de validación de las fichas y las pruebas automáticas que comprueban datos obligatorios, formato de correo, documento y condición del registro.

## Archivos del aporte
- `src/validation.js`: normalización y validación de datos.
- `tests/validation.test.js`: pruebas automatizadas con el runner nativo de Node.js.
- `docs/EVIDENCIAS_APF1.md`: guía de evidencias técnicas del avance.

## Commits sugeridos
1. `Implementar validaciones de datos del registro`
2. `Agregar pruebas automatizadas para las validaciones`
3. `Documentar evidencias técnicas requeridas en APF1`

## Verificación
Ejecutar:

```bash
npm test
```

Luego levantar el sistema y comprobar que los mensajes de error aparezcan cuando se envían datos incompletos o inválidos.

## Evidencia recomendada
Capturar la rama `feature/validaciones-registro`, los commits realizados y la consola con las pruebas aprobadas.
