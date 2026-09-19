'use strict';

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'registrau.db');

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

db.exec(`
  CREATE TABLE IF NOT EXISTS registros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombres TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    documento TEXT NOT NULL UNIQUE,
    correo TEXT NOT NULL,
    telefono TEXT DEFAULT '',
    condicion TEXT NOT NULL CHECK (condicion IN ('ESTUDIANTE', 'POSTULANTE')),
    programa TEXT DEFAULT '',
    observaciones TEXT DEFAULT '',
    creado_en TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    actualizado_en TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  );

  CREATE INDEX IF NOT EXISTS idx_registros_nombre ON registros(apellidos, nombres);
  CREATE INDEX IF NOT EXISTS idx_registros_correo ON registros(correo);
`);

function listRecords(search = '') {
  const q = String(search || '').trim();
  if (!q) {
    return db.prepare(`
      SELECT * FROM registros
      ORDER BY datetime(actualizado_en) DESC, id DESC
    `).all();
  }
  const like = `%${q}%`;
  return db.prepare(`
    SELECT * FROM registros
    WHERE nombres LIKE ? OR apellidos LIKE ? OR documento LIKE ? OR correo LIKE ? OR programa LIKE ?
    ORDER BY datetime(actualizado_en) DESC, id DESC
  `).all(like, like, like, like, like);
}

function getRecord(id) {
  return db.prepare('SELECT * FROM registros WHERE id = ?').get(Number(id));
}

function createRecord(data) {
  const stmt = db.prepare(`
    INSERT INTO registros (nombres, apellidos, documento, correo, telefono, condicion, programa, observaciones)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    data.nombres,
    data.apellidos,
    data.documento,
    data.correo,
    data.telefono,
    data.condicion,
    data.programa,
    data.observaciones
  );
  return getRecord(result.lastInsertRowid);
}

function updateRecord(id, data) {
  const exists = getRecord(id);
  if (!exists) return null;

  db.prepare(`
    UPDATE registros
    SET nombres = ?, apellidos = ?, documento = ?, correo = ?, telefono = ?, condicion = ?,
        programa = ?, observaciones = ?, actualizado_en = datetime('now','localtime')
    WHERE id = ?
  `).run(
    data.nombres,
    data.apellidos,
    data.documento,
    data.correo,
    data.telefono,
    data.condicion,
    data.programa,
    data.observaciones,
    Number(id)
  );

  return getRecord(id);
}

function getStats() {
  const total = db.prepare('SELECT COUNT(*) AS n FROM registros').get().n;
  const estudiantes = db.prepare("SELECT COUNT(*) AS n FROM registros WHERE condicion='ESTUDIANTE'").get().n;
  const postulantes = db.prepare("SELECT COUNT(*) AS n FROM registros WHERE condicion='POSTULANTE'").get().n;
  const hoy = db.prepare("SELECT COUNT(*) AS n FROM registros WHERE date(creado_en)=date('now','localtime')").get().n;
  return { total, estudiantes, postulantes, hoy };
}

function documentExists(documento, excludeId = null) {
  if (excludeId) {
    return Boolean(db.prepare('SELECT 1 FROM registros WHERE documento = ? AND id <> ?').get(documento, Number(excludeId)));
  }
  return Boolean(db.prepare('SELECT 1 FROM registros WHERE documento = ?').get(documento));
}

function clearAll() {
  db.exec("DELETE FROM registros; DELETE FROM sqlite_sequence WHERE name='registros';");
}

module.exports = {
  DB_PATH,
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  getStats,
  documentExists,
  clearAll
};
