'use strict';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOCUMENT_RE = /^[0-9]{8,12}$/;
const PHONE_RE = /^[0-9+()\-\s]{7,20}$/;
const ALLOWED_CONDITIONS = new Set(['ESTUDIANTE', 'POSTULANTE']);

function normalizeText(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function normalizeRecord(input = {}) {
  return {
    nombres: normalizeText(input.nombres),
    apellidos: normalizeText(input.apellidos),
    documento: normalizeText(input.documento),
    correo: normalizeText(input.correo).toLowerCase(),
    telefono: normalizeText(input.telefono),
    condicion: normalizeText(input.condicion).toUpperCase(),
    programa: normalizeText(input.programa),
    observaciones: normalizeText(input.observaciones)
  };
}

function validateRecord(input = {}) {
  const data = normalizeRecord(input);
  const errors = {};

  if (!data.nombres) errors.nombres = 'Los nombres son obligatorios.';
  if (!data.apellidos) errors.apellidos = 'Los apellidos son obligatorios.';
  if (!data.documento) {
    errors.documento = 'El documento es obligatorio.';
  } else if (!DOCUMENT_RE.test(data.documento)) {
    errors.documento = 'El documento debe contener entre 8 y 12 dígitos.';
  }

  if (!data.correo) {
    errors.correo = 'El correo es obligatorio.';
  } else if (!EMAIL_RE.test(data.correo)) {
    errors.correo = 'Ingrese un correo electrónico válido.';
  }

  if (data.telefono && !PHONE_RE.test(data.telefono)) {
    errors.telefono = 'Ingrese un teléfono válido.';
  }

  if (!ALLOWED_CONDITIONS.has(data.condicion)) {
    errors.condicion = 'Seleccione Estudiante o Postulante.';
  }

  if (data.nombres.length > 80) errors.nombres = 'Máximo 80 caracteres.';
  if (data.apellidos.length > 80) errors.apellidos = 'Máximo 80 caracteres.';
  if (data.correo.length > 120) errors.correo = 'Máximo 120 caracteres.';
  if (data.programa.length > 120) errors.programa = 'Máximo 120 caracteres.';
  if (data.observaciones.length > 500) errors.observaciones = 'Máximo 500 caracteres.';

  return { valid: Object.keys(errors).length === 0, errors, data };
}

module.exports = { validateRecord, normalizeRecord };
