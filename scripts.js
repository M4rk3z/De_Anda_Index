const SUPABASE_URL = 'https://ehwxvirqiwztonbgosfy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVod3h2aXJxaXd6dG9uYmdvc2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNDAwMTUsImV4cCI6MjA5NTkxNjAxNX0.VzMoS_kOFIjvSz_ewdu6Q9_vAIwAnTuqPTlxFvzfJk8';

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

function toggleSidebar() {
  const menu = document.getElementById('sideMenu');

  if (menu) {
    menu.classList.toggle('open');
  }
}

function showSection(section) {
  const viewer = document.getElementById('viewer');

  if (!viewer) return;

  if (section === 'bienvenida') {
    const usuarioActivo = localStorage.getItem('usuarioActivo') || 'Usuario';

    viewer.innerHTML = `
      <h2>Bienvenido, ${escapeHtml(usuarioActivo)}</h2>
      <p>Acceso correcto. Selecciona una opcion del menu para continuar.</p>
    `;
    return;
  }

  if (section === 'buscador') {
    renderBuscador();
    return;
  }

  if (section === 'nuevoCodigo') {
    renderNuevoCodigo();
    return;
  }

  if (section === 'panelControl') {
    renderPanelControl();
    return;
  }

  if (section === 'solicitudes') {
    window.renderSolicitudes();
    return;
  }

  
  if (section === 'manual') {
    renderManual();
    return;
  }
}


function renderBuscador() {
  const viewer = document.getElementById('viewer');

  viewer.innerHTML = `
    <div class="inicio-panel">
      <div class="inicio-header">
        <h2>Buscador</h2>
        <p>Busca por Nombre Pixvs, Nombre SAP o Codigo SAP.</p>
      </div>

      <div class="search-bar">
        <input
          id="buscadorInput"
          type="text"
          placeholder="Ejemplo: tornillo, cable, M11F020007..."
          onkeydown="onBuscadorKeydown(event)"
        >

        <button onclick="buscarMateriaPrima()">
          Buscar
        </button>
      </div>

      <div id="buscadorStatus" class="status-box">
        Escribe un nombre o codigo para buscar.
      </div>

      <div class="table-scroll">
        <table class="catalog-table results-table">
          <thead>
            <tr>
              <th>Nombre Pixvs</th>
              <th>Nombre SAP</th>
              <th>Codigo SAP</th>
              <th>Status</th>
              <th>Fecha Ultimo Cambio</th>
            </tr>
          </thead>

          <tbody id="buscadorResults">
            <tr>
              <td colspan="5">Sin resultados todavia.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function onBuscadorKeydown(event) {
  if (event.key === 'Enter') {
    buscarMateriaPrima();
  }
}

async function buscarMateriaPrima() {
  const input = document.getElementById('buscadorInput');
  const status = document.getElementById('buscadorStatus');
  const tbody = document.getElementById('buscadorResults');

  const query = input.value.trim();

  if (!query) {
    status.textContent = 'Escribe un nombre o codigo para buscar.';

    tbody.innerHTML = `
      <tr>
        <td colspan="5">Sin resultados todavia.</td>
      </tr>
    `;

    return;
  }

  status.textContent = 'Buscando...';

  const filtro = `"Nombre Pixvs".ilike.%${query}%,"Nombre SAP".ilike.%${query}%,"Codigo SAP".ilike.%${query}%`;

  const { data, error } = await supabaseClient
    .from('Materia_Prima')
    .select('"Nombre Pixvs","Nombre SAP","Codigo SAP","Status","Fecha_Ultimo_Cambio"')
    .or(filtro)
    .limit(100);

  if (error) {
    status.textContent = 'Error al buscar en Supabase.';

    tbody.innerHTML = `
      <tr>
        <td colspan="5">${escapeHtml(error.message)}</td>
      </tr>
    `;

    return;
  }

  if (!data || data.length === 0) {
    status.textContent = 'No se encontraron resultados.';

    tbody.innerHTML = `
      <tr>
        <td colspan="5">No hay coincidencias.</td>
      </tr>
    `;

    return;
  }

  status.textContent = `Resultados encontrados: ${data.length}`;

  tbody.innerHTML = data.map(item => `
    <tr>
      <td>${escapeHtml(item['Nombre Pixvs'])}</td>
      <td>${escapeHtml(item['Nombre SAP'])}</td>
      <td>${escapeHtml(item['Codigo SAP'])}</td>
      <td>${renderStatusBadge(item['Status'])}</td>
      <td>${escapeHtml(formatearFecha(item['Fecha_Ultimo_Cambio']))}</td>
    </tr>
  `).join('');
}

function renderVisualizer() {
  const viewer = document.getElementById('viewer');

  viewer.innerHTML = `
    <div class="catalog-wrapper">
      <div class="catalog-header">
        <h2>Visualizador</h2>
        <p>Modulo visualizador pendiente por configurar.</p>
      </div>
    </div>
  `;
}

function renderManual() {
  const viewer = document.getElementById('viewer');

  viewer.innerHTML = `
    <h2>Manual</h2>
    <p>Aqui podras ver el manual.</p>
  `;
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


//document.addEventListener('DOMContentLoaded', function () {
//  if (localStorage.getItem('sesionActiva') === 'true') {
//    showSection('bienvenida');
//  }
//});

function formatearFecha(fecha) {
  if (!fecha) return '';

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) {
    return fecha;
  }

  return date.toLocaleString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

//Decoracion//

function renderStatusBadge(status) {
  const statusNormalizado = normalizarTextoFlexible(status);

  let clase = 'status-control';
  let etiqueta = 'Control';

  if (statusNormalizado === 'DISPONIBLE') {
    clase = 'status-disponible';
    etiqueta = 'Disponible';
  }

  if (statusNormalizado === 'BLOQUEADO') {
    clase = 'status-bloqueado';
    etiqueta = 'Bloqueado';
  }

  if (statusNormalizado === 'CONTROL') {
    clase = 'status-control';
    etiqueta = 'Control';
  }

  return `
    <span class="status-badge ${clase}">
      <span class="status-dot"></span>
      ${etiqueta}
    </span>
  `;
}

function normalizarTextoFlexible(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .trim()
    .toUpperCase();
}