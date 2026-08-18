<template>
  <div class="clientes-contenedor">
    <div class="cabecera-seccion">
      <div class="header-text">
        <h2>Pagos</h2>
        <p class="subtitulo">
          Monitorea los movimientos financieros de tu despacho, filtra por estatus y tipo, y accede a los detalles de cada pago.
        </p>
      </div>
    </div>

    <div class="dashboard-financiero mb-4">
      <div class="widget-finanzas pagado">
        <span class="widget-titulo">Cobrado (Este Mes)</span>
        <span class="widget-monto">{{
          formatoMoneda(metricasGlobales.totalPagado)
        }}</span>
      </div>
      <div class="widget-finanzas pendiente">
        <span class="widget-titulo">Por Cobrar (Saldos)</span>
        <span class="widget-monto">{{
          formatoMoneda(metricasGlobales.totalPendiente)
        }}</span>
      </div>
      <div class="widget-finanzas total">
        <span class="widget-titulo">Cartera Vencida</span>
        <span class="widget-monto" style="color: #c5221f">{{
          formatoMoneda(metricasGlobales.totalAtrasado)
        }}</span>
      </div>
    </div>

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

    <div class="tarjeta-sistema">
      <div v-if="cargando" class="estado-msg">
        <span class="spinner">⏳</span> Consultando libros contables legales...
      </div>

      <div v-else-if="errorMensaje" class="estado-msg">
        <span class="spinner">⚠️</span> {{ errorMensaje }}
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
                No se encontraron registros financieros con los filtros
                seleccionados.
              </td>
            </tr>

            <tr v-for="pago in pagosPaginados" :key="pago.id">
              <td>
                <div class="resaltado">
                  👤 {{ pago.nombre_cliente || "Sin cliente" }}
                </div>
                <div class="expediente-num">
                  💼 Expediente: {{ pago.numero_expediente }}
                </div>
              </td>
              <td>
                <div class="resaltado">{{ pago.concepto }}</div>
                <span class="tag-asunto">{{ pago.tipo }}</span>
              </td>
              <td>{{ formatearFecha(pago.fecha_vencimiento) }}</td>
              <td class="resaltado" style="font-size: 1rem">
                {{ formatoMoneda(pago.monto) }}
              </td>
              <td>
                <span :class="['badge-estatus', obtenerClaseEstatus(pago)]">
                  {{ obtenerTextoEstatus(pago) }}
                </span>
              </td>
              <td class="resaltado" style="font-size: 1rem">
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
                    class="btn-accion view"
                    title="Ir a la carpeta del caso"
                  >
                    📂
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="paginacion-footer" v-if="pagosFiltrados.length > 0">
          <div class="paginacion-info">
            Mostrando {{ inicioPaginacion }} a {{ finPaginacion }} de
            {{ pagosFiltrados.length }}
          </div>
          <div class="paginacion-controles">
            <button
              @click="paginaActual--"
              :disabled="paginaActual === 1"
              class="btn-paginacion"
            >
              Anterior
            </button>
            <span class="paginacion-texto"
              >{{ paginaActual }} / {{ totalPaginas }}</span
            >
            <button
              @click="paginaActual++"
              :disabled="paginaActual === totalPaginas"
              class="btn-paginacion"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>

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
                  obtenerClaseEstatus(pagoSeleccionado),
                ]"
              >
                {{ obtenerTextoEstatus(pagoSeleccionado) }}
              </span>
            </div>
          </div>

          <div class="form-grid">
            <div class="grupo-input full">
              <label>Cliente y Expediente:</label>
              <div class="caja-texto-lectura">
                <strong>{{ pagoSeleccionado.nombre_cliente }}</strong
                ><br />
                Expediente: {{ pagoSeleccionado.numero_expediente }}
              </div>
            </div>

            <div class="grupo-input full">
              <label>Concepto:</label>
              <div class="caja-texto-lectura">
                {{ pagoSeleccionado.concepto }}
              </div>
            </div>

            <div class="grupo-input">
              <label>Tipo:</label>
              <div class="caja-texto-lectura">{{ pagoSeleccionado.tipo }}</div>
            </div>

            <div class="grupo-input">
              <label>Vencimiento:</label>
              <div class="caja-texto-lectura">
                {{ formatearFecha(pagoSeleccionado.fecha_vencimiento) }}
              </div>
            </div>

            <template v-if="pagoSeleccionado.estatus === 'Pagado'">
              <div class="grupo-input">
                <label>Método de Pago:</label>
                <div class="caja-texto-lectura">
                  {{ pagoSeleccionado.metodo_pago || "No especificado" }}
                </div>
              </div>
              <div class="grupo-input">
                <label>Fecha de Pago Real:</label>
                <div class="caja-texto-lectura">
                  {{ formatearFecha(pagoSeleccionado.fecha_pago) || "N/A" }}
                </div>
              </div>
            </template>

            <div class="grupo-input full" v-if="pagoSeleccionado.notas">
              <label>Notas Adicionales:</label>
              <div class="caja-texto-lectura">{{ pagoSeleccionado.notas }}</div>
            </div>

            <div class="grupo-input full" style="margin-top: 10px">
              <a
                v-if="pagoSeleccionado.comprobante_url"
                :href="`http://localhost:3000${pagoSeleccionado.comprobante_url}`"
                target="_blank"
                class="btn-primario"
                style="
                  text-align: center;
                  text-decoration: none;
                  display: block;
                "
              >
                📄 Ver / Descargar Comprobante
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

  
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
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
const obtenerTextoEstatus = (pago) => {
  if (pago.estatus === "Pagado") return "Pagado";
  const hoy = new Date().toISOString().split("T")[0];
  if (!pago.fecha_vencimiento) return "Pendiente";
  const vencimiento = new Date(pago.fecha_vencimiento)
    .toISOString()
    .split("T")[0];
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

    // Validamos contra las llaves correctas de tu JSON
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

    const respuesta = await fetch(`http://localhost:3000/api/pagos`, {
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

onMounted(() => {
  cargarTodosLosPagos();
});

// UTILIDADES FORMATO
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
</script>

<style scoped>
/* =======================================================
   ESTILOS ROBUSTOS (Se incluyeron fallbacks por si acaso)
   ======================================================= */
.clientes-contenedor {
  padding: 20px;
}

.cabecera-seccion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-text h2 {
  color: var(--primary-dark, #2c3e50);
  font-size: 1.8rem;
  margin: 0 0 5px 0;
}

.subtitulo {
  color: #666;
  margin: 0;
}

.tarjeta-sistema {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid var(--border-light, #eee);
}

.toolbar-tabla {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.buscador-wrapper {
  position: relative;
  flex-grow: 1;
  max-width: 400px;
}

.input-buscador {
  width: 100%;
  padding: 10px 10px 10px 35px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 12px;
  color: var(--secondary, #853953);
}
.filtros-rapidos {
  display: flex;
  gap: 10px;
}
.input-select.mini {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: white;
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
  background: var(--secondary, #853953);
  color: var(--primary, #ffffff);
  padding: 15px;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.tabla-profesional td {
  padding: 15px;
  border-bottom: 1px solid var(--border-light, #eee);
  color: var(--primary-dark, #2c3e50);
  vertical-align: middle;
}

.resaltado {
  font-weight: 600;
  color: var(--primary-dark, #2c3e50);
  margin-bottom: 2px;
}
.expediente-num {
  font-size: 0.85rem;
  color: #666;
}
.tag-asunto {
  display: inline-block;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #f0f0f0;
  color: #555;
  margin-top: 4px;
}
.estado-msg {
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
  color: #666;
}
.vacio {
  text-align: center;
  padding: 40px 20px;
  color: #888;
}
.mb-4 {
  margin-bottom: 25px;
}

/* BADGES DE ESTATUS */
.badge-estatus {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  display: inline-block;
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

.btn-groupacciones {
  display: flex;
  gap: 8px;
  justify-content: center;
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

/* DASHBOARD FINANCIERO */
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
  font-size: 1.7rem;
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
  background-color: #fdf2f2;
  border-color: #fecaca;
}
.widget-finanzas.total .widget-titulo {
  color: #991b1b;
}
.widget-finanzas.total .widget-monto {
  color: #b91c1c;
}

/* PAGINACIÓN FOOTER */
.paginacion-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: white;
  border-top: 1px solid var(--border-light, #eee);
}
.paginacion-info {
  font-size: 0.9rem;
  color: #555;
}
.paginacion-controles {
  display: flex;
  align-items: center;
  gap: 12px;
}
.paginacion-texto {
  font-weight: 600;
  color: var(--primary-dark, #2c3e50);
  font-size: 0.95rem;
}
.btn-paginacion {
  background-color: transparent;
  color: var(--secondary, #853953);
  border: 1px solid var(--secondary, #853953);
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-paginacion:hover:not(:disabled) {
  background-color: var(--secondary, #853953);
  color: white;
}
.btn-paginacion:disabled {
  border-color: #ccc;
  color: #ccc;
  cursor: not-allowed;
}

/* MODAL STYLES */
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
  max-width: 500px;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  overflow-y: auto;
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
  color: var(--primary-dark, #2c3e50);
}
.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
}
.btn-close:hover {
  color: var(--secondary, #853953);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}
.grupo-input {
  display: flex;
  flex-direction: column;
}
.grupo-input.full {
  grid-column: 1 / -1;
}
.grupo-input label {
  font-weight: 600;
  color: var(--primary-dark, #2c3e50);
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.caja-texto-lectura {
  padding: 12px;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 6px;
  color: #444;
  font-size: 0.95rem;
}
.btn-primario {
  background-color: var(--secondary, #853953);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: inline-block;
}
.btn-primario:hover {
  background-color: #6a2a40;
}

/* Resumen rápido dentro del modal */
.resumen-rapido {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid var(--secondary, #853953);
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
  color: var(--primary-dark, #2c3e50);
}
</style>
