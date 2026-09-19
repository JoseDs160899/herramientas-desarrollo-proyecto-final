'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const {
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  getStats,
  documentExists
} = require('./db');
const { validateRecord } = require('./validation');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8'
};

function apiResult(status, body) {
  return { status, body };
}

function isUniqueError(error) {
  return String(error?.message || '').includes('UNIQUE constraint failed');
}

async function handleApi(method, pathname, query, payload) {
  if (method === 'GET' && pathname === '/api/health') {
    return apiResult(200, { ok: true, app: 'RegistraU', version: '0.1.0' });
  }

  if (method === 'GET' && pathname === '/api/stats') {
    return apiResult(200, getStats());
  }

  if (method === 'GET' && pathname === '/api/registros') {
    return apiResult(200, { items: listRecords(query.get('search') || '') });
  }

  const match = pathname.match(/^\/api\/registros\/(\d+)$/);
  if (method === 'GET' && match) {
    const item = getRecord(match[1]);
    return item ? apiResult(200, item) : apiResult(404, { message: 'Registro no encontrado.' });
  }

  if (method === 'POST' && pathname === '/api/registros') {
    const result = validateRecord(payload);
    if (!result.valid) return apiResult(400, { message: 'Revise los datos ingresados.', errors: result.errors });
    if (documentExists(result.data.documento)) {
      return apiResult(409, { message: 'Ya existe un registro con este documento.', errors: { documento: 'Documento duplicado.' } });
    }
    try {
      return apiResult(201, { message: 'Registro creado correctamente.', item: createRecord(result.data) });
    } catch (error) {
      if (isUniqueError(error)) return apiResult(409, { message: 'El documento ya se encuentra registrado.' });
      throw error;
    }
  }

  if (method === 'PUT' && match) {
    if (!getRecord(match[1])) return apiResult(404, { message: 'Registro no encontrado.' });
    const result = validateRecord(payload);
    if (!result.valid) return apiResult(400, { message: 'Revise los datos ingresados.', errors: result.errors });
    if (documentExists(result.data.documento, match[1])) {
      return apiResult(409, { message: 'Ya existe otro registro con este documento.', errors: { documento: 'Documento duplicado.' } });
    }
    try {
      return apiResult(200, { message: 'Registro actualizado correctamente.', item: updateRecord(match[1], result.data) });
    } catch (error) {
      if (isUniqueError(error)) return apiResult(409, { message: 'El documento ya se encuentra registrado.' });
      throw error;
    }
  }

  return apiResult(404, { message: 'Ruta no encontrada.' });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Payload demasiado grande'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); } catch { reject(new Error('JSON inválido')); }
    });
  });
}

function sendJson(res, status, body) {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(text),
    'Cache-Control': 'no-store'
  });
  res.end(text);
}

function sendStatic(req, res, pathname) {
  let requested = pathname === '/' ? '/index.html' : pathname;
  requested = decodeURIComponent(requested);
  const target = path.normalize(path.join(PUBLIC_DIR, requested));
  if (!target.startsWith(PUBLIC_DIR)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.stat(target, (err, stat) => {
    if (err || !stat.isFile()) {
      const index = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(index, (indexErr, content) => {
        if (indexErr) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': MIME['.html'] }); res.end(content);
      });
      return;
    }
    fs.readFile(target, (readErr, content) => {
      if (readErr) { res.writeHead(500); res.end('Error'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(target)] || 'application/octet-stream' });
      res.end(content);
    });
  });
}

async function nativeHandler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) {
      const payload = ['POST', 'PUT', 'PATCH'].includes(req.method) ? await parseBody(req) : {};
      const result = await handleApi(req.method, url.pathname, url.searchParams, payload);
      return sendJson(res, result.status, result.body);
    }
    return sendStatic(req, res, url.pathname);
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { message: 'Error interno del servidor.' });
  }
}

function startWithExpress(express) {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use(express.static(PUBLIC_DIR));

  app.all('/api/*path', async (req, res) => {
    try {
      const url = new URL(req.originalUrl, `http://${req.headers.host}`);
      const result = await handleApi(req.method, url.pathname, url.searchParams, req.body || {});
      res.status(result.status).json(result.body);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error interno del servidor.' });
    }
  });

  app.get('*path', (_req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));
  app.listen(PORT, HOST, () => {
    console.log(`RegistraU disponible en http://${HOST}:${PORT}`);
    console.log('Modo: Express + SQLite');
  });
}

function startNative() {
  http.createServer(nativeHandler).listen(PORT, HOST, () => {
    console.log(`RegistraU disponible en http://${HOST}:${PORT}`);
    console.log('Modo: servidor Node.js nativo + SQLite (compatibilidad sin npm install)');
  });
}

try {
  const express = require('express');
  startWithExpress(express);
} catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
  startNative();
}

app.put('/api/registros/:id', (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    if (!datos.nombres || !datos.apellidos || !datos.documento) {
      return res.status(400).json({ error: 'Nombres, apellidos y documento son obligatorios' });
    }

    const resultado = updateRecord(id, datos);

    if (resultado.changes === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    return res.status(200).json({ mensaje: 'Ficha actualizada exitosamente' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar el registro' });
  }
});