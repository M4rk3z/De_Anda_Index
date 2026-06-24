let editorMaestroRows = [];

const CATALOGOS_ADMIN = {
  'DT_Grupos': {
    label: 'DT_Grupos',
    sortField: 'ID',
    keys: ['Grupo', 'ID'],
    fields: [
      { name: 'Grupo', label: 'Grupo' },
      { name: 'ID', label: 'ID' }
    ]
  },
  'MP:MateriaPrima': {
    label: 'MP:MateriaPrima',
    sortField: 'IdFamilia',
    keys: ['Grupo', 'Familia', 'IdFamilia'],
    fields: [
      { name: 'Grupo', label: 'Grupo' },
      { name: 'Familia', label: 'Familia' },
      { name: 'IdFamilia', label: 'Id Familia' }
    ]
  },
  'MP:Materiales': {
    label: 'MP:Materiales',
    sortField: 'Id_Material',
    keys: ['Grupo', 'Material', 'Id_Material'],
    fields: [
      { name: 'Grupo', label: 'Grupo' },
      { name: 'Material', label: 'Material' },
      { name: 'Id_Material', label: 'Id Material' },
      { name: 'Nomenclatura', label: 'Nomenclatura' }
    ]
  },
  'MP:Tipos': {
    label: 'MP:Tipos',
    sortField: 'id_Keys',
    keys: ['id_Keys'],
    fields: [
      { name: 'id_Keys', label: 'ID Key', readonly: true },
      { name: 'Familia', label: 'Familia' },
      { name: 'Tipo', label: 'Tipo' },
      { name: 'Id', label: 'ID' }
    ]
  },
  'PT:Tipos': {
    label: 'PT:Tipos',
    sortField: 'Registro_Id',
    keys: ['Registro_Id'],
    fields: [
      { name: 'Registro_Id', label: 'Registro ID', readonly: true },
      { name: 'Clave', label: 'Clave' },
      { name: 'Tipos', label: 'Tipo' },
      { name: 'Id', label: 'ID' }
    ]
  }
};

let catalogoAdminActual = 'DT_Grupos';
let catalogoAdminRows = [];
let catalogoAdminOrden = 'asc';

function renderPanelControl() {
  const viewer = document.getElementById('viewer');
  if (!viewer) return;

  if (!usuarioPuede(0, 1)) {
    mostrarAccesoDenegado();
    return;
  }

  viewer.innerHTML = `
    <div class="catalog-wrapper">
      <div class="catalog-header">
        <h2>Bienvenido ADMIN</h2>
        <p>Administracion de Base de Datos Local de Codificacion.</p>
      </div>

      <div class="nuevo-codigo-panel">
        <div class="panel-actions">
          <button onclick="renderEditorMaestro()">Editor Maestro</button>
          ${usuarioPuede(0) ? '<button onclick="renderControlAccesos()">Control de Accesos</button>' : ''}
          ${usuarioPuede(0) ? '<button onclick="renderAdministrarCatalogos()">Administrar Catalogos</button>' : ''}
        </div>

        <div id="panelControlContenido" class="panel-control-content">
          <div class="status-box">Selecciona Editor Maestro para continuar.</div>
        </div>
      </div>
    </div>
  `;
}

