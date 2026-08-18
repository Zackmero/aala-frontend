<template>
  <div class="clientes-contenedor">
    <div class="cabecera-seccion">
      <div class="header-text">
        <button @click="regresar" class="btn-regresar">
          &larr; Volver a la lista
        </button>
        <h2 v-if="expediente">{{ expediente.titulo }}</h2>
        <h2 v-else>Cargando expediente...</h2>
        <p class="subtitulo" v-if="expediente">
          Juzgado: {{ expediente.numero_expediente_judicial || "Sin asignar" }}
        </p>
      </div>
    </div>

    <div v-if="cargando" class="estado-msg">
      <span class="spinner">⏳</span> Abriendo carpeta legal...
    </div>

    <!--TODO DATOS DEL EXPEDIENTE -->
    <div v-else-if="expediente" class="tarjeta-sistema">
      <div class="resumen-rapido">
        <div class="dato-pill">
          <span class="label">Estatus:</span>
          <span class="badge-estatus activo">Activo</span>
        </div>
        <div class="dato-pill">
          <span class="label">Prioridad:</span>
          <span class="valor">🔥 {{ expediente.prioridad || "Media" }}</span>
        </div>
        <div class="dato-pill">
          <span class="label">Apertura:</span>
          <span class="valor"
            >📅 {{ formatearFecha(expediente.fecha_apertura) }}</span
          >
        </div>
      </div>

      <!--! TABS DETALLES DE EXPEDIENTE -->
      <div class="tabs-nav">
        <!--TODO RESUMEN  -->
        <button
          :class="['tab-btn', { active: pestanaActiva === 'resumen' }]"
          @click="pestanaActiva = 'resumen'"
        >
          📄 Resumen
        </button>
        <!--TODO DOCUMENTOS  -->
        <button
          :class="['tab-btn', { active: pestanaActiva === 'documentos' }]"
          @click="pestanaActiva = 'documentos'"
        >
          📂 Documentos
        </button>
        <!--TODO PAGOS  -->
        <button
          :class="['tab-btn', { active: pestanaActiva === 'pagos' }]"
          @click="pestanaActiva = 'pagos'"
        >
          💰 Pagos
        </button>
        <!--TODO GASTOS  -->
        <button
          :class="['tab-btn', { active: pestanaActiva === 'gastos' }]"
          @click="pestanaActiva = 'gastos'"
        >
          🧾 Gastos
        </button>
        <!--TODO AUDIENCIAS  -->
        <button
          :class="['tab-btn', { active: pestanaActiva === 'audiencias' }]"
          @click="pestanaActiva = 'audiencias'"
        >
          ⚖️ Audiencias
        </button>
      </div>

      <!--! CONTENIDO DE TABS -->
      <div class="tab-content">
        <!--TODO TAB DE RESUMEN -->
        <div v-if="pestanaActiva === 'resumen'" class="animacion-fade">
          <div class="form-grid">
            <div class="group-input full">
              <label>Descripción y Hechos Iniciales</label>
              <div class="caja-texto-lectura">
                {{ expediente.descripcion || "Sin descripción registrada." }}
              </div>
            </div>

            <div class="group-input mt-3">
              <label>👤Cliente</label>
              <div class="caja-texto-lectura clickeable">
                ID Cliente: #{{ expediente.cliente_id }}
              </div>
              <div class="caja-texto-lectura clickeable">
                Nombre: {{ expediente.nombre_cliente || "No registrado" }}
              </div>
            </div>

            <div class="group-input mt-3">
              <label>Fecha de Cierre Esperada</label>
              <div class="caja-texto-lectura">
                🗓️
                {{
                  formatearFecha(expediente.fecha_cierre_esperada) ||
                  "No definida"
                }}
              </div>
            </div>
          </div>
        </div>

        <!--TODO TAB DE DOCUMENTOS -->
        <div v-if="pestanaActiva === 'documentos'" class="animacion-fade">
          <div class="tab-header-accion">
            <h3>Archivos del Expediente</h3>
            <button @click="mostrarModalDoc = true" class="btn-primario mini">
              + Subir Documento
            </button>
          </div>

          <!--? TABLA DE DOCUMENTOS -->
          <div
            v-if="listaDocumentos.length > 0"
            class="responsive-table-container mt-3"
          >
            <table class="tabla-profesional">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Archivos</th>
                  <th>Fecha de Carga</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="doc in listaDocumentos" :key="doc.id">
                  <td>
                    <span class="tag-materia">{{ doc.tipo_documento }}</span>
                  </td>
                  <td class="resaltado">{{ doc.nombre_original }}</td>
                  <td>{{ formatearFecha(doc.creado_en) }}</td>
                  <td class="text-center">
                    <a
                      :href="doc.ruta_url"
                      target="_blank"
                      class="btn-accion view"
                      title="Ver"
                      rel="noopener noreferrer"
                      style="text-decoration: none"
                    >
                      👁️
                    </a>
                    <button
                      class="btn-accion delete"
                      @click="borrarDocumento(doc.id)"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="vacio">
            <span class="icon-large">📂</span>
            <p>Aún no hay documentos subidos a este caso.</p>
          </div>
        </div>

        <!--TODO TAB DE PAGOS -->
        <div v-if="pestanaActiva === 'pagos'" class="animacion-fade">
          <!--? REGISTRAR PAGO BOTON -->
          <div class="tab-header-accion">
            <h3>Control Financiero del Expediente</h3>
            <button @click="abrirNuevoPago" class="btn-primario mini">
              + Registrar Cobro/Pago
            </button>
          </div>

          <!--? KPI's -->
          <div class="dashboard-financiero mb-4">
            <div class="widget-finanzas pagado">
              <span class="widget-titulo">Total Pagado</span>
              <span class="widget-monto">{{
                formatoMoneda(resumenFinanciero.pagado)
              }}</span>
            </div>
            <div class="widget-finanzas pendiente">
              <span class="widget-titulo">Saldo Pendiente</span>
              <span class="widget-monto">{{
                formatoMoneda(resumenFinanciero.pendiente)
              }}</span>
            </div>
            <div class="widget-finanzas total">
              <span class="widget-titulo">Valor Total del Caso</span>
              <span class="widget-monto">{{
                formatoMoneda(
                  resumenFinanciero.pagado + resumenFinanciero.pendiente,
                )
              }}</span>
            </div>
          </div>

          <!--? LISTA PAGOS -->
          <div v-if="listaPagos.length > 0" class="responsive-table-container">
            <table class="tabla-profesional">
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Tipo / Frecuencia</th>
                  <th>Fecha Límite</th>
                  <th>Monto</th>
                  <th>Metodo de Pago</th>
                  <th>Registrado Por</th>
                  <th>Estatus</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pago in listaPagos" :key="pago.id">
                  <td class="resaltado">{{ pago.concepto }}</td>
                  <td>
                    <span class="tag-asunto">{{ pago.tipo }}</span>
                  </td>
                  <td>{{ formatearFecha(pago.fecha_vencimiento) }}</td>

                  <td class="resaltado">{{ formatoMoneda(pago.monto) }}</td>
                  <td>{{ pago.metodo_pago }}</td>
                  <td>{{ pago.nombre_abogado }}</td>
                  <td>
                    <span
                      :class="['badge-estatus', pago.estatus.toLowerCase()]"
                    >
                      {{ pago.estatus }}
                    </span>
                  </td>
                  <td class="text-center">
                    <button
                      @click="verDetallesPago(pago)"
                      class="btn-accion view"
                      title="Ver Detalles y Comprobante"
                    >
                      👁️
                    </button>
                    <button
                      @click="editarPago(pago)"
                      class="btn-accion edit"
                      title="Registrar abono o marcar pagado"
                    >
                      ✏️
                    </button>
                    <button
                      @click="borrarPago(pago.id)"
                      class="btn-accion delete"
                      title="Eliminar registro"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!--? LISTA PAGOS VACIA -->
          <div v-else class="vacio">
            <span class="icon-large">💵</span>
            <p>No hay registro de cobros o anticipos para este expediente.</p>
          </div>
        </div>

        <!--TODO TAB DE GASTOS-->
        <div v-if="pestanaActiva === 'gastos'" class="animacion-fade">
          <div class="tab-header-accion">
            <h3>Control de Gastos del Expediente</h3>
            <button @click="abrirNuevoGasto" class="btn-primario mini">
              + Registrar Gasto
            </button>
          </div>

          <div class="dashboard-financiero mb-4">
            <div class="widget-finanzas pagado">
              <span class="widget-titulo">Total Pagado</span>
              <span class="widget-monto">{{
                formatoMoneda(resumenGastos.pagado)
              }}</span>
            </div>
            <div class="widget-finanzas pendiente">
              <span class="widget-titulo">Pendientes</span>
              <span class="widget-monto">{{
                formatoMoneda(resumenGastos.pendiente)
              }}</span>
            </div>
            <div class="widget-finanzas total">
              <span class="widget-titulo">Total del Expediente</span>
              <span class="widget-monto">{{
                formatoMoneda(resumenGastos.total)
              }}</span>
            </div>
          </div>

          <div v-if="listaGastos.length > 0" class="responsive-table-container">
            <table class="tabla-profesional">
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Abogado Responsable</th>
                  <th>Estatus</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="gasto in listaGastos" :key="gasto.id">
                  <td class="resaltado">{{ gasto.concepto }}</td>
                  <td>
                    <span class="tag-asunto">{{ gasto.tipo }}</span>
                  </td>
                  <td>{{ formatearFecha(gasto.fecha) }}</td>
                  <td class="resaltado">{{ formatoMoneda(gasto.monto) }}</td>
                  <td class="resaltado">
                    {{ gasto.abogado || "Sin abogado" }}
                  </td>
                  <td>
                    <span
                      :class="['badge-estatus', gasto.estatus.toLowerCase()]"
                    >
                      {{ gasto.estatus }}
                    </span>
                  </td>
                  <td class="text-center">
                    <button
                      @click="verDetallesGasto(gasto)"
                      class="btn-accion edit"
                      title="Ver gasto"
                    >
                      👁️
                    </button>
                    <button
                      @click="editarGasto(gasto)"
                      class="btn-accion edit"
                      title="Editar gasto"
                    >
                      ✏️
                    </button>
                    <button
                      @click="eliminarGasto(gasto.id)"
                      class="btn-accion delete"
                      title="Eliminar gasto"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="vacio">
            <span class="icon-large">🧾</span>
            <p>No hay gastos registrados para este expediente todavía.</p>
          </div>
        </div>

        <!--TODO TAB DE AUDIENCIAS -->
        <div v-if="pestanaActiva === 'audiencias'" class="animacion-fade">
          <div class="tab-header-accion">
            <h3>Agenda de Audiencias del Caso</h3>
            <button @click="abrirNuevaAudiencia" class="btn-primario mini">
              + Programar Cita
            </button>
          </div>

          <!-- <div class="vacio">
            <span class="icon-large">⚖️</span>
            <p>No hay audiencias programadas en el juzgado.</p>
          </div> -->
          <table class="tabla-profesional mt-4">
            <thead>
              <tr>
                <th>Audiencia</th>
                <th>Fecha y Hora</th>
                <th>Lugar / Modalidad</th>
                <th>Estatus</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="listaAudiencias.length === 0">
                <td colspan="5" class="vacio">
                  No hay audiencias programadas para este expediente.
                </td>
              </tr>

              <tr v-for="audiencia in listaAudiencias" :key="audiencia.id">
                <td>
                  <div class="resaltado">{{ audiencia.titulo }}</div>
                </td>
                <td>
                  🗓️ {{ formato.formatearFechaHoraCorta(audiencia.fecha_hora) }}
                </td>
                <td>📍 {{ audiencia.lugar }}</td>
                <td>
                  <span
                    :class="['badge-estatus', audiencia.estatus.toLowerCase()]"
                  >
                    {{ audiencia.estatus }}
                  </span>
                </td>
                <td>
                  <div class="btn-groupacciones">
                    <button
                      @click="editarAudiencia(audiencia)"
                      class="btn-accion edit"
                      title="Editar"
                    >
                      ✏️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!--TODO MODAL DE DOCUMNTOS -->
    <div v-if="mostrarModalDoc" class="modal-overlay">
      <div class="modal-card">
        <header class="modal-header">
          <h3>Subir Archivos al Expediente</h3>
          <button @click="cerrarModalDoc" class="btn-close">&times;</button>
        </header>

        <form
          @submit.prevent="subirDocumento"
          class="form-grid"
          style="margin-top: 15px"
        >
          <div class="group-input full">
            <label>Clasificación del Documento *</label>
            <select v-model="formDoc.tipo" class="input-select" required>
              <option value="" disabled>Selecciona el tipo...</option>
              <option
                v-for="tipo in tiposDeDocumentos"
                :key="tipo"
                :value="tipo"
              >
                {{ tipo }}
              </option>
            </select>
          </div>

          <div class="group-input full mt-2">
            <label>Seleccionar Archivos (Puedes elegir varios) *</label>
            <input
              type="file"
              @change="manejarArchivos"
              class="input-select file-input"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              required
            />
          </div>

          <div class="group-input full" v-if="archivosSeleccionados.length > 0">
            <div class="lista-archivos-preview">
              <p class="preview-titulo">Archivos listos para subir:</p>
              <ul>
                <li
                  v-for="(archivo, index) in archivosSeleccionados"
                  :key="index"
                >
                  📄 {{ archivo.name }}
                </li>
              </ul>
            </div>
          </div>

          <div class="group-input full mt-2">
            <label>Notas adicionales (Opcional)</label>
            <textarea
              v-model="formDoc.notas"
              rows="2"
              class="input-select"
              placeholder="Ej. Anverso y reverso de la identificación..."
            ></textarea>
          </div>

          <footer class="modal-footer full mt-4">
            <button
              type="button"
              @click="cerrarModalDoc"
              class="btn-secundario"
            >
              Cancelar
            </button>
            <button type="submit" class="btn-primario" :disabled="subiendo">
              {{ subiendo ? "Subiendo archivos..." : "Guardar Archivos" }}
            </button>
          </footer>
        </form>
      </div>
    </div>

    <!--TODO MODAL DE PAGOS -->
    <div v-if="mostrarModalPago" class="modal-overlay">
      <div class="modal-card">
        <header class="modal-header">
          <h3>
            {{
              formPago.id
                ? "Actualizar Cobro / Anticipo"
                : "Registrar Cobro / Anticipo"
            }}
          </h3>
          <button @click="cerrarModalPago" class="btn-close">&times;</button>
        </header>

        <form
          @submit.prevent="guardarPago"
          class="form-grid"
          style="margin-top: 20px"
        >
          <!--* CONCEPTO COBRO -->
          <div class="group-input full">
            <label>Concepto del Cobro *</label>
            <input
              v-model="formPago.concepto"
              type="text"
              class="input-select"
              placeholder="Ej. Anticipo Inicial, Iguala Mayo..."
              required
            />
          </div>

          <!--* TIPO DE COBRO -->
          <div class="group-input two-columns">
            <label>Tipo de Cobro *</label>
            <select v-model="formPago.tipo" class="input-select" required>
              <option value="Pago Inicial">Pago Inicial</option>
              <option value="Honorarios">Honorarios (Único)</option>
              <option value="Iguala Mensual">Iguala Mensual</option>
              <option value="Gastos Generales">Gastos Generales</option>
              <option value="Costas Judiciales">Costas Judiciales</option>
            </select>
          </div>

          <div class="group-input">
            <label>Monto a Cobrar (MXN) *</label>
            <input
              v-model="formPago.monto"
              type="number"
              step="0.01"
              class="input-select"
              placeholder="Ej. 5000.00"
              required
            />
          </div>

          <div class="group-input">
            <label>Fecha de Vencimiento *</label>
            <input
              v-model="formPago.fecha_vencimiento"
              type="date"
              class="input-select"
              required
            />
          </div>

          <div class="group-input">
            <label>Estatus Actual *</label>
            <select v-model="formPago.estatus" class="input-select" required>
              <option value="Pendiente">Pendiente de Pago</option>
              <option value="Pagado">Liquidado / Pagado</option>
            </select>
          </div>

          <div class="group-input full" v-if="formPago.estatus === 'Pagado'">
            <div
              class="caja-texto-lectura"
              style="
                padding: 15px;
                border-left: 4px solid #137333;
                background-color: #f0fdf4;
              "
            >
              <h4
                style="margin: 0 0 15px 0; color: #166534; font-size: 0.95rem"
              >
                Detalles de Liquidación
              </h4>

              <div class="form-grid">
                <div class="group-input">
                  <label>Método de pago *</label>
                  <select
                    v-model="formPago.metodo_pago"
                    class="input-select"
                    :required="formPago.estatus === 'Pagado'"
                  >
                    <option value="" disabled>-- Elige una opción --</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                </div>

                <div class="group-input">
                  <label>Fecha en que se Pagó *</label>
                  <input
                    v-model="formPago.fecha_pago"
                    type="date"
                    class="input-select"
                    :required="formPago.estatus === 'Pagado'"
                  />
                </div>

                <div class="group-input full">
                  <label>Subir Comprobante de Pago (Opcional)</label>
                  <input
                    type="file"
                    @change="manejarComprobante"
                    class="input-select file-input"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="group-input full">
            <label>Notas / Detalles (Opcional)</label>
            <textarea
              v-model="formPago.notas"
              rows="2"
              class="input-select"
              placeholder="Forma de pago acordada, número de cuenta..."
            ></textarea>
          </div>

          <footer class="modal-footer full" style="margin-top: 10px">
            <button
              type="button"
              @click="cerrarModalPago"
              class="btn-secundario"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn-primario"
              :disabled="guardandoPago"
            >
              {{
                guardandoPago
                  ? "Guardando..."
                  : formPago.id
                    ? "Actualizar Cobro"
                    : "Registrar Cobro"
              }}
            </button>
          </footer>
        </form>
      </div>
    </div>

    <!--TODO MODAL DE DETALLE DE PAGO -->
    <div v-if="mostrarModalDetallePago" class="modal-overlay">
      <div class="modal-card">
        <header class="modal-header">
          <h3>Detalle del Movimiento</h3>
          <button @click="cerrarModalDetallePago" class="btn-close">
            &times;
          </button>
        </header>

        <div v-if="pagoSeleccionado" style="margin-top: 20px">
          <div class="resumen-rapido" style="margin-bottom: 20px">
            <div class="dato-pill">
              <span class="label">Monto Total</span>
              <span class="valor" style="font-size: 1.2rem">{{
                formatoMoneda(pagoSeleccionado.monto)
              }}</span>
            </div>
            <div class="dato-pill">
              <span class="label">Estatus</span>
              <span
                :class="[
                  'badge-estatus',
                  pagoSeleccionado.estatus.toLowerCase(),
                ]"
              >
                {{ pagoSeleccionado.estatus }}
              </span>
            </div>
          </div>

          <div class="form-grid">
            <div class="group-input full">
              <label>Concepto:</label>
              <div class="caja-texto-lectura">
                {{ pagoSeleccionado.concepto }}
              </div>
            </div>

            <div class="group-input">
              <label>Tipo:</label>
              <div class="caja-texto-lectura">{{ pagoSeleccionado.tipo }}</div>
            </div>

            <div class="group-input">
              <label>Vencimiento:</label>
              <div class="caja-texto-lectura">
                {{ formatearFecha(pagoSeleccionado.fecha_vencimiento) }}
              </div>
            </div>

            <template v-if="pagoSeleccionado.estatus === 'Pagado'">
              <div class="group-input">
                <label>Método:</label>
                <div class="caja-texto-lectura">
                  {{ pagoSeleccionado.metodo_pago || "No especificado" }}
                </div>
              </div>
              <div class="group-input">
                <label>Fecha de Pago:</label>
                <div class="caja-texto-lectura">
                  {{ formatearFecha(pagoSeleccionado.fecha_pago) }}
                </div>
              </div>
            </template>

            <div class="group-input full" v-if="pagoSeleccionado.notas">
              <label>Notas:</label>
              <div class="caja-texto-lectura">{{ pagoSeleccionado.notas }}</div>
            </div>

            <div class="group-input full" style="margin-top: 10px">
              <a
                v-if="pagoSeleccionado.comprobante_url"
                :href="`http://localhost:3000/api/pagos/${pagoSeleccionado.id}/comprobante?token=${token}`"
                target="_blank"
                class="btn-primario"
                style="
                  text-align: center;
                  text-decoration: none;
                  display: block;
                "
              >
                📄 Ver Comprobante Adjunto
              </a>
              <div
                v-else
                class="vacio"
                style="
                  padding: 15px;
                  border: 1px dashed #ccc;
                  border-radius: 6px;
                "
              >
                <p style="margin: 0; font-size: 0.85rem">
                  No hay comprobante adjunto a este registro.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--TODO MODAL DE DETALLE DE GASTO -->
    <div v-if="mostrarModalDetalleGasto" class="modal-overlay">
      <div class="modal-card">
        <header class="modal-header">
          <h3>Detalle del Gasto</h3>
          <button @click="cerrarModalDetalleGasto" class="btn-close">
            &times;
          </button>
        </header>

        <div v-if="gastoSeleccionado" style="margin-top: 20px">
          <div class="resumen-rapido" style="margin-bottom: 20px">
            <div class="dato-pill">
              <span class="label">Monto Total</span>
              <span class="valor" style="font-size: 1.2rem">{{
                formatoMoneda(gastoSeleccionado.monto)
              }}</span>
            </div>
            <div class="dato-pill">
              <span class="label">Estatus</span>
              <span
                :class="[
                  'badge-estatus',
                  gastoSeleccionado.estatus
                    ? gastoSeleccionado.estatus.toLowerCase()
                    : '',
                ]"
              >
                {{ gastoSeleccionado.estatus }}
              </span>
            </div>
          </div>

          <div class="form-grid">
            <div class="group-input full">
              <label>Concepto:</label>
              <div class="caja-texto-lectura">
                {{ gastoSeleccionado.concepto }}
              </div>
            </div>

            <div class="group-input">
              <label>Categoría:</label>
              <div class="caja-texto-lectura">{{ gastoSeleccionado.tipo }}</div>
            </div>

            <div class="group-input">
              <label>Fecha del Gasto:</label>
              <div class="caja-texto-lectura">
                {{ formatearFecha(gastoSeleccionado.fecha) }}
              </div>
            </div>

            <div class="group-input full" v-if="gastoSeleccionado.notas">
              <label>Notas:</label>
              <div class="caja-texto-lectura">
                {{ gastoSeleccionado.notas }}
              </div>
            </div>

            <div class="group-input full" style="margin-top: 10px">
              <a
                v-if="
                  gastoSeleccionado.comprobante_url ||
                  gastoSeleccionado.comprobanteUrl
                "
                :href="`http://localhost:3000/api/gastos/${gastoSeleccionado.id}/comprobante?token=${token}`"
                target="_blank"
                class="btn-primario"
                style="
                  text-align: center;
                  text-decoration: none;
                  display: block;
                "
              >
                📄 Ver Comprobante Adjunto
              </a>
              <div
                v-else
                class="vacio"
                style="
                  padding: 15px;
                  border: 1px dashed #ccc;
                  border-radius: 6px;
                "
              >
                <p style="margin: 0; font-size: 0.85rem">
                  No hay comprobante adjunto a este registro.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--TODO MODAL DE GASTOS -->
    <div v-if="mostrarModalGasto" class="modal-overlay">
      <div class="modal-card">
        <header class="modal-header">
          <h3>
            {{ formGasto.id ? "Editar Gasto" : "Registrar Gasto" }}
          </h3>
          <button @click="cerrarModalGasto" class="btn-close">&times;</button>
        </header>

        <form
          @submit.prevent="guardarGasto"
          class="form-grid"
          style="margin-top: 20px"
        >
          <div class="group-input full">
            <label>Abogado responsable *</label>
            <select
              v-model="formGasto.abogado_id"
              class="input-select"
              required
            >
              <option value="" disabled>Selecciona el abogado...</option>
              <option
                v-for="abogado in abogadosDisponibles"
                :key="abogado.id"
                :value="abogado.id"
              >
                {{ abogado.nombre }}
              </option>
            </select>
          </div>

          <div class="group-input">
            <label>Categoria *</label>
            <select v-model="formGasto.tipo" class="input-select" required>
              <option value="" disabled>Selecciona el tipo...</option>
              <option
                v-for="tipo in tiposGastosDisponibles"
                :key="tipo"
                :value="tipo"
              >
                {{ tipo }}
              </option>
            </select>
          </div>

          <div class="group-input">
            <label>Concepto *</label>
            <select v-model="formGasto.concepto" class="input-select" required>
              <option value="" disabled>Selecciona el concepto...</option>
              <option
                v-for="concepto in conceptosPorTipo[formGasto.tipo] || []"
                :key="concepto"
                :value="concepto"
              >
                {{ concepto }}
              </option>
            </select>
          </div>

          <div class="group-input">
            <label>Monto (MXN) *</label>
            <input
              v-model="formGasto.monto"
              type="number"
              step="0.01"
              min="0"
              class="input-select"
              placeholder="Ej. 1500.00"
              required
            />
          </div>

          <div class="group-input">
            <label>Fecha *</label>
            <input
              v-model="formGasto.fecha"
              type="date"
              class="input-select"
              required
            />
          </div>

          <div class="group-input">
            <label>Estatus *</label>
            <select v-model="formGasto.estatus" class="input-select" required>
              <option value="Pendiente">Pendiente</option>
              <option value="Pagado">Pagado</option>
            </select>
          </div>

          <!--TODO SOLO MOSTRAR SI EL ESTATUS ES PAGADO -->
          <div class="group-input full" v-if="formGasto.estatus === 'Pagado'">
            <div
              class="caja-texto-lectura"
              style="
                padding: 15px;
                border-left: 4px solid #137333;
                background-color: #f0fdf4;
              "
            >
              <h4
                style="margin: 0 0 15px 0; color: #166534; font-size: 0.95rem"
              >
                Detalles de Liquidación
              </h4>

              <div class="form-grid">
                <div class="group-input">
                  <label>Método de pago *</label>
                  <select
                    v-model="formGasto.metodo_pago"
                    class="input-select"
                    :required="formGasto.estatus === 'Pagado'"
                  >
                    <option value="" disabled>-- Elige una opción --</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                </div>

                <div class="group-input two-columns">
                  <label>Subir Comprobante de Gasto (Opcional)</label>
                  <input
                    type="file"
                    @change="manejarComprobante"
                    class="input-select file-input"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="group-input full">
            <label>Notas / observaciones</label>
            <textarea
              v-model="formGasto.notas"
              rows="3"
              class="input-select"
              placeholder="Detalle adicional del gasto..."
            ></textarea>
          </div>

          <footer class="modal-footer full" style="margin-top: 10px">
            <button
              type="button"
              @click="cerrarModalGasto"
              class="btn-secundario"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn-primario"
              :disabled="guardandoGasto"
            >
              {{
                guardandoGasto
                  ? "Guardando..."
                  : formGasto.id
                    ? "Actualizar Gasto"
                    : "Registrar Gasto"
              }}
            </button>
          </footer>
        </form>
      </div>
    </div>

    <!--TODO MODAL DE AUDIENCIAS -->
    <!--TODO MODAL DE AUDIENCIAS -->
    <div v-if="mostrarModalAudiencia" class="modal-overlay">
      <div class="modal-card">
        <header class="modal-header">
          <h3>
            {{ formAudiencia.id ? "Editar Audiencia" : "Registrar Audiencia" }}
          </h3>
          <button @click="cerrarModalAudiencia" class="btn-close">
            &times;
          </button>
        </header>

        <form
          @submit.prevent="guardarAudiencia"
          class="form-grid"
          style="margin-top: 20px"
        >
          <div class="group-input full">
            <label>Abogado responsable *</label>
            <select
              v-model="formAudiencia.abogado_id"
              class="input-select"
              required
            >
              <option value="" disabled>Selecciona el abogado...</option>
              <option
                v-for="abogado in abogadosDisponibles"
                :key="abogado.id"
                :value="abogado.id"
              >
                {{ abogado.nombre }}
              </option>
            </select>
          </div>

          <div class="grupo-input full mt-2">
            <label>Estatus de la Audiencia *</label>
            <select
              v-model="formAudiencia.estatus"
              class="input-select"
              required
            >
              <option value="Programada">Programada</option>
              <option value="Realizada">Realizada (Finalizada)</option>
              <option value="Diferida">Diferida (Pospuesta)</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          <div class="group-input full">
            <label>Tipo / Título de Audiencia *</label>
            <input
              v-model="formAudiencia.titulo"
              type="text"
              class="input-select"
              placeholder="Ej. Audiencia Inicial, Desahogo de Pruebas..."
              required
            />
          </div>

          <div class="group-input full mt-2">
            <label>Fecha y Hora Exacta *</label>
            <input
              v-model="formAudiencia.fecha_hora"
              type="datetime-local"
              class="input-select"
              required
            />
          </div>

          <div class="group-input full mt-2">
            <label>Sede o Medio de la Audiencia *</label>
            <select
              v-model="formAudiencia.lugar_seleccion"
              class="input-select"
              required
            >
              <option value="" disabled>Seleccione la sede...</option>
              <option value="Ciudad Judicial del Estado (Zapopan)">
                Ciudad Judicial del Estado (Zapopan)
              </option>
              <option value="Juzgados Familiares (Guadalajara)">
                Juzgados Familiares (Guadalajara)
              </option>
              <option value="Centro de Justicia Penal Federal (Puente Grande)">
                Centro de Justicia Penal Federal (Puente Grande)
              </option>
              <option value="Audiencia Virtual (Zoom / Webex / Teams)">
                Audiencia Virtual (Zoom / Webex / Teams)
              </option>
              <option value="Otro">Otro (Especificar)</option>
            </select>
          </div>

          <div
            class="group-input full mt-2"
            v-if="formAudiencia.lugar_seleccion === 'Otro'"
          >
            <label>Especifique el Juzgado o pegue el Link *</label>
            <input
              v-model="formAudiencia.lugar_otro"
              type="text"
              class="input-select"
              placeholder="Ej. Juzgado Mixto de Tlajomulco o Link de Zoom"
              required
            />
          </div>

          <div class="group-input full mt-2" v-if="formAudiencia.id">
            <label>Estatus Actual *</label>
            <select
              v-model="formAudiencia.estatus"
              class="input-select"
              required
            >
              <option value="Programada">Programada</option>
              <option value="Realizada">Realizada (Finalizada)</option>
              <option value="Diferida">Diferida (Pospuesta)</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          <div class="group-input full mt-2">
            <label>Notas de Preparación</label>
            <textarea
              v-model="formAudiencia.notas_preparacion"
              rows="2"
              class="input-select"
              placeholder="Ej. Recordar al cliente llevar recibos originales..."
            ></textarea>
          </div>

          <div
            class="group-input full mt-2"
            v-if="
              formAudiencia.estatus === 'Realizada' ||
              formAudiencia.estatus === 'Diferida'
            "
          >
            <label>Resultado / Resumen de la Audiencia *</label>
            <textarea
              v-model="formAudiencia.resultado"
              rows="3"
              class="input-select"
              placeholder="¿Qué resolvió el juez?..."
              required
            ></textarea>
          </div>

          <footer class="modal-footer full mt-4">
            <button
              type="button"
              @click="cerrarModalAudiencia"
              class="btn-secundario"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn-primario"
              :disabled="guardandoAudiencia"
            >
              {{ guardandoAudiencia ? "Guardando..." : "Guardar Audiencia" }}
            </button>
          </footer>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as formato from "../utils/Formatos.js";

