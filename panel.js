let editorMaestroRows = [];

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
