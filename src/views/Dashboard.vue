<template>
  <div class="dashboard-contenedor">
    <div class="cabecera-pagina">
      <div>
        <h2>Hola, {{ nombreUsuario }} 👋</h2>
        <p class="subtitulo">
          Aquí tienes el resumen de tu despacho al día de hoy.
        </p>
      </div>
      <div class="fecha-hoy">
        <span class="icon">📅</span> {{ fechaActual }}
      </div>
    </div>

    <div v-if="errorMensaje" class="aviso-error">
      <span>⚠️</span>
      <p>{{ errorMensaje }}</p>
      <button @click="cargarDashboard" class="btn-reintentar">Reintentar</button>
    </div>

    <!--TODO CARDS DE ESTADISTICAS -->
    <div class="grid-resumen">
      <div class="tarjeta-stat">
        <div class="stat-icon client-icon">👥</div>
        <div class="stat-info">
          <h3>Clientes Registrados</h3>
          <p class="numero">{{ cargando ? "—" : stats.clientes }}</p>
        </div>
      </div>

      <div class="tarjeta-stat">
        <div class="stat-icon case-icon">📂</div>
        <div class="stat-info">
          <h3>Casos Activos</h3>
          <p class="numero">{{ cargando ? "—" : stats.casos }}</p>
        </div>
      </div>

      <div class="tarjeta-stat">
        <div class="stat-icon hearing-icon">⚖️</div>
        <div class="stat-info">
          <h3>Audiencias (7 días)</h3>
          <p class="numero">{{ cargando ? "—" : stats.audiencias }}</p>
        </div>
      </div>

      <div class="tarjeta-stat">
        <div class="stat-icon money-icon">💰</div>
        <div class="stat-info">
          <h3>Cobrado este mes</h3>
          <p class="numero">
            {{ cargando ? "—" : formato.formatoMoneda(stats.ingresos) }}
          </p>
          <p v-if="!cargando && stats.vencidoPorCobrar > 0" class="stat-nota">
            {{ formato.formatoMoneda(stats.vencidoPorCobrar) }} vencido por cobrar
          </p>
        </div>
      </div>
    </div>

     
    <!--? RESUMEN DE ACTIVIDADES Y VENCIMIENTOS -->
    <div class="dashboard-contenido">

    <!--TODO ACTIVIDADES RECIENTES  -->
      <div class="panel-info">
        <div class="panel-header">
          <h3>Actividad Reciente</h3>
          <button class="btn-link">Ver todo</button>
        </div>
        <div class="lista-actividad">
          <div v-if="actividades.length === 0" class="vacio">
            <span class="icon-large">📋</span>
            <p>PRÓXIMAMENTE</p>
            <span class="vacio-sub">Espera a las actualizaciones</span>
          </div>
          <div
            v-if="actividades.length !== 0"
            v-for="actividad in actividades"
            :key="actividad.id"
            class="item-actividad"
          >
            <div class="avatar-mini">{{ actividad.iniciales }}</div>
            <div class="detalle-actividad">
              <p>
                <strong>{{ actividad.usuario }}</strong>
                {{ actividad.accion }} en <em>{{ actividad.caso }}</em>
              </p>
              <span class="tiempo">{{ actividad.tiempo }}</span>
            </div>
          </div>
        </div>
      </div>


      <!--TODO PROXIMOS VENCIMIENTOS -->
      <div class="panel-info">
        <div class="panel-header">
          <h3>Próximos Vencimientos</h3>
          <button class="btn-link" @click="verListaAudiencias">Ver todo</button>
        </div>
        
        <div class="lista-vencimientos">
          <!-- Estado vacío por si no hay vencimientos -->
          <div v-if="vencimientos.length === 0" class="vacio">
            <span class="icon-large">🎉</span>
            <p>¡Todo al día!</p>
            <span class="vacio-sub">No tienes vencimientos próximos</span>
          </div>

          <div
            v-for="vencimiento in vencimientos"
            :key="vencimiento.id"
            class="item-vencimiento"
          >
            <div class="info-vencimiento">
              <p class="titulo-caso">
                {{ vencimiento.descripcion }}
              </p>
              <span class="fecha-vencimiento">
                <span class="icon-small">📅</span> {{ formato.formatearFechaHoraTexto(vencimiento.fecha) }}
              </span>
            </div>
            
            <div class="badges-container">
              <span :class="['badge-prioridad', (vencimiento.prioridad || 'Media').toLowerCase()]">
                {{ vencimiento.prioridad || 'Media' }}
              </span>
              <span class="badge-tipo">
                {{ vencimiento.tipo }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import * as formato  from "../utils/Formatos.js";
import router from "../router/index.js";
import { API_URL } from "../services/api.js";

const nombreUsuario = ref("");
const token = localStorage.getItem("token");

const inicial = computed(() => {
  return nombreUsuario.value
    ? nombreUsuario.value.charAt(0).toUpperCase()
    : "U";
});

// Fecha actual formateada
const fechaActual = computed(() => {
  const opciones = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date().toLocaleDateString("es-MX", opciones);
});

  // ESTADISTICAS CARDS DASHBOARD
const cargando = ref(true);
const errorMensaje = ref("");

const stats = ref({
  clientes: 0,
  casos: 0,
  audiencias: 0,
  ingresos: 0,
  vencidoPorCobrar: 0,
});

  // ACTIVIDADES RECIENTES
const actividades = ref([
  // {
  //   id: 1,
  //   iniciales: "ZA",
  //   usuario: "Zacarias",
  //   accion: "registró un nuevo caso",
  //   caso: "Divorcio Familia Pérez",
  //   tiempo: "Hace 2 horas",
  // },
  // {
  //   id: 2,
  //   iniciales: "LA",
  //   usuario: "Luis",
  //   accion: "actualizó el estado",
  //   caso: "Mercantil Grupo Z",
  //   tiempo: "Hace 5 horas",
  // },
  // {
  //   id: 3,
  //   iniciales: "MR",
  //   usuario: "María",
  //   accion: "registró un pago",
  //   caso: "Sucesorio Intestamentario",
  //   tiempo: "Ayer",
  // },
]);

  // PROXIMOS VENCIMIENTOS
const vencimientos = ref([]);

// RESUMEN DEL DESPACHO
// Una sola petición en vez de cuatro. Antes cada tarjeta pedía la lista
// completa y contaba en el navegador, así que "Casos Activos" incluía los
// cerrados, "Audiencias (7 días)" eran todas las de la historia e "Ingresos
// del Mes" sumaba todos los cobros, incluidos los que nadie había pagado.
const cargarResumen = async () => {
  try {
    const res = await fetch(`${API_URL}/dashboard/resumen`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("No se pudo cargar el resumen del despacho");

    const data = await res.json();
    stats.value = {
      clientes: data.clientes ?? 0,
      casos: data.casos ?? 0,
      audiencias: data.audiencias ?? 0,
      ingresos: data.ingresos ?? 0,
      vencidoPorCobrar: data.vencidoPorCobrar ?? 0,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
// OBTENER PROXIMOS VENCIMIENTOS
const obtenerVencimientos = async () => {
  const res = await fetch(`${API_URL}/dashboard/proximos-vencimientos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("No se pudieron cargar los próximos vencimientos");

  const data = await res.json();
  vencimientos.value = Array.isArray(data) ? data : [];
};

const verListaAudiencias = () => {
  router.push({ name: "ListaAudiencias" });
};

// Las dos peticiones van en paralelo y un solo mensaje en pantalla sustituye
// a los cinco alert() que salían uno tras otro cuando el servidor no
// respondía (típico cuando Render acaba de despertar).
const cargarDashboard = async () => {
  cargando.value = true;
  errorMensaje.value = "";
  try {
    await Promise.all([cargarResumen(), obtenerVencimientos()]);
  } catch (error) {
    errorMensaje.value =
      "No se pudo cargar la información del despacho. Si acabas de abrir el " +
      "sistema, el servidor puede tardar unos segundos en responder.";
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  nombreUsuario.value = localStorage.getItem("nombre") || "Usuario";
  cargarDashboard();
});
</script>

<style scoped>
/* Aviso de error del dashboard */
.aviso-error {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fef3f2;
  border: 1px solid #fecdca;
  color: #7a271a;
  padding: 14px 18px;
  border-radius: 10px;
  margin-bottom: 24px;
}
.aviso-error p { margin: 0; flex: 1; }
.btn-reintentar {
  background: #fff;
  border: 1px solid #fecdca;
  color: #7a271a;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.btn-reintentar:hover { background: #fee4e2; }
.stat-nota {
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: #b42318;
  font-weight: 600;
}

/* ====================================================
   ESTILOS DEL DASHBOARD (Diseño Premium Moderno)
   ==================================================== */
.dashboard-contenedor {
  padding: 25px 30px;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Cabecera */
.cabecera-pagina {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 35px;
}

.cabecera-pagina h2 {
  color: var(--primary-dark);
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.subtitulo {
  color: #64748b;
  margin: 0;
  font-size: 1rem;
}

.fecha-hoy {
  background-color: #ffffff;
  padding: 10px 20px;
  border-radius: 30px; /* Estilo píldora */
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--primary-dark);
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Tarjetas de Resumen */
.grid-resumen {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 35px;
}

.tarjeta-stat {
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 10px 15px -3px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0,0,0,0.03);
  display: flex;
  align-items: center;
  gap: 18px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* Pequeño acento de color en el borde izquierdo (invisible hasta hover) */
.tarjeta-stat::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background-color: var(--secondary);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tarjeta-stat:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.06);
}

.tarjeta-stat:hover::before {
  opacity: 1;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  transition: transform 0.3s ease;
}

.tarjeta-stat:hover .stat-icon {
  transform: scale(1.1);
}

/* Iconos con fondos suaves y modernos */
.client-icon {
  background: linear-gradient(135deg, rgba(133, 57, 83, 0.15) 0%, rgba(133, 57, 83, 0.05) 100%);
  color: var(--secondary);
}
.case-icon {
  background: linear-gradient(135deg, rgba(97, 45, 83, 0.15) 0%, rgba(97, 45, 83, 0.05) 100%);
  color: var(--terciary);
}
.hearing-icon {
  background: linear-gradient(135deg, #f0f4ff 0%, #d9e2ff 100%);
  color: #4c6ef5;
}
.money-icon {
  background: linear-gradient(135deg, #ebfbee 0%, #d3f9d8 100%);
  color: #2b8a3e;
}

.stat-info h3 {
  margin: 0 0 6px 0;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.numero {
  margin: 0;
  font-size: 1.9rem;
  font-weight: 800;
  color: var(--primary-dark);
  letter-spacing: -0.5px;
}

/* Layout Principal de Contenido */
.dashboard-contenido {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 24px;
}

/* Paneles Blancos */
.panel-info {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 10px 15px -3px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.panel-header h3 {
  margin: 0;
  color: var(--primary-dark);
  font-size: 1.25rem;
  font-weight: 700;
}

.btn-link {
  background: rgba(0, 0, 0, 0.04);
  border: none;
  color: var(--secondary);
  font-weight: 600;
  font-size: 0.85rem;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-link:hover {
  background: var(--secondary);
  color: #ffffff;
}

/* Estados Vacíos más elegantes */
.vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  text-align: center;
}
.vacio .icon-large {
  font-size: 3rem;
  opacity: 0.5;
  margin-bottom: 10px;
}
.vacio p {
  color: var(--primary-dark);
  font-weight: 700;
  margin: 0 0 5px 0;
}
.vacio-sub {
  color: #94a3b8;
  font-size: 0.9rem;
}

/* Listas */
.lista-actividad,
.lista-vencimientos {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex-grow: 1;
}

/* Items Actividad */
.item-actividad {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 12px;
  border-radius: 10px;
  transition: background-color 0.2s ease;
}

.item-actividad:hover {
  background-color: rgba(0,0,0,0.02);
}

.avatar-mini {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background-color: var(--terciary);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  flex-shrink: 0;
}

.detalle-actividad p {
  margin: 0 0 4px 0;
  font-size: 0.95rem;
  color: #334155;
  line-height: 1.4;
}

.detalle-actividad strong {
  color: var(--primary-dark);
}

.detalle-actividad em {
  font-style: normal;
  font-weight: 600;
  color: var(--secondary);
}

.tiempo {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 500;
}

/* Items Vencimientos */
.item-vencimiento {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.02);
  border-left: 4px solid var(--secondary);
  border-radius: 10px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.item-vencimiento:hover {
  transform: translateX(4px);
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.info-vencimiento {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.titulo-caso {
  margin: 0;
  font-weight: 700;
  font-size: 1rem;
  color: var(--primary-dark);
}

.fecha-vencimiento {
  font-size: 0.9rem;
  color: #b91c1c;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

.icon-small {
  font-size: 0.9rem;
}

.badges-container {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Badges de Prioridad (Estilo moderno) */
.badge-prioridad, .badge-tipo {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-tipo {
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.badge-prioridad.urgente {
  background-color: #fee2e2;
  color: #b91c1c;
}
.badge-prioridad.alta {
  background-color: #fef9c3;
  color: #a16207;
}
.badge-prioridad.media {
  background-color: rgba(133, 57, 83, 0.1);
  color: var(--secondary);
}
.badge-prioridad.baja {
  background-color: #f1f5f9;
  color: #64748b;
}

/* Responsivo */
@media (max-width: 1024px) {
  .dashboard-contenido {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-contenedor {
    padding: 15px;
  }
  .cabecera-pagina {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  .item-vencimiento {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>