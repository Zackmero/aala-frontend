<template>
  <div class="agenda-contenedor">
    <!-- CABECERA -->
    <header class="cabecera-agenda">
      <div>
        <h2>Agenda de Audiencias</h2>
        <p class="subtitulo">
          Todas las audiencias del despacho, en un solo lugar.
        </p>
      </div>
      <button class="btn-secundario" @click="router.push('/')">
        ⬅ Volver al Dashboard
      </button>
    </header>

    <!-- RESUMEN RÁPIDO -->
    <div class="tira-resumen" v-if="!cargando">
      <button
        type="button"
        :class="['resumen-item', { activo: rangoActivo === 'hoy' }]"
        @click="aplicarRango('hoy')"
      >
        <span class="resumen-numero">{{ resumen.hoy }}</span>
        <span class="resumen-etiqueta">hoy</span>
      </button>
      <button
        type="button"
        :class="['resumen-item', { activo: rangoActivo === 'semana' }]"
        @click="aplicarRango('semana')"
      >
        <span class="resumen-numero">{{ resumen.semana }}</span>
        <span class="resumen-etiqueta">próximos 7 días</span>
      </button>
      <div class="resumen-item resumen-item--info" v-if="resumen.sinResultado > 0">
        <span class="resumen-numero alerta">{{ resumen.sinResultado }}</span>
        <span class="resumen-etiqueta">realizadas sin resultado capturado</span>
      </div>
    </div>

    <!-- PANEL DE FILTROS -->
    <section class="panel-filtros" aria-label="Filtros de la agenda">
      <div class="fila-chips" role="group" aria-label="Rango de fechas">
        <button
          v-for="opcion in rangos"
          :key="opcion.valor"
          type="button"
          :class="['chip', { 'chip--activo': rangoActivo === opcion.valor }]"
          :aria-pressed="rangoActivo === opcion.valor"
          @click="aplicarRango(opcion.valor)"
        >
          {{ opcion.etiqueta }}
        </button>
      </div>

      <div class="fila-campos">
        <div class="campo">
          <label for="filtro-estatus">Estatus</label>
          <div class="selector">
            <select id="filtro-estatus" v-model="filtroEstatus">
              <option value="">Todos los estatus</option>
              <option v-for="e in estatusDisponibles" :key="e" :value="e">{{ e }}</option>
            </select>
          </div>
        </div>

        <div class="campo">
          <label for="filtro-abogado">Abogado</label>
          <div class="selector">
            <select id="filtro-abogado" v-model="filtroAbogado">
              <option value="">Todos los abogados</option>
              <option v-for="a in abogadosDisponibles" :key="a" :value="a">{{ a }}</option>
            </select>
          </div>
        </div>

        <div class="campo campo--fecha">
          <label for="filtro-desde">Desde</label>
          <div class="selector selector--fecha">
            <svg class="selector__icono" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><rect x="2.5" y="4" width="15" height="13.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M2.5 8.2h15" stroke="currentColor" stroke-width="1.6"/><path d="M6.6 2.5v3M13.4 2.5v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
            <input id="filtro-desde" v-model="fechaDesde" type="date" @change="rangoActivo = 'personalizado'" />
          </div>
        </div>

        <div class="campo campo--fecha">
          <label for="filtro-hasta">Hasta</label>
          <div class="selector selector--fecha">
            <svg class="selector__icono" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><rect x="2.5" y="4" width="15" height="13.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M2.5 8.2h15" stroke="currentColor" stroke-width="1.6"/><path d="M6.6 2.5v3M13.4 2.5v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
            <input id="filtro-hasta" v-model="fechaHasta" type="date" @change="rangoActivo = 'personalizado'" />
          </div>
        </div>

        <button
          v-if="hayFiltrosActivos"
          type="button"
          class="btn-limpiar"
          @click="limpiarFiltros"
        >
          ✕ Limpiar filtros
        </button>
      </div>
    </section>

    <!-- TABLA -->
    <div v-if="cargando" class="estado-msg">
      <span class="spinner">⏳</span> Cargando la agenda...
    </div>

    <div v-else-if="listaAudiencias.length === 0" class="vacio">
      <span class="icon-large">⚖️</span>
      <p>Todavía no hay audiencias registradas en el sistema.</p>
      <span class="vacio-sub">Se programan desde el expediente correspondiente.</span>
    </div>

    <div v-else-if="audienciasFiltradas.length === 0" class="vacio">
      <span class="icon-large">🔍</span>
      <p>Ninguna audiencia coincide con estos filtros.</p>
      <button class="btn-secundario mt-2" @click="limpiarFiltros">Ver todas</button>
    </div>

    <TablaGenerica
      v-else
      :titulo="tituloTabla"
      :subtitulo="subtituloTabla"
      :mostrar-boton-nuevo="false"
      :columnas="columnas"
      :datos="audienciasFiltradas"
      :cargando="false"
      :items-por-pagina="8"
      placeholder-buscador="Buscar por asunto, cliente o expediente..."
    >
      <template #titulo="{ item }">
        <div class="celda-asunto">
          <span class="asunto-texto">{{ item.titulo || "Sin título" }}</span>
          <span class="asunto-cliente">👤 {{ item.nombre_cliente || "Sin cliente" }}</span>
        </div>
      </template>

      <template #numero_expediente="{ item }">
        <span v-if="item.numero_expediente" class="tag-expediente">
          {{ item.numero_expediente }}
        </span>
        <span v-else class="texto-tenue">Sin número</span>
      </template>

      <template #fecha_hora="{ item }">
        <div class="celda-fecha">
          <span class="fecha-principal">
            {{ formato.formatearFechaHoraCorta(item.fecha_hora) }}
          </span>
          <span
            v-if="etiquetaRelativa(item.fecha_hora)"
            :class="['fecha-relativa', claseRelativa(item.fecha_hora)]"
          >
            {{ etiquetaRelativa(item.fecha_hora) }}
          </span>
        </div>
      </template>

      <template #lugar="{ item }">
        <span class="texto-lugar">📍 {{ item.lugar || "Sin lugar" }}</span>
      </template>

      <template #estatus="{ item }">
        <span :class="['badge-estatus', (item.estatus || 'Programada').toLowerCase()]">
          {{ item.estatus || "Programada" }}
        </span>
      </template>

      <template #acciones="{ item }">
        <div class="btn-groupacciones">
          <button
            @click="verDetallesAudiencia(item)"
            class="btn-accion tooltip-custom"
            data-tooltip="Ver detalles"
          >
            👁️
          </button>
          <button
            @click="irADetalles(item)"
            class="btn-accion tooltip-custom"
            data-tooltip="Ir al expediente"
          >
            📂
          </button>
          <button
            @click="eliminarAudiencia(item)"
            class="btn-accion delete tooltip-custom"
            data-tooltip="Eliminar audiencia"
          >
            🗑️
          </button>
        </div>
      </template>
    </TablaGenerica>

    <!-- MODAL DE DETALLE -->
    <div v-if="mostrarModalDetalle" class="modal-overlay" @click.self="cerrarModalDetalle">
      <div class="modal-card">
        <header class="modal-header">
          <h3>Detalle de la Audiencia</h3>
          <button @click="cerrarModalDetalle" class="btn-close" aria-label="Cerrar">&times;</button>
        </header>

        <div class="modal-body" v-if="audienciaSeleccionada">
          <div class="detalle-fila full">
            <label>Audiencia</label>
            <div class="detalle-valor resaltado">
              {{ audienciaSeleccionada.titulo || "Sin título" }}
            </div>
          </div>

          <div class="detalle-fila">
            <label>Fecha y hora</label>
            <div class="detalle-valor">
              🗓️ {{ formato.formatearFechaHoraTexto(audienciaSeleccionada.fecha_hora) }}
            </div>
          </div>

          <div class="detalle-fila">
            <label>Estatus</label>
            <div class="detalle-valor">
              <span :class="['badge-estatus', (audienciaSeleccionada.estatus || 'Programada').toLowerCase()]">
                {{ audienciaSeleccionada.estatus || "Programada" }}
              </span>
            </div>
          </div>

          <div class="detalle-fila full">
            <label>Lugar / Modalidad</label>
            <div class="detalle-valor">
              📍 {{ audienciaSeleccionada.lugar || "Sin lugar registrado" }}
            </div>
          </div>

          <div class="detalle-fila">
            <label>Cliente</label>
            <div class="detalle-valor">
              {{ audienciaSeleccionada.nombre_cliente || "Sin cliente" }}
            </div>
          </div>

          <div class="detalle-fila">
            <label>Expediente</label>
            <div class="detalle-valor">
              {{ audienciaSeleccionada.numero_expediente || "Sin número de juzgado" }}
            </div>
          </div>

          <div class="detalle-fila full">
            <label>Abogado responsable</label>
            <div class="detalle-valor">
              {{ audienciaSeleccionada.nombre_abogado || "Sin asignar" }}
            </div>
          </div>

          <div class="detalle-fila full">
            <label>Notas de preparación</label>
            <div class="detalle-valor">
              {{ audienciaSeleccionada.notas_preparacion || "Sin notas de preparación." }}
            </div>
          </div>

          <div class="detalle-fila full">
            <label>Resultado</label>
            <div class="detalle-valor">
              {{ audienciaSeleccionada.resultado || "Todavía sin resultado registrado." }}
            </div>
          </div>
        </div>

        <footer class="modal-footer">
          <button @click="cerrarModalDetalle" class="btn-secundario">Cerrar</button>
          <button
            v-if="audienciaSeleccionada?.expediente_id"
            @click="irADetalles(audienciaSeleccionada)"
            class="btn-primario"
          >
            📂 Abrir expediente
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import TablaGenerica from "../components/TablaGenerica.vue";
import { API_URL } from "../services/api.js";
import { notificar, confirmar } from "../composables/useNotificaciones";
import * as formato from "../utils/Formatos.js";

