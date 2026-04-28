<template>
  <div class="dashboard-contenedor">
    
    <div class="cabecera-pagina">
      <div>
        <h2>Hola, {{ nombreUsuario }} 👋</h2>
        <p class="subtitulo">Aquí tienes el resumen de tu despacho al día de hoy.</p>
      </div>
      <div class="fecha-hoy">
        <span class="icon">📅</span> {{ fechaActual }}
      </div>
    </div>

    <div class="grid-resumen">
      <div class="tarjeta-stat">
        <div class="stat-icon client-icon">👥</div>
        <div class="stat-info">
          <h3>Clientes Registrados</h3>
          <p class="numero">{{ stats.clientes }}</p>
        </div>
      </div>
      
      <div class="tarjeta-stat">
        <div class="stat-icon case-icon">📂</div>
        <div class="stat-info">
          <h3>Casos Activos</h3>
          <p class="numero">{{ stats.casos }}</p>
        </div>
      </div>
      
      <div class="tarjeta-stat">
        <div class="stat-icon hearing-icon">⚖️</div>
        <div class="stat-info">
          <h3>Audiencias (7 días)</h3>
          <p class="numero">{{ stats.audiencias }}</p>
        </div>
      </div>
      
      <div class="tarjeta-stat">
        <div class="stat-icon money-icon">💰</div>
        <div class="stat-info">
          <h3>Ingresos del Mes</h3>
          <p class="numero">${{ stats.ingresos.toLocaleString() }}</p>
        </div>
      </div>
    </div>

    <div class="dashboard-contenido">
      
      <div class="panel-info">
        <div class="panel-header">
          <h3>Actividad Reciente</h3>
          <button class="btn-link">Ver todo</button>
        </div>
        <div class="lista-actividad">
          <div v-for="actividad in actividades" :key="actividad.id" class="item-actividad">
            <div class="avatar-mini">{{ actividad.iniciales }}</div>
            <div class="detalle-actividad">
              <p><strong>{{ actividad.usuario }}</strong> {{ actividad.accion }} en <em>{{ actividad.caso }}</em></p>
              <span class="tiempo">{{ actividad.tiempo }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="panel-info">
        <div class="panel-header">
          <h3>Próximos Vencimientos</h3>
        </div>
        <div class="lista-vencimientos">
          <div v-for="vencimiento in vencimientos" :key="vencimiento.id" class="item-vencimiento">
            <div class="info-vencimiento">
              <p class="titulo-caso">{{ vencimiento.caso }}</p>
              <span class="fecha-vencimiento">📅 {{ vencimiento.fecha }}</span>
            </div>
            <span :class="['badge-prioridad', vencimiento.prioridad.toLowerCase()]">
              {{ vencimiento.prioridad }}
            </span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';


const nombreUsuario = ref('Zacarias');

// Fecha actual formateada
const fechaActual = computed(() => {
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('es-MX', opciones);
});

// Datos Simulados para visualización
const stats = ref({
  clientes: 124,
  casos: 45,
  audiencias: 8,
  ingresos: 45200
});

const actividades = ref([
  { id: 1, iniciales: 'ZA', usuario: 'Zacarias', accion: 'registró un nuevo caso', caso: 'Divorcio Familia Pérez', tiempo: 'Hace 2 horas' },
  { id: 2, iniciales: 'LA', usuario: 'Luis', accion: 'actualizó el estado', caso: 'Mercantil Grupo Z', tiempo: 'Hace 5 horas' },
  { id: 3, iniciales: 'MR', usuario: 'María', accion: 'registró un pago', caso: 'Sucesorio Intestamentario', tiempo: 'Ayer' },
]);

const vencimientos = ref([
  { id: 1, caso: 'Exp. 124/2026 - Audiencia Inicial', fecha: 'Mañana, 10:00 AM', prioridad: 'Urgente' },
  { id: 2, caso: 'Exp. 089/2026 - Presentar Pruebas', fecha: '15 de Abril', prioridad: 'Alta' },
  { id: 3, caso: 'Exp. 045/2025 - Firma de Acuerdo', fecha: '20 de Abril', prioridad: 'Normal' },
]);

onMounted(() => {

  const nombre = localStorage.getItem('nombre');
  if (nombre) nombreUsuario.value = nombre;
});
</script>

<style scoped>
/* ====================================================
   ESTILOS DEL DASHBOARD (Adaptado a nueva paleta Guinda/Ciruela)
   ==================================================== */
.dashboard-contenedor {
  padding: 10px;
}

/* Cabecera */
.cabecera-pagina {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}
.cabecera-pagina h2 {
  color: var(--primary-dark); 
  font-size: 1.8rem;
  margin: 0 0 5px 0;
}
.subtitulo {
  color: #666;
  margin: 0;
}
.fecha-hoy {
  background-color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  color: var(--terciary); 
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

/* Tarjetas de Resumen */
.grid-resumen {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}
.tarjeta-stat {
  background: white;
  padding: 25px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  border-left: 4px solid var(--secondary); 
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.2s;
}
.tarjeta-stat:hover {
  transform: translateY(-3px);
}
.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

/* Iconos bañados en tu nueva paleta */
.client-icon { background-color: rgba(133, 57, 83, 0.1); color: var(--secondary); } 
.case-icon { background-color: rgba(97, 45, 83, 0.1); color: var(--terciary); } 
.hearing-icon { background-color: #edf2ff; color: #4c6ef5; } 
.money-icon { background-color: #ebfbee; color: #40c057; } 

.stat-info h3 { 
  margin: 0 0 5px 0; 
  color: #666; 
  font-size: 0.9rem; 
  font-weight: 500;
}
.numero { 
  margin: 0; 
  font-size: 1.8rem; 
  font-weight: 700; 
  color: var(--primary-dark); 
}


.dashboard-contenido {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

/* Paneles (Actividad y Vencimientos) */
.panel-info {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--primary); 
  padding-bottom: 15px;
}
.panel-header h3 {
  margin: 0;
  color: var(--primary-dark);
  font-size: 1.2rem;
}
.btn-link {
  background: none;
  border: none;
  color: var(--secondary);
  font-weight: 600;
  cursor: pointer;
}
.btn-link:hover { text-decoration: underline; }

/* Listas */
.lista-actividad, .lista-vencimientos {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.item-actividad {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #eee;
}
.item-actividad:last-child { border-bottom: none; padding-bottom: 0; }

.avatar-mini {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: var(--terciary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
}
.detalle-actividad p { margin: 0 0 5px 0; font-size: 0.95rem; color: var(--primary-dark); }
.tiempo { font-size: 0.8rem; color: #888; }

.item-vencimiento {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: var(--primary); 
  border-radius: 8px;
}
.titulo-caso { margin: 0 0 5px 0; font-weight: 600; font-size: 0.95rem; color: var(--primary-dark); }
.fecha-vencimiento { font-size: 0.8rem; color: #666; }

/* Badges de Prioridad alineados a tus colores */
.badge-prioridad {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}
.badge-prioridad.urgente { background-color: rgba(133, 57, 83, 0.15); color: var(--secondary); } 
.badge-prioridad.alta { background-color: #fff4e6; color: #e67700; }
.badge-prioridad.normal { background-color: rgba(97, 45, 83, 0.1); color: var(--terciary); }

/* Responsivo */
@media (max-width: 992px) {
  .dashboard-contenido {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .cabecera-pagina {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}
</style>