function renderEditorMaestro() {
  if (!usuarioPuede(0, 1)) {
    mostrarAccesoDenegado();
    return;
  }

  const contenedor = document.getElementById('panelControlContenido');
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="control-card">
      <div class="catalog-header">
        <h2>Editor Maestro</h2>
        <p>Consulta y edita los registros de BD_General.</p>
      </div>

      <div class="editor-toolbar">
        <div class="field-block">
          <label for="buscadorMaestro">Buscar</label>
          <input
            id="buscadorMaestro"
            type="text"
            placeholder="Codigo o nombre Pixvs / SAP"
            onkeydown="onEditorMaestroKeydown(event)"
          >
        </div>

        <button type="button" onclick="buscarEditorMaestro()">Buscar</button>
      </div>

      <div id="editorMaestroStatus" class="status-box">
        Escribe un valor o presiona Buscar para mostrar registros.
      </div>

      <div class="table-scroll">
        <table class="catalog-table master-editor-table">
          <thead>
            <tr>
              <th>Codigo Pixvs</th>
              <th>Nombre Pixvs</th>
              <th>Codigo SAP</th>
              <th>Nombre SAP</th>
              <th>Version SAP</th>
              <th>Revision SAP</th>
              <th>Status</th>
              <th>Fecha ultimo cambio</th>
              <th>Responsable</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody id="editorMaestroResultados">
            <tr>
              <td colspan="10">Sin resultados todavia.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function onEditorMaestroKeydown(event) {
  if (event.key === 'Enter') {
    buscarEditorMaestro();
  }
}

async function buscarEditorMaestro() {
  const input = document.getElementById('buscadorMaestro');
  const statusBox = document.getElementById('editorMaestroStatus');
  const busqueda = input ? input.value.trim() : '';

  if (!statusBox) return;

  statusBox.textContent = 'Buscando...';

  let consulta = supabaseClient
    .from('BD_General')
    .select('"Id","Codigo Pixvs","Nombre Pixvs","Codigo SAP","Nombre SAP","Version SAP","Revision SAP","Status","Fecha de ultimo Cambio","Responsable"')
    .limit(25);

  if (busqueda) {
    consulta = consulta.or(
      `"Codigo Pixvs".ilike.%${busqueda}%,"Nombre Pixvs".ilike.%${busqueda}%,"Codigo SAP".ilike.%${busqueda}%,"Nombre SAP".ilike.%${busqueda}%`
    );
  }

  const { data, error } = await consulta;

  if (error) {
    console.error('Error Supabase:', error);
    statusBox.textContent = 'Error: ' + error.message;
    return;
  }

  renderResultadosEditorMaestro(data || []);

  statusBox.textContent = data.length
    ? `Registros encontrados: ${data.length}`
    : 'No se encontraron resultados.';
}

function renderResultadosEditorMaestro(rows) {
  const tbody = document.getElementById('editorMaestroResultados');
  if (!tbody) return;

  editorMaestroRows = rows || [];

  if (!editorMaestroRows.length) {
    tbody.innerHTML = '<tr><td colspan="10">No se encontraron resultados.</td></tr>';
    return;
  }

  tbody.innerHTML = editorMaestroRows.map((row, index) => `
    <tr>
      <td>
        <input
          id="maestro-codigo-pixvs-${index}"
          class="master-input master-code-input"
          type="text"
          value="${escapeHtml(row['Codigo Pixvs'] || '')}"
        >
      </td>

      <td>
        <textarea
          id="maestro-nombre-pixvs-${index}"
          class="master-textarea"
          rows="2"
        >${escapeHtml(row['Nombre Pixvs'] || '')}</textarea>
      </td>

      <td>
        <input
          id="maestro-codigo-sap-${index}"
          class="master-input master-code-input master-locked-input"
          type="text"
          value="${escapeHtml(row['Codigo SAP'] || '')}"
          readonly
          aria-readonly="true"
          title="El Codigo SAP no se puede modificar"
        >
      </td>

      <td>
        <textarea
          id="maestro-nombre-sap-${index}"
          class="master-textarea"
          rows="2"
        >${escapeHtml(row['Nombre SAP'] || '')}</textarea>
      </td>

      <td>
        <input
          id="maestro-version-sap-${index}"
          class="master-input master-number-input"
          type="number"
          min="0"
          step="1"
          value="${escapeHtml(row['Version SAP'] ?? '')}"
        >
      </td>

      <td>
        <input
          id="maestro-revision-sap-${index}"
          class="master-input master-number-input"
          type="number"
          min="0"
          step="1"
          value="${escapeHtml(row['Revision SAP'] ?? '')}"
        >
      </td>

      <td>
        <select id="maestro-status-${index}" class="master-select">
          ${renderOpcionesStatusMaestro(row['Status'])}
        </select>
      </td>

      <td class="master-readonly">
        ${escapeHtml(formatearFecha(row['Fecha de ultimo Cambio']))}
      </td>

      <td class="master-readonly">
        ${escapeHtml(row['Responsable'] || '')}
      </td>

      <td>
        <button
          type="button"
          class="master-save-button"
          onclick="guardarRegistroMaestro(${index})"
        >
          Guardar
        </button>
      </td>
    </tr>
  `).join('');
}

function renderOpcionesStatusMaestro(statusActual) {
  const opciones = [
    '1 - Proceso',
    '2 - Local',
    '3 - SAP',
    '4 - Bloqueado'
  ];

  return opciones.map(status => `
    <option value="${status}" ${status === statusActual ? 'selected' : ''}>
      ${status}
    </option>
  `).join('');
}

async function guardarRegistroMaestro(index) {
  const row = editorMaestroRows[index];
  const statusBox = document.getElementById('editorMaestroStatus');

  if (!row) {
    if (statusBox) statusBox.textContent = 'No se encontro el registro seleccionado.';
    return;
  }

  const versionRaw = obtenerValorMaestro('maestro-version-sap', index);
  const revisionRaw = obtenerValorMaestro('maestro-revision-sap', index);

  const versionSap = convertirEnteroOpcional(versionRaw);
  const revisionSap = convertirEnteroOpcional(revisionRaw);

  if (versionSap === undefined || revisionSap === undefined) {
    if (statusBox) {
      statusBox.textContent = 'Version SAP y Revision SAP deben ser numeros enteros.';
    }
    return;
  }

  const responsable = localStorage.getItem('usuarioActivo') || 'Usuario';
  const fechaCambio = new Date().toISOString();

  const payload = {
    'Codigo Pixvs': valorONull(obtenerValorMaestro('maestro-codigo-pixvs', index)),
    'Nombre Pixvs': valorONull(obtenerValorMaestro('maestro-nombre-pixvs', index)),
    'Nombre SAP': valorONull(obtenerValorMaestro('maestro-nombre-sap', index)),
    'Version SAP': versionSap,
    'Revision SAP': revisionSap,
    'Status': obtenerValorMaestro('maestro-status', index),
    'Fecha de ultimo Cambio': fechaCambio,
    'Responsable': responsable
  };

  if (statusBox) statusBox.textContent = 'Guardando cambios...';

  const { data, error } = await supabaseClient
    .from('BD_General')
    .update(payload)
    .eq('Id', row.Id)
    .select('"Id","Codigo Pixvs","Nombre Pixvs","Codigo SAP","Nombre SAP","Version SAP","Revision SAP","Status","Fecha de ultimo Cambio","Responsable"')
    .maybeSingle();

  if (error) {
    console.error('Error Supabase:', error);
    if (statusBox) statusBox.textContent = 'Error al guardar: ' + error.message;
    return;
  }

  if (!data) {
    if (statusBox) {
      statusBox.textContent = 'No se actualizo el registro. Revisa la policy UPDATE de BD_General.';
    }
    return;
  }

  editorMaestroRows[index] = data;
  renderResultadosEditorMaestro(editorMaestroRows);

  if (statusBox) {
    statusBox.textContent = 'Registro actualizado correctamente.';
  }
}

function obtenerValorMaestro(prefijo, index) {
  const elemento = document.getElementById(`${prefijo}-${index}`);
  return elemento ? elemento.value.trim() : '';
}

function convertirEnteroOpcional(valor) {
  if (valor === '') return null;

  const numero = Number(valor);

  if (!Number.isInteger(numero) || numero < 0) {
    return undefined;
  }

  return numero;
}

function valorONull(valor) {
  return valor === '' ? null : valor;
}

/*************************************************
 * CONTROL DE ACCESOS
 *************************************************/

let controlAccesosRows = [];

function renderControlAccesos() {
  if (!usuarioPuede(0)) {
    mostrarAccesoDenegado();
    return;
  }

  const contenedor = document.getElementById('panelControlContenido');
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="control-card access-control-card">
      <div class="catalog-header">
        <h2>Control de Accesos</h2>
        <p>Administra los usuarios y contrasenas del sistema.</p>
      </div>

      <div class="access-create-form">
        <div class="field-block">
          <label for="nuevoUsuarioAcceso">Usuario</label>
          <input id="nuevoUsuarioAcceso" type="text" autocomplete="off" placeholder="Nombre del nuevo usuario">
        </div>

        <div class="field-block">
          <label for="nuevoPasswordAcceso">Contrasena</label>
          <div class="password-field">
            <input id="nuevoPasswordAcceso" type="password" autocomplete="new-password" placeholder="Contrasena">
            <button type="button" onclick="alternarPasswordAcceso('nuevoPasswordAcceso', this)">Mostrar</button>
          </div>
        </div>

        <div class="field-block">
          <label for="nuevoNivelAcceso">Nivel</label>
          <select id="nuevoNivelAcceso">
            <option value="">Selecciona un nivel</option>
            <option value="0">0 - Control Total</option>
            <option value="1">1 - Administrador</option>
            <option value="2">2 - Usuario</option>
          </select>
        </div>

        <button type="button" onclick="agregarUsuarioAcceso()">Agregar usuario</button>
      </div>

      <div id="controlAccesosStatus" class="status-box">Cargando usuarios...</div>

      <div class="table-scroll">
        <table class="catalog-table access-control-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Contrasena</th>
              <th>Nivel</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="controlAccesosResultados">
            <tr><td colspan="4">Cargando usuarios...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  cargarUsuariosAcceso();
}

async function cargarUsuariosAcceso() {
  if (!usuarioPuede(0)) return;

  const status = document.getElementById('controlAccesosStatus');
  const tbody = document.getElementById('controlAccesosResultados');
  if (!status || !tbody) return;

  status.textContent = 'Cargando usuarios...';

  const { data, error } = await supabaseClient
    .from('Usuarios_Login')
    .select('id,User_Nombre,User_Pass,Nivel')
    .order('User_Nombre', { ascending: true });

  if (error) {
    status.textContent = 'Error al cargar usuarios: ' + error.message;
    tbody.innerHTML = '<tr><td colspan="4">No se pudieron cargar los usuarios.</td></tr>';
    return;
  }

  controlAccesosRows = data || [];
  renderUsuariosAcceso();
  status.textContent = `Usuarios registrados: ${controlAccesosRows.length}`;
}

function renderUsuariosAcceso() {
  const tbody = document.getElementById('controlAccesosResultados');
  if (!tbody) return;

  if (!controlAccesosRows.length) {
    tbody.innerHTML = '<tr><td colspan="4">No hay usuarios registrados.</td></tr>';
    return;
  }

  tbody.innerHTML = controlAccesosRows.map((row, index) => `
    <tr>
      <td>
        <input id="acceso-usuario-${index}" class="master-input" type="text"
          autocomplete="off" value="${escapeHtml(row.User_Nombre || '')}">
      </td>
      <td>
        <div class="password-field">
          <input id="acceso-password-${index}" class="master-input" type="password"
            autocomplete="new-password" value="${escapeHtml(row.User_Pass || '')}">
          <button type="button"
            onclick="alternarPasswordAcceso('acceso-password-${index}', this)">Mostrar</button>
        </div>
      </td>
      <td>
        <select id="acceso-nivel-${index}" class="master-input">
          ${renderOpcionesNivelAcceso(row.Nivel)}
        </select>
      </td>
      <td>
        <div class="access-row-actions">
          <button type="button" onclick="guardarUsuarioAcceso(${index})">Guardar</button>
          <button type="button" class="danger-button"
            onclick="eliminarUsuarioAcceso(${index})">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderOpcionesNivelAcceso(nivelActual) {
  const niveles = [
    ['0', '0 - Control Total'],
    ['1', '1 - Administrador'],
    ['2', '2 - Usuario']
  ];

  return niveles.map(([valor, etiqueta]) => `
    <option value="${valor}" ${String(nivelActual) === valor ? 'selected' : ''}>
      ${etiqueta}
    </option>
  `).join('');
}

function alternarPasswordAcceso(inputId, button) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const mostrar = input.type === 'password';
  input.type = mostrar ? 'text' : 'password';
  if (button) button.textContent = mostrar ? 'Ocultar' : 'Mostrar';
}

async function agregarUsuarioAcceso() {
  if (!usuarioPuede(0)) {
    mostrarAccesoDenegado();
    return;
  }

  const usuarioInput = document.getElementById('nuevoUsuarioAcceso');
  const passwordInput = document.getElementById('nuevoPasswordAcceso');
  const nivelInput = document.getElementById('nuevoNivelAcceso');
  const status = document.getElementById('controlAccesosStatus');
  const usuario = usuarioInput ? usuarioInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';
  const nivel = nivelInput ? nivelInput.value.trim() : '';

  if (!usuario || !password || !nivel) {
    if (status) status.textContent = 'Escribe usuario, contrasena y nivel.';
    return;
  }

  const { data: existente, error: errorConsulta } = await supabaseClient
    .from('Usuarios_Login')
    .select('id')
    .ilike('User_Nombre', usuario)
    .maybeSingle();

  if (errorConsulta) {
    if (status) status.textContent = 'Error al validar usuario: ' + errorConsulta.message;
    return;
  }

  if (existente) {
    if (status) status.textContent = 'Ese nombre de usuario ya existe.';
    return;
  }

  const { error } = await supabaseClient
    .from('MD:Usuarios')
    .insert({ User_Nombre: usuario, User_Pass: password, Nivel: nivel });

  if (error) {
    if (status) status.textContent = 'Error al agregar usuario: ' + error.message;
    return;
  }

  usuarioInput.value = '';
  passwordInput.value = '';
  nivelInput.value = '';
  await cargarUsuariosAcceso();
  if (status) status.textContent = 'Usuario agregado correctamente.';
}

async function guardarUsuarioAcceso(index) {
  if (!usuarioPuede(0)) {
    mostrarAccesoDenegado();
    return;
  }

  const row = controlAccesosRows[index];
  const usuarioInput = document.getElementById(`acceso-usuario-${index}`);
  const passwordInput = document.getElementById(`acceso-password-${index}`);
  const nivelInput = document.getElementById(`acceso-nivel-${index}`);
  const status = document.getElementById('controlAccesosStatus');
  if (!row || !usuarioInput || !passwordInput || !nivelInput) return;

  const usuario = usuarioInput.value.trim();
  const password = passwordInput.value;
  const nivel = nivelInput.value.trim();

  if (!usuario || !password || !nivel) {
    if (status) status.textContent = 'Usuario, contrasena y nivel no pueden quedar vacios.';
    return;
  }

  const { data, error } = await supabaseClient
    .from('MD:Usuarios')
    .update({ User_Nombre: usuario, User_Pass: password, Nivel: nivel })
    .eq('id', row.id)
    .select('id,User_Nombre,User_Pass,Nivel')
    .maybeSingle();

  if (error) {
    if (status) status.textContent = 'Error al guardar usuario: ' + error.message;
    return;
  }

  if (!data) {
    if (status) status.textContent = 'No se actualizo el usuario. Revisa la policy UPDATE.';
    return;
  }

  controlAccesosRows[index] = data;
  renderUsuariosAcceso();

  if (String(data.id) === String(localStorage.getItem('usuarioId') || '')) {
    localStorage.setItem('usuarioActivo', data.User_Nombre);
    localStorage.setItem('usuarioNivel', String(data.Nivel ?? ''));
    aplicarPermisosNavegacion();
  }

  if (status) status.textContent = 'Usuario actualizado correctamente.';
}

async function eliminarUsuarioAcceso(index) {
  if (!usuarioPuede(0)) {
    mostrarAccesoDenegado();
    return;
  }

  const row = controlAccesosRows[index];
  const status = document.getElementById('controlAccesosStatus');
  if (!row) return;

  if (String(row.id) === String(localStorage.getItem('usuarioId') || '')) {
    if (status) status.textContent = 'No puedes eliminar el usuario de la sesion actual.';
    return;
  }

  if (!window.confirm(`Se eliminara el usuario "${row.User_Nombre}". Esta accion no se puede deshacer.`)) {
    return;
  }

  const { error } = await supabaseClient
    .from('MD:Usuarios')
    .delete()
    .eq('id', row.id);

  if (error) {
    if (status) status.textContent = 'Error al eliminar usuario: ' + error.message;
    return;
  }

  await cargarUsuariosAcceso();
  if (status) status.textContent = 'Usuario eliminado correctamente.';
}

function renderAdministrarCatalogos() {
  if (!usuarioPuede(0)) {
    mostrarAccesoDenegado();
    return;
  }

  const contenedor = document.getElementById('panelControlContenido');
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="control-card catalog-admin-card">
      <div class="catalog-header">
        <h2>Administrar Catalogos</h2>
        <p>Edita los catalogos utilizados para construir codigos.</p>
      </div>

      <div class="catalog-admin-toolbar">
        <div class="field-block">
          <label for="catalogoAdminSelect">Tabla</label>
          <select id="catalogoAdminSelect" onchange="seleccionarCatalogoAdmin(this.value)">
            ${Object.entries(CATALOGOS_ADMIN).map(([tabla, config]) => `
              <option value="${escapeHtml(tabla)}" ${tabla === catalogoAdminActual ? 'selected' : ''}>
                ${escapeHtml(config.label)}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="field-block catalog-admin-search">
          <label for="catalogoAdminFiltro">Buscar en la tabla</label>
          <input
            id="catalogoAdminFiltro"
            type="search"
            placeholder="Filtrar registros"
            oninput="renderFilasCatalogoAdmin(this.value)"
          >
        </div>

        <div class="field-block">
          <label for="catalogoAdminOrden">Orden por ID</label>
          <select id="catalogoAdminOrden" onchange="cambiarOrdenCatalogoAdmin(this.value)">
            <option value="asc" ${catalogoAdminOrden === 'asc' ? 'selected' : ''}>
              Menor a mayor
            </option>
            <option value="desc" ${catalogoAdminOrden === 'desc' ? 'selected' : ''}>
              Mayor a menor
            </option>
          </select>
        </div>

        <button type="button" onclick="cargarCatalogoAdmin()">Actualizar</button>
      </div>

      <div id="catalogoAdminNuevo" class="catalog-admin-new"></div>
      <div id="catalogoAdminStatus" class="status-box">Cargando catalogo...</div>

      <div class="table-scroll">
        <table class="catalog-table catalog-admin-table">
          <thead id="catalogoAdminHead"></thead>
          <tbody id="catalogoAdminBody"></tbody>
        </table>
      </div>
    </div>
  `;

  renderFormularioNuevoCatalogo();
  cargarCatalogoAdmin();
}

function seleccionarCatalogoAdmin(tabla) {
  if (!usuarioPuede(0) || !CATALOGOS_ADMIN[tabla]) return;

  catalogoAdminActual = tabla;
  catalogoAdminRows = [];

  const filtro = document.getElementById('catalogoAdminFiltro');
  if (filtro) filtro.value = '';

  renderFormularioNuevoCatalogo();
  cargarCatalogoAdmin();
}

function cambiarOrdenCatalogoAdmin(orden) {
  if (!usuarioPuede(0) || !['asc', 'desc'].includes(orden)) return;

  catalogoAdminOrden = orden;
  ordenarCatalogoAdminRows();

  const filtro = document.getElementById('catalogoAdminFiltro')?.value || '';
  renderFilasCatalogoAdmin(filtro);
}

function renderFormularioNuevoCatalogo() {
  const contenedor = document.getElementById('catalogoAdminNuevo');
  const config = CATALOGOS_ADMIN[catalogoAdminActual];
  if (!contenedor || !config) return;

  const fields = config.fields.filter(field => !field.readonly);

  contenedor.innerHTML = `
    <div class="catalog-admin-new-header">
      <h3>Agregar registro</h3>
    </div>
    <div class="catalog-admin-new-grid">
      ${fields.map((field, index) => `
        <div class="field-block">
          <label for="catalogoNuevo-${index}">${escapeHtml(field.label)}</label>
          <input id="catalogoNuevo-${index}" type="text" autocomplete="off">
        </div>
      `).join('')}
      <button type="button" onclick="agregarRegistroCatalogo()">Agregar</button>
    </div>
  `;
}

async function cargarCatalogoAdmin() {
  if (!usuarioPuede(0)) {
    mostrarAccesoDenegado();
    return;
  }

  const status = document.getElementById('catalogoAdminStatus');
  const config = CATALOGOS_ADMIN[catalogoAdminActual];
  if (!status || !config) return;

  status.textContent = `Cargando ${config.label}...`;

  const { data, error } = await supabaseClient
    .from(catalogoAdminActual)
    .select('*')
    .order(config.sortField, {
      ascending: true
    })
    .limit(1000);

  if (error) {
    catalogoAdminRows = [];
    status.textContent = `Error al cargar ${config.label}: ${error.message}`;
    renderFilasCatalogoAdmin();
    return;
  }

  catalogoAdminRows = data || [];
  ordenarCatalogoAdminRows();
  status.textContent = `Registros cargados: ${catalogoAdminRows.length}`;
  renderFilasCatalogoAdmin();
}

function ordenarCatalogoAdminRows() {
  const config = CATALOGOS_ADMIN[catalogoAdminActual];
  if (!config) return;

  const factor = catalogoAdminOrden === 'desc' ? -1 : 1;

  catalogoAdminRows.sort((a, b) => {
    const valorA = String(a[config.sortField] ?? '');
    const valorB = String(b[config.sortField] ?? '');

    return valorA.localeCompare(valorB, undefined, {
      numeric: true,
      sensitivity: 'base'
    }) * factor;
  });
}

function renderFilasCatalogoAdmin(filtro = '') {
  const head = document.getElementById('catalogoAdminHead');
  const body = document.getElementById('catalogoAdminBody');
  const config = CATALOGOS_ADMIN[catalogoAdminActual];
  if (!head || !body || !config) return;

  const filtroNormalizado = normalizarTextoFlexible(filtro);
  const rows = catalogoAdminRows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => {
      if (!filtroNormalizado) return true;

      return config.fields.some(field => (
        normalizarTextoFlexible(row[field.name]).includes(filtroNormalizado)
      ));
    });

  head.innerHTML = `
    <tr>
      ${config.fields.map(field => `<th>${escapeHtml(field.label)}</th>`).join('')}
      <th>Acciones</th>
    </tr>
  `;

  if (rows.length === 0) {
    body.innerHTML = `
      <tr>
        <td colspan="${config.fields.length + 1}">No hay registros para mostrar.</td>
      </tr>
    `;
    return;
  }

  body.innerHTML = rows.map(({ row, index }) => `
    <tr>
      ${config.fields.map((field, fieldIndex) => `
        <td>
          <input
            id="catalogo-${index}-${fieldIndex}"
            class="master-input"
            type="text"
            value="${escapeHtml(row[field.name] ?? '')}"
            ${field.readonly ? 'disabled' : ''}
          >
        </td>
      `).join('')}
      <td>
        <div class="catalog-admin-actions">
          <button type="button" onclick="guardarRegistroCatalogo(${index})">Guardar</button>
          <button type="button" class="danger-button" onclick="eliminarRegistroCatalogo(${index})">
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function agregarRegistroCatalogo() {
  if (!usuarioPuede(0)) {
    mostrarAccesoDenegado();
    return;
  }

  const config = CATALOGOS_ADMIN[catalogoAdminActual];
  const status = document.getElementById('catalogoAdminStatus');
  const fields = config?.fields.filter(field => !field.readonly) || [];
  if (!config || !status) return;

  const payload = {};

  for (let index = 0; index < fields.length; index += 1) {
    const value = document.getElementById(`catalogoNuevo-${index}`)?.value.trim() || '';

    if (!value) {
      status.textContent = `Completa el campo ${fields[index].label}.`;
      return;
    }

    payload[fields[index].name] = value;
  }

  status.textContent = 'Agregando registro...';

  const { error } = await supabaseClient
    .from(catalogoAdminActual)
    .insert(payload);

  if (error) {
    status.textContent = 'Error al agregar: ' + error.message;
    return;
  }

  fields.forEach((field, index) => {
    const input = document.getElementById(`catalogoNuevo-${index}`);
    if (input) input.value = '';
  });

  await cargarCatalogoAdmin();
  status.textContent = 'Registro agregado correctamente.';
}

async function guardarRegistroCatalogo(index) {
  if (!usuarioPuede(0)) {
    mostrarAccesoDenegado();
    return;
  }

  const config = CATALOGOS_ADMIN[catalogoAdminActual];
  const row = catalogoAdminRows[index];
  const status = document.getElementById('catalogoAdminStatus');
  if (!config || !row || !status) return;

  const payload = {};

  for (let fieldIndex = 0; fieldIndex < config.fields.length; fieldIndex += 1) {
    const field = config.fields[fieldIndex];
    if (field.readonly) continue;

    const value = document.getElementById(`catalogo-${index}-${fieldIndex}`)?.value.trim() || '';

    if (!value) {
      status.textContent = `El campo ${field.label} no puede quedar vacio.`;
      return;
    }

    payload[field.name] = value;
  }

  status.textContent = 'Guardando cambios...';

  let query = supabaseClient
    .from(catalogoAdminActual)
    .update(payload);

  query = aplicarIdentificadorCatalogo(query, config, row);
  const { error } = await query;

  if (error) {
    status.textContent = 'Error al guardar: ' + error.message;
    return;
  }

  await cargarCatalogoAdmin();
  status.textContent = 'Registro actualizado correctamente.';
}

async function eliminarRegistroCatalogo(index) {
  if (!usuarioPuede(0)) {
    mostrarAccesoDenegado();
    return;
  }

  const config = CATALOGOS_ADMIN[catalogoAdminActual];
  const row = catalogoAdminRows[index];
  const status = document.getElementById('catalogoAdminStatus');
  if (!config || !row || !status) return;

  if (!window.confirm(`Se eliminara este registro de ${config.label}. Esta accion no se puede deshacer.`)) {
    return;
  }

  status.textContent = 'Eliminando registro...';

  let query = supabaseClient
    .from(catalogoAdminActual)
    .delete();

  query = aplicarIdentificadorCatalogo(query, config, row);
  const { error } = await query;

  if (error) {
    status.textContent = 'Error al eliminar: ' + error.message;
    return;
  }

  await cargarCatalogoAdmin();
  status.textContent = 'Registro eliminado correctamente.';
}

function aplicarIdentificadorCatalogo(query, config, row) {
  const keysDisponibles = config.keys.every(key => row[key] !== null && row[key] !== undefined);
  const keys = keysDisponibles
    ? config.keys
    : config.fields.filter(field => !field.readonly).map(field => field.name);

  keys.forEach(key => {
    query = row[key] === null
      ? query.is(key, null)
      : query.eq(key, row[key]);
  });

  return query;
}