const token = localStorage.getItem("token");

const route = useRoute();
const router = useRouter();

const expediente = ref(null);
const cargando = ref(true);
const pestanaActiva = ref("resumen");

// === LÓGICA DE DOCUMENTOS MULTIPLES (Mantenida intacta) ===
const mostrarModalDoc = ref(false);
const subiendo = ref(false);
const archivosSeleccionados = ref([]);
const listaDocumentos = ref([]);

const tiposDeDocumentos = ref([
  "INE",
  "Comprobante de domicilio",
  "Escrituras",
  "Copias certificadas",
  "Título de propiedad",
  "Certificado parcelario",
  "Testamentos",
  "Actas",
  "Contratos",
  "Pagarés",
  "Expedientes",
  "CLG",
  "Recibos agua y predial",
  "Recibos",
  "Constancia de situación fiscal",
  "Curp",
  "Constancias de estudio",
  "Oficios/Notificaciones",
  "Traslados",
  "Poderes",
  "Otro",
]);

const formDoc = ref({ tipo: "", notas: "" });

const manejarArchivos = (event) => {
  archivosSeleccionados.value = Array.from(event.target.files);
};

const cerrarModalDoc = () => {
  mostrarModalDoc.value = false;
  formDoc.value = { tipo: "", notas: "" };
  archivosSeleccionados.value = [];
};

