
'use strict';

// ======================================================
// REGISTRAU - Interfaz principal
// Búsqueda, filtros, CRUD y estadísticas
// ======================================================

const form = document.getElementById('form-registro');
const tbody = document.getElementById('tbody');
const searchInput = document.getElementById('search');
const toast = document.getElementById('toast');
const formTitle = document.getElementById('form-title');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');
const btnResetFilters = document.getElementById('btn-clear-filters');
const filterCondicion = document.getElementById('filter-condicion');
const filterPrograma = document.getElementById('filter-programa');
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
let requestController = null;

// ======================================================
// API
// ======================================================

async function api(path, options = {}) {
  const { signal, headers, ...rest } = options;

  const response = await fetch(path, {
    ...rest,
    signal,
    headers: {
      ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
      ...(headers || {})
    }
  });

  let body = {};

  try {
    body = await response.json();
  } catch {
    body = {};
  }

  return {
    ok: response.ok,
    status: response.status,
    body
  };
}

// ======================================================
// MENSAJES Y VALIDACIONES
// ======================================================

function showToast(message, type = 'ok') {
  if (!toast) return;

  toast.hidden = false;
  toast.className = `toast ${type}`;
  toast.textContent = message;
}

function clearToast() {
  if (!toast) return;

  toast.hidden = true;
  toast.textContent = '';
}

function clearErrors() {
  document.querySelectorAll('.field').forEach((element) => {
    element.classList.remove('invalid');
  });

  document.querySelectorAll('[data-error]').forEach((element) => {
    element.textContent = '';
  });
}

function setErrors(errors = {}) {
  clearErrors();

  Object.entries(errors).forEach(([key, message]) => {
    const hint = document.querySelector(`[data-error="${key}"]`);
    const input = document.getElementById(key);

    if (hint) hint.textContent = message;

    if (input?.closest('.field')) {
      input.closest('.field').classList.add('invalid');
    }
  });
}

// ======================================================
// FORMULARIO
// ======================================================

function readForm() {
  const data = {};

  fields.forEach((name) => {
    const input = document.getElementById(name);
    data[name] = input ? input.value.trim() : '';
  });

  return data;
}

function fillForm(item) {
  fields.forEach((name) => {
    const input = document.getElementById(name);

    if (input) {
      input.value = item[name] ?? '';
    }
  });

  recordId.value = item.id ?? '';
}

function resetFormMode() {
  form.reset();
  recordId.value = '';

  if (formTitle) formTitle.textContent = 'Nueva ficha';
  if (btnSubmit) btnSubmit.textContent = 'Guardar ficha';
  if (btnCancel) btnCancel.hidden = true;

  clearErrors();
  clearToast();
}

