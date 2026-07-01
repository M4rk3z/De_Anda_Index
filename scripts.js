const SUPABASE_URL = 'https://ehwxvirqiwztonbgosfy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVod3h2aXJxaXd6dG9uYmdvc2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNDAwMTUsImV4cCI6MjA5NTkxNjAxNX0.VzMoS_kOFIjvSz_ewdu6Q9_vAIwAnTuqPTlxFvzfJk8';

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const ACCESOS_POR_SECCION = {
  buscador: [0, 1, 2],
  nuevoCodigo: [0, 1],
  panelControl: [0, 1],
  solicitudes: [0, 1, 2],
  manual: [0, 1, 2]
};

function obtenerNivelUsuario() {
  const valor = localStorage.getItem('usuarioNivel');
  if (valor === null || valor === '') return null;

  const nivel = Number(valor);
  return [0, 1, 2].includes(nivel) ? nivel : null;
}

function usuarioPuede(...niveles) {
  const nivel = obtenerNivelUsuario();
  return nivel !== null && niveles.includes(nivel);
}

function puedeAccederSeccion(section) {
  const niveles = ACCESOS_POR_SECCION[section];
  return Array.isArray(niveles) && usuarioPuede(...niveles);
}

function mostrarAccesoDenegado() {
  const viewer = document.getElementById('viewer');
  if (!viewer) return;

  viewer.innerHTML = `
    <div class="status-box">No tienes permisos para acceder a esta funcion.</div>
  `;
}

function aplicarPermisosNavegacion() {
  document.querySelectorAll('#sideMenu [data-section]').forEach(button => {
    button.hidden = !puedeAccederSeccion(button.dataset.section);
  });
}

function toggleSidebar() {
  const menu = document.getElementById('sideMenu');

  if (menu) {
    menu.classList.toggle('open');
  }
}

function showSection(section) {
  const viewer = document.getElementById('viewer');

  if (!viewer) return;

  if (section !== 'bienvenida' && !puedeAccederSeccion(section)) {
    mostrarAccesoDenegado();
    return;
  }

  document.querySelectorAll('#sideMenu [data-section]').forEach(button => {
    const isActive = button.dataset.section === section;
    button.classList.toggle('active', isActive);

    if (isActive) {
      button.setAttribute('aria-current', 'page');
    } else {
      button.removeAttribute('aria-current');
    }
  });

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
              <th>Codigo Pixvs</th>
              <th>Nombre Pixvs</th>
              <th>Codigo SAP</th>
              <th>Nombre SAP</th>
              <th>Version SAP</th>
              <th>Revision SAP</th>
              <th>Status</th>
              <th>Fecha Ultimo Cambio</th>
              <th>Responsable</th>
            </tr>
          </thead>

          <tbody id="buscadorResults">
            <tr>
              <td colspan="9">Sin resultados todavia.</td>
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
        <td colspan="9">Sin resultados todavia.</td>
      </tr>
    `;

    return;
  }

  status.textContent = 'Buscando...';

  const columnasBusqueda = [
    'Codigo Pixvs',
    'Nombre Pixvs',
    'Codigo SAP',
    'Nombre SAP'
  ];

  const { data, error } = await leerSupabasePaginado(
    'BD_General',
    '"Codigo Pixvs","Nombre Pixvs","Codigo SAP","Nombre SAP","Version SAP","Revision SAP","Status","Fecha de ultimo Cambio","Responsable"',
    'Codigo SAP'
  );

  if (error) {
    status.textContent = 'Error al buscar en Supabase.';

    tbody.innerHTML = `
      <tr>
        <td colspan="9">${escapeHtml(error.message)}</td>
      </tr>
    `;

    return;
  }

  const resultados = filtrarRegistrosNormalizados(
    data,
    query,
    columnasBusqueda
  ).slice(0, 1000);

  if (resultados.length === 0) {
    status.textContent = 'No se encontraron resultados.';

    tbody.innerHTML = `
      <tr>
        <td colspan="9">No hay coincidencias.</td>
      </tr>
    `;

    return;
  }

  status.textContent = `Resultados encontrados: ${resultados.length}`;

  tbody.innerHTML = resultados.map(item => `
    <tr>
      <td>${escapeHtml(item['Codigo Pixvs'])}</td>
      <td>${escapeHtml(item['Nombre Pixvs'])}</td>
      <td>${escapeHtml(item['Codigo SAP'])}</td>
      <td>${escapeHtml(item['Nombre SAP'])}</td>
      <td>${escapeHtml(item['Version SAP'])}</td>
      <td>${escapeHtml(item['Revision SAP'])}</td>
      <td>${renderStatusBadge(item['Status'])}</td>
      <td>${escapeHtml(formatearFecha(item['Fecha de ultimo Cambio']))}</td>
      <td>${escapeHtml(item['Responsable'])}</td>
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

  let clase = 'status-proceso';
  let etiqueta = String(status || 'Sin status').trim();

  if (statusNormalizado === '1PROCESO') {
    clase = 'status-proceso';
    etiqueta = '1 - Proceso';
  }

  if (statusNormalizado === '2LOCAL') {
    clase = 'status-local';
    etiqueta = '2 - Local';
  }

  if (statusNormalizado === '3SAP') {
    clase = 'status-sap';
    etiqueta = '3 - SAP';
  }

  if (statusNormalizado === '4BLOQUEADO') {
    clase = 'status-bloqueado';
    etiqueta = '4 - Bloqueado';
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

function filtrarRegistrosNormalizados(rows, busqueda, columnas) {
  const busquedaNormalizada = normalizarTextoFlexible(busqueda);
  if (!busquedaNormalizada) return [];

  return (rows || []).filter(row => (
    columnas.some(columna => (
      normalizarTextoFlexible(row[columna]).includes(busquedaNormalizada)
    ))
  ));
}

async function leerSupabasePaginado(
  tabla,
  columnas = '*',
  columnaOrden = '',
  ascendente = true
) {
  const limitePagina = 1000;
  const registros = [];
  let inicio = 0;

  while (true) {
    let consulta = supabaseClient
      .from(tabla)
      .select(columnas);

    if (columnaOrden) {
      consulta = consulta.order(columnaOrden, { ascending: ascendente });
    }

    const { data, error } = await consulta.range(
      inicio,
      inicio + limitePagina - 1
    );

    if (error) {
      return { data: [], error };
    }

    const pagina = data || [];
    registros.push(...pagina);

    if (pagina.length < limitePagina) {
      break;
    }

    inicio += limitePagina;
  }

  return { data: registros, error: null };
}
