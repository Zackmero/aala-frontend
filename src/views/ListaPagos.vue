<template>
  <div class="clientes-contenedor">
    <div class="cabecera-seccion">
      <div class="header-text">
        <h2>Control Financiero General</h2>
        <p class="subtitulo">
          Monitorea los ingresos, cuentas por cobrar y la cartera vencida de todo el despacho.
        </p>
      </div>
    </div>

    <div class="dashboard-financiero mb-4">
      <div class="widget-finanzas pagado">
        <span class="widget-titulo">Cobrado (Este Mes)</span>
        <span class="widget-monto">{{ formatoMoneda(metricasGlobales.totalPagado) }}</span>
      </div>
      <div class="widget-finanzas pendiente">
        <span class="widget-titulo">Por Cobrar (Saldos)</span>
        <span class="widget-monto">{{ formatoMoneda(metricasGlobales.totalPendiente) }}</span>
      </div>
      <div class="widget-finanzas total">
        <span class="widget-titulo">Cartera Vencida</span>
        <span class="widget-monto" style="color: #c5221f;">{{ formatoMoneda(metricasGlobales.totalAtrasado) }}</span>
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

      <div v-else class="responsive-table-container">
        <table class="tabla-profesional">
          <thead>
            <tr>
              <th>Cliente / Expediente</th>
              <th>Concepto / Tipo</th>
              <th>Vencimiento</th>
              <th>Monto</th>
              <th>Estatus</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pagosFiltrados.length === 0">
              <td colspan="6" class="vacio">
                No se encontraron registros financieros con los filtros seleccionados.
              </td>
            </tr>
            
            <tr v-for="pago in pagosPaginados" :key="pago.id">
              <td>
                <div class="resaltado">👤 {{ p_cliente_nombre(pago) }}</div>
                <div class="expediente-num">💼 Caso: {{ pago.expediente_titulo }}</div>
              </td>
              <td>
                <div class="resaltado">{{ pago.concepto }}</div>
                <span class="tag-asunto">{{ pago.tipo }}</span>
              </td>
              <td>{{ formatearFecha(pago.fecha_vencimiento) }}</td>
              <td class="resaltado" style="font-size: 1rem;">
                {{ formatoMoneda(pago.monto) }}
              </td>
              <td>
                <span :class="['badge-estatus', obtenerClaseEstatus(pago)]">
                  {{ obtenerTextoEstatus(pago) }}
                </span>
              </td>
              <td>
                <div class="btn-groupacciones">
                  <button
                    @click="irAlExpediente(pago.expediente_id)"
                    class="btn-accion view"
                    title="Ir al Expediente Completo"
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
            Mostrando {{ inicioPaginacion }} a {{ finPaginacion }} de {{ pagosFiltrados.length }}
          </div>
          <div class="paginacion-controles">
            <button 
              @click="paginaActual--" 
              :disabled="paginaActual === 1" 
              class="btn-paginacion"
            >
              Anterior
            </button>
            <span class="paginacion-texto">{{ paginaActual }} / {{ totalPaginas }}</span>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const cargando = ref(true);

// Filtros reactivos
const filtroBusqueda = ref("");
const filtroEstatus = ref("");
const filtroTipo = ref("");

// Lista maestra de pagos y variables de paginación
const listaGlobalPagos = ref([]);
const paginaActual = ref(1);
const elementosPorPagina = ref(8);

// Resetear paginación al cambiar filtros
watch([filtroBusqueda, filtroEstatus, filtroTipo], () => {
  paginaActual.value = 1;
});

// Función para navegar rápido al expediente correspondiente
const irAlExpediente = (id) => {
  router.push(`/expedientes/${id}`);
};

// Formateadores auxiliares seguros para el render
const p_cliente_nombre = (pago) => pago.cliente_nombre || `Cliente #${pago.cliente_id || 'N/A'}`;

const obtenerTextoEstatus = (pago) => {
  if (pago.estatus === 'Pagado') return 'Pagado';
  const hoy = new Date().toISOString().split('T')[0];
  const vencimiento = new Date(pago.fecha_vencimiento).toISOString().split('T')[0];
  return (pago.estatus === 'Pendiente' && vencimiento < hoy) ? 'Atrasado' : 'Pendiente';
};

const obtenerClaseEstatus = (pago) => {
  const est = obtenerTextoEstatus(pago);
  return est.toLowerCase();
};