function editMode(item) {
  fillForm(item);

  if (formTitle) formTitle.textContent = 'Editar ficha';
  if (btnSubmit) btnSubmit.textContent = 'Actualizar ficha';
  if (btnCancel) btnCancel.hidden = false;

  clearErrors();
  clearToast();

  form.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

// ======================================================
// ESTADÍSTICAS
// ======================================================

function renderStats(stats = {}) {
  document.querySelectorAll('[data-stat]').forEach((element) => {
    const key = element.getAttribute('data-stat');
    element.textContent = stats[key] ?? 0;
  });
}

async function loadStats() {
  const { ok, body } = await api('/api/stats');

  if (ok) {
    renderStats(body);
  }
}

// ======================================================
// SEGURIDAD Y RENDERIZADO
// ======================================================

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function badge(condicion) {
  if (condicion === 'ESTUDIANTE') {
    return '<span class="badge est">Estudiante</span>';
  }

  if (condicion === 'POSTULANTE') {
    return '<span class="badge post">Postulante</span>';
  }

  return '<span class="badge">Sin condición</span>';
}

function renderRows(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    tbody.innerHTML = `
      <tr class="empty">
        <td colspan="5">No hay registros para mostrar.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = items.map((item) => `
    <tr data-id="${escapeHtml(item.id)}">
      <td class="person">
        <strong>
          ${escapeHtml(item.nombres)} ${escapeHtml(item.apellidos)}
        </strong>
        <small>${escapeHtml(item.correo)}</small>
      </td>
      <td>${escapeHtml(item.documento)}</td>
      <td>${badge(item.condicion)}</td>
      <td>${escapeHtml(item.programa || '—')}</td>
      <td>
        <div class="row-actions">
          <button type="button" data-action="edit">
            Editar
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ======================================================
// BÚSQUEDA Y FILTROS
// ======================================================

function buildListUrl(search = '') {
  const params = new URLSearchParams();
  const text = String(search || '').trim();
  const condicion = filterCondicion?.value || '';
  const programa = filterPrograma?.value.trim() || '';

  if (text) {
    params.set('search', text);
  }

  if (condicion) {
    params.set('condicion', condicion);
  }

  if (programa) {
    params.set('programa', programa);
  }

  const query = params.toString();

  return `/api/registros${query ? `?${query}` : ''}`;
}

async function loadList(search = '') {
  // Evita que una petición anterior sobrescriba los
  // resultados de una búsqueda más reciente.
  if (requestController) {
    requestController.abort();
  }

  requestController = new AbortController();

  const url = buildListUrl(search);

  try {
    const { ok, body } = await api(url, {
      signal: requestController.signal
    });

    if (!ok) {
      tbody.innerHTML = `
        <tr class="empty">
          <td colspan="5">No se pudo cargar el listado.</td>
        </tr>
      `;

      showToast(
        body.message || 'Error al consultar los registros.',
        'err'
      );

      return;
    }

    renderRows(body.items || []);
  } catch (error) {
    if (error.name === 'AbortError') return;

    tbody.innerHTML = `
      <tr class="empty">
        <td colspan="5">Error de conexión con el servidor.</td>
      </tr>
    `;

    showToast('No se pudo conectar con el servidor.', 'err');
  }
}

function applyFilters() {
  clearTimeout(searchTimer);

  loadList(searchInput?.value || '');
}

function clearFilters() {
  if (searchInput) searchInput.value = '';
  if (filterCondicion) filterCondicion.value = '';
  if (filterPrograma) filterPrograma.value = '';

  clearToast();
  loadList('');
}

async function refresh() {
  await Promise.all([
    loadStats(),
    loadList(searchInput?.value || '')
  ]);
}

// ======================================================
// GUARDAR Y ACTUALIZAR REGISTROS
// ======================================================

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  clearErrors();
  clearToast();

  const payload = readForm();
  const id = recordId.value.trim();
  const editing = Boolean(id);

  const path = editing
    ? `/api/registros/${encodeURIComponent(id)}`
    : '/api/registros';

  const method = editing ? 'PUT' : 'POST';

  btnSubmit.disabled = true;

  try {
    const { ok, body } = await api(path, {
      method,
      body: JSON.stringify(payload)
    });

    if (!ok) {
      setErrors(body.errors || {});

      showToast(
        body.message || 'Revise los datos ingresados.',
        'err'
      );

      return;
    }

    resetFormMode();

    showToast(
      body.message || (
        editing ? 'Ficha actualizada.' : 'Ficha creada.'
      ),
      'ok'
    );

    await refresh();
  } catch {
    showToast('No se pudo conectar con el servidor.', 'err');
  } finally {
    btnSubmit.disabled = false;
  }
});

// ======================================================
// LIMPIAR FORMULARIO Y CANCELAR EDICIÓN
// ======================================================

form.addEventListener('reset', () => {
  setTimeout(() => {
    resetFormMode();
  }, 0);
});

btnCancel?.addEventListener('click', () => {
  resetFormMode();
});

// ======================================================
// EVENTOS DE BÚSQUEDA Y FILTROS
// ======================================================

searchInput?.addEventListener('input', () => {
  clearTimeout(searchTimer);

  searchTimer = setTimeout(() => {
    applyFilters();
  }, 250);
});

filterCondicion?.addEventListener('change', applyFilters);

filterPrograma?.addEventListener('input', () => {
  clearTimeout(searchTimer);

  searchTimer = setTimeout(() => {
    applyFilters();
  }, 250);
});

btnResetFilters?.addEventListener('click', clearFilters);

// ======================================================
// EDITAR REGISTRO
// ======================================================

tbody.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action="edit"]');

  if (!button) return;

  const row = button.closest('tr[data-id]');

  if (!row) return;

  button.disabled = true;

  try {
    const { ok, body } = await api(
      `/api/registros/${encodeURIComponent(row.dataset.id)}`
    );

    if (!ok) {
      showToast(
        body.message || 'No se pudo cargar la ficha.',
        'err'
      );

      return;
    }

    editMode(body);
  } catch {
    showToast('Error al cargar la ficha.', 'err');
  } finally {
    button.disabled = false;
  }
});

// ======================================================
// INICIALIZACIÓN
// ======================================================

refresh().catch(() => {
  tbody.innerHTML = `
    <tr class="empty">
      <td colspan="5">Error al iniciar la interfaz.</td>
    </tr>
  `;

  showToast('No se pudo iniciar RegistraU.', 'err');
});
