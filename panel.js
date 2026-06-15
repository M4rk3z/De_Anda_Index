let controlAltasRows = [];

function renderPanelControl() {
  const viewer = document.getElementById('viewer');
  if (!viewer) return;

  viewer.innerHTML = `
    <div class="catalog-wrapper">
      <div class="catalog-header">
        <h2>Bienvenido ADMIN</h2>
        <p>Selecciona una opcion disponible.</p>
      </div>

      <div class="nuevo-codigo-panel">
        <div class="panel-actions">
          <button onclick="renderControlAltas()">Control de Estatus</button>
        </div>

        <div id="panelControlContenido" class="panel-control-content">
          <div class="status-box">Elige una opcion para continuar.</div>
        </div>
      </div>
    </div>
  `;
}

function renderControlAltas() {
  const contenedor = document.getElementById('panelControlContenido');
  if (!contenedor) return;

  contenedor.innerHTML = `
  <div class="control-card">
    <div class="catalog-header">
      <h2>Control de Estatus</h2>
      <p>Busca un articulo por Nombre SAP o Codigo.</p>
    </div>

    <div class="nuevo-codigo-grid">
      <div class="field-block">
        <label for="buscadorAltas">Buscar</label>
        <input id="buscadorAltas" type="text" placeholder="Nombre SAP o codigo">
      </div>

      <div class="field-block action-block">
        <label>&nbsp;</label>
        <button onclick="buscarControlAltas()">Buscar</button>
      </div>
    </div>

    <div id="controlAltasStatus" class="status-box">
      Escribe un valor para buscar.
    </div>

    <div class="table-scroll">
      <table class="catalog-table results-table">
        <thead>
          <tr>
            <th>Nombre SAP</th>
            <th>Codigo</th>
            <th>Status</th>
            <th>Fecha</th>
            <th>Accion</th>
          </tr>
        </thead>
        <tbody id="controlAltasResultados">
          <tr><td colspan="5">Sin resultados todavia.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
`;
}

async function buscarControlAltas() {
  const input = document.getElementById('buscadorAltas');
  const statusBox = document.getElementById('controlAltasStatus');

  const busqueda = input ? input.value.trim() : '';

  if (!busqueda) {
    statusBox.textContent = 'Escribe un Nombre SAP o Codigo.';
    return;
  }

  statusBox.textContent = 'Buscando...';

  const { data, error } = await supabaseClient
    .from('Materia_Prima')
    .select('id,"Nombre SAP","Codigo SAP","Status","Fecha_Ultimo_Cambio"')
    .or(`"Nombre SAP".ilike.%${busqueda}%,"Codigo SAP".ilike.%${busqueda}%`)
    .limit(10);

  if (error) {
    console.error('Error Supabase:', error);
    statusBox.textContent = 'Error: ' + error.message;
    return;
  }

  renderResultadosControlAltas(data || []);
  statusBox.textContent = data.length ? 'Busqueda completada.' : 'No se encontraron resultados.';
}

function renderResultadosControlAltas(rows) {
  const tbody = document.getElementById('controlAltasResultados');
  if (!tbody) return;

  controlAltasRows = rows || [];

  if (!controlAltasRows.length) {
    tbody.innerHTML = '<tr><td colspan="5">No se encontraron resultados.</td></tr>';
    return;
  }

  tbody.innerHTML = controlAltasRows.map((row, index) => {
    const statusActual = row["Status"] || '';

    return `
      <tr>
        <td>${escapeHtml(row["Nombre SAP"] || '')}</td>
        <td>${escapeHtml(row["Codigo SAP"] || '')}</td>
        <td>
          <select id="status-altas-${index}">
            <option value="Disponible" ${statusActual === 'Disponible' ? 'selected' : ''}>Disponible</option>
            <option value="Bloqueado" ${statusActual === 'Bloqueado' ? 'selected' : ''}>Bloqueado</option>
            <option value="CONTROL" ${statusActual === 'CONTROL' ? 'selected' : ''}>CONTROL</option>
          </select>
        </td>
        <td>${escapeHtml(row["Fecha_Ultimo_Cambio"] || '')}</td>
        <td>
          <button onclick="guardarStatusArticulo(${index})">Guardar</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function guardarStatusArticulo(index) {
  const row = controlAltasRows[index];
  const select = document.getElementById(`status-altas-${index}`);

  if (!row || !select) {
    alert('No se encontro el registro seleccionado.');
    return;
  }

  const nuevoStatus = select.value;

  const { data, error } = await supabaseClient
    .from('Materia_Prima')
    .update({
      "Status": nuevoStatus
    })
    .eq('id', row.id)
    .select('id,"Nombre SAP","Codigo SAP","Status","Fecha_Ultimo_Cambio"');

  if (error) {
    console.error('Error Supabase:', error);
    alert('No se pudo actualizar el Status: ' + error.message);
    return;
  }

  if (!data || !data.length) {
    alert('No se actualizo ningun registro. Revisa permisos de Supabase.');
    return;
  }

  alert('Status actualizado correctamente.');
  buscarControlAltas();
}