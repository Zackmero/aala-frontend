<template>
  <div class="clientes-contenedor">
    <div class="cabecera-seccion">
      <div class="header-text">
        <h2>Pagos y Finanzas</h2>
        <p class="subtitulo">
          Monitorea los movimientos financieros de tu despacho, filtra por estatus y tipo, y accede a los detalles de cada pago.
        </p>
      </div>
    </div>

    <!-- DASHBOARD FINANCIERO -->
    <div class="dashboard-financiero mb-4">
      <div class="widget-finanzas pagado">
        <div class="widget-icon">💰</div>
        <div class="widget-info">
          <span class="widget-titulo">Cobrado (Este Mes)</span>
          <span class="widget-monto">{{ formatoMoneda(metricasGlobales.totalPagado) }}</span>
        </div>
      </div>
      <div class="widget-finanzas pendiente">
        <div class="widget-icon">⏳</div>
        <div class="widget-info">
          <span class="widget-titulo">Por Cobrar (Saldos)</span>
          <span class="widget-monto">{{ formatoMoneda(metricasGlobales.totalPendiente) }}</span>
        </div>
      </div>
      <div class="widget-finanzas total">
        <div class="widget-icon">⚠️</div>
        <div class="widget-info">
          <span class="widget-titulo">Cartera Vencida</span>
          <span class="widget-monto atrasado-text">{{ formatoMoneda(metricasGlobales.totalAtrasado) }}</span>
        </div>
      </div>
    </div>

    <!-- TOOLBAR (BUSCADOR Y FILTROS) -->
    <div class="toolbar-tabla">
      <div class="buscador-wrapper">
        <span class="search-icon">🔍</span>
        <input
          v-model="filtroBusqueda"
          type="text"
          placeholder="Buscar por cliente, expediente o concepto..."
          class="input-buscador"
        />
      </div>

      <div class="filtros-rapidos">
        <select v-model="filtroEstatus" class="input-select mini">
          <option value="">Todos los Estatus</option>
          <option value="Pagado">Liquidados</option>
          <option value="Pendiente">Pendientes</option>
          <option value="Atrasado">Atrasados</option>
        </select>
        <select v-model="filtroTipo" class="input-select mini">
          <option value="">Todos los Tipos</option>
          <option value="Honorarios">Honorarios</option>
          <option value="Iguala Mensual">Igualas Mensuales</option>
          <option value="Gastos Generales">Gastos / Costas</option>
        </select>
      </div>
    </div>

    <!-- TABLA DE PAGOS -->
    <div class="tarjeta-sistema">
      <div v-if="cargando" class="estado-msg">
        <span class="spinner-small"></span> Consultando libros contables legales...
      </div>

      <div v-else-if="errorMensaje" class="estado-msg error">
        <span class="vacio-icon">⚠️</span>
        <p>{{ errorMensaje }}</p>
      </div>

      <div v-else class="responsive-table-container">
        <table class="tabla-profesional">
          <thead>
            <tr>
              <th>Cliente / Expediente</th>
              <th>Concepto / Tipo</th>
              <th>Vencimiento</th>
              <th>Monto</th>
              <th>Estatus</th>
              <th>Abogado Responsable</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pagosFiltrados.length === 0">
              <td colspan="7" class="vacio">
                <span class="vacio-icon">📭</span>
                <p>No se encontraron registros financieros con los filtros seleccionados.</p>
              </td>
            </tr>

            <tr v-for="pago in pagosPaginados" :key="pago.id">
              <td>
                <div class="resaltado">
                  <span class="contacto-icon">👤</span> {{ pago.nombre_cliente || "Sin cliente" }}
                </div>
                <div class="expediente-num">
                  Expediente: <strong>{{ pago.numero_expediente }}</strong>
                </div>
              </td>
              <td>
                <div class="resaltado">{{ pago.concepto }}</div>
                <span class="tag-asunto">{{ pago.tipo }}</span>
              </td>
              <td class="col-fecha">
                <span class="contacto-icon">📅</span> {{ formatearFecha(pago.fecha_vencimiento) }}
              </td>
              <td class="resaltado monto-text">
                {{ formatoMoneda(pago.monto) }}
              </td>
              <td>
                <span :class="['badge-estatus', obtenerClaseEstatus(pago)]">
                  {{ obtenerTextoEstatus(pago) }}
                </span>
              </td>
              <td class="col-abogado">
                {{ pago.nombre_abogado || "No asignado" }}
              </td>
              <td>
                <div class="btn-groupacciones">
                  <button
                    @click="verDetallesPago(pago)"
                    class="btn-accion view"
                    title="Ver toda la información del pago"
                  >
                    👁️
                  </button>
                  <button
                    @click="irAlExpediente(pago.expediente_id)"
                    class="btn-accion folder"
                    title="Ir a la carpeta del caso"
                  >
                    📂
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- PAGINACIÓN -->
        <div class="paginacion-footer" v-if="pagosFiltrados.length > 0">
          <div class="paginacion-info">
            Mostrando <strong>{{ inicioPaginacion }}</strong> a <strong>{{ finPaginacion }}</strong> de
            <strong>{{ pagosFiltrados.length }}</strong>
          </div>
          <div class="paginacion-controles">
            <button
              @click="paginaActual--"
              :disabled="paginaActual === 1"
              class="btn-page"
            >
              Anterior
            </button>
            <span class="page-current"
              >{{ paginaActual }} / {{ totalPaginas }}</span
            >
            <button
              @click="paginaActual++"
              :disabled="paginaActual === totalPaginas"
              class="btn-page"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DETALLES DEL PAGO -->
    <div v-if="mostrarModalDetallePago" class="modal-overlay">
      <div class="modal-card">
        <header class="modal-header header-detail">
          <h3>Detalle del Movimiento</h3>
          <button @click="cerrarModalDetallePago" class="btn-close">
            &times;
          </button>
        </header>

        <div v-if="pagoSeleccionado" class="modal-body">
          <div class="resumen-rapido">
            <div class="dato-pill">
              <span class="label">Monto Total</span>
              <span class="valor monto-destacado">{{ formatoMoneda(pagoSeleccionado.monto) }}</span>
            </div>
            <div class="dato-pill">
              <span class="label">Estatus</span>
              <span :class="['badge-estatus', obtenerClaseEstatus(pagoSeleccionado)]">
                {{ obtenerTextoEstatus(pagoSeleccionado) }}
              </span>
            </div>
          </div>

          <div class="detail-grid">
            <div class="detail-item full">
              <strong>Cliente y Expediente:</strong>
              <div class="caja-texto-lectura">
                <span class="resaltado">{{ pagoSeleccionado.nombre_cliente }}</span><br />
                Expediente: {{ pagoSeleccionado.numero_expediente }}
              </div>
            </div>

            <div class="detail-item full">
              <strong>Concepto:</strong>
              <div class="caja-texto-lectura">{{ pagoSeleccionado.concepto }}</div>
            </div>

            <div class="detail-item">
              <strong>Tipo:</strong>
              <div class="caja-texto-lectura">{{ pagoSeleccionado.tipo }}</div>
            </div>

            <div class="detail-item">
              <strong>Vencimiento:</strong>
              <div class="caja-texto-lectura">
                {{ formatearFecha(pagoSeleccionado.fecha_vencimiento) }}
              </div>
            </div>

            <template v-if="pagoSeleccionado.estatus === 'Pagado'">
              <div class="detail-item">
                <strong>Método de Pago:</strong>
                <div class="caja-texto-lectura">
                  {{ pagoSeleccionado.metodo_pago || "No especificado" }}
                </div>
              </div>
              <div class="detail-item">
                <strong>Fecha de Pago Real:</strong>
                <div class="caja-texto-lectura">
                  {{ formatearFecha(pagoSeleccionado.fecha_pago) || "N/A" }}
                </div>
              </div>
            </template>

            <div class="detail-item full" v-if="pagoSeleccionado.notas">
              <strong>Notas Adicionales:</strong>
              <div class="caja-texto-lectura">{{ pagoSeleccionado.notas }}</div>
            </div>
          </div>

          <footer class="modal-footer full">
            <!-- Botón actualizado para usar la lógica segura a través del backend AWS -->
            <button
              v-if="pagoSeleccionado.comprobante_url"
              @click="abrirComprobanteSeguro(pagoSeleccionado.id)"
              class="btn-primario full-width-btn"
            >
              📄 Ver Comprobante Adjunto (Seguro)
            </button>
            <div v-else class="vacio-comprobante">
              <p>No hay comprobante adjunto a este registro.</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
