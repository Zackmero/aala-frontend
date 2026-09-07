<template>
  <div class="gastos-contenedor">
    <div class="cabecera-seccion">
      <div class="header-text">
        <h2>Gastos del Despacho</h2>
        <p class="subtitulo">
          Consulta todos los gastos registrados en el despacho y accede al expediente asociado.
        </p>
      </div>
    </div>

    <!-- DASHBOARD DE GASTOS -->
    <div class="dashboard-gastos">
      <div class="widget-gasto total">
        <div class="widget-icon">💸</div>
        <div class="widget-info">
          <span class="widget-titulo">Total de gastos</span>
          <span class="widget-monto">{{ formatoMoneda(metricas.total) }}</span>
        </div>
      </div>
      <div class="widget-gasto pendiente">
        <div class="widget-icon">⏳</div>
        <div class="widget-info">
          <span class="widget-titulo">Pendientes</span>
          <span class="widget-monto">{{ formatoMoneda(metricas.pendientes) }}</span>
        </div>
      </div>
      <div class="widget-gasto pagado">
        <div class="widget-icon">✅</div>
        <div class="widget-info">
          <span class="widget-titulo">Pagados</span>
          <span class="widget-monto">{{ formatoMoneda(metricas.pagados) }}</span>
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
          placeholder="Buscar por abogado, expediente o concepto..."
          class="input-buscador"
        />
      </div>

      <div class="filtros-rapidos">
        <select v-model="filtroEstatus" class="input-select mini">
          <option value="">Todos los estatus</option>
          <option value="Pendiente">Pendientes</option>
          <option value="Pagado">Pagados</option>
          <option value="Revisar">Revisar</option>
        </select>
        <select v-model="filtroTipo" class="input-select mini">
          <option value="">Todos los tipos</option>
          <option v-for="tipo in tiposDisponibles" :key="tipo" :value="tipo">
            {{ tipo }}
          </option>
        </select>
      </div>
    </div>

    <!-- TABLA DE GASTOS -->
    <div class="tarjeta-sistema">
      <div v-if="cargando" class="estado-msg">
        <span class="spinner-small"></span> Consultando gastos desde la API...
      </div>

      <div v-else class="responsive-table-container">
        <table class="tabla-profesional">
          <thead>
            <tr>
              <th>Abogado</th>
              <th>Tipo</th>
              <th>Concepto</th>
              <th>Expediente</th>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Estatus</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="gastosFiltrados.length === 0">
              <td colspan="8" class="vacio">
                <span class="vacio-icon">📭</span>
                <p>No se encontraron gastos con los filtros seleccionados.</p>
              </td>
            </tr>

            <tr v-for="gasto in gastosPaginados" :key="gasto.id">
              <td>
                <div class="resaltado">
                  <span class="contacto-icon">👤</span> {{ gasto.abogado || 'Sin abogado' }}
                </div>
              </td>
              <td>
                <span class="tag-asunto">{{ gasto.tipo }}</span>
              </td>
              <td class="col-concepto">{{ gasto.concepto }}</td>
              <td>
                <div class="expediente-num">
                  <strong>{{ gasto.expedienteEtiqueta }}</strong>
                </div>
              </td>
              <td class="col-fecha">
                <span class="contacto-icon">📅</span> {{ formatearFecha(gasto.fecha) }}
              </td>
              <td class="resaltado monto-text">{{ formatoMoneda(gasto.monto) }}</td>
              <td>
                <span :class="['badge-estatus', claseEstatus(gasto.estatus)]">
                  {{ gasto.estatus }}
                </span>
              </td>
              <td>
                <div class="btn-groupacciones">
                  <!-- Comprobante: se pide una URL firmada al backend.
                       Antes se abría el enlace crudo de S3, que o daba 403
                       o dejaba el comprobante fiscal accesible sin sesión. -->
                  <button
                    v-if="gasto.comprobante_url"
                    @click="abrirComprobanteSeguro(gasto.id)"
                    class="btn-accion receipt"
                    title="Ver comprobante adjunto"
                  >
                    👁️
                  </button>
                  
                  <!-- Botón para abrir el expediente -->
                  <button
                    v-if="gasto.expedienteId"
                    @click="irAlExpediente(gasto.expedienteId)"
                    class="btn-accion folder"
                    title="Abrir expediente"
                  >
                    📂
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- PAGINACIÓN -->
        <div class="paginacion-footer" v-if="gastosFiltrados.length > 0">
          <div class="paginacion-info">
            Mostrando <strong>{{ inicioPaginacion }}</strong> a <strong>{{ finPaginacion }}</strong> de
            <strong>{{ gastosFiltrados.length }}</strong>
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
// Los comprobantes se abren con una URL firmada que pide el backend (ver J-02)
import { API_URL } from '../services/api.js';
import { notificar } from '../composables/useNotificaciones';
import { formatearFecha as formatearFechaBase, formatoMoneda } from '../utils/Formatos.js';

