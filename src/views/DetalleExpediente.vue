<template>
  <div class="expediente-detalle-contenedor">
    <div class="cabecera-seccion">
      <div class="header-text">
        <button @click="regresar" class="btn-regresar">
          &larr; Volver a la lista
        </button>
        <h2 v-if="expediente">{{ expediente.titulo }}</h2>
        <h2 v-else>Cargando expediente...</h2>
        <p class="subtitulo" v-if="expediente">
          Juzgado: <strong>{{ expediente.numero_expediente_judicial || "Sin asignar" }}</strong>
        </p>
      </div>
    </div>

    <div v-if="cargando" class="estado-msg">
      <span class="spinner-small"></span> Abriendo carpeta legal...
    </div>

    <!--TODO DATOS DEL EXPEDIENTE -->
    <div v-else-if="expediente" class="tarjeta-sistema">
      <div class="resumen-rapido">
        <div class="dato-pill">
          <span class="label">Estatus</span>
          <span class="badge-estatus activo">Activo</span>
        </div>
        <div class="dato-pill">
          <span class="label">Prioridad</span>
          <span class="valor">🔥 {{ expediente.prioridad || "Media" }}</span>
        </div>
        <div class="dato-pill">
          <span class="label">Apertura</span>
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
          <div class="form-grid-base">
            <div class="group-input full">
              <label>Descripción y Hechos Iniciales</label>
              <div class="caja-texto-lectura">
                {{ expediente.descripcion || "Sin descripción registrada." }}
              </div>
            </div>

            <div class="group-input mt-3">
              <label>👤 Cliente</label>
              <div class="caja-texto-lectura clickeable">
                ID Cliente: #{{ expediente.cliente_id }}
              </div>
              <div class="caja-texto-lectura clickeable mt-2">
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
                    <div class="btn-groupacciones">
                      <a
                        :href="doc.ruta_url"
                        target="_blank"
                        class="btn-accion view"
                        title="Ver Documento"
                        rel="noopener noreferrer"
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
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="vacio">
            <span class="vacio-icon">📂</span>
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
              <div class="widget-info">
                <span class="widget-titulo">Total Cobrado</span>
                <span class="widget-monto">{{ formatoMoneda(resumenFinanciero.pagado) }}</span>
              </div>
            </div>
            <div class="widget-finanzas pendiente">
              <div class="widget-info">
                <span class="widget-titulo">Saldo Pendiente</span>
                <span class="widget-monto">{{ formatoMoneda(resumenFinanciero.pendiente) }}</span>
              </div>
            </div>
            <div class="widget-finanzas total">
              <div class="widget-info">
                <span class="widget-titulo">Valor Total del Caso</span>
                <span class="widget-monto">{{ formatoMoneda(resumenFinanciero.pagado + resumenFinanciero.pendiente) }}</span>
              </div>
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
                  <th>Método</th>
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
                  <td class="resaltado monto-text">{{ formatoMoneda(pago.monto) }}</td>
                  <td>{{ pago.metodo_pago || '-' }}</td>
                  <td>{{ pago.nombre_abogado }}</td>
                  <td>
                    <span :class="['badge-estatus', pago.estatus.toLowerCase()]">
                      {{ pago.estatus }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-groupacciones">
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
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!--? LISTA PAGOS VACIA -->
          <div v-else class="vacio">
            <span class="vacio-icon">💵</span>
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
              <div class="widget-info">
                <span class="widget-titulo">Total Pagado</span>
                <span class="widget-monto">{{ formatoMoneda(resumenGastos.pagado) }}</span>
              </div>
            </div>
            <div class="widget-finanzas pendiente">
              <div class="widget-info">
                <span class="widget-titulo">Pendientes</span>
                <span class="widget-monto">{{ formatoMoneda(resumenGastos.pendiente) }}</span>
              </div>
            </div>
            <div class="widget-finanzas total">
              <div class="widget-info">
                <span class="widget-titulo">Total en Gastos</span>
                <span class="widget-monto">{{ formatoMoneda(resumenGastos.total) }}</span>
              </div>
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
                  <td class="resaltado monto-text">{{ formatoMoneda(gasto.monto) }}</td>
                  <td class="resaltado">
                    👤 {{ gasto.abogado || "Sin abogado" }}
                  </td>
                  <td>
                    <span :class="['badge-estatus', gasto.estatus.toLowerCase()]">
                      {{ gasto.estatus }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-groupacciones">
                      <button
                        @click="verDetallesGasto(gasto)"
                        class="btn-accion view"
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
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="vacio">
            <span class="vacio-icon">🧾</span>
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

          <div v-if="listaAudiencias.length === 0" class="vacio">
            <span class="vacio-icon">⚖️</span>
            <p>No hay audiencias programadas para este expediente.</p>
          </div>

          <div v-else class="responsive-table-container">
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
                <tr v-for="audiencia in listaAudiencias" :key="audiencia.id">
                  <td>
                    <div class="resaltado">{{ audiencia.titulo }}</div>
                  </td>
                  <td>
                    🗓️ {{ formato.formatearFechaHoraCorta(audiencia.fecha_hora) }}
                  </td>
                  <td>📍 {{ audiencia.lugar }}</td>
                  <td>
                    <span :class="['badge-estatus', audiencia.estatus.toLowerCase()]">
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
    </div>

    <!--TODO MODAL DE DOCUMNTOS -->
    <div v-if="mostrarModalDoc" class="modal-overlay">
      <div class="modal-card">
        <header class="modal-header">
          <h3>Subir Archivos al Expediente</h3>
          <button @click="cerrarModalDoc" class="btn-close">&times;</button>
        </header>

        <form @submit.prevent="subirDocumento" class="modal-form">
          <div class="modal-body form-grid">
            <div class="group-input full">
              <label>Clasificación del Documento *</label>
              <select v-model="formDoc.tipo" class="input-select" required>
                <option value="" disabled>Selecciona el tipo...</option>
                <option v-for="tipo in tiposDeDocumentos" :key="tipo" :value="tipo">
                  {{ tipo }}
                </option>
              </select>
            </div>

            <div class="group-input full">
              <label>Seleccionar Archivos (Puedes elegir varios) *</label>
              <input type="file" @change="manejarArchivos" class="input-select file-input" accept=".pdf,.jpg,.jpeg,.png" multiple required />
            </div>

            <div class="group-input full" v-if="archivosSeleccionados.length > 0">
              <div class="lista-archivos-preview">
                <p class="preview-titulo">Archivos listos para subir:</p>
                <ul>
                  <li v-for="(archivo, index) in archivosSeleccionados" :key="index">
                    📄 {{ archivo.name }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="group-input full">
              <label>Notas adicionales (Opcional)</label>
              <textarea v-model="formDoc.notas" rows="2" class="input-select textarea" placeholder="Ej. Anverso y reverso de la identificación..."></textarea>
            </div>
          </div>

          <footer class="modal-footer">
            <button type="button" @click="cerrarModalDoc" class="btn-secundario">Cancelar</button>
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
          <h3>{{ formPago.id ? "Actualizar Cobro / Anticipo" : "Registrar Cobro / Anticipo" }}</h3>
          <button @click="cerrarModalPago" class="btn-close">&times;</button>
        </header>

        <form @submit.prevent="guardarPago" class="modal-form">
          <div class="modal-body form-grid">
            <div class="group-input full">
              <label>Concepto del Cobro *</label>
              <input v-model="formPago.concepto" type="text" class="input-select" placeholder="Ej. Anticipo Inicial, Iguala Mayo..." required />
            </div>

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
              <input v-model="formPago.monto" type="number" step="0.01" class="input-select" placeholder="Ej. 5000.00" required />
            </div>

            <div class="group-input">
              <label>Fecha de Vencimiento *</label>
              <input v-model="formPago.fecha_vencimiento" type="date" class="input-select" required />
            </div>

            <div class="group-input">
              <label>Estatus Actual *</label>
              <select v-model="formPago.estatus" class="input-select" required>
                <option value="Pendiente">Pendiente de Pago</option>
                <option value="Pagado">Liquidado / Pagado</option>
              </select>
            </div>

            <div class="group-input full" v-if="formPago.estatus === 'Pagado'">
              <div class="caja-texto-lectura liquidacion-box">
                <h4 class="liquidacion-title">Detalles de Liquidación</h4>
                <div class="form-grid-inner">
                  <div class="group-input">
                    <label>Método de pago *</label>
                    <select v-model="formPago.metodo_pago" class="input-select" :required="formPago.estatus === 'Pagado'">
                      <option value="" disabled>-- Elige una opción --</option>
                      <option value="Tarjeta">Tarjeta</option>
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia</option>
                    </select>
                  </div>
                  <div class="group-input">
                    <label>Fecha en que se Pagó *</label>
                    <input v-model="formPago.fecha_pago" type="date" class="input-select" :required="formPago.estatus === 'Pagado'" />
                  </div>
                  <div class="group-input full">
                    <label>Subir Comprobante de Pago (Opcional)</label>
                    <input type="file" @change="manejarComprobante" class="input-select file-input" accept=".pdf,.jpg,.jpeg,.png" />
                  </div>
                </div>
              </div>
            </div>

            <div class="group-input full">
              <label>Notas / Detalles (Opcional)</label>
              <textarea v-model="formPago.notas" rows="2" class="input-select textarea" placeholder="Forma de pago acordada, número de cuenta..."></textarea>
            </div>
          </div>

          <footer class="modal-footer">
            <button type="button" @click="cerrarModalPago" class="btn-secundario">Cancelar</button>
            <button type="submit" class="btn-primario" :disabled="guardandoPago">
              {{ guardandoPago ? "Guardando..." : formPago.id ? "Actualizar Cobro" : "Registrar Cobro" }}
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
          <button @click="cerrarModalDetallePago" class="btn-close">&times;</button>
        </header>

        <div v-if="pagoSeleccionado" class="modal-body-content">
          <div class="modal-body form-grid">
            <div class="resumen-rapido full-card">
              <div class="dato-pill">
                <span class="label">Monto Total</span>
                <span class="valor highlight-monto">{{ formatoMoneda(pagoSeleccionado.monto) }}</span>
              </div>
              <div class="dato-pill">
                <span class="label">Estatus</span>
                <span :class="['badge-estatus', pagoSeleccionado.estatus.toLowerCase()]">
                  {{ pagoSeleccionado.estatus }}
                </span>
              </div>
            </div>

            <div class="group-input full">
              <label>Concepto:</label>
              <div class="caja-texto-lectura">{{ pagoSeleccionado.concepto }}</div>
            </div>
            <div class="group-input">
              <label>Tipo:</label>
              <div class="caja-texto-lectura">{{ pagoSeleccionado.tipo }}</div>
            </div>
            <div class="group-input">
              <label>Vencimiento:</label>
              <div class="caja-texto-lectura">{{ formatearFecha(pagoSeleccionado.fecha_vencimiento) }}</div>
            </div>

            <template v-if="pagoSeleccionado.estatus === 'Pagado'">
              <div class="group-input">
                <label>Método:</label>
                <div class="caja-texto-lectura">{{ pagoSeleccionado.metodo_pago || "No especificado" }}</div>
              </div>
              <div class="group-input">
                <label>Fecha de Pago:</label>
                <div class="caja-texto-lectura">{{ formatearFecha(pagoSeleccionado.fecha_pago) }}</div>
              </div>
            </template>

            <div class="group-input full" v-if="pagoSeleccionado.notas">
              <label>Notas:</label>
              <div class="caja-texto-lectura">{{ pagoSeleccionado.notas }}</div>
            </div>

            <div class="group-input full mt-2">
              <button
                v-if="pagoSeleccionado.comprobante_url"
                @click="abrirComprobanteSeguro(pagoSeleccionado.id)"
                class="btn-primario flex-center"
              >
                📄 Ver Comprobante Adjunto (Seguro)
              </button>
              <div v-else class="vacio-border">
                <p>No hay comprobante adjunto a este registro.</p>
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
          <button @click="cerrarModalDetalleGasto" class="btn-close">&times;</button>
        </header>

        <div v-if="gastoSeleccionado" class="modal-body-content">
          <div class="modal-body form-grid">
            <div class="resumen-rapido full-card">
              <div class="dato-pill">
                <span class="label">Monto Total</span>
                <span class="valor highlight-monto">{{ formatoMoneda(gastoSeleccionado.monto) }}</span>
              </div>
              <div class="dato-pill">
                <span class="label">Estatus</span>
                <span :class="['badge-estatus', gastoSeleccionado.estatus ? gastoSeleccionado.estatus.toLowerCase() : '']">
                  {{ gastoSeleccionado.estatus }}
                </span>
              </div>
            </div>

            <div class="group-input full">
              <label>Concepto:</label>
              <div class="caja-texto-lectura">{{ gastoSeleccionado.concepto }}</div>
            </div>
            <div class="group-input">
              <label>Categoría:</label>
              <div class="caja-texto-lectura">{{ gastoSeleccionado.tipo }}</div>
            </div>
            <div class="group-input">
              <label>Fecha del Gasto:</label>
              <div class="caja-texto-lectura">{{ formatearFecha(gastoSeleccionado.fecha) }}</div>
            </div>

            <div class="group-input full" v-if="gastoSeleccionado.notas">
              <label>Notas:</label>
              <div class="caja-texto-lectura">{{ gastoSeleccionado.notas }}</div>
            </div>

            <div class="group-input full mt-2">
              <a
                v-if="gastoSeleccionado.comprobante_url || gastoSeleccionado.comprobanteUrl"
                :href="`${API_URL}/gastos/${gastoSeleccionado.id}/comprobante?token=${token}`"
                target="_blank"
                class="btn-primario flex-center text-no-underline"
              >
                📄 Ver Comprobante Adjunto (Seguro)
              </a>
              <div v-else class="vacio-border">
                <p>No hay comprobante adjunto a este registro.</p>
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
          <h3>{{ formGasto.id ? "Editar Gasto" : "Registrar Gasto" }}</h3>
          <button @click="cerrarModalGasto" class="btn-close">&times;</button>
        </header>

        <form @submit.prevent="guardarGasto" class="modal-form">
          <div class="modal-body form-grid">
            <div class="group-input full">
              <label>Abogado responsable *</label>
              <select v-model="formGasto.abogado_id" class="input-select" required>
                <option value="" disabled>Selecciona el abogado...</option>
                <option v-for="abogado in abogadosDisponibles" :key="abogado.id" :value="abogado.id">
                  {{ abogado.nombre }}
                </option>
              </select>
            </div>

            <div class="group-input">
              <label>Categoría *</label>
              <select v-model="formGasto.tipo" class="input-select" required>
                <option value="" disabled>Selecciona el tipo...</option>
                <option v-for="tipo in tiposGastosDisponibles" :key="tipo" :value="tipo">
                  {{ tipo }}
                </option>
              </select>
            </div>

            <div class="group-input">
              <label>Concepto *</label>
              <select v-model="formGasto.concepto" class="input-select" required>
                <option value="" disabled>Selecciona el concepto...</option>
                <option v-for="concepto in conceptosPorTipo[formGasto.tipo] || []" :key="concepto" :value="concepto">
                  {{ concepto }}
                </option>
              </select>
            </div>

            <div class="group-input">
              <label>Monto (MXN) *</label>
              <input v-model="formGasto.monto" type="number" step="0.01" min="0" class="input-select" placeholder="Ej. 1500.00" required />
            </div>
            <div class="group-input">
              <label>Fecha *</label>
              <input v-model="formGasto.fecha" type="date" class="input-select" required />
            </div>
            <div class="group-input">
              <label>Estatus *</label>
              <select v-model="formGasto.estatus" class="input-select" required>
                <option value="Pendiente">Pendiente</option>
                <option value="Pagado">Pagado</option>
              </select>
            </div>

            <div class="group-input full" v-if="formGasto.estatus === 'Pagado'">
              <div class="caja-texto-lectura liquidacion-box">
                <h4 class="liquidacion-title">Detalles de Liquidación</h4>
                <div class="form-grid-inner">
                  <div class="group-input">
                    <label>Método de pago *</label>
                    <select v-model="formGasto.metodo_pago" class="input-select" :required="formGasto.estatus === 'Pagado'">
                      <option value="" disabled>-- Elige una opción --</option>
                      <option value="Tarjeta">Tarjeta</option>
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia</option>
                    </select>
                  </div>
                  <div class="group-input two-columns">
                    <label>Subir Comprobante de Gasto (Opcional)</label>
                    <input type="file" @change="manejarComprobante" class="input-select file-input" accept=".pdf,.jpg,.jpeg,.png" />
                  </div>
                </div>
              </div>
            </div>

            <div class="group-input full">
              <label>Notas / observaciones</label>
              <textarea v-model="formGasto.notas" rows="3" class="input-select textarea" placeholder="Detalle adicional del gasto..."></textarea>
            </div>
          </div>

          <footer class="modal-footer">
            <button type="button" @click="cerrarModalGasto" class="btn-secundario">Cancelar</button>
            <button type="submit" class="btn-primario" :disabled="guardandoGasto">
              {{ guardandoGasto ? "Guardando..." : formGasto.id ? "Actualizar Gasto" : "Registrar Gasto" }}
            </button>
          </footer>
        </form>
      </div>
    </div>

    <!--TODO MODAL DE AUDIENCIAS -->
    <div v-if="mostrarModalAudiencia" class="modal-overlay">
      <div class="modal-card">
        <header class="modal-header">
          <h3>{{ formAudiencia.id ? "Editar Audiencia" : "Registrar Audiencia" }}</h3>
          <button @click="cerrarModalAudiencia" class="btn-close">&times;</button>
        </header>

        <form @submit.prevent="guardarAudiencia" class="modal-form">
          <div class="modal-body form-grid">
            <div class="group-input full">
              <label>Abogado responsable *</label>
              <select v-model="formAudiencia.abogado_id" class="input-select" required>
                <option value="" disabled>Selecciona el abogado...</option>
                <option v-for="abogado in abogadosDisponibles" :key="abogado.id" :value="abogado.id">
                  {{ abogado.nombre }}
                </option>
              </select>
            </div>

            <div class="group-input full">
              <label>Estatus de la Audiencia *</label>
              <select v-model="formAudiencia.estatus" class="input-select" required>
                <option value="Programada">Programada</option>
                <option value="Realizada">Realizada (Finalizada)</option>
                <option value="Diferida">Diferida (Pospuesta)</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>

            <div class="group-input full">
              <label>Tipo / Título de Audiencia *</label>
              <input v-model="formAudiencia.titulo" type="text" class="input-select" placeholder="Ej. Audiencia Inicial, Desahogo de Pruebas..." required />
            </div>

            <div class="group-input full">
              <label>Fecha y Hora Exacta *</label>
              <input v-model="formAudiencia.fecha_hora" type="datetime-local" class="input-select" required />
            </div>

            <div class="group-input full">
              <label>Sede o Medio de la Audiencia *</label>
              <select v-model="formAudiencia.lugar_seleccion" class="input-select" required>
                <option value="" disabled>Seleccione la sede...</option>
                <option value="Ciudad Judicial del Estado (Zapopan)">Ciudad Judicial del Estado (Zapopan)</option>
                <option value="Juzgados Familiares (Guadalajara)">Juzgados Familiares (Guadalajara)</option>
                <option value="Centro de Justicia Penal Federal (Puente Grande)">Centro de Justicia Penal Federal (Puente Grande)</option>
                <option value="Audiencia Virtual (Zoom / Webex / Teams)">Audiencia Virtual (Zoom / Webex / Teams)</option>
                <option value="Otro">Otro (Especificar)</option>
              </select>
            </div>

            <div class="group-input full" v-if="formAudiencia.lugar_seleccion === 'Otro'">
              <label>Especifique el Juzgado o pegue el Link *</label>
              <input v-model="formAudiencia.lugar_otro" type="text" class="input-select" placeholder="Ej. Juzgado Mixto de Tlajomulco o Link de Zoom" required />
            </div>

            <div class="group-input full">
              <label>Notas de Preparación</label>
              <textarea v-model="formAudiencia.notas_preparacion" rows="2" class="input-select textarea" placeholder="Ej. Recordar al cliente llevar recibos originales..."></textarea>
            </div>

            <div class="group-input full" v-if="formAudiencia.estatus === 'Realizada' || formAudiencia.estatus === 'Diferida'">
              <label>Resultado / Resumen de la Audiencia *</label>
              <textarea v-model="formAudiencia.resultado" rows="3" class="input-select textarea" placeholder="¿Qué resolvió el juez?..." required></textarea>
            </div>
          </div>

          <footer class="modal-footer">
            <button type="button" @click="cerrarModalAudiencia" class="btn-secundario">Cancelar</button>
            <button type="submit" class="btn-primario" :disabled="guardandoAudiencia">
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
import { API_URL } from "../services/api.js";

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
  "INE", "Comprobante de domicilio", "Escrituras", "Copias certificadas", 
  "Título de propiedad", "Certificado parcelario", "Testamentos", "Actas", 
  "Contratos", "Pagarés", "Expedientes", "CLG", "Recibos agua y predial", 
  "Recibos", "Constancia de situación fiscal", "Curp", "Constancias de estudio", 
  "Oficios/Notificaciones", "Traslados", "Poderes", "Otro",
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
    const res = await fetch(`${API_URL}/documentos/expediente/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      listaDocumentos.value = await res.json();
    }
  } catch (error) {
    console.error("Error al traer documentos:", error);
  }
};

const subirDocumento = async () => {
  if (archivosSeleccionados.value.length === 0)
    return alert("Por favor selecciona al menos un archivo.");

  subiendo.value = true;
  const formData = new FormData();

  formData.append("tipo", formDoc.value.tipo);
  formData.append("notas", formDoc.value.notas);
  formData.append("expediente_id", route.params.id);

  archivosSeleccionados.value.forEach((archivo) => {
    formData.append("archivos", archivo);
  });

  try {
    const respuesta = await fetch(`${API_URL}/documentos/expediente/${route.params.id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!respuesta.ok) throw new Error("Error en el servidor al subir archivos");
    const dataRespuesta = await respuesta.json();
    alert(`¡Éxito! ${dataRespuesta.mensaje} (${dataRespuesta.cantidad} archivos)`);
    cerrarModalDoc();
    await cargarDocumentos();
  } catch (error) {
    console.error(error);
    alert("Error al subir los documentos.");
  } finally {
    subiendo.value = false;
  }
};

const borrarDocumento = async (documentoId) => {
  if (!confirm("¿Estás seguro de eliminar este documento?")) return;
  try {
    const respuesta = await fetch(`${API_URL}/documentos/${route.params.id}/${documentoId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
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
  id: null, concepto: "", tipo: "Honorarios", monto: "", fecha_vencimiento: "",
  estatus: "Pendiente", metodo_pago: "", fecha_pago: "", notas: "", comprobante_url: null,
});

const manejarComprobante = (event) => {
  archivoComprobante.value = event.target.files[0];
};

// === LÓGICA DE GASTOS DEL EXPEDIENTE ===
const API_GASTOS = `${API_URL}/gastos`;
const API_CATALOGOS = `${API_URL}/catalogos`;
const listaGastos = ref([]);
const abogadosDisponibles = ref([]);
const mostrarModalGasto = ref(false);
const guardandoGasto = ref(false);
const mostrarModalDetalleGasto = ref(false);
const gastoSeleccionado = ref(null);

const formGasto = ref({
  id: null, abogado_id: "", concepto: "", categoria: "", monto: "",
  fecha: new Date().toISOString().split("T")[0], estatus: "Pendiente", notas: "", comprobante_url: null,
});

const tiposGastosDisponibles = ["Viáticos", "Copias", "Aseo", "Servicios de oficina", "Otros gastos"];
const conceptosPorTipo = {
  Viáticos: ["Gasolina", "Estacionamiento", "Caseta Peaje", "Transporte Público", "Uber", "Alimentación", "Hospedaje"],
  Copias: ["Copias", "Impresión de documentos", "Gestoria de tramites externos"],
  Aseo: ["Articulos de limpieza", "Pago servicio de limpieza", "Desechables", "Mantenimiento de áreas comunes"],
  "Servicios de oficina": ["Internet y telefonía", "Suministros de papelería", "Servicio eléctrico", "Agua potable", "Suscripciones"],
  "Otros gastos": ["Honorarios periciales", "Traducciones oficiales", "Gastos notariales", "Costas judiciales", "Otros"],
};

const formatoInputDate = (fechaISO) => {
  if (!fechaISO) return "";
  const date = new Date(fechaISO);
  return new Date(date.getTime() + Math.abs(date.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
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
  const abogadoNombre = gasto.abogado || gasto.nombre_abogado || gasto.abogado_nombre || gasto.abogado_responsable || "";
  return {
    id: gasto.id ?? gasto.gasto_id, abogadoId: gasto.abogado_id ?? null, abogado: abogadoNombre,
    tipo: gasto.tipo || gasto.categoria || "Gasto general", concepto: gasto.concepto || gasto.descripcion || "",
    expedienteId: gasto.expediente_id ?? gasto.expediente?.id ?? null, monto: Number(gasto.monto ?? gasto.total ?? 0) || 0,
    fecha: gasto.fecha || gasto.fecha_gasto || "", estatus: gasto.estatus || gasto.estado || "Pendiente",
    notas: gasto.notas || gasto.observaciones || "", comprobante_url: gasto.comprobante_url || gasto.comprobanteUrl || null,
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
    const respuesta = await fetch(API_CATALOGOS, { headers: { Authorization: `Bearer ${token}` } });
    const data = await parsearRespuesta(respuesta);
    const abogados = Array.isArray(data?.abogados) ? data.abogados : [];
    abogadosDisponibles.value = abogados.map(normalizarAbogado).filter((a) => a.id && a.nombre);
  } catch (error) { console.error("Error cargando catalogos:", error); }
};

const cargarGastosPorExpediente = async () => {
  try {
    const respuesta = await fetch(API_GASTOS, { headers: { Authorization: `Bearer ${token}` } });
    const data = await parsearRespuesta(respuesta);
    listaGastos.value = Array.isArray(data) ? data.map(normalizarGasto).filter((g) => Number(g.expedienteId) === Number(route.params.id)) : [];
  } catch (error) { console.error("Error cargando gastos:", error); }
};

const abrirNuevoGasto = () => {
  formGasto.value = {
    id: null, abogado_id: "", registrado_por: localStorage.getItem("usuario_id") || 1, tipo: "Viáticos",
    concepto: "", monto: "", fecha: new Date().toISOString().split("T")[0], estatus: "Pendiente", notas: "",
  };
  archivoComprobante.value = null;
  mostrarModalGasto.value = true;
};

const editarGasto = (gasto) => {
  const abogadoSeleccionado = abogadosDisponibles.value.find((a) => a.id === gasto.abogadoId);
  formGasto.value = {
    id: gasto.id, abogado_id: gasto.abogado_id || abogadoSeleccionado?.id || "", tipo: gasto.tipo || "Viáticos",
    concepto: gasto.concepto || "", monto: Number(gasto.monto || 0),
    fecha: formatoInputDate(gasto.fecha) || new Date().toISOString().split("T")[0],
    estatus: gasto.estatus || "Pendiente", notas: gasto.notas || "",
  };
  mostrarModalGasto.value = true;
};

const verDetallesGasto = (gasto) => { gastoSeleccionado.value = gasto; mostrarModalDetalleGasto.value = true; };
const cerrarModalDetalleGasto = () => { mostrarModalDetalleGasto.value = false; gastoSeleccionado.value = null; };
const cerrarModalGasto = () => { mostrarModalGasto.value = false; };

const eliminarGasto = async (idGasto) => {
  if (!idGasto) return;
  if (!confirm("¿Deseas eliminar este gasto? Esta acción no se puede deshacer.")) return;
  try {
    const respuesta = await fetch(`${API_GASTOS}/expediente/${idGasto}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` },
    });
    if (!respuesta.ok) throw new Error("No se pudo eliminar el gasto");
    alert("Gasto eliminado correctamente.");
    await cargarGastosPorExpediente();
  } catch (error) { alert("No se pudo eliminar el gasto."); }
};

const guardarGasto = async () => {
  if (!formGasto.value.abogado_id) return alert("Selecciona un abogado responsable.");
  guardandoGasto.value = true;
  const metodoHTTP = formGasto.value.id ? "PUT" : "POST";
  const url = formGasto.value.id ? `${API_GASTOS}/expediente/${formGasto.value.id}` : `${API_GASTOS}/expediente/${route.params.id}`;
  const nombreArchivo = metodoHTTP === "POST" ? "comprobante_gasto" : "comprobante_url_gasto";

  const formData = new FormData();
  formData.append("id", formGasto.value.id); formData.append("abogado_id", formGasto.value.abogado_id);
  formData.append("registrado_por", formGasto.value.registrado_por); formData.append("categoria", formGasto.value.tipo);
  formData.append("concepto", formGasto.value.concepto); formData.append("monto", Number(formGasto.value.monto) || 0);
  formData.append("fecha_gasto", formGasto.value.fecha); formData.append("estatus", formGasto.value.estatus);
  formData.append("notas", formGasto.value.notas); formData.append("expediente_id", Number(route.params.id));

  if (formGasto.value.estatus === "Pagado") {
    formData.append("metodo_pago", formGasto.value.metodo_pago);
    if (archivoComprobante.value) formData.append(nombreArchivo, archivoComprobante.value);
  }

  try {
    const respuesta = await fetch(url, { method: metodoHTTP, headers: { Authorization: `Bearer ${token}` }, body: formData });
    if (!respuesta.ok) throw new Error("Error al guardar el gasto");
    alert(`Gasto ${metodoHTTP === "POST" ? "registrado" : "actualizado"} correctamente.`);
    cerrarModalGasto(); await cargarGastosPorExpediente();
  } catch (error) { alert("No se pudo guardar el gasto."); } finally { guardandoGasto.value = false; }
};

// === AUDIENCIAS ===
const listaAudiencias = ref([]);
const mostrarModalAudiencia = ref(false);
const guardandoAudiencia = ref(false);
const formAudiencia = ref({
  id: null, expediente_id: "", titulo: "", fecha_hora: "", lugar_seleccion: "",
  lugar_otro: "", estatus: "Programada", abogado_id: "", notas_preparacion: "", resultado: "",
});

const cargarAudiencias = async () => {
  try {
    const res = await fetch(`${API_URL}/audiencias/expediente/${route.params.id}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) listaAudiencias.value = Array.isArray(data) ? data : [data];
  } catch (error) { console.error("Error cargando audiencias:", error); }
};

const abrirNuevaAudiencia = () => {
  formAudiencia.value = { titulo: "", fecha_hora: "", lugar: "", estatus: "Programada", abogado_id: "", notas_preparacion: "", resultado: "", lugar_seleccion: "", lugar_otro: "" };
  mostrarModalAudiencia.value = true;
};
const cerrarModalAudiencia = () => { mostrarModalAudiencia.value = false; };

const editarAudiencia = (audiencia) => {
  const opciones = ["Ciudad Judicial del Estado (Zapopan)", "Juzgados Familiares (Guadalajara)", "Centro de Justicia Penal Federal (Puente Grande)", "Audiencia Virtual (Zoom / Webex / Teams)"];
  const esPredefinido = opciones.includes(audiencia.lugar);
  const listaAbogados = abogadosDisponibles.value.map((a) => ({ id: a.id, nombre: resolverNombreAbogado(a) }));
  formAudiencia.value = {
    id: audiencia.id, expediente_id: audiencia.expediente_id, titulo: audiencia.titulo, fecha_hora: formatoInputDateTime(audiencia.fecha_hora),
    lugar_seleccion: esPredefinido ? audiencia.lugar : "Otro", lugar_otro: esPredefinido ? "" : audiencia.lugar, estatus: audiencia.estatus,
    abogado_id: listaAbogados.find((a) => resolverNombreAbogado(a) === audiencia.abogado)?.id || "",
    resultado: audiencia.resultado || "", notas_preparacion: audiencia.notas_preparacion || "",
  };
  mostrarModalAudiencia.value = true;
};

const guardarAudiencia = async () => {
  guardandoAudiencia.value = true;
  const lugarFinal = formAudiencia.value.lugar_seleccion === "Otro" ? formAudiencia.value.lugar_otro : formAudiencia.value.lugar_seleccion;
  const fechaMysql = new Date().toISOString().slice(0, 19).replace("T", " ");

  const payload = {
    expediente_id: Number(route.params.id), titulo: formAudiencia.value.titulo, fecha_hora: formAudiencia.value.fecha_hora,
    lugar: lugarFinal, estatus: formAudiencia.value.estatus, abogado_id: Number(formAudiencia.value.abogado_id),
    notas_preparacion: formAudiencia.value.notas_preparacion || null, resultado: formAudiencia.value.resultado || null, fecha_creacion: fechaMysql, 
  };
  const url = formAudiencia.value.id ? `${API_URL}/audiencias/${formAudiencia.value.id}` : `${API_URL}/audiencias`;
  const metodo = formAudiencia.value.id ? "PUT" : "POST";
  try {
    const res = await fetch(url, { method: metodo, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
    if (res.ok) { alert(`Audiencia ${metodo === "POST" ? "programada" : "actualizada"} correctamente.`); cerrarModalAudiencia(); cargarAudiencias(); }
    else throw new Error("Fallo en la respuesta del servidor");
  } catch (error) { alert("Hubo un error al guardar la audiencia."); } finally { guardandoAudiencia.value = false; }
};

const resumenFinanciero = computed(() => {
  let pagado = 0; let pendiente = 0;
  listaPagos.value.forEach((p) => { if (p.estatus === "Pagado") { pagado += Number(p.monto); } else { pendiente += Number(p.monto); } });
  return { pagado, pendiente };
});

const resumenGastos = computed(() => {
  let total = 0; let pendiente = 0; let pagado = 0;
  listaGastos.value.forEach((g) => {
    total += Number(g.monto || 0);
    if (g.estatus === "Pagado") { pagado += Number(g.monto || 0); } else { pendiente += Number(g.monto || 0); }
  });
  return { total, pendiente, pagado };
});

const abrirNuevoPago = () => {
  formPago.value = { id: null, concepto: "", tipo: "Honorarios", monto: "", fecha_vencimiento: "", estatus: "Pendiente", metodo_pago: "", fecha_pago: "", notas: "", };
  archivoComprobante.value = null; mostrarModalPago.value = true;
};
const editarPago = (pago) => {
  formPago.value = { id: pago.id, concepto: pago.concepto, tipo: pago.tipo, monto: pago.monto, fecha_vencimiento: formatoInputDate(pago.fecha_vencimiento), estatus: pago.estatus, metodo_pago: pago.metodo_pago || "", fecha_pago: formatoInputDate(pago.fecha_pago) || formatoInputDate(new Date()), notas: pago.notas || "", };
  archivoComprobante.value = null; mostrarModalPago.value = true;
};
const borrarPago = async (idPago) => {
  if (confirm("¿Estás seguro de eliminar este registro?")) {
    try {
      const respuesta = await fetch(`${API_URL}/pagos/${idPago}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!respuesta.ok) throw new Error("Error al eliminar");
      alert("Registro financiero eliminado."); await cargarPagos();
    } catch (error) { alert("No se pudo eliminar el registro."); }
  }
};
const cerrarModalPago = () => { mostrarModalPago.value = false; archivoComprobante.value = null; };

const cargarPagos = async () => {
  try {
    const res = await fetch(`${API_URL}/pagos/${route.params.id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) listaPagos.value = await res.json();
  } catch (error) { console.error("Error al traer pagos:", error); }
};

const guardarPago = async () => {
  guardandoPago.value = true;
  const esActualizacion = !!formPago.value.id;
  const url = esActualizacion ? `${API_URL}/pagos/${formPago.value.id}` : `${API_URL}/pagos`;
  const metodoHTTP = esActualizacion ? "PUT" : "POST";

  const formData = new FormData();
  formData.append("id", formPago.value.id || ""); formData.append("concepto", formPago.value.concepto);
  formData.append("tipo_cobro", formPago.value.tipo); formData.append("monto", formPago.value.monto);
  formData.append("fecha_vencimiento", formPago.value.fecha_vencimiento); formData.append("estatus", formPago.value.estatus);
  formData.append("notas", formPago.value.notas || ""); formData.append("expediente_id", route.params.id);
  if (!esActualizacion) formData.append("registrado_por", localStorage.getItem("usuario_id") || 1);
  if (formPago.value.estatus === "Pagado") {
    formData.append("metodo_pago", formPago.value.metodo_pago); formData.append("fecha_pago", formPago.value.fecha_pago);
    if (archivoComprobante.value) formData.append(esActualizacion ? "comprobante_url_pago" : "comprobante_pago", archivoComprobante.value);
  }

  try {
    const respuesta = await fetch(url, { method: metodoHTTP, body: formData, headers: { Authorization: `Bearer ${token}` } });
    if (!respuesta.ok) throw new Error("Error al registrar el pago");
    cerrarModalPago(); await cargarPagos();
  } catch (error) { console.error(error); } finally { guardandoPago.value = false; }
};

const abrirComprobanteSeguro = async (pagoId) => {
  try {
    const respuesta = await fetch(`${API_URL}/pagos/${pagoId}/comprobante`, { method: "GET", headers: { Authorization: `Bearer ${token}` } });
    if (!respuesta.ok) throw new Error("No tienes permisos o el archivo no existe");
    const data = await respuesta.json(); window.open(data.url, "_blank");
  } catch (error) { alert("Hubo un problema al abrir el documento."); }
};

// === UTILIDADES ===
const formatearFecha = (fechaString) => {
  if (!fechaString) return null;
  const date = new Date(fechaString);
  return new Date(date.getTime() + Math.abs(date.getTimezoneOffset() * 60000)).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
};
const formatoMoneda = (monto) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(monto) || 0);
const formatoInputDateTime = (fechaISO) => {
  if (!fechaISO) return ""; const date = new Date(fechaISO);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const regresar = () => router.push("/expedientes");

onMounted(async () => {
  try {
    const respuesta = await fetch(`${API_URL}/expedientes/${route.params.id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!respuesta.ok) throw new Error("No se pudo cargar el expediente");
    expediente.value = await respuesta.json();
    await cargarDocumentos(); await cargarPagos(); await cargarCatalogos(); await cargarGastosPorExpediente(); await cargarAudiencias();
  } catch (error) { alert("Error al cargar los datos del expediente."); regresar(); } finally { cargando.value = false; }
});
</script>

<style scoped>
/* ====================================================
   ESTILOS DETALLES EXPEDIENTE (Color Hunt Estricto)
   ==================================================== */
.expediente-detalle-contenedor {
  width: 100%; padding: 20px 30px; background-color: #F3F4F4; min-height: 100vh; box-sizing: border-box; animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.cabecera-seccion { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; }
.btn-regresar {
  background: none; border: none; color: #612D53; cursor: pointer; font-weight: 700; padding: 0; margin-bottom: 8px;
  font-size: 1rem; transition: color 0.2s; display: flex; align-items: center; gap: 5px;
}
.btn-regresar:hover { color: #853953; text-decoration: underline; }
.header-text h2 { color: #2C2C2C; font-size: 2rem; font-weight: 800; margin: 5px 0; letter-spacing: -0.5px; }
.subtitulo { color: #612D53; margin: 0; font-size: 1rem; }

.tarjeta-sistema {
  background: #ffffff; border-radius: 16px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(44, 44, 44, 0.03), 0 10px 15px -3px rgba(44, 44, 44, 0.04); border: 1px solid rgba(133, 57, 83, 0.1);
}
.estado-msg { text-align: center; padding: 50px; font-size: 1.2rem; color: #612D53; font-weight: 500; }

.resumen-rapido { display: flex; gap: 20px; margin-bottom: 30px; padding: 20px; background: #F3F4F4; border-radius: 12px; border-left: 5px solid #853953; }
.resumen-rapido.full-card { background: #ffffff; border: 1px solid rgba(133, 57, 83, 0.1); box-shadow: 0 2px 8px rgba(44, 44, 44, 0.03); margin-bottom: 20px; grid-column: 1 / -1; }
.dato-pill { display: flex; flex-direction: column; gap: 6px; padding-right: 25px; border-right: 1px solid rgba(44, 44, 44, 0.1); }
.dato-pill:last-child { border-right: none; }
.dato-pill .label { font-size: 0.8rem; color: #612D53; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
.dato-pill .valor { font-weight: 800; color: #2C2C2C; font-size: 1rem; }
.highlight-monto { font-size: 1.4rem !important; color: #853953 !important; }

.tabs-nav { display: flex; border-bottom: 2px solid rgba(133, 57, 83, 0.1); margin-bottom: 25px; gap: 10px; flex-wrap: wrap; }
.tab-btn { padding: 12px 20px; background: none; border: none; cursor: pointer; font-weight: 600; color: #2C2C2C; opacity: 0.6; font-size: 0.95rem; border-bottom: 3px solid transparent; transition: all 0.3s ease; }
.tab-btn:hover { opacity: 1; color: #612D53; }
.tab-btn.active { color: #853953; opacity: 1; border-bottom-color: #853953; }
.tab-content { min-height: 250px; }
.animacion-fade { animation: fadeIn 0.3s ease-in-out; }

.tab-header-accion { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(133, 57, 83, 0.2); padding-bottom: 15px; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
.tab-header-accion h3 { margin: 0; color: #2C2C2C; font-size: 1.3rem; font-weight: 800; }
.caja-texto-lectura { padding: 16px; background: #F3F4F4; border: 1px solid rgba(133, 57, 83, 0.1); border-radius: 10px; color: #2C2C2C; line-height: 1.6; font-size: 0.95rem; }
.caja-texto-lectura.clickeable { cursor: pointer; color: #612D53; font-weight: 600; transition: background 0.2s, color 0.2s; }
.caja-texto-lectura.clickeable:hover { background: #ffffff; color: #853953; border-color: #853953; }

.dashboard-financiero { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 15px; }
.widget-finanzas { background: #ffffff; padding: 20px; border-radius: 12px; display: flex; align-items: center; box-shadow: 0 4px 6px -1px rgba(44, 44, 44, 0.03); border: 1px solid rgba(133, 57, 83, 0.1); position: relative; overflow: hidden; }
.widget-finanzas::before { content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 5px; opacity: 0.8; }
.widget-finanzas.pagado::before { background-color: #10b981; }
.widget-finanzas.pendiente::before { background-color: #f59e0b; }
.widget-finanzas.total::before { background-color: #3b82f6; }
.widget-info { display: flex; flex-direction: column; }
.widget-titulo { font-size: 0.8rem; text-transform: uppercase; font-weight: 700; color: #612D53; margin-bottom: 4px; }
.widget-monto { font-size: 1.5rem; font-weight: 800; color: #2C2C2C; }

.btn-primario { background: #853953; color: #ffffff; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.3s ease; }
.btn-primario:hover { background: #612D53; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(133, 57, 83, 0.3); }
.btn-primario.mini { padding: 8px 16px; font-size: 0.9rem; border-radius: 8px; }
.btn-secundario { background: #F3F4F4; color: #2C2C2C; border: 1px solid rgba(133, 57, 83, 0.2); padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-secundario:hover { background: #ffffff; border-color: #853953; }

.badge-estatus { padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; }
.badge-estatus.activo { background-color: #e0e7ff; color: #4338ca; }
.badge-estatus.pagado { background-color: #d1fae5; color: #047857; }
.badge-estatus.pendiente { background-color: #fef3c7; color: #b45309; }
.badge-estatus.atrasado { background-color: #fee2e2; color: #b91c1c; }

.responsive-table-container { overflow-x: auto; }
.tabla-profesional { width: 100%; border-collapse: collapse; text-align: left; }
.tabla-profesional th { background: #F3F4F4; color: #612D53; padding: 14px 18px; font-size: 0.85rem; text-transform: uppercase; font-weight: 700; border-bottom: 2px solid rgba(133, 57, 83, 0.15); }
.tabla-profesional td { padding: 14px 18px; border-bottom: 1px solid rgba(44, 44, 44, 0.05); vertical-align: middle; color: #2C2C2C; }
.resaltado { font-weight: 700; color: #2C2C2C; }
.monto-text { color: #853953; font-size: 1.05rem; }
.tag-materia, .tag-asunto { display: inline-block; font-size: 0.75rem; padding: 4px 10px; border-radius: 20px; font-weight: 600; margin-bottom: 4px; }
.tag-materia { background-color: rgba(97, 45, 83, 0.1); color: #612D53; }
.tag-asunto { background-color: rgba(133, 57, 83, 0.08); color: #853953; }

.btn-groupacciones { display: flex; gap: 8px; justify-content: center; }
.btn-accion { border: none; background: #F3F4F4; border: 1px solid rgba(133, 57, 83, 0.2); padding: 8px; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; text-decoration: none; color: inherit; }
.btn-accion:hover { background: #ffffff; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(44, 44, 44, 0.08); border-color: #853953; }

/* Formularios Normales (No Modales) */
.form-grid-base { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.form-grid-inner { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; padding-top: 15px; }

/* MODALES CON ESTRUCTURA FIXED (NUEVO) */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(44, 44, 44, 0.5);
  display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(4px); animation: fadeIn 0.2s ease-out;
}
.modal-card {
  background: #ffffff; width: 95%; max-width: 800px; border-radius: 16px; 
  box-shadow: 0 25px 50px -12px rgba(44, 44, 44, 0.3); animation: modalSlideUp 0.3s ease-out;
  /* El secreto para el scrolling perfecto */
  display: flex; flex-direction: column; max-height: 90vh; overflow: hidden;
}
@keyframes modalSlideUp { from { opacity: 0; transform: translateY(30px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

.modal-header {
  padding: 24px 30px; background: linear-gradient(135deg, #853953 0%, #612D53 100%); color: #ffffff;
  display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;
}
.modal-header h3 { margin: 0; font-size: 1.3rem; font-weight: 700; color: #ffffff; }
.btn-close { background: none; border: none; font-size: 2rem; cursor: pointer; line-height: 1; color: #ffffff; opacity: 0.8; transition: opacity 0.2s; }
.btn-close:hover { opacity: 1; }

.modal-form, .modal-body-content {
  display: flex; flex-direction: column; overflow: hidden; height: 100%;
}

.modal-body {
  flex-grow: 1; overflow-y: auto; padding: 25px 30px;
}
/* Scrollbar estético para el modal */
.modal-body::-webkit-scrollbar { width: 8px; }
.modal-body::-webkit-scrollbar-track { background: #F3F4F4; border-radius: 4px; }
.modal-body::-webkit-scrollbar-thumb { background: #d1d1d1; border-radius: 4px; }
.modal-body::-webkit-scrollbar-thumb:hover { background: #853953; }

.modal-footer {
  flex-shrink: 0; padding: 20px 30px; background: #F3F4F4; border-top: 1px solid rgba(133, 57, 83, 0.1);
  display: flex; justify-content: flex-end; gap: 15px;
}

/* Grillas dentro de los modales */
.form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.group-input { display: flex; flex-direction: column; }
.group-input.full { grid-column: 1 / -1; }
.group-input.two-columns { grid-column: span 2; }
.group-input label { font-weight: 700; color: #2C2C2C; font-size: 0.9rem; margin-bottom: 8px; }

.input-select {
  width: 100%; padding: 12px 16px; border: 1.5px solid rgba(133, 57, 83, 0.2); border-radius: 10px;
  background-color: #ffffff; color: #2C2C2C; font-size: 0.95rem; box-sizing: border-box; transition: all 0.3s ease;
}
.input-select:focus { outline: none; border-color: #853953; box-shadow: 0 0 0 4px rgba(133, 57, 83, 0.1); }
.file-input { padding: 10px; background: #F3F4F4; }
.textarea { resize: vertical; min-height: 80px; }

/* Detalles extra */
.liquidacion-box { border-left: 4px solid #10b981; background-color: #f0fdf4; padding: 20px; border-radius: 10px; }
.liquidacion-title { margin: 0; color: #047857; font-size: 0.95rem; font-weight: 700; text-transform: uppercase; }
.vacio { text-align: center; padding: 60px 20px; color: #612D53; }
.vacio-icon { font-size: 3.5rem; display: block; margin-bottom: 15px; opacity: 0.6; }
.vacio-border { padding: 15px; border: 1.5px dashed rgba(133, 57, 83, 0.3); border-radius: 10px; text-align: center; color: #612D53; }
.flex-center { display: flex; justify-content: center; align-items: center; }
.text-no-underline { text-decoration: none; }
.mt-2 { margin-top: 15px; } .mt-3 { margin-top: 20px; } .mb-4 { margin-bottom: 25px; }

/* Archivos previsualizados */
.lista-archivos-preview { background: rgba(133, 57, 83, 0.05); border: 1.5px dashed #853953; border-radius: 10px; padding: 15px; margin-top: 5px; }
.preview-titulo { margin: 0 0 10px 0; font-size: 0.9rem; font-weight: 700; color: #612D53; }
.lista-archivos-preview ul { margin: 0; padding: 0; list-style: none; }
.lista-archivos-preview li { font-size: 0.9rem; color: #2C2C2C; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }

@media (max-width: 900px) {
  .form-grid, .form-grid-base, .form-grid-inner { grid-template-columns: 1fr; }
  .group-input.two-columns { grid-column: 1 / -1; }
  .resumen-rapido { flex-direction: column; gap: 15px; border-right: none; }
  .dato-pill { border-right: none; border-bottom: 1px solid rgba(44, 44, 44, 0.1); padding-bottom: 10px; }
}
</style>