// Eliminamos assetUrl ya que ahora usamos la ruta segura a través del backend
import { API_URL } from "../services/api.js";
import { formatearFecha, formatoMoneda, aFechaLocal } from "../utils/Formatos.js";
import { notificar } from "../composables/useNotificaciones";
const token = localStorage.getItem("token");

const router = useRouter();
const cargando = ref(true);
const errorMensaje = ref("");

// Filtros reactivos
const filtroBusqueda = ref("");
const filtroEstatus = ref("");
const filtroTipo = ref("");

// Lista maestra y paginación
const listaGlobalPagos = ref([]);
const paginaActual = ref(1);
const elementosPorPagina = ref(8);

// Lógica del Modal
const mostrarModalDetallePago = ref(false);
const pagoSeleccionado = ref(null);

watch([filtroBusqueda, filtroEstatus, filtroTipo], () => {
  paginaActual.value = 1;
});

const irAlExpediente = (id) => {
  router.push(`/expedientes/${id}`);
};

const verDetallesPago = (pago) => {
  pagoSeleccionado.value = pago;
  mostrarModalDetallePago.value = true;
};

const normalizarPagos = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.pagos)) return payload.pagos;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const cerrarModalDetallePago = () => {
  mostrarModalDetallePago.value = false;
  pagoSeleccionado.value = null;
};