const router = useRouter();
const API_BASE = `${API_URL}/gastos`;
const token = localStorage.getItem('token');

const cargando = ref(true);


const filtroBusqueda = ref('');
const filtroEstatus = ref('');
const filtroTipo = ref('');

const paginaActual = ref(1);
const elementosPorPagina = ref(8);

const gastos = ref([]);

const tiposDisponibles = [
  'Viáticos',
  'Peritaje',
  'Copias',
  'Honorarios',
  'Gastos generales',
  'Transportes',
  'Servicios profesionales',
];

const cabeceras = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

// Se mantiene el nombre para no tocar todas las llamadas, pero ahora sale
// por el sistema de avisos de la aplicación en vez de por un banner propio.
const mostrarMensaje = (texto, tipo = 'success') => {
  if (tipo === 'error') return notificar.error(texto);
  if (tipo === 'advertencia') return notificar.advertencia(texto);
  return notificar.exito(texto);
};

const limpiarMensaje = () => {};

const parsearRespuesta = async (respuesta) => {
  if (!respuesta.ok) {
    const texto = await respuesta.text();
    throw new Error(texto || 'Error en el servidor');
  }
  if (respuesta.status === 204) return null;
  return respuesta.json();
};

const normalizarGasto = (gasto = {}) => {
  const abogadoNombre =
    gasto.abogado ||
    gasto.nombre_abogado ||
    gasto.abogado_nombre ||
    gasto.abogado_responsable ||
    'Sin abogado';

  // El número del juzgado va primero: al abogado "Expediente 14" no le dice
  // nada, y no puede buscar por el número con el que identifica el caso.
  const expedienteValor =
    gasto.numero_expediente ||
    gasto.numero_expediente_judicial ||
    gasto.expediente ||
    gasto.expediente_id ||
    'Sin expediente';

  return {
    id: gasto.id ?? gasto.gasto_id,
    abogadoId: gasto.abogado_id ?? null,
    abogado: abogadoNombre,
    tipo: gasto.tipo || gasto.categoria || 'Gasto general',
    concepto: gasto.concepto || gasto.descripcion || '',
    expedienteId: gasto.expediente_id ?? gasto.expediente?.id ?? null,
    expedienteEtiqueta: expedienteValor || 'Sin expediente',
    fecha: gasto.fecha || gasto.fecha_gasto || '',
    monto: Number(gasto.monto ?? gasto.total ?? 0) || 0,
    estatus: gasto.estatus || gasto.estado || 'Pendiente',
    notas: gasto.notas || gasto.observaciones || '',
    // Propiedad para el comprobante de AWS
    comprobante_url: gasto.comprobante_url || gasto.url_comprobante || null, 
  };
};

const cargarGastos = async () => {
  cargando.value = true;
  limpiarMensaje();

  try {
    const respuesta = await fetch(API_BASE, {
      headers: cabeceras(),
    });
    const data = await parsearRespuesta(respuesta);
    gastos.value = Array.isArray(data) ? data.map(normalizarGasto) : [];
  } catch (error) {
    console.error('Error cargando gastos:', error);
    mostrarMensaje('No se pudieron cargar los gastos.', 'error');
  } finally {
    cargando.value = false;
  }
};

const irAlExpediente = (id) => {
  if (!id) return;
  router.push(`/expedientes/${id}`);
};

// Pide al backend una URL firmada y temporal de S3, igual que hace Pagos.
const abrirComprobanteSeguro = async (idGasto) => {
  // La pestaña se abre en el mismo clic; si se abriera después del await,
  // el bloqueador de ventanas emergentes la cancelaría.
  const ventana = window.open('', '_blank');
  try {
    const respuesta = await fetch(`${API_BASE}/${idGasto}/comprobante`, {
      headers: cabeceras(),
    });
    const data = await parsearRespuesta(respuesta);
    if (!data?.url) throw new Error('El servidor no devolvió el enlace del comprobante');

    if (ventana) {
      ventana.location.href = data.url;
    } else {
      window.open(data.url, '_blank');
    }
  } catch (error) {
    if (ventana) ventana.close();
    console.error('Error al abrir el comprobante:', error);
    mostrarMensaje('No se pudo abrir el comprobante.', 'error');
  }
};

// Reiniciar la paginación a la página 1 cuando se realiza una búsqueda o se filtra
watch([filtroBusqueda, filtroEstatus, filtroTipo], () => {
  paginaActual.value = 1;
});

