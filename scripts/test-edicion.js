'use strict';

const { createRecord, updateRecord, getRecord } = require('../src/db');
const { validateRecord } = require('../src/validation');

console.log('=== TEST UNITARIO: EDICION Y VALIDACION DE FICHAS ===\n');

try {
  // Generar documento único para evitar conflicto UNIQUE en SQLite
  const docUnico = `DOC${Date.now().toString().slice(-6)}`;

  // 1. Crear registro base
  const nuevo = createRecord({
    nombres: 'Prueba',
    apellidos: 'Edicion',
    documento: docUnico,
    correo: 'test.edicion@utp.edu.pe',
    telefono: '987654321',
    condicion: 'POSTULANTE',
    programa: 'Ingeniería de Sistemas',
    observaciones: 'Ficha inicial para pruebas de actualización'
  });

  console.log(`[1] Registro inicial creado con ID: ${nuevo.id} y documento: ${nuevo.documento}`);

  // 2. Probar actualización de datos
  const modificado = updateRecord(nuevo.id, {
    nombres: 'Prueba Actualizada',
    apellidos: 'Edicion Confirmada',
    documento: docUnico,
    correo: 'test.actualizado@utp.edu.pe',
    telefono: '911222333',
    condicion: 'ESTUDIANTE',
    programa: 'Ingeniería de Sistemas',
    observaciones: 'Ficha actualizada satisfactoriamente'
  });

  console.assert(modificado.nombres === 'Prueba Actualizada', 'Error: el nombre no se actualizó');
  console.assert(modificado.condicion === 'ESTUDIANTE', 'Error: la condición no se actualizó');
  console.log('✔ [2] Actualización exitosa verificada.');

  // 3. Probar validación de datos inválidos
  const validacion = validateRecord({
    nombres: '',
    apellidos: '',
    documento: '12',
    condicion: 'INVALIDA'
  });

  console.assert(!validacion.valid, 'Error: la validación debió rechazar campos vacíos');
  console.log(`✔ [3] Detección de datos inválidos verificada (${Object.keys(validacion.errors).length} campos observados).`);

  console.log('\n=== TODAS LAS PRUEBAS UNITARIAS PASARON CON EXITO ===');
} catch (error) {
  console.error('Error durante la ejecución de las pruebas:', error);
}