// CÁLCULO DE ESTATUS
// Compara SOLO fechas, en horario local. Antes usaba toISOString(), que
// convierte a UTC: en México (UTC-6) un cobro que vence hoy se marcaba como
// atrasado desde las 6 de la tarde. Es el dato que dispara la cobranza.
const soloFecha = (valor) => {
  const d = valor instanceof Date ? valor : aFechaLocal(valor);
  if (!d || Number.isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

const obtenerTextoEstatus = (pago) => {
  if (pago.estatus === "Pagado") return "Pagado";
  if (!pago.fecha_vencimiento) return "Pendiente";

  const hoy = soloFecha(new Date());
  const vencimiento = soloFecha(pago.fecha_vencimiento);
  if (vencimiento === null) return "Pendiente";

  return pago.estatus === "Pendiente" && vencimiento < hoy
    ? "Atrasado"
    : "Pendiente";
};

const obtenerClaseEstatus = (pago) => {
  return obtenerTextoEstatus(pago).toLowerCase();
};

// FILTRADO
const pagosFiltrados = computed(() => {
  return listaGlobalPagos.value.filter((pago) => {
    const busqueda = filtroBusqueda.value.toLowerCase();
    const textoEstatus = obtenerTextoEstatus(pago);

    const cumpleBusqueda =
      !busqueda ||
      (pago.concepto && pago.concepto.toLowerCase().includes(busqueda)) ||
      (pago.nombre_cliente &&
        pago.nombre_cliente.toLowerCase().includes(busqueda)) ||
      (pago.numero_expediente &&
        pago.numero_expediente.toLowerCase().includes(busqueda));

    const cumpleEstatus =
      !filtroEstatus.value || textoEstatus === filtroEstatus.value;
    const cumpleTipo = !filtroTipo.value || pago.tipo === filtroTipo.value;

    return cumpleBusqueda && cumpleEstatus && cumpleTipo;
  });
});

// TOTALES DE DASHBOARD FINANCIERO
const metricasGlobales = computed(() => {
  let totalPagado = 0;
  let totalPendiente = 0;
  let totalAtrasado = 0;

  listaGlobalPagos.value.forEach((p) => {
    const est = obtenerTextoEstatus(p);
    const montoNum = Number(p.monto) || 0;

    if (p.estatus === "Pagado") {
      totalPagado += montoNum;
    } else if (est === "Atrasado") {
      totalAtrasado += montoNum;
    } else {
      totalPendiente += montoNum;
    }
  });

  return { totalPagado, totalPendiente, totalAtrasado };
});

// PAGINACIÓN
const totalPaginas = computed(
  () => Math.ceil(pagosFiltrados.value.length / elementosPorPagina.value) || 1,
);

const pagosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * elementosPorPagina.value;
  return pagosFiltrados.value.slice(inicio, inicio + elementosPorPagina.value);
});