const gastosFiltrados = computed(() => {
  const busqueda = filtroBusqueda.value.toLowerCase().trim();

  return gastos.value.filter((gasto) => {
    // Uso de String() para evitar errores si algún valor llega como nulo o indefinido
    const coincideBusqueda =
      !busqueda ||
      String(gasto.abogado).toLowerCase().includes(busqueda) ||
      String(gasto.concepto).toLowerCase().includes(busqueda) ||
      String(gasto.expedienteEtiqueta).toLowerCase().includes(busqueda);

    const coincideEstado = !filtroEstatus.value || gasto.estatus === filtroEstatus.value;
    const coincideTipo = !filtroTipo.value || gasto.tipo === filtroTipo.value;

    return coincideBusqueda && coincideEstado && coincideTipo;
  });
});

const metricas = computed(() => {
  const total = gastos.value.reduce((sum, gasto) => sum + Number(gasto.monto || 0), 0);
  const pendientes = gastos.value
    .filter((gasto) => gasto.estatus === 'Pendiente')
    .reduce((sum, gasto) => sum + Number(gasto.monto || 0), 0);
  const pagados = gastos.value
    .filter((gasto) => gasto.estatus === 'Pagado')
    .reduce((sum, gasto) => sum + Number(gasto.monto || 0), 0);

  return { total, pendientes, pagados };
});

// Se apoya en utils/Formatos.js y conserva el "Sin fecha" que esperaba la tabla.
const formatearFecha = (fechaString) => formatearFechaBase(fechaString) || 'Sin fecha';

// PAGINACIÓN
const totalPaginas = computed(
  () => Math.ceil(gastosFiltrados.value.length / elementosPorPagina.value) || 1,
);

const gastosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * elementosPorPagina.value;
  return gastosFiltrados.value.slice(inicio, inicio + elementosPorPagina.value);
});

const inicioPaginacion = computed(() =>
  gastosFiltrados.value.length === 0
    ? 0
    : (paginaActual.value - 1) * elementosPorPagina.value + 1,
);

const finPaginacion = computed(() => {
  const fin = paginaActual.value * elementosPorPagina.value;
  return fin > gastosFiltrados.value.length ? gastosFiltrados.value.length : fin;
});

const claseEstatus = (estatus) => {
  if (estatus === 'Pagado') return 'pagado';
  if (estatus === 'Pendiente') return 'pendiente';
  if (estatus === 'Revisar') return 'revisar';
  return 'atrasado';
};

onMounted(() => {
  cargarGastos();
});
</script>

<style scoped>
/* ====================================================
   ESTILOS DE GASTOS (Paleta estricta Color Hunt)
   ==================================================== */
.gastos-contenedor {
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

/* Banner de Estado */
.estado-banner {
  padding: 14px 20px;
  border-radius: 12px;
  margin-bottom: 25px;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}

.estado-banner.success {
  background-color: #d1fae5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.estado-banner.error {
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

/* DASHBOARD FINANCIERO (WIDGETS) */
.dashboard-gastos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.widget-gasto {
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

.widget-gasto::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 5px;
  opacity: 0.8;
}

.widget-gasto.total::before { background-color: #3b82f6; }
.widget-gasto.pendiente::before { background-color: #f59e0b; }
.widget-gasto.pagado::before { background-color: #10b981; }

.widget-gasto:hover {
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
  font-size: 0.95rem;
}

.monto-text {
  font-size: 1.05rem !important;
  color: #853953;
}

.col-concepto {
  color: #2C2C2C;
  font-size: 0.95rem;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.expediente-num {
  font-size: 0.85rem;
  color: #612D53;
  background: rgba(133, 57, 83, 0.05);
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
}

.col-fecha {
  font-size: 0.9rem;
  color: #2C2C2C;
}

.tag-asunto {
  display: inline-block;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 20px;
  background-color: rgba(133, 57, 83, 0.08);
  color: #853953;
  font-weight: 600;
}

.contacto-icon {
  margin-right: 4px;
  opacity: 0.7;
}

/* BADGES DE ESTATUS */
.badge-estatus {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.badge-estatus.pagado { background-color: #d1fae5; color: #047857; }
.badge-estatus.pendiente { background-color: #fef3c7; color: #b45309; }
.badge-estatus.revisar { background-color: #e0e7ff; color: #4338ca; }
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
  text-decoration: none; /* Asegura que el anchor <a> no se subraye */
  color: inherit;
}

.btn-accion:hover {
  background: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(44, 44, 44, 0.08);
  border-color: #853953;
}

.btn-accion.receipt:hover {
  color: #853953;
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

/* ESTADOS VACÍOS */
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
  .gastos-contenedor { padding: 15px; }
  .toolbar-tabla { flex-direction: column; align-items: stretch; }
  .buscador-wrapper { max-width: 100%; }
  .filtros-rapidos { flex-direction: column; }
  .dashboard-gastos { grid-template-columns: 1fr; }
}
</style>