window.renderSolicitudes = function renderSolicitudes() {
  const viewer = document.getElementById('viewer');
  if (!viewer) return;

  viewer.innerHTML = `
    <div class="catalog-wrapper solicitudes-wrapper">
      <div class="catalog-header">
        <h2>Solicitudes</h2>
        <p>Registro y seguimiento de solicitudes del Index.</p>
      </div>

      <div class="solicitudes-panel">
        <div class="solicitudes-toolbar">
          <button type="button" onclick="crearSolicitud()">Nueva solicitud</button>
        </div>

        <div id="solicitudesStatus" class="status-box">Modulo de solicitudes listo.</div>

        <div class="table-scroll">
          <table class="catalog-table solicitudes-table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Fecha</th>
                <th>Solicitante</th>
                <th>Descripcion</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody id="solicitudesResultados">
              <tr>
                <td colspan="5">Sin solicitudes registradas todavia.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
};

window.crearSolicitud = function crearSolicitud() {
  const viewer = document.getElementById('viewer');
  if (!viewer) return;

  viewer.innerHTML = `
    <div class="catalog-wrapper solicitudes-wrapper">
      <div class="solicitud-paper">
        <div class="solicitud-paper-header">
          <div>
            <h2>Solicitud de Alta / Modificacion de Articulo</h2>
            <p>Formato de captura basado en el PDF.</p>
          </div>

          <button type="button" onclick="renderSolicitudes()">Regresar</button>
        </div>

        <div class="solicitud-row three-cols">
          <div class="paper-field">
            <label for="solicitudFolio">Folio de Solicitud</label>
            <input id="solicitudFolio" type="text" placeholder="Automatico" disabled>
          </div>

          <div class="paper-field">
            <label for="solicitudFecha">Fecha</label>
            <input id="solicitudFecha" type="date" disabled>
          </div>

          <div class="paper-field">
            <label for="solicitudSolicitante">Solicitante</label>
            <input id="solicitudSolicitante" type="text">
          </div>
        </div>

        <div class="paper-section">
          <div class="paper-section-title">1. Datos de Nuevo Articulo</div>

          <div class="pdf-two-columns">
            <div class="pdf-column">
              <div class="paper-field underline-field">
                <label for="codigoExtranjero">Codigo Extranjero</label>
                <input id="codigoExtranjero" type="text">
              </div>

              <div class="subsection-title">Datos Generales</div>

              <div class="paper-field underline-field short-field">
                <label for="solicitudUnidadMedida">Unidad de Medida (UM)</label>
                <input id="solicitudUnidadMedida" type="text" placeholder="PZA, KG, MTS, etc.">
              </div>

              <div class="subsection-title">Es un producto fantasma? (Solo ADN-4):</div>

              <div class="pdf-check-options small-options">
                <label>
                  <input type="radio" name="productoFantasma" value="Si">
                  Si
                </label>

                <label>
                  <input type="radio" name="productoFantasma" value="No">
                  No
                </label>
              </div>
            </div>

            <div class="pdf-column">
              <div class="paper-field underline-field">
                <label for="descripcionExtranjera">Descripcion Extranjera</label>
                <input id="descripcionExtranjera" type="text">
              </div>

              <div class="subsection-title">Categorias del articulo</div>

              <div class="pdf-check-options category-options">
                <label>
                  <input type="checkbox" id="categoriaInventario">
                  <span><strong>Articulo de Inventario:</strong> Articulo capaz de guardarse fisicamente.</span>
                </label>

                <label>
                  <input type="checkbox" id="categoriaVenta">
                  <span><strong>Articulo de Venta:</strong> Articulo para venta.</span>
                </label>

                <label>
                  <input type="checkbox" id="categoriaCompra">
                  <span><strong>Articulo de Compra:</strong> Articulo comprado a un proveedor.</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="paper-section">
          <div class="paper-section-title">2. Clasificacion General</div>

          <div class="paper-options">
            <label>
              <input type="radio" name="clasificacionGeneral" value="ADN-5">
              ADN-5: Materia Prima, Consumibles, Herramientas, Servicios, Activos o Empaques.
            </label>

            <label>
              <input type="radio" name="clasificacionGeneral" value="ADN-4">
              ADN-4: Productos Terminados o Sub-Productos.
            </label>
          </div>
        </div>

        <div class="paper-section">
          <div class="paper-section-title">3. Datos para Identificacion</div>

          <div class="solicitud-row four-cols">
            <div class="paper-field">
              <label for="solicitudGrupo">Grupo</label>
              <input id="solicitudGrupo" type="text" placeholder="Letra segun Anexo 01">
            </div>

            <div class="paper-field">
              <label for="solicitudFamilia">Familia</label>
              <input id="solicitudFamilia" type="text" placeholder="2 digitos">
            </div>

            <div class="paper-field">
              <label for="solicitudTipo">Tipo</label>
              <input id="solicitudTipo" type="text" placeholder="Letra o 2 digitos">
            </div>

            <div class="paper-field">
              <label for="solicitudMaterial">Material</label>
              <input id="solicitudMaterial" type="text" placeholder="Solo ADN-5">
            </div>
          </div>
        </div>

        <div class="paper-section">
          <div class="paper-section-title">4. Descripcion Sugerida</div>

          <div class="paper-instruction">
            Formato: NOMBRE + MEDIDA + MATERIAL + DETALLE TECNICO.
          </div>

          <div class="paper-field">
            <label for="solicitudDescripcion">Descripcion</label>
            <textarea id="solicitudDescripcion" rows="4" placeholder="MAYUSCULAS Y SIN ACENTOS"></textarea>
          </div>
        </div>

        <div class="solicitud-actions">
          <button type="button" onclick="limpiarSolicitud()">Limpiar</button>
          <button type="button" onclick="guardarSolicitud()">Guardar solicitud</button>
        </div>

        <div id="solicitudesStatus" class="status-box">Completa el formato para registrar la solicitud.</div>
      </div>
    </div>
  `;

  prepararSolicitudInicial();
};

window.prepararSolicitudInicial = function prepararSolicitudInicial() {
  const fecha = document.getElementById('solicitudFecha');

  if (fecha) {
    fecha.value = new Date().toISOString().slice(0, 10);
  }
};

window.limpiarSolicitud = function limpiarSolicitud() {
  crearSolicitud();
};

async function guardarSolicitud() {
  const status = document.getElementById('solicitudesStatus');

  if (!supabaseClient) {
    if (status) {
      status.textContent = 'Supabase no esta cargado. Revisa index.html.';
    }
    return;
  }

  const productoFantasmaValue = document.querySelector('input[name="productoFantasma"]:checked')?.value || null;
  const productoFantasma = productoFantasmaValue === null ? null : productoFantasmaValue === 'Si';

  const categorias = [];

  if (document.getElementById('categoriaInventario')?.checked) {
    categorias.push('Inventario');
  }

  if (document.getElementById('categoriaVenta')?.checked) {
    categorias.push('Venta');
  }

  if (document.getElementById('categoriaCompra')?.checked) {
    categorias.push('Compra');
  }

  const payload = {
    Solicitante: document.getElementById('solicitudSolicitante')?.value || null,
    C_Extranjero: document.getElementById('codigoExtranjero')?.value || null,
    D_extranjero: document.getElementById('descripcionExtranjera')?.value || null,
    UM: document.getElementById('solicitudUnidadMedida')?.value || null,
    Fantasma: productoFantasma,
    Categoria: categorias.length ? categorias.join(', ') : null
  };

  try {
    if (status) status.textContent = 'Guardando solicitud...';

    const { data, error } = await supabaseClient
      .from('Solicitudes')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    if (status) {
      status.textContent = `Solicitud guardada correctamente. Folio: ${data.Folio}`;
    }

    const folioInput = document.getElementById('solicitudFolio');
    if (folioInput && data.Folio) {
      folioInput.value = data.Folio;
    }
  } catch (error) {
    if (status) {
      status.textContent = 'Error al guardar solicitud: ' + error.message;
    }

    console.error(error);
  }
}