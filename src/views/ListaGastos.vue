<template>
  <div class="gastos-contenedor">
    <div class="cabecera-seccion">
      <div class="header-text">
        <h2>Gastos </h2>
        <p class="subtitulo">
          Consulta todos los gastos registrados en el despacho y accede al expediente asociado.
        </p>
      </div>
    </div>

    <div v-if="mensajeEstado" :class="['estado-banner', tipoMensaje]">
      {{ mensajeEstado }}
    </div>

    <div class="dashboard-gastos">
      <div class="widget-gasto total">
        <span class="widget-titulo">Total de gastos</span>
        <span class="widget-monto">{{ formatoMoneda(metricas.total) }}</span>
      </div>
      <div class="widget-gasto pendiente">
        <span class="widget-titulo">Pendientes</span>
        <span class="widget-monto">{{ formatoMoneda(metricas.pendientes) }}</span>
      </div>
      <div class="widget-gasto pagado">
        <span class="widget-titulo">Pagados</span>
        <span class="widget-monto">{{ formatoMoneda(metricas.pagados) }}</span>
      </div>
    </div>

    <div class="toolbar-tabla">
      <div class="buscador-wrapper">
        <span class="search-icon">🔍</span>
        <input
          v-model="filtroBusqueda"
          type="text"
          placeholder="Buscar por abogado, expediente o concepto"
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

    <div class="tarjeta-sistema">
      <div v-if="cargando" class="estado-msg">
        <span class="spinner">⏳</span> Consultando gastos desde la API...
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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="gastosFiltrados.length === 0">
              <td colspan="8" class="vacio">
                No se encontraron gastos con los filtros seleccionados.
              </td>
            </tr>

            <tr v-for="gasto in gastosFiltrados" :key="gasto.id">
              <td>
                <div class="resaltado">{{ gasto.abogado || 'Sin abogado' }}</div>
              </td>
              <td>{{ gasto.tipo }}</td>
              <td>{{ gasto.concepto }}</td>
              <td>
                <div class="resaltado">{{ gasto.expedienteEtiqueta }}</div>
              </td>
              <td>{{ formatearFecha(gasto.fecha) }}</td>
              <td class="resaltado">{{ formatoMoneda(gasto.monto) }}</td>
              <td>
                <span :class="['badge-estatus', claseEstatus(gasto.estatus)]">
                  {{ gasto.estatus }}
                </span>
              </td>
              <td>
                <div class="acciones-tabla">
                  <button
                    v-if="gasto.expedienteId"
                    @click="irAlExpediente(gasto.expedienteId)"
                    class="btn-accion"
                    title="Abrir expediente"
                  >
                    📂
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

          <div class="paginacion-footer" v-if="gastosFiltrados.length > 0">
          <div class="paginacion-info">
            Mostrando {{ inicioPaginacion }} a {{ finPaginacion }} de
            {{ gastosFiltrados.length }}
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const API_BASE = `${import.meta.env.VITE_API_URL}/gastos`;
const token = localStorage.getItem('token');

const cargando = ref(true);
const mensajeEstado = ref('');
const tipoMensaje = ref('success');

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

const mostrarMensaje = (texto, tipo = 'success') => {
  mensajeEstado.value = texto;
  tipoMensaje.value = tipo;
};

const limpiarMensaje = () => {
  mensajeEstado.value = '';
};

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

  const expedienteValor =
    gasto.expediente ||
    gasto.expediente_id ||
    gasto.numero_expediente ||
    gasto.numero_expediente_judicial ||
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

