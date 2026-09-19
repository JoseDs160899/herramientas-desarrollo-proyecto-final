'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { validateRecord } = require('../src/validation');

test('acepta un registro válido', () => {
  const result = validateRecord({
    nombres: 'Ana', apellidos: 'Torres', documento: '12345678',
    correo: 'ana@ejemplo.com', telefono: '987654321', condicion: 'postulante'
  });
  assert.equal(result.valid, true);
  assert.equal(result.data.condicion, 'POSTULANTE');
});

test('rechaza documento y correo inválidos', () => {
  const result = validateRecord({
    nombres: 'Ana', apellidos: 'Torres', documento: 'ABC',
    correo: 'correo-invalido', condicion: 'ESTUDIANTE'
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.documento);
  assert.ok(result.errors.correo);
});