const inicioPaginacion = computed(() =>
  pagosFiltrados.value.length === 0
    ? 0
    : (paginaActual.value - 1) * elementosPorPagina.value + 1,
);

const finPaginacion = computed(() => {
  const fin = paginaActual.value * elementosPorPagina.value;
  return fin > pagosFiltrados.value.length ? pagosFiltrados.value.length : fin;
});

// CARGA DE DATOS DE LA API
const cargarTodosLosPagos = async () => {
  cargando.value = true;
  errorMensaje.value = "";

  try {
    if (!token) {
      throw new Error(
        "No hay sesión activa. Inicia sesión para ver los pagos.",
      );
    }

    const respuesta = await fetch(`${API_URL}/pagos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const payload = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      throw new Error(payload?.mensaje || "Error en el servidor");
    }

    listaGlobalPagos.value = normalizarPagos(payload);
  } catch (error) {
    errorMensaje.value = error.message;
    console.error("Error cargando el tablero financiero:", error);
    listaGlobalPagos.value = [];
  } finally {
    cargando.value = false;
  }
};

// Función para abrir el comprobante usando el backend como puente seguro hacia AWS
const abrirComprobanteSeguro = async (pagoId) => {
  const ventana = window.open("", "_blank");
  try {
    const respuesta = await fetch(`${API_URL}/pagos/${pagoId}/comprobante`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!respuesta.ok) {
      throw new Error("No tienes permisos o el archivo no existe");
    }

    const data = await respuesta.json();
    if (!data.url) throw new Error("El servidor no devolvió el enlace del comprobante");

    // La pestaña se abre en el mismo clic del usuario; si se abriera después
    // del await, el bloqueador de ventanas emergentes la cancelaría.
    if (ventana) {
      ventana.location.href = data.url;
    } else {
      window.open(data.url, "_blank");
    }
  } catch (error) {
    if (ventana) ventana.close();
    console.error("Error al intentar abrir el comprobante:", error);
    notificar.error("No se pudo abrir el comprobante", error.message);
  }
};

onMounted(() => {
  cargarTodosLosPagos();
});

// Los formatos viven en utils/Formatos.js y se importan arriba.
// La versión local de formatoMoneda no protegía contra null y mostraba "$NaN".
</script>

<style scoped>
/* ====================================================
   ESTILOS DE PAGOS (Paleta estricta Color Hunt)
   ==================================================== */
.clientes-contenedor {
  width: 100%;
  padding: 20px 30px;
  animation: fadeIn 0.4s ease-out;
  background-color: #F3F4F4;
  min-height: 100vh;
  box-sizing: border-box;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Cabecera */
.cabecera-seccion {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
}

.header-text h2 {
  margin: 0 0 8px 0;
  color: #2C2C2C;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.subtitulo {
  color: #612D53;
  margin: 0;
  font-size: 1rem;
  opacity: 0.85;
}

/* DASHBOARD FINANCIERO (WIDGETS) */
.dashboard-financiero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.widget-finanzas {
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 6px -1px rgba(44, 44, 44, 0.03), 0 10px 15px -3px rgba(44, 44, 44, 0.04);
  border: 1px solid rgba(133, 57, 83, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.widget-finanzas::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 5px;
  opacity: 0.8;
}

.widget-finanzas.pagado::before { background-color: #10b981; }
.widget-finanzas.pendiente::before { background-color: #f59e0b; }
.widget-finanzas.total::before { background-color: #ef4444; }

.widget-finanzas:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -5px rgba(44, 44, 44, 0.08);
}

.widget-icon {
  width: 55px;
  height: 55px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  background: #F3F4F4;
  color: #2C2C2C;
}

.widget-info {
  display: flex;
  flex-direction: column;
}

.widget-titulo {
  font-size: 0.85rem;
  text-transform: uppercase;
  font-weight: 700;
  color: #612D53;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.widget-monto {
  font-size: 1.8rem;
  font-weight: 800;
  color: #2C2C2C;
  letter-spacing: -0.5px;
}

/* Solo pintamos el texto de rojo semántico si está atrasado, el resto respeta la paleta */
.atrasado-text {
  color: #dc2626;
}

/* BUSCADOR Y FILTROS */
.toolbar-tabla {
  margin-bottom: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.buscador-wrapper {
  position: relative;
  flex-grow: 1;
  max-width: 450px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #612D53;
  font-size: 1.1rem;
}

.input-buscador {
  width: 100%;
  padding: 14px 16px 14px 45px;
  border: 1.5px solid rgba(133, 57, 83, 0.2);
  border-radius: 12px;
  font-size: 1rem;
  background-color: #ffffff;
  color: #2C2C2C;
  box-shadow: 0 2px 6px rgba(44, 44, 44, 0.02);
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-buscador:focus {
  outline: none;
  border-color: #853953;
  box-shadow: 0 0 0 4px rgba(133, 57, 83, 0.1);
}

.filtros-rapidos {
  display: flex;
  gap: 12px;
}

.input-select.mini {
  padding: 12px 16px;
  border: 1.5px solid rgba(133, 57, 83, 0.2);
  border-radius: 10px;
  background-color: #ffffff;
  color: #2C2C2C;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
}

.input-select.mini:focus {
  border-color: #853953;
  box-shadow: 0 0 0 4px rgba(133, 57, 83, 0.1);
}

/* TARJETA Y TABLA */
.tarjeta-sistema {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(44, 44, 44, 0.03), 0 10px 15px -3px rgba(44, 44, 44, 0.04);
  border: 1px solid rgba(133, 57, 83, 0.1);
  overflow: hidden;
}

.estado-msg {
  padding: 50px;
  text-align: center;
  color: #612D53;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
}

.estado-msg.error {
  color: #dc2626;
}

.responsive-table-container {
  overflow-x: auto;
}

.tabla-profesional {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.tabla-profesional th {
  background: #F3F4F4;
  color: #612D53;
  padding: 16px 20px;
  font-size: 0.85rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
  border-bottom: 2px solid rgba(133, 57, 83, 0.15);
}

.tabla-profesional td {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(44, 44, 44, 0.05);
  vertical-align: middle;
  color: #2C2C2C;
  transition: background-color 0.2s ease;
}

.tabla-profesional tbody tr:hover td {
  background-color: rgba(243, 244, 244, 0.6);
}

/* Celdas de la tabla */
.resaltado {
  font-weight: 700;
  color: #2C2C2C;
  font-size: 1rem;
}

.monto-text {
  font-size: 1.1rem !important;
  color: #853953; /* Acento en el dinero */
}

.expediente-num {
  font-size: 0.85rem;
  color: #612D53;
  margin-top: 4px;
}

.col-fecha {
  font-size: 0.95rem;
  color: #2C2C2C;
}

.col-abogado {
  font-size: 0.95rem;
  color: #2C2C2C;
  opacity: 0.9;
}

.tag-asunto {
  display: inline-block;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 20px;
  background-color: rgba(133, 57, 83, 0.08);
  color: #853953;
  margin-top: 6px;
  font-weight: 600;
}

.contacto-icon {
  margin-right: 4px;
  opacity: 0.7;
}

/* SEMÁNTICA SOLO PARA BADGES DE ESTATUS */
.badge-estatus {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.badge-estatus.pagado { background-color: #d1fae5; color: #047857; }
.badge-estatus.pendiente { background-color: #fef3c7; color: #b45309; }
.badge-estatus.atrasado { background-color: #fee2e2; color: #b91c1c; }


/* BOTONES TABLA */
.btn-groupacciones {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-accion {
  border: none;
  background: #F3F4F4;
  border: 1px solid rgba(133, 57, 83, 0.2);
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-accion:hover {
  background: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(44, 44, 44, 0.08);
  border-color: #853953;
}


/* PAGINACIÓN */
.paginacion-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #F3F4F4;
  border-top: 1px solid rgba(133, 57, 83, 0.1);
}

.paginacion-info {
  font-size: 0.9rem;
  color: #2C2C2C;
}

.paginacion-controles {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-page {
  padding: 8px 16px;
  border: 1px solid rgba(133, 57, 83, 0.2);
  background: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #2C2C2C;
  transition: all 0.2s ease;
}

.btn-page:not(:disabled):hover {
  background: #853953;
  color: #ffffff;
  border-color: #853953;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #F3F4F4;
}

.page-current {
  font-weight: 700;
  color: #2C2C2C;
}

/* MODALES */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(44, 44, 44, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

.modal-card {
  background: #ffffff;
  width: 95%;
  max-width: 600px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(44, 44, 44, 0.3);
  animation: modalSlideUp 0.3s ease-out;
}

@keyframes modalSlideUp {
  from { opacity: 0; transform: translateY(30px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  padding: 24px;
  background: linear-gradient(135deg, #853953 0%, #612D53 100%);
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffffff;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
  color: #ffffff;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.btn-close:hover { opacity: 1; }

.modal-body {
  padding: 0;
}

/* Resumen rápido dentro del modal */
.resumen-rapido {
  display: flex;
  gap: 30px;
  padding: 24px 30px;
  background: #F3F4F4;
  border-bottom: 1px solid rgba(133, 57, 83, 0.1);
}

.dato-pill {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dato-pill .label {
  font-size: 0.8rem;
  color: #612D53;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.monto-destacado {
  font-weight: 800;
  color: #2C2C2C;
  font-size: 1.5rem;
}

/* Grid del Formulario en Modal */
.detail-grid {
  padding: 30px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.detail-item.full { grid-column: span 2; }

.detail-item strong {
  display: block;
  font-size: 0.85rem;
  color: #2C2C2C;
  margin-bottom: 8px;
  font-weight: 700;
}

.caja-texto-lectura {
  padding: 14px 16px;
  background: #F3F4F4;
  border: 1px solid rgba(133, 57, 83, 0.1);
  border-radius: 10px;
  color: #2C2C2C;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* Footer Modal */
.modal-footer {
  padding: 24px 30px;
  background: #ffffff;
  border-top: 1px solid rgba(133, 57, 83, 0.1);
}

.btn-primario {
  background: #853953;
  color: #ffffff;
  border: none;
  padding: 14px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
}

.btn-primario:hover {
  background: #612D53;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(133, 57, 83, 0.3);
}

.full-width-btn { width: 100%; box-sizing: border-box; }

.vacio-comprobante {
  padding: 20px;
  border: 1.5px dashed rgba(133, 57, 83, 0.3);
  border-radius: 10px;
  text-align: center;
  background: #F3F4F4;
}

.vacio-comprobante p {
  margin: 0;
  font-size: 0.9rem;
  color: #612D53;
  font-weight: 600;
}

/* Estados Vacíos Generales */
.vacio {
  text-align: center;
  padding: 60px 20px;
  color: #612D53;
}
.vacio-icon {
  font-size: 3.5rem;
  display: block;
  margin-bottom: 15px;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .clientes-contenedor { padding: 15px; }
  .toolbar-tabla { flex-direction: column; align-items: stretch; }
  .buscador-wrapper { max-width: 100%; }
  .filtros-rapidos { flex-direction: column; }
  .detail-grid { grid-template-columns: 1fr; padding: 20px; }
  .detail-item.full { grid-column: span 1; }
  .resumen-rapido { flex-direction: column; gap: 15px; }
}
</style>