// LÓGICA DE FILTRADO COMBINADO
const pagosFiltrados = computed(() => {
  return listaGlobalPagos.value.filter((pago) => {
    const busqueda = filtroBusqueda.value.toLowerCase();
    const textoEstatus = obtenerTextoEstatus(pago);
    
    const cumpleBusqueda = !busqueda || 
      (pago.concepto && pago.concepto.toLowerCase().includes(busqueda)) ||
      (pago.cliente_nombre && pago.cliente_nombre.toLowerCase().includes(busqueda)) ||
      (pago.expediente_titulo && pago.expediente_titulo.toLowerCase().includes(busqueda));

    const cumpleEstatus = !filtroEstatus.value || textoEstatus === filtroEstatus.value;
    const cumpleTipo = !filtroTipo.value || pago.tipo === filtroTipo.value;

    return cumpleBusqueda && cumpleEstatus && cumpleTipo;
  });
});

// TOTALES DE DASHBOARD FINANCIERO (Calculados dinámicamente)
const metricasGlobales = computed(() => {
  let totalPagado = 0;
  let totalPendiente = 0;
  let totalAtrasado = 0;

  listaGlobalPagos.value.forEach(p => {
    const est = obtenerTextoEstatus(p);
    const montoNum = Number(p.monto) || 0;
    
    if (p.estatus === 'Pagado') {
      totalPagado += montoNum;
    } else if (est === 'Atrasado') {
      totalAtrasado += montoNum;
    } else {
      totalPendiente += montoNum;
    }
  });

  return { totalPagado, totalPendiente, totalAtrasado };
});

// LÓGICA DE PAGINACIÓN COMPUTADA
const totalPaginas = computed(() => {
  return Math.ceil(pagosFiltrados.value.length / elementosPorPagina.value) || 1;
});

const pagosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * elementosPorPagina.value;
  const fin = inicio + elementosPorPagina.value;
  return pagosFiltrados.value.slice(inicio, fin);
});

const inicioPaginacion = computed(() => {
  if (pagosFiltrados.value.length === 0) return 0;
  return ((paginaActual.value - 1) * elementosPorPagina.value) + 1;
});

const finPaginacion = computed(() => {
  const fin = paginaActual.value * elementosPorPagina.value;
  return fin > pagosFiltrados.value.length ? pagosFiltrados.value.length : fin;
});

// CARGA DE DATOS DE LA API GLOBAL
const cargarTodosLosPagos = async () => {
  cargando.value = true;
  try {
    // LLAMADA AL NUEVO ENDPOINT GLOBAL
    const respuesta = await fetch("http://localhost:3000/api/pagos");
    if (!respuesta.ok) throw new Error("Error en el servidor");
    listaGlobalPagos.value = await respuesta.json();
  } catch (error) {
    console.error("Error cargando el tablero financiero:", error);
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
  return new Date(date.getTime() + Math.abs(date.getTimezoneOffset() * 60000)).toLocaleDateString("es-MX", opciones);
};

const formatoMoneda = (monto) => {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(monto);
};
</script>

<style scoped>
/* REUTILIACIÓN DE ESTILOS DE TU SISTEMA */
.clientes-contenedor { padding: 20px; }
.cabecera-seccion { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header-text h2 { color: var(--primary-dark); font-size: 1.8rem; margin: 0 0 5px 0; }
.subtitulo { color: #666; margin: 0; }
.tarjeta-sistema { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid var(--border-light); }
.toolbar-tabla { display: flex; justify-content: space-between; gap: 15px; margin-bottom: 20px; flex-wrap: wrap; }
.buscador-wrapper { position: relative; flex-grow: 1; max-width: 400px; }
.input-buscador { width: 100%; padding: 10px 10px 10px 35px; border: 1px solid #ccc; border-radius: 6px; }
.search-icon { position: absolute; left: 12px; top: 12px; color: var(--secondary); }
.filtros-rapidos { display: flex; gap: 10px; }
.input-select.mini { padding: 8px 12px; border: 1px solid #ccc; border-radius: 6px; background-color: white; }
.responsive-table-container {  overflow-x: auto; }
.tabla-profesional { width: 100%; border-collapse: collapse; text-align: left; }
.tabla-profesional th { background: var(--secondary); color: var(--primary); padding: 15px; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; }
.tabla-profesional td { padding: 15px; border-bottom: 1px solid var(--border-light); color: var(--primary-dark); vertical-align: middle; }
.resaltado { font-weight: 600; color: var(--primary-dark); margin-bottom: 2px; }
.expediente-num { font-size: 0.85rem; color: #666; }
.tag-asunto { display: inline-block; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; background-color: #f0f0f0; color: #333; }
</style>