const cargarDocumentos = async () => {
  try {
    const res = await fetch(
      `http://localhost:3000/api/documentos/expediente/${route.params.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (res.ok) {
      listaDocumentos.value = await res.json();
    }

    console.log("Documentos cargados:", listaDocumentos.value);
  } catch (error) {
    console.error("Error al traer documentos:", error);
  }
};

const subirDocumento = async () => {
  if (archivosSeleccionados.value.length === 0)
    return alert("Por favor selecciona al menos un archivo.");

  subiendo.value = true;
  const formData = new FormData();

  // 1. PRIMERO agregamos los campos de texto para que el backend los lea antes que los archivos
  formData.append("tipo", formDoc.value.tipo);
  formData.append("notas", formDoc.value.notas);
  formData.append("expediente_id", route.params.id);
  formData.append("subido_por", localStorage.getItem("usuario_id") || 1);

  // 2. DESPUÉS agregamos los archivos
  archivosSeleccionados.value.forEach((archivo) => {
    formData.append("archivos", archivo);
  });

  try {
    // Tu URL ya incluye el ID del expediente, lo cual es excelente
    const respuesta = await fetch(
      `http://localhost:3000/api/documentos/expediente/${route.params.id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );

    if (!respuesta.ok)
      throw new Error("Error en el servidor al subir archivos");

    const dataRespuesta = await respuesta.json();

    alert(
      `¡Éxito! ${dataRespuesta.mensaje} (${dataRespuesta.cantidad} archivos)`,
    );

    cerrarModalDoc();
    await cargarDocumentos();
  } catch (error) {
    console.error(error);
    alert("Error al subir los documentos.");
    subiendo.value = false;
  }
};

const borrarDocumento = async (documentoId) => {
  if (!confirm("¿Estás seguro de eliminar este documento?")) return;
  try {
    const respuesta = await fetch(
      `http://localhost:3000/api/documentos/${route.params.id}/${documentoId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!respuesta.ok) throw new Error("Error al eliminar el documento");
    alert("Documento eliminado correctamente.");
    await cargarDocumentos();
  } catch (error) {
    console.error(error);
    alert("Error al eliminar el documento.");
  }
};

// === NUEVA LÓGICA DE PAGOS ===
const mostrarModalPago = ref(false);
const guardandoPago = ref(false);

const mostrarModalDetallePago = ref(false);
const pagoSeleccionado = ref(null);

const verDetallesPago = (pago) => {
  pagoSeleccionado.value = pago;
  mostrarModalDetallePago.value = true;
};

const cerrarModalDetallePago = () => {
  mostrarModalDetallePago.value = false;
  pagoSeleccionado.value = null;
};

const listaPagos = ref([]);
const archivoComprobante = ref(null);

const formPago = ref({
  id: null,
  concepto: "",
  tipo: "Honorarios",
  monto: "",
  fecha_vencimiento: "",
  estatus: "Pendiente",
  metodo_pago: "",
  fecha_pago: "",
  notas: "",
  comprobante_url: null,
});

const manejarComprobante = (event) => {
  archivoComprobante.value = event.target.files[0];
};

// === LÓGICA DE GASTOS DEL EXPEDIENTE ===
const API_GASTOS = `${import.meta.env.VITE_API_URL}/gastos`;
const API_CATALOGOS = `${import.meta.env.VITE_API_URL}/catalogos`;

const listaGastos = ref([]);
const abogadosDisponibles = ref([]);
const mostrarModalGasto = ref(false);
const guardandoGasto = ref(false);

const mostrarModalDetalleGasto = ref(false);
const gastoSeleccionado = ref(null);

const formGasto = ref({
  id: null,
  abogado_id: "",
  concepto: "",
  categoria: "",
  monto: "",
  fecha: new Date().toISOString().split("T")[0],
  estatus: "Pendiente",
  notas: "",
  comprobante_url: null,
});

const tiposGastosDisponibles = [
  "Viáticos",
  "Copias",
  "Aseo",
  "Servicios de oficina",
  "Otros gastos",
];

const conceptosPorTipo = {
  Viáticos: [
    "Gasolina",
    "Estacionamiento",
    "Caseta Peaje",
    "Transporte Público",
    "Uber",
    "Alimentación",
    "Hospedaje",
  ],
  Copias: [
    "Copias",
    "Impresión de documentos",
    "Gestoria de tramites externos",
  ],
  Aseo: [
    "Articulos de limpieza",
    "Pago servicio de limpieza",
    "Desechables",
    "Mantenimiento de áreas comunes",
  ],
  "Servicios de oficina": [
    "Internet y telefonía",
    "Suministros de papelería",
    "Servicio eléctrico",
    "Agua potable",
    "Suscripciones",
  ],
  "Otros gastos": [
    "Honorarios periciales",
    "Traducciones oficiales",
    "Gastos notariales",
    "Costas judiciales",
    "Otros",
  ],
};

const formatoInputDate = (fechaISO) => {
  if (!fechaISO) return "";
  const date = new Date(fechaISO);
  return new Date(date.getTime() + Math.abs(date.getTimezoneOffset() * 60000))
    .toISOString()
    .split("T")[0];
};

const resolverNombreAbogado = (item) => {
  if (!item) return "";
  if (item.nombre) return item.nombre;
  if (item.nombre_completo) return item.nombre_completo;
  if (item.nombre_abogado) return item.nombre_abogado;
  return `${item.nombre || ""} ${item.apellido || ""}`.trim();
};

const normalizarAbogado = (item) => ({
  id: item.id ?? item.abogado_id ?? item.usuario_id,
  nombre: resolverNombreAbogado(item),
});

const normalizarGasto = (gasto = {}) => {
  const abogadoNombre =
    gasto.abogado ||
    gasto.nombre_abogado ||
    gasto.abogado_nombre ||
    gasto.abogado_responsable ||
    "";

  return {
    id: gasto.id ?? gasto.gasto_id,
    abogadoId: gasto.abogado_id ?? null,
    abogado: abogadoNombre,
    tipo: gasto.tipo || gasto.categoria || "Gasto general",
    concepto: gasto.concepto || gasto.descripcion || "",
    expedienteId: gasto.expediente_id ?? gasto.expediente?.id ?? null,
    monto: Number(gasto.monto ?? gasto.total ?? 0) || 0,
    fecha: gasto.fecha || gasto.fecha_gasto || "",
    estatus: gasto.estatus || gasto.estado || "Pendiente",
    notas: gasto.notas || gasto.observaciones || "",
    // ¡AQUÍ ESTÁ LA LÍNEA MÁGICA PARA AWS!
    comprobante_url: gasto.comprobante_url || gasto.comprobanteUrl || null,
  };
};

const parsearRespuesta = async (respuesta) => {
  if (!respuesta.ok) {
    const texto = await respuesta.text();
    throw new Error(texto || "Error en el servidor");
  }
  if (respuesta.status === 204) return null;
  return respuesta.json();
};

const cargarCatalogos = async () => {
  try {
    const respuesta = await fetch(API_CATALOGOS, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await parsearRespuesta(respuesta);
    const abogados = Array.isArray(data?.abogados) ? data.abogados : [];
    abogadosDisponibles.value = abogados
      .map(normalizarAbogado)
      .filter((abogado) => abogado.id && abogado.nombre);
  } catch (error) {
    console.error("Error cargando catalogos de gastos:", error);
  }
};

const cargarGastosPorExpediente = async () => {
  try {
    const respuesta = await fetch(API_GASTOS, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await parsearRespuesta(respuesta);
    listaGastos.value = Array.isArray(data)
      ? data
          .map(normalizarGasto)
          .filter(
            (gasto) => Number(gasto.expedienteId) === Number(route.params.id),
          )
      : [];
    console.log("Gastos cargados para el expediente:", listaGastos.value);
  } catch (error) {
    console.error("Error cargando gastos del expediente:", error);
  }
};

const abrirNuevoGasto = () => {
  formGasto.value = {
    id: null,
    abogado_id: "",
    registrado_por: localStorage.getItem("usuario_id") || 1,
    tipo: "Viáticos",
    concepto: "",
    monto: "",
    fecha: new Date().toISOString().split("T")[0],
    estatus: "Pendiente",
    notas: "",
  };
  archivoComprobante.value = null;
  mostrarModalGasto.value = true;
};

const editarGasto = (gasto) => {
  const abogadoSeleccionado = abogadosDisponibles.value.find(
    (abogado) => abogado.id === gasto.abogadoId,
  );

  formGasto.value = {
    id: gasto.id,
    abogado_id: gasto.abogado_id || abogadoSeleccionado?.id || "",
    tipo: gasto.tipo || "Viáticos",
    concepto: gasto.concepto || "",
    monto: Number(gasto.monto || 0),
    fecha:
      formatoInputDate(gasto.fecha) || new Date().toISOString().split("T")[0],
    estatus: gasto.estatus || "Pendiente",
    notas: gasto.notas || "",
  };

  mostrarModalGasto.value = true;
};

const verDetallesGasto = (gasto) => {
  gastoSeleccionado.value = gasto;
  mostrarModalDetalleGasto.value = true;
};

const cerrarModalDetalleGasto = () => {
  mostrarModalDetalleGasto.value = false;
  gastoSeleccionado.value = null;
};

const cerrarModalGasto = () => {
  mostrarModalGasto.value = false;
};

const eliminarGasto = async (idGasto) => {
  if (!idGasto) return;

  const confirmar = confirm(
    "¿Deseas eliminar este gasto? Esta acción no se puede deshacer.",
  );
  if (!confirmar) return;

  try {
    const respuesta = await fetch(`${API_GASTOS}/expediente/${idGasto}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!respuesta.ok) throw new Error("No se pudo eliminar el gasto");
    alert("Gasto eliminado correctamente.");
    await cargarGastosPorExpediente();
  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar el gasto.");
  }
};

const guardarGasto = async () => {
  if (!formGasto.value.abogado_id) {
    alert("Selecciona un abogado responsable.");
    return;
  }

  guardandoGasto.value = true;

  // 1. Definimos el método HTTP desde el principio para tomar decisiones
  const metodoHTTP = formGasto.value.id ? "PUT" : "POST";

  // 2. Corregimos las URLs para que hagan match exacto con tus rutas del backend
  // POST necesita el ID del expediente. PUT necesita el ID del gasto.
  const url = formGasto.value.id
    ? `${API_GASTOS}/expediente/${formGasto.value.id}`
    : `${API_GASTOS}/expediente/${route.params.id}`;

  // 3. Aplicamos el nombre mágico para el archivo dependiendo de la acción
  const nombreArchivo =
    metodoHTTP === "POST" ? "comprobante_gasto" : "comprobante_url_gasto";

  const formData = new FormData();
  formData.append("id", formGasto.value.id);
  formData.append("abogado_id", formGasto.value.abogado_id);
  formData.append("registrado_por", formGasto.value.registrado_por);
  formData.append("categoria", formGasto.value.tipo);
  formData.append("concepto", formGasto.value.concepto);
  formData.append("monto", Number(formGasto.value.monto) || 0);
  formData.append("fecha_gasto", formGasto.value.fecha);
  formData.append("estatus", formGasto.value.estatus);
  formData.append("notas", formGasto.value.notas);
  formData.append("expediente_id", Number(route.params.id));

  if (formGasto.value.estatus === "Pagado") {
    formData.append("metodo_pago", formGasto.value.metodo_pago);
    if (archivoComprobante.value) {
      // Inyectamos la variable dinámica en lugar del nombre fijo
      formData.append(nombreArchivo, archivoComprobante.value);
    }
  }

  try {
    const respuesta = await fetch(url, {
      method: metodoHTTP,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!respuesta.ok) throw new Error("Error al guardar el gasto");

    alert(
      `Gasto ${metodoHTTP === "POST" ? "registrado" : "actualizado"} correctamente.`,
    );
    cerrarModalGasto();
    await cargarGastosPorExpediente();
  } catch (error) {
    console.error(error);
    alert("No se pudo guardar el gasto.");
  } finally {
    guardandoGasto.value = false;
  }
};

// === AUDIENCIAS ===
const listaAudiencias = ref([]);
const mostrarModalAudiencia = ref(false);
const guardandoAudiencia = ref(false);
const listaAbogados = ref([]);

const formAudiencia = ref({
  id: null,
  expediente_id: "",
  titulo: "",
  fecha_hora: "",
  lugar_seleccion: "",
  lugar_otro: "",
  estatus: "Programada",
  abogado_id: "",
  notas_preparacion: "",
  resultado: "",
});

const cargarAudiencias = async () => {
  try {
    const res = await fetch(
      `http://localhost:3000/api/audiencias/expediente/${route.params.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();
    if (res.ok) listaAudiencias.value = Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error("Error cargando audiencias:", error);
  }
};

const abrirModalAudiencia = () => {
  formAudiencia.value = {
    id: null,
    titulo: "",
    fecha_hora: "",
    lugar_seleccion: "",
    lugar_otro: "",
    estatus: "Programada",
    abogado_id: "",
    notas_preparacion: "",
  };
  mostrarModalAudiencia.value = true;
};

const cerrarModalAudiencia = () => {
  mostrarModalAudiencia.value = false;
};

const abrirNuevaAudiencia = () => {
  formAudiencia.value = {
    titulo: "",
    fecha_hora: "",
    lugar: "",
    estatus: "",
    abogado_id: "",
    notas_preparacion: "",
    resultado: "",
  };
  mostrarModalAudiencia.value = true;
};

const editarAudiencia = (audiencia) => {
  // Verificamos si el lugar guardado está en nuestra lista predefinida
  const opcionesPredefinidas = [
    "Ciudad Judicial del Estado (Zapopan)",
    "Juzgados Familiares (Guadalajara)",
    "Centro de Justicia Penal Federal (Puente Grande)",
    "Audiencia Virtual (Zoom / Webex / Teams)",
  ];
  const esPredefinido = opcionesPredefinidas.includes(audiencia.lugar);
  const listaAbogados = abogadosDisponibles.value.map((abogado) => ({
    id: abogado.id,
    nombre: resolverNombreAbogado(abogado),
  }));

  formAudiencia.value = {
    id: audiencia.id,
    exopediente_id: audiencia.expediente_id,
    titulo: audiencia.titulo,
    fecha_hora: formatoInputDateTime(audiencia.fecha_hora),
    lugar_seleccion: esPredefinido ? audiencia.lugar : "Otro",
    lugar_otro: esPredefinido ? "" : audiencia.lugar,
    estatus: audiencia.estatus,
    abogado_id:
      listaAbogados.find(
        (abogado) => resolverNombreAbogado(abogado) === audiencia.abogado,
      )?.id || "",
    resultado: audiencia.resultado || "",
    notas_preparacion: audiencia.notas_preparacion || "",
  };
  mostrarModalAudiencia.value = true;
};

const guardarAudiencia = async () => {
  guardandoAudiencia.value = true;

  // Resolvemos qué lugar enviar a la BD
  const lugarFinal =
    formAudiencia.value.lugar_seleccion === "Otro"
      ? formAudiencia.value.lugar_otro
      : formAudiencia.value.lugar_seleccion;

  const fechaActual = new Date();
  const fechaMysql = fechaActual.toISOString().slice(0, 19).replace("T", " "); // Formato: YYYY-MM-DD HH:MM:SS

  const payload = {
    expediente_id: Number(route.params.id),
    titulo: formAudiencia.value.titulo,
    fecha_hora: formAudiencia.value.fecha_hora,
    lugar: lugarFinal,
    estatus: formAudiencia.value.estatus,
    abogado_id: Number(formAudiencia.value.abogado_id),
    notas_preparacion: formAudiencia.value.notas_preparacion || null,
    resultado: formAudiencia.value.resultado || null,
    fecha_creacion: fechaMysql, // Este campo previene que tu SQL arroje error de cantidad de datos
  };

  const url = formAudiencia.value.id
    ? `http://localhost:3000/api/audiencias/${formAudiencia.value.id}`
    : `${import.meta.env.VITE_API_URL}/audiencias`;
  const metodo = formAudiencia.value.id ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert(
        `Audiencia ${metodo === "POST" ? "programada" : "actualizada"} correctamente.`,
      );
      cerrarModalAudiencia();
      cargarAudiencias(); // Recargamos la tabla
    } else {
      throw new Error("Fallo en la respuesta del servidor");
    }
  } catch (error) {
    console.error("Error guardando:", error);
    alert("Hubo un error al guardar la audiencia.");
  } finally {
    guardandoAudiencia.value = false;
  }
};

// Calcula los totales del Dashboard Financiero en tiempo real
const resumenFinanciero = computed(() => {
  let pagado = 0;
  let pendiente = 0;

  listaPagos.value.forEach((p) => {
    if (p.estatus === "Pagado") {
      pagado += Number(p.monto);
    } else {
      pendiente += Number(p.monto);
    }
  });

  return { pagado, pendiente };
});

const resumenGastos = computed(() => {
  let total = 0;
  let pendiente = 0;
  let pagado = 0;

  listaGastos.value.forEach((gasto) => {
    total += Number(gasto.monto || 0);

    if (gasto.estatus === "Pagado") {
      pagado += Number(gasto.monto || 0);
    } else {
      pendiente += Number(gasto.monto || 0);
    }
  });

  return { total, pendiente, pagado };
});

const abrirNuevoPago = () => {
  formPago.value = {
    id: null,
    concepto: "",
    tipo: "Honorarios",
    monto: "",
    fecha_vencimiento: "",
    estatus: "Pendiente",
    metodo_pago: "",
    fecha_pago: "",
    notas: "",
  };
  archivoComprobante.value = null;
  mostrarModalPago.value = true;
};

//EDITAR PAGO
const editarPago = (pago) => {
  formPago.value = {
    id: pago.id,
    concepto: pago.concepto,
    tipo: pago.tipo,
    monto: pago.monto,
    fecha_vencimiento: formatoInputDate(pago.fecha_vencimiento),
    estatus: pago.estatus,
    metodo_pago: pago.metodo_pago || "",
    fecha_pago:
      formatoInputDate(pago.fecha_pago) || formatoInputDate(new Date()),
    notas: pago.notas || "",
  };
  archivoComprobante.value = null;
  mostrarModalPago.value = true;
};

// BORRAR PAGO
const borrarPago = async (idPago) => {
  if (
    confirm(
      "¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer y alterará el saldo total.",
    )
  ) {
    try {
      const respuesta = await fetch(
        `http://localhost:3000/api/pagos/${idPago}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!respuesta.ok) throw new Error("Error al eliminar");
      alert("Registro financiero eliminado.");
      await cargarPagos();
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el registro.");
    }
  }
};

const cerrarModalPago = () => {
  mostrarModalPago.value = false;
  archivoComprobante.value = null;
};

const cargarPagos = async () => {
  try {
    const res = await fetch(
      `http://localhost:3000/api/pagos/${route.params.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (res.ok) {
      listaPagos.value = await res.json();
    }
  } catch (error) {
    console.error("Error al traer pagos:", error);
  }
};

const guardarPago = async () => {
  guardandoPago.value = true;

  // Lo determinamos desde el principio para usar la lógica más abajo
  const esActualizacion = !!formPago.value.id;
  const url = esActualizacion
    ? `http://localhost:3000/api/pagos/${formPago.value.id}`
    : `${import.meta.env.VITE_API_URL}/pagos`;
  const metodoHTTP = esActualizacion ? "PUT" : "POST";

  const formData = new FormData();
  formData.append("id", formPago.value.id || "");
  formData.append("concepto", formPago.value.concepto);
  formData.append("tipo_cobro", formPago.value.tipo);
  formData.append("monto", formPago.value.monto);
  formData.append("fecha_vencimiento", formPago.value.fecha_vencimiento);
  formData.append("estatus", formPago.value.estatus);
  formData.append("notas", formPago.value.notas || "");

  // ¡CLAVE! AWS siempre necesita el expediente_id para armar la carpeta, ya sea al crear o actualizar
  formData.append("expediente_id", route.params.id);

  if (!esActualizacion) {
    formData.append("registrado_por", localStorage.getItem("usuario_id") || 1);
  }

  if (formPago.value.estatus === "Pagado") {
    formData.append("metodo_pago", formPago.value.metodo_pago);
    formData.append("fecha_pago", formPago.value.fecha_pago);

    if (archivoComprobante.value) {
      // Inyectamos dinámicamente el nombre correcto que espera nuestro backend
      const nombreCampoArchivo = esActualizacion
        ? "comprobante_url_pago"
        : "comprobante_pago";
      formData.append(nombreCampoArchivo, archivoComprobante.value);
    }
  }

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const respuesta = await fetch(url, {
      method: metodoHTTP,
      body: formData,
      headers: headers,
    });

    if (!respuesta.ok)
      throw new Error("Error en el servidor al registrar el pago");

    // Reemplaza esto con un Toast o Snackbar de Vue en el futuro
    console.log(
      `Cobro ${esActualizacion ? "actualizado" : "creado"} exitosamente.`,
    );

    cerrarModalPago();
    await cargarPagos();
  } catch (error) {
    console.error(error);
    console.log("Error al registrar el cobro."); // Alternativa visual recomendada: Toasts
    guardandoPago.value = false;
  } finally {
    guardandoPago.value = false;
  }
};
const abrirComprobanteSeguro = async (pagoId) => {
  try {
    // 1. Hacemos la petición a nuestra API, ahora SÍ enviando el token de seguridad
    const respuesta = await fetch(
      `http://localhost:3000/api/pagos/${pagoId}/comprobante`,
      {
        method: "GET",
        headers: {
          // Asegúrate de que tu variable 'token' esté disponible en este contexto
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!respuesta.ok) {
      throw new Error("No tienes permisos o el archivo no existe");
    }

    // 2. Extraemos el JSON que nos mandó el backend
    const data = await respuesta.json();

    // 3. Abrimos la URL firmada de Amazon S3 en una pestaña nueva automáticamente
    window.open(data.url, "_blank");
  } catch (error) {
    console.error("Error al intentar abrir el comprobante:", error);
    alert("Hubo un problema al abrir el documento. Verifica la consola.");
  }
};

// === UTILIDADES ===
const formatearFecha = (fechaString) => {
  if (!fechaString) return null;
  const opciones = { year: "numeric", month: "long", day: "numeric" };
  const date = new Date(fechaString);
  return new Date(
    date.getTime() + Math.abs(date.getTimezoneOffset() * 60000),
  ).toLocaleDateString("es-MX", opciones);
};

const formatoMoneda = (monto) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(monto);
};

const formatoInputDateTime = (fechaISO) => {
  if (!fechaISO) return "";
  const date = new Date(fechaISO);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

const formatearFechaHora = (fechaISO) => {
  if (!fechaISO) return "Sin fecha";
  return new Date(fechaISO).toLocaleString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const regresar = () => {
  router.push("/expedientes");
};

onMounted(async () => {
  try {
    const id = route.params.id;
    const respuesta = await fetch(
      `http://localhost:3000/api/expedientes/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!respuesta.ok) throw new Error("No se pudo cargar el expediente");
    expediente.value = await respuesta.json();

    await cargarDocumentos();
    await cargarPagos();
    await cargarCatalogos();
    await cargarGastosPorExpediente();
    await cargarAudiencias();
  } catch (error) {
    console.error(error);
    alert("Error al cargar los datos del expediente.");
    regresar();
  } finally {
    cargando.value = false;
  }
});
</script>

<style scoped>
/* ====================================================
   ESTILOS BASE (Tus clases existentes se mantienen)
   ==================================================== */
.clientes-contenedor {
  padding: 20px;
}
.cabecera-seccion {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.header-text h2 {
  color: var(--primary-dark);
  font-size: 1.8rem;
  margin: 10px 0 5px 0;
}
.subtitulo {
  color: #666;
  margin: 0;
  font-family: monospace;
  font-size: 1rem;
}
.tarjeta-sistema {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
.estado-msg {
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
  color: #666;
}
.btn-regresar {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-weight: 600;
  padding: 0;
  margin-bottom: 5px;
  font-size: 1.2rem;
  transition: color 0.2s;
}
.btn-regresar:hover {
  color: var(--secondary);
}
.btn-primario {
  background-color: var(--secondary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}
.btn-primario:hover {
  background-color: var(--terciary);
}
.btn-primario.mini {
  padding: 8px 15px;
  font-size: 0.85rem;
}
.btn-secundario {
  background-color: white;
  color: var(--primary-dark);
  border: 1px solid #ccc;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

/* Resumen Rápido */
.resumen-rapido {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid var(--secondary);
}
.dato-pill {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 20px;
  border-right: 1px solid #ddd;
}
.dato-pill:last-child {
  border-right: none;
}
.dato-pill .label {
  font-size: 0.75rem;
  color: #777;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.dato-pill .valor {
  font-weight: 600;
  color: var(--primary-dark);
  font-size: 0.95rem;
}

/* Pestañas */
.tabs-nav {
  display: flex;
  border-bottom: 2px solid #eee;
  margin-bottom: 25px;
  gap: 10px;
}
.tab-btn {
  padding: 12px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: #888;
  font-size: 0.95rem;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}
.tab-btn:hover {
  color: var(--terciary);
}
.tab-btn.active {
  color: var(--secondary);
  border-bottom-color: var(--secondary);
}
.tab-content {
  min-height: 250px;
}
.animacion-fade {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Elementos Internos */
.tab-header-accion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed #eee;
  padding-bottom: 15px;
  margin-bottom: 20px;
}
.tab-header-accion h3 {
  margin: 0;
  color: var(--terciary);
  font-size: 1.2rem;
}
.caja-texto-lectura {
  padding: 15px;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 6px;
  color: #444;
  line-height: 1.5;
  font-size: 0.95rem;
}
.caja-texto-lectura.clickeable {
  cursor: pointer;
  color: var(--secondary);
  font-weight: 600;
  transition: background 0.2s;
}
.caja-texto-lectura.clickeable:hover {
  background: #f0f0f0;
}
.vacio {
  text-align: center;
  padding: 40px 20px;
  color: #888;
}
.icon-large {
  font-size: 3rem;
  opacity: 0.5;
  margin-bottom: 10px;
  display: block;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}
.group-input {
  display: flex;
  flex-direction: column;
}
.group-input.full {
  grid-column: 1 / -1;
}

.group-input.two-columns {
  grid-column: span 2;
}

.group-input.tree-columns {
  grid-column: span 3;
}

.group-input label {
  font-weight: 600;
  color: var(--primary-dark);
  font-size: 0.9rem;
  margin-bottom: 8px;
}
.mb-4 {
  margin-bottom: 25px;
}

/* TABLA Y MODAL */
.responsive-table-container {
  overflow-x: auto;
}
.tabla-profesional {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.tabla-profesional th {
  background-color: var(--primary);
  padding: 12px 15px;
  color: var(--primary-dark);
  font-weight: 600;
  border-bottom: 2px solid #ddd;
}
.tabla-profesional td {
  padding: 15px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}
.resaltado {
  font-weight: 600;
  color: var(--primary-dark);
}
.tag-materia,
.tag-asunto {
  display: inline-block;
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 4px;
  margin-bottom: 3px;
  margin-right: 5px;
}
.tag-materia {
  background-color: rgba(97, 45, 83, 0.1);
  color: var(--terciary);
  font-weight: 600;
}
.tag-asunto {
  background-color: #f0f0f0;
  color: #555;
}

/* NUEVO: ESTILOS DE ESTATUS FINANCIEROS (Badges) */
.badge-estatus {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}
.badge-estatus.activo {
  background-color: rgba(133, 57, 83, 0.1);
  color: var(--secondary);
}
.badge-estatus.pagado {
  background-color: #e6f4ea;
  color: #137333;
}
.badge-estatus.pendiente {
  background-color: #fef7e0;
  color: #b06000;
}
.badge-estatus.atrasado {
  background-color: #fce8e6;
  color: #c5221f;
}

.btn-accion {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background 0.2s;
}
.btn-accion:hover {
  background: #f5f5f5;
}

/* NUEVO: DASHBOARD FINANCIERO WIDGETS */
.dashboard-financiero {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}
.widget-finanzas {
  padding: 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  border: 1px solid #eee;
}
.widget-titulo {
  font-size: 0.85rem;
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 5px;
}
.widget-monto {
  font-size: 1.8rem;
  font-weight: 800;
}
.widget-finanzas.pagado {
  background-color: #f0fdf4;
  border-color: #bbf7d0;
}
.widget-finanzas.pagado .widget-titulo {
  color: #166534;
}
.widget-finanzas.pagado .widget-monto {
  color: #15803d;
}

.widget-finanzas.pendiente {
  background-color: #fffbeb;
  border-color: #fef08a;
}
.widget-finanzas.pendiente .widget-titulo {
  color: #854d0e;
}
.widget-finanzas.pendiente .widget-monto {
  color: #a16207;
}

.widget-finanzas.total {
  background-color: rgba(133, 57, 83, 0.05);
  border-color: rgba(133, 57, 83, 0.2);
}
.widget-finanzas.total .widget-titulo {
  color: var(--secondary);
}
.widget-finanzas.total .widget-monto {
  color: var(--primary-dark);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-card {
  background: white;
  width: 100%;
  max-width: 800px;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}
.modal-header h3 {
  margin: 0;
  color: var(--primary-dark);
}
.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
}
.btn-close:hover {
  color: var(--secondary);
}
.input-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-family: inherit;
}
.file-input {
  padding: 7px;
  background: #fafafa;
}
.mt-2 {
  margin-top: 15px;
}
.mt-4 {
  margin-top: 25px;
}
.modal-footer {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.modal-footer.full {
  grid-column: 1 / -1;
}

/* Archivos previsualizados */
.lista-archivos-preview {
  background: rgba(133, 57, 83, 0.05);
  border: 1px dashed var(--secondary);
  border-radius: 6px;
  padding: 10px 15px;
  margin-top: 5px;
}
.preview-titulo {
  margin: 0 0 8px 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--terciary);
}
.lista-archivos-preview ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
.lista-archivos-preview li {
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