const token = localStorage.getItem("token");
const router = useRouter();

const listaAudiencias = ref([]);
const cargando = ref(true);

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

const columnas = [
  { label: "Asunto", key: "titulo" },
  { label: "Expediente", key: "numero_expediente" },
  { label: "Fecha y hora", key: "fecha_hora" },
  { label: "Lugar", key: "lugar" },
  { label: "Estatus", key: "estatus" },
  { label: "Acciones", key: "acciones", clase: "text-center" },
];

// ---------------------------------------------------------------- fechas
// Todo el filtrado trabaja con el día local, nunca con toISOString(), que
// convierte a UTC y en México desplaza las fechas un día.
const inicioDelDia = (valor) => {
  const d = valor instanceof Date ? valor : formato.aFechaLocal(valor);
  if (!d || Number.isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

const desdeTexto = (texto) => {
  if (!texto) return null;
  const [a, m, d] = texto.split("-").map(Number);
  if (!a || !m || !d) return null;
  return new Date(a, m - 1, d).getTime();
};

const diasDeDiferencia = (fechaISO) => {
  const f = inicioDelDia(fechaISO);
  if (f === null) return null;
  return Math.round((f - inicioDelDia(new Date())) / 86400000);
};

const etiquetaRelativa = (fechaISO) => {
  const dias = diasDeDiferencia(fechaISO);
  if (dias === null) return "";
  if (dias === 0) return "Hoy";
  if (dias === 1) return "Mañana";
  if (dias === -1) return "Ayer";
  if (dias > 1 && dias <= 30) return `En ${dias} días`;
  if (dias < -1 && dias >= -30) return `Hace ${Math.abs(dias)} días`;
  return "";
};

const claseRelativa = (fechaISO) => {
  const dias = diasDeDiferencia(fechaISO);
  if (dias === null) return "";
  if (dias < 0) return "pasada";
  if (dias <= 2) return "inminente";
  return "proxima";
};

// ---------------------------------------------------------------- filtros
const rangos = [
  { valor: "proximas", etiqueta: "Próximas" },
  { valor: "hoy", etiqueta: "Hoy" },
  { valor: "semana", etiqueta: "Próximos 7 días" },
  { valor: "mes", etiqueta: "Este mes" },
  { valor: "pasadas", etiqueta: "Pasadas" },
  { valor: "todas", etiqueta: "Todas" },
];

// Por defecto se abre en "Próximas": para un abogado, la agenda es lo que
// viene, no el histórico.
const rangoActivo = ref("proximas");
const filtroEstatus = ref("");
const filtroAbogado = ref("");
const fechaDesde = ref("");
const fechaHasta = ref("");

const aplicarRango = (valor) => {
  rangoActivo.value = valor;
  fechaDesde.value = "";
  fechaHasta.value = "";
};

const limpiarFiltros = () => {
  rangoActivo.value = "proximas";
  filtroEstatus.value = "";
  filtroAbogado.value = "";
  fechaDesde.value = "";
  fechaHasta.value = "";
};

const hayFiltrosActivos = computed(
  () =>
    rangoActivo.value !== "proximas" ||
    filtroEstatus.value !== "" ||
    filtroAbogado.value !== "" ||
    fechaDesde.value !== "" ||
    fechaHasta.value !== ""
);

// Las opciones salen de los datos reales, no de una lista escrita a mano que
// tarde o temprano se desalinea de lo que hay en la base.
const estatusDisponibles = computed(() => {
  const vistos = new Set(
    listaAudiencias.value.map((a) => a.estatus).filter(Boolean)
  );
  return [...vistos].sort();
});

const abogadosDisponibles = computed(() => {
  const vistos = new Set(
    listaAudiencias.value.map((a) => a.nombre_abogado).filter(Boolean)
  );
  return [...vistos].sort();
});

const dentroDelRango = (audiencia) => {
  const dias = diasDeDiferencia(audiencia.fecha_hora);
  if (dias === null) return rangoActivo.value === "todas";

  const desde = desdeTexto(fechaDesde.value);
  const hasta = desdeTexto(fechaHasta.value);
  const fecha = inicioDelDia(audiencia.fecha_hora);

  // Un rango escrito a mano manda sobre los atajos.
  if (desde !== null || hasta !== null) {
    if (desde !== null && fecha < desde) return false;
    if (hasta !== null && fecha > hasta) return false;
    return true;
  }

  switch (rangoActivo.value) {
    case "proximas": return dias >= 0;
    case "hoy": return dias === 0;
    case "semana": return dias >= 0 && dias <= 7;
    case "mes": {
      const f = formato.aFechaLocal(audiencia.fecha_hora);
      if (!f) return false;
      const hoy = new Date();
      return f.getFullYear() === hoy.getFullYear() && f.getMonth() === hoy.getMonth();
    }
    case "pasadas": return dias < 0;
    default: return true;
  }
};

const audienciasFiltradas = computed(() => {
  const lista = listaAudiencias.value.filter((a) => {
    if (filtroEstatus.value && (a.estatus || "Programada") !== filtroEstatus.value) return false;
    if (filtroAbogado.value && a.nombre_abogado !== filtroAbogado.value) return false;
    return dentroDelRango(a);
  });

  // Mirando al futuro se ordena de lo más cercano en adelante; mirando al
  // pasado, de lo más reciente hacia atrás.
  const ascendente = rangoActivo.value !== "pasadas";
  return [...lista].sort((a, b) => {
    const fa = formato.aFechaLocal(a.fecha_hora)?.getTime() || 0;
    const fb = formato.aFechaLocal(b.fecha_hora)?.getTime() || 0;
    return ascendente ? fa - fb : fb - fa;
  });
});

const tituloTabla = computed(() => {
  if (fechaDesde.value || fechaHasta.value) return "Audiencias del rango elegido";
  const encontrado = rangos.find((r) => r.valor === rangoActivo.value);
  return encontrado ? `Audiencias · ${encontrado.etiqueta}` : "Audiencias";
});

const subtituloTabla = computed(() => {
  const n = audienciasFiltradas.value.length;
  return n === 1 ? "1 audiencia en la vista" : `${n} audiencias en la vista`;
});

const resumen = computed(() => {
  let hoy = 0;
  let semana = 0;
  let sinResultado = 0;

  listaAudiencias.value.forEach((a) => {
    const dias = diasDeDiferencia(a.fecha_hora);
    if (dias === 0) hoy += 1;
    if (dias !== null && dias >= 0 && dias <= 7) semana += 1;
    if (a.estatus === "Realizada" && !a.resultado) sinResultado += 1;
  });

  return { hoy, semana, sinResultado };
});

// ---------------------------------------------------------------- datos
const cargarAudienciasVisualizacion = async () => {
  cargando.value = true;
  try {
    const res = await fetch(`${API_URL}/audiencias`, { headers });
    if (!res.ok) throw new Error("El servidor no devolvió la agenda");
    const datos = await res.json();
    listaAudiencias.value = Array.isArray(datos) ? datos : [];
  } catch (e) {
    console.error(e);
    notificar.error("No se pudieron cargar las audiencias", e.message);
  } finally {
    cargando.value = false;
  }
};

// ---------------------------------------------------------------- detalle
const mostrarModalDetalle = ref(false);
const audienciaSeleccionada = ref(null);

const verDetallesAudiencia = (audiencia) => {
  audienciaSeleccionada.value = audiencia;
  mostrarModalDetalle.value = true;
};

const cerrarModalDetalle = () => {
  mostrarModalDetalle.value = false;
  audienciaSeleccionada.value = null;
};

// ---------------------------------------------------------------- acciones
const eliminarAudiencia = async (audiencia) => {
  if (!audiencia?.id) return;

  const confirmacion = await confirmar({
    titulo: "¿Eliminar esta audiencia?",
    mensaje:
      `"${audiencia.titulo || "Sin título"}"\n` +
      `Programada para el ${formato.formatearFechaHoraTexto(audiencia.fecha_hora)}.`,
    detalle:
      "Esta acción no se puede deshacer. Si la audiencia se cayó pero quieres " +
      'dejar constancia, es mejor abrir el expediente y ponerle estatus "Cancelada".',
    textoConfirmar: "Sí, eliminar",
    textoCancelar: "Conservar",
    tipo: "peligro",
  });
  if (!confirmacion) return;

  try {
    const respuesta = await fetch(`${API_URL}/audiencias/${audiencia.id}`, {
      method: "DELETE",
      headers,
    });
    if (!respuesta.ok) throw new Error("No se pudo eliminar la audiencia");

    if (audienciaSeleccionada.value?.id === audiencia.id) cerrarModalDetalle();

    notificar.exito("Audiencia eliminada", audiencia.titulo || "");
    await cargarAudienciasVisualizacion();
  } catch (error) {
    console.error("Error al eliminar la audiencia:", error);
    notificar.error("No se pudo eliminar la audiencia", error.message);
  }
};

const irADetalles = (audiencia) => {
  if (audiencia.expediente_id) {
    router.push(`/expedientes/${audiencia.expediente_id}`);
  } else {
    notificar.info(
      "Sin expediente vinculado",
      "Esta audiencia no está ligada a ningún expediente legal."
    );
  }
};

onMounted(cargarAudienciasVisualizacion);
</script>

<style scoped>
/* ============================================================
   AGENDA DE AUDIENCIAS
   Paleta del despacho: vino (--secondary) y ciruela (--terciary).
   Los colores de estatus son semánticos y van aparte del color de marca.
   ============================================================ */

.agenda-contenedor {
  padding: 4px 0 40px;
}

/* ---------- Cabecera ---------- */
.cabecera-agenda {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}
.cabecera-agenda h2 {
  margin: 0;
  font-size: 1.85rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--primary-dark);
}
.subtitulo {
  margin: 6px 0 0;
  color: #6f636a;
  font-size: 0.95rem;
}

/* ---------- Tira de resumen ---------- */
.tira-resumen {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.resumen-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #e7dde1;
  border-radius: 10px;
  padding: 10px 16px;
  font: inherit;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
}
.resumen-item:hover {
  border-color: var(--secondary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(133, 57, 83, 0.1);
}
.resumen-item.activo {
  border-color: var(--secondary);
  box-shadow: inset 0 0 0 1px var(--secondary);
}
.resumen-item--info { cursor: default; }
.resumen-item--info:hover { transform: none; border-color: #e7dde1; box-shadow: none; }

.resumen-numero {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--secondary);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.resumen-numero.alerta { color: #b45309; }
.resumen-etiqueta {
  font-size: 0.82rem;
  color: #6f636a;
  font-weight: 600;
}

/* ---------- Panel de filtros ---------- */
.panel-filtros {
  background: #ffffff;
  border: 1px solid rgba(133, 57, 83, 0.1);
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 25px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 4px 6px -1px rgba(44, 44, 44, 0.03), 0 10px 15px -3px rgba(44, 44, 44, 0.04);
}

.fila-chips {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.chip {
  border: 1.5px solid rgba(133, 57, 83, 0.2);
  background: #ffffff;
  color: #612D53;
  border-radius: 999px;
  padding: 8px 18px;
  font-size: 0.87rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.chip:hover {
  border-color: #853953;
  color: #853953;
  background: rgba(133, 57, 83, 0.06);
}
.chip--activo {
  background: #853953;
  border-color: #853953;
  color: #ffffff;
}
.chip--activo:hover { background: #612D53; border-color: #612D53; color: #ffffff; }
.chip:focus-visible { outline: 2px solid var(--terciary); outline-offset: 2px; }

.fila-campos {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  align-items: flex-end;
}
.campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 180px;
  flex: 1 1 180px;
}
.campo--fecha { flex: 0 1 165px; min-width: 150px; }
.campo label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 700;
  color: #8a7d83;
}

/* Contenedor común de select e input: mismo alto, mismo borde, mismo foco
   que .input-select.mini (Pagos/Gastos) */
.selector {
  position: relative;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1.5px solid rgba(133, 57, 83, 0.2);
  border-radius: 10px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.selector:focus-within {
  border-color: #853953;
  box-shadow: 0 0 0 4px rgba(133, 57, 83, 0.1);
}

.selector select,
.selector input {
  width: 100%;
  border: none;
  background: transparent;
  padding: 12px 16px;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--primary-dark);
  outline: none;
  cursor: pointer;
}

/* Flecha propia para el select, en lugar de la del sistema */
.selector select {
  appearance: none;
  padding-right: 34px;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23853953' d='M1.4 0 6 4.6 10.6 0 12 1.4 6 7.4 0 1.4z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 13px center;
}

/* Fecha: icono propio a la izquierda y todo el campo abre el calendario */
.selector--fecha { position: relative; }
.selector__icono {
  position: absolute;
  left: 12px;
  width: 17px;
  height: 17px;
  color: var(--secondary);
  opacity: 0.85;
  pointer-events: none;
}
.selector--fecha input[type="date"] {
  padding-left: 36px;
}
.selector--fecha input[type="date"]::-webkit-calendar-picker-indicator {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
.selector--fecha input[type="date"]::-webkit-datetime-edit {
  color: var(--primary-dark);
}

.btn-limpiar {
  background: none;
  border: none;
  color: var(--secondary);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 11px 4px;
  white-space: nowrap;
}
.btn-limpiar:hover { color: var(--terciary); text-decoration: underline; }

/* ---------- Celdas de la tabla ---------- */
.celda-asunto {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.asunto-texto {
  font-weight: 700;
  color: var(--primary-dark);
}
.asunto-cliente {
  font-size: 0.8rem;
  color: #8a7d83;
}

.tag-expediente {
  display: inline-block;
  font-family: "IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace;
  font-size: 0.8rem;
  padding: 3px 9px;
  border-radius: 6px;
  background: rgba(97, 45, 83, 0.09);
  color: var(--terciary);
  font-weight: 600;
}
.texto-tenue { color: #a99ba1; font-size: 0.85rem; }
.texto-lugar { font-size: 0.88rem; color: #5c5257; }

.celda-fecha {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.fecha-principal {
  font-variant-numeric: tabular-nums;
  color: var(--primary-dark);
  font-size: 0.9rem;
}
.fecha-relativa {
  align-self: flex-start;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.fecha-relativa.inminente { background: #fdf0e3; color: #9a4a06; }
.fecha-relativa.proxima { background: #eaf1f8; color: #1e4d78; }
.fecha-relativa.pasada { background: #f0eef0; color: #77707a; }

/* ---------- Estatus ---------- */
.badge-estatus {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
  white-space: nowrap;
}
.badge-estatus.programada { background: #e6eefb; color: #1d4ed8; }
.badge-estatus.realizada { background: #e3f4ea; color: #15803d; }
.badge-estatus.cancelada { background: #fce9e7; color: #b42318; }
.badge-estatus.diferida { background: #fdf0e3; color: #9a4a06; }

/* ---------- Acciones ---------- */
.btn-groupacciones {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.btn-accion {
  background: #faf7f8;
  border: 1px solid #e7dde1;
  border-radius: 9px;
  padding: 7px 11px;
  font-size: 1.05rem;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.12s, border-color 0.2s;
}
.btn-accion:hover {
  background: #f2e9ed;
  border-color: var(--secondary);
  transform: translateY(-1px);
}
.btn-accion.delete:hover { background: #fce9e7; border-color: #b42318; }
.btn-accion:focus-visible { outline: 2px solid var(--secondary); outline-offset: 2px; }

/* ---------- Estados vacíos ---------- */
.estado-msg,
.vacio {
  text-align: center;
  padding: 56px 20px;
  color: #8a7d83;
  background: #ffffff;
  border: 1px solid #e7dde1;
  border-radius: 14px;
}
.icon-large {
  font-size: 2.6rem;
  opacity: 0.45;
  display: block;
  margin-bottom: 12px;
}
.vacio p { margin: 0; font-weight: 600; color: #5c5257; }
.vacio-sub { font-size: 0.87rem; }
.mt-2 { margin-top: 14px; }

/* ---------- Botones base ---------- */
.btn-secundario {
  background: #ffffff;
  color: var(--primary-dark);
  border: 1px solid #ddd2d7;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-secundario:hover { background: #f6f1f3; }

.btn-primario {
  background: var(--secondary);
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}
.btn-primario:hover { background: var(--terciary); }

/* ---------- Modal de detalle ---------- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 14, 18, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}
.modal-card {
  background: #fff;
  border-radius: 14px;
  width: 100%;
  max-width: 660px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.22);
  border-top: 5px solid var(--secondary);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0e9ec;
}
.modal-header h3 { margin: 0; color: var(--primary-dark); font-size: 1.2rem; }
.btn-close {
  background: none;
  border: none;
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
  color: #a99ba1;
}
.btn-close:hover { color: var(--primary-dark); }

.modal-body {
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
.detalle-fila.full { grid-column: 1 / -1; }
.detalle-fila label {
  display: block;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 700;
  color: #8a7d83;
  margin-bottom: 6px;
}
.detalle-valor {
  background: #faf7f8;
  border-radius: 9px;
  padding: 11px 13px;
  color: var(--primary-dark);
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.93rem;
}
.detalle-valor.resaltado { font-weight: 700; }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 18px 24px;
  border-top: 1px solid #f0e9ec;
}

/* ---------- Tooltips ---------- */
.tooltip-custom { position: relative; }
.tooltip-custom::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 118%;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--primary-dark);
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.74rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.18s ease, visibility 0.18s ease;
  z-index: 10;
  pointer-events: none;
}
.tooltip-custom:hover::after { opacity: 1; visibility: visible; }

/* ---------- Responsivo ---------- */
@media (max-width: 760px) {
  .cabecera-agenda { flex-direction: column; align-items: stretch; }
  .campo, .campo--fecha { flex: 1 1 100%; }
  .modal-body { grid-template-columns: 1fr; }
  .tira-resumen .resumen-item { flex: 1 1 auto; }
}

@media (prefers-reduced-motion: reduce) {
  .resumen-item, .chip, .btn-accion, .selector { transition: none; }
  .resumen-item:hover, .btn-accion:hover { transform: none; }
}
</style>
