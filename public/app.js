'use strict';

const form = document.getElementById('form-registro');
const tbody = document.getElementById('tbody');
const searchInput = document.getElementById('search');
const toast = document.getElementById('toast');
const formTitle = document.getElementById('form-title');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');
const recordId = document.getElementById('record-id');

const fields = [
  'nombres',
  'apellidos',
  'documento',
  'correo',
  'telefono',
  'condicion',
  'programa',
  'observaciones'
];

let searchTimer = null;

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = {};
  }
  return { ok: res.ok, status: res.status, body };
}

function showToast(message, type = 'ok') {
  toast.hidden = false;
  toast.className = `toast ${type}`;
  toast.textContent = message;
}

function clearToast() {
  toast.hidden = true;
  toast.textContent = '';
}

function clearErrors() {
  document.querySelectorAll('.field').forEach((el) => el.classList.remove('invalid'));
  document.querySelectorAll('[data-error]').forEach((el) => {
    el.textContent = '';
  });
}

function setErrors(errors = {}) {
  clearErrors();
  Object.entries(errors).forEach(([key, message]) => {
    const hint = document.querySelector(`[data-error="${key}"]`);
    const input = document.getElementById(key);
    if (hint) hint.textContent = message;
    if (input?.closest('.field')) input.closest('.field').classList.add('invalid');
  });
}

function readForm() {
  const data = {};
  fields.forEach((name) => {
    data[name] = document.getElementById(name).value;
  });
  return data;
}

function fillForm(item) {
  fields.forEach((name) => {
    document.getElementById(name).value = item[name] ?? '';
  });
  recordId.value = item.id ?? '';
}

function resetFormMode() {
  form.reset();
  recordId.value = '';
  formTitle.textContent = 'Nueva ficha';
  btnSubmit.textContent = 'Guardar ficha';
  btnCancel.hidden = true;
  clearErrors();
  clearToast();
}

function editMode(item) {
  fillForm(item);
  formTitle.textContent = 'Editar ficha';
  btnSubmit.textContent = 'Actualizar ficha';
  btnCancel.hidden = false;
  clearErrors();
  clearToast();
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderStats(stats) {
  document.querySelectorAll('[data-stat]').forEach((el) => {
    const key = el.getAttribute('data-stat');
    el.textContent = stats?.[key] ?? 0;
  });
}

function badge(condicion) {
  const cls = condicion === 'ESTUDIANTE' ? 'est' : 'post';
  const label = condicion === 'ESTUDIANTE' ? 'Estudiante' : 'Postulante';
  return `<span class="badge ${cls}">${label}</span>`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderRows(items) {
  if (!items.length) {
    tbody.innerHTML = '<tr class="empty"><td colspan="5">No hay registros para mostrar.</td></tr>';
    return;
  }

  tbody.innerHTML = items
    .map(
      (item) => `
      <tr data-id="${item.id}">
        <td class="person">
          <strong>${escapeHtml(item.nombres)} ${escapeHtml(item.apellidos)}</strong>
          <small>${escapeHtml(item.correo)}</small>
        </td>
        <td>${escapeHtml(item.documento)}</td>
        <td>${badge(item.condicion)}</td>
        <td>${escapeHtml(item.programa || '—')}</td>
        <td>
          <div class="row-actions">
            <button type="button" data-action="edit">Editar</button>
          </div>
        </td>
      </tr>`
    )
    .join('');
}

async function loadStats() {
  const { ok, body } = await api('/api/stats');
  if (ok) renderStats(body);
}

async function loadList(search = '') {
  const q = search ? `?search=${encodeURIComponent(search)}` : '';
  const { ok, body } = await api(`/api/registros${q}`);
  if (!ok) {
    tbody.innerHTML = '<tr class="empty"><td colspan="5">No se pudo cargar el listado.</td></tr>';
    return;
  }
  renderRows(body.items || []);
}

async function refresh() {
  await Promise.all([loadStats(), loadList(searchInput.value.trim())]);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearErrors();
  clearToast();

  const payload = readForm();
  const id = recordId.value.trim();
  const editing = Boolean(id);
  const path = editing ? `/api/registros/${id}` : '/api/registros';
  const method = editing ? 'PUT' : 'POST';

  btnSubmit.disabled = true;
  try {
    const { ok, body } = await api(path, {
      method,
      body: JSON.stringify(payload)
    });

    if (!ok) {
      setErrors(body.errors || {});
      showToast(body.message || 'Revise los datos ingresados.', 'err');
      return;
    }

    showToast(body.message || (editing ? 'Ficha actualizada.' : 'Ficha creada.'), 'ok');
    resetFormMode();
    await refresh();
  } catch {
    showToast('No se pudo conectar con el servidor.', 'err');
  } finally {
    btnSubmit.disabled = false;
  }
});

form.addEventListener('reset', () => {
  setTimeout(() => {
    resetFormMode();
  }, 0);
});

btnCancel.addEventListener('click', () => {
  resetFormMode();
});

searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    loadList(searchInput.value.trim());
  }, 250);
});

tbody.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action="edit"]');
  if (!button) return;
  const row = button.closest('tr[data-id]');
  if (!row) return;

  const { ok, body } = await api(`/api/registros/${row.dataset.id}`);
  if (!ok) {
    showToast(body.message || 'No se pudo cargar la ficha.', 'err');
    return;
  }
  editMode(body);
});

refresh().catch(() => {
  tbody.innerHTML = '<tr class="empty"><td colspan="5">Error al iniciar la interfaz.</td></tr>';
});