const gastosFiltrados = computed(() => {
  const busqueda = filtroBusqueda.value.toLowerCase();

  return gastos.value.filter((gasto) => {
    const coincideBusqueda =
      !busqueda ||
      (gasto.abogado && gasto.abogado.toLowerCase().includes(busqueda)) ||
      (gasto.concepto && gasto.concepto.toLowerCase().includes(busqueda)) ||
      (gasto.expedienteEtiqueta && gasto.expedienteEtiqueta.toLowerCase().includes(busqueda));

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

const formatearFecha = (fechaString) => {
  if (!fechaString) return 'Sin fecha';
  const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(fechaString);
  return new Date(date.getTime() + Math.abs(date.getTimezoneOffset() * 60000)).toLocaleDateString('es-MX', opciones);
};
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

const formatoMoneda = (monto) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(monto) || 0);

const claseEstatus = (estatus) => {
  if (estatus === 'Pagado') return 'pagado';
  if (estatus === 'Pendiente') return 'pendiente';
  return 'atrasado';
};

onMounted(() => {
  cargarGastos();
});
</script>

<style scoped>
.gastos-contenedor {
  padding: 10px;
}

.cabecera-seccion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
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

.estado-banner {
  padding: 12px 14px;
  border-radius: 8px;
  margin-bottom: 18px;
  font-weight: 700;
}

.estado-banner.success {
  background-color: #e6f4ea;
  color: #137333;
}

.estado-banner.error {
  background-color: #fce8e6;
  color: #c5221f;
}

.dashboard-gastos {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.widget-gasto {
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  border: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.widget-titulo {
  font-size: 0.82rem;
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 6px;
}

.widget-monto {
  font-size: 1.7rem;
  font-weight: 800;
}

.widget-gasto.total {
  background-color: #fdf2f2;
  border-color: #fecaca;
}

.widget-gasto.pendiente {
  background-color: #fffbeb;
  border-color: #fef08a;
}

.widget-gasto.pagado {
  background-color: #f0fdf4;
  border-color: #bbf7d0;
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
  max-width: 420px;
}

.input-buscador {
  width: 100%;
  padding: 10px 10px 10px 35px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
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
  align-items: center;
  flex-wrap: wrap;
}

.input-select.mini,
.input-campo {
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: white;
}

.tarjeta-sistema {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid var(--border-light, #eee);
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


.resaltado {
  font-weight: 700;
  color: var(--primary-dark, #2c3e50);
  margin-bottom: 2px;
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

.acciones-tabla {
  display: flex;
  gap: 8px;
}

.btn-primario,
.btn-secundario,
.btn-accion,
.btn-clear {
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primario {
  background-color: var(--secondary, #853953);
  color: #fff;
  padding: 11px 16px;
}

.btn-secundario {
  background-color: #f1f5f9;
  color: var(--primary-dark, #2c3e50);
  padding: 11px 16px;
}

.btn-accion {
  background: transparent;
  padding: 6px 8px;
  font-size: 1rem;
}

.btn-clear {
  background: transparent;
  color: #666;
  padding: 2px 6px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  z-index: 1100;
}

.modal-card {
  width: min(760px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.18);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  color: var(--primary-dark, #2c3e50);
}

.modal-subtitulo {
  margin: 6px 0 0;
  color: #666;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
  color: #666;
}

.form-grid-gastos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.grupo-input {
  display: flex;
  flex-direction: column;
}

.grupo-input.full {
  grid-column: 1 / -1;
}

.grupo-input label {
  font-weight: 700;
  color: var(--primary-dark, #2c3e50);
  margin-bottom: 8px;
}

.textarea {
  resize: vertical;
  min-height: 100px;
}

.autocomplete-list {
  margin-top: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  max-height: 220px;
  overflow-y: auto;
  background: white;
}

.autocomplete-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 12px 14px;
  border: none;
  border-bottom: 1px solid #f1f1f1;
  background: white;
  text-align: left;
  cursor: pointer;
}

.autocomplete-item:last-child {
  border-bottom: none;
}

.autocomplete-item:hover {
  background: #f8fafc;
}

.autocomplete-titulo {
  font-weight: 700;
  color: var(--primary-dark, #2c3e50);
}

.autocomplete-subtitulo {
  font-size: 0.9rem;
  color: #666;
  margin-top: 4px;
}

.selected-expediente {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f8fafc;
  color: var(--primary-dark, #2c3e50);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.badge-estatus {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
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

@media (max-width: 900px) {
  .dashboard-gastos,
  .form-grid-gastos {
    grid-template-columns: 1fr;
  }

  .cabecera-seccion {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
