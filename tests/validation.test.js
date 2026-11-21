
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { validateRecord } = require('../src/validation');

// ======================================================
// REGISTRAU - PRUEBAS AUTOMATIZADAS
// ISSUE-01: Validación de campos obligatorios
// ======================================================

// Datos válidos para reutilizar en las pruebas
function registroValido(cambios = {}) {
  return {
    nombres: 'Ana',
    apellidos: 'Torres',
    documento: '12345678',
    correo: 'ana@ejemplo.com',
    telefono: '987654321',
    condicion: 'ESTUDIANTE',
    programa: 'Ingeniería de Sistemas',
    observaciones: 'Registro de prueba',
    ...cambios
  };
}

// PRUEBA 1: Registro válido
test('acepta un registro válido', () => {
  const resultado = validateRecord(registroValido());

  assert.equal(resultado.valid, true);
  assert.deepEqual(resultado.errors, {});
});

// PRUEBA 2: Documento y correo incorrectos
test('rechaza documento y correo inválidos', () => {
  const resultado = validateRecord(registroValido({
    documento: 'ABC',
    correo: 'correo-invalido'
  }));

  assert.equal(resultado.valid, false);
  assert.ok(resultado.errors.documento);
  assert.ok(resultado.errors.correo);
});

// PRUEBA 3: Campos obligatorios vacíos
test('rechaza los campos obligatorios vacíos', () => {
  const resultado = validateRecord(registroValido({
    nombres: '   ',
    apellidos: '',
    documento: '',
    correo: ' ',
    condicion: ''
  }));

  assert.equal(resultado.valid, false);

  for (const campo of [
    'nombres',
    'apellidos',
    'documento',
    'correo',
    'condicion'
  ]) {
    assert.ok(
      resultado.errors[campo],
      `Falta error de ${campo}`
    );
  }
});

// PRUEBA 4: Correo obligatorio
test('rechaza un correo vacío', () => {
  const resultado = validateRecord(registroValido({
    correo: ''
  }));

  assert.equal(resultado.valid, false);
  assert.equal(
    resultado.errors.correo,
    'El correo es obligatorio.'
  );
});

// PRUEBA 5: Condición incorrecta
test('rechaza una condición no permitida', () => {
  const resultado = validateRecord(registroValido({
    condicion: 'DOCENTE'
  }));

  assert.equal(resultado.valid, false);
  assert.ok(resultado.errors.condicion);
});

// PRUEBA 6: Normalización de datos
test('normaliza espacios, correo y condición', () => {
  const resultado = validateRecord(registroValido({
    nombres: '  Ana   María  ',
    correo: '  ANA@EJEMPLO.COM  ',
    condicion: 'postulante'
  }));

  assert.equal(resultado.valid, true);
  assert.equal(resultado.data.nombres, 'Ana María');
  assert.equal(resultado.data.correo, 'ana@ejemplo.com');
  assert.equal(resultado.data.condicion, 'POSTULANTE');
});

// PRUEBA 7: Teléfono opcional
test('acepta teléfono opcional vacío', () => {
  const resultado = validateRecord(registroValido({
    telefono: ''
  }));

  assert.equal(resultado.valid, true);
});

// PRUEBA 8: Teléfono incorrecto
test('rechaza un teléfono inválido', () => {
  const resultado = validateRecord(registroValido({
    telefono: 'abc'
  }));

  assert.equal(resultado.valid, false);
  assert.ok(resultado.errors.telefono);
});

// PRUEBA 9: Longitudes máximas
test('rechaza textos que exceden las longitudes permitidas', () => {
  const resultado = validateRecord(registroValido({
    nombres: 'A'.repeat(81),
    apellidos: 'B'.repeat(81),
    correo: `${'a'.repeat(110)}@ejemplo.com`,
    programa: 'P'.repeat(121),
    observaciones: 'O'.repeat(501)
  }));

  assert.equal(resultado.valid, false);

  for (const campo of [
    'nombres',
    'apellidos',
    'correo',
    'programa',
    'observaciones'
  ]) {
    assert.ok(
      resultado.errors[campo],
      `Falta error de ${campo}`
    );
  }
});
