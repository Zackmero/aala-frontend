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
          Juzgado: {{ expediente.numero_expediente_judicial || 'Sin asignar' }}
        </p>
      </div>
      <button class="btn-secundario" v-if="expediente">
        ⚙️ Opciones del Caso
      </button>
    </div>

    <div v-if="cargando" class="estado-msg">
      <span class="spinner">⏳</span> Abriendo carpeta legal...
    </div>

    <div v-else-if="expediente" class="tarjeta-sistema">
      
      <div class="resumen-rapido">
        <div class="dato-pill">
          <span class="label">Estatus:</span>
          <span class="badge-estatus activo">Activo</span> </div>
        <div class="dato-pill">
          <span class="label">Prioridad:</span>
          <span class="valor">🔥 {{ expediente.prioridad || 'Media' }}</span>
        </div>
        <div class="dato-pill">
          <span class="label">Apertura:</span>
          <span class="valor">📅 {{ formatearFecha(expediente.fecha_apertura) }}</span>
        </div>
      </div>

      <div class="tabs-nav">
        <button 
          :class="['tab-btn', { active: pestanaActiva === 'resumen' }]"
          @click="pestanaActiva = 'resumen'"
        >
          📄 Resumen
        </button>
        <button 
          :class="['tab-btn', { active: pestanaActiva === 'documentos' }]"
          @click="pestanaActiva = 'documentos'"
        >
          📂 Documentos
        </button>
        <button 
          :class="['tab-btn', { active: pestanaActiva === 'pagos' }]"
          @click="pestanaActiva = 'pagos'"
        >
          💰 Pagos
        </button>
        <button 
          :class="['tab-btn', { active: pestanaActiva === 'audiencias' }]"
          @click="pestanaActiva = 'audiencias'"
        >
          ⚖️ Audiencias
        </button>
      </div>

      <div class="tab-content">
        
        <div v-if="pestanaActiva === 'resumen'" class="animacion-fade">
          <div class="form-grid">
            <div class="grupo-input full">
              <label>Descripción y Hechos Iniciales</label>
              <div class="caja-texto-lectura">
                {{ expediente.descripcion || 'Sin descripción registrada.' }}
              </div>
            </div>
            
            <div class="grupo-input mt-3">
              <label>Cliente Vinculado</label>
              <div class="caja-texto-lectura clickeable">
                👤 ID Cliente: #{{ expediente.cliente_id }} 
              </div>
            </div>

            <div class="grupo-input mt-3">
              <label>Fecha de Cierre Esperada</label>
              <div class="caja-texto-lectura">
                🗓️ {{ formatearFecha(expediente.fecha_cierre_esperada) || 'No definida' }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="pestanaActiva === 'documentos'" class="animacion-fade">
          <div class="tab-header-accion">
            <h3>Archivos del Expediente</h3>
            <button class="btn-primario mini">+ Subir PDF</button>
          </div>
          <div class="vacio">
            <span class="icon-large">📂</span>
            <p>Aún no hay documentos subidos a este caso.</p>
          </div>
        </div>

        <div v-if="pestanaActiva === 'pagos'" class="animacion-fade">
          <div class="tab-header-accion">
            <h3>Control Financiero</h3>
            <button class="btn-primario mini">+ Registrar Pago</button>
          </div>
          <div class="vacio">
            <span class="icon-large">💵</span>
            <p>No hay registro de pagos o anticipos para este cliente.</p>
          </div>
        </div>

        <div v-if="pestanaActiva === 'audiencias'" class="animacion-fade">
          <div class="tab-header-accion">
            <h3>Agenda Judicial</h3>
            <button class="btn-primario mini">+ Programar Cita</button>
          </div>
          <div class="vacio">
            <span class="icon-large">⚖️</span>
            <p>No hay audiencias programadas en el juzgado.</p>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const expediente = ref(null);
const cargando = ref(true);
const pestanaActiva = ref('resumen'); 


const formatearFecha = (fechaString) => {
  if (!fechaString) return null;
  const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(fechaString).toLocaleDateString('es-MX', opciones);
};

const regresar = () => {
  router.push('/expedientes');
};

onMounted(async () => {
  try {
  
    const id = route.params.id; 
  
    const respuesta = await fetch(`http://localhost:3000/api/expedientes/${id}`);
    
    if (!respuesta.ok) throw new Error("No se pudo cargar el expediente");
    
    expediente.value = await respuesta.json();
    
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
   ESTILOS BASE (Tus clases existentes)
   ==================================================== */
.clientes-contenedor { padding: 20px; }
.cabecera-seccion { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.header-text h2 { color: var(--primary-dark); font-size: 1.8rem; margin: 10px 0 5px 0; }
.subtitulo { color: #666; margin: 0; font-family: monospace; font-size: 1rem;}
.tarjeta-sistema { background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
.estado-msg { text-align: center; padding: 50px; font-size: 1.2rem; color: #666; }

/* Botones */
.btn-regresar { background: none; border: none; color: #666; cursor: pointer; font-weight: 600; padding: 0; margin-bottom: 5px; font-size: 0.9rem; transition: color 0.2s;}
.btn-regresar:hover { color: var(--secondary); }
.btn-primario { background-color: var(--secondary); color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-primario:hover { background-color: var(--terciary); }
.btn-primario.mini { padding: 8px 15px; font-size: 0.85rem; }
.btn-secundario { background-color: white; color: var(--primary-dark); border: 1px solid #ccc; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; }

/* Resumen Rápido Superior */
.resumen-rapido { display: flex; gap: 15px; margin-bottom: 30px; padding: 15px; background: #f9f9f9; border-radius: 8px; border-left: 4px solid var(--secondary);}
.dato-pill { display: flex; flex-direction: column; gap: 4px; padding-right: 20px; border-right: 1px solid #ddd;}
.dato-pill:last-child { border-right: none; }
.dato-pill .label { font-size: 0.75rem; color: #777; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;}
.dato-pill .valor { font-weight: 600; color: var(--primary-dark); font-size: 0.95rem;}
.badge-estatus.activo { background-color: rgba(133, 57, 83, 0.1); color: var(--secondary); padding: 3px 10px; border-radius: 15px; font-size: 0.85rem; font-weight: 700;}

/* ====================================================
   SISTEMA DE PESTAÑAS (TABS)
   ==================================================== */
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
.tab-btn:hover { color: var(--terciary); }
.tab-btn.active {
  color: var(--secondary);
  border-bottom-color: var(--secondary);
}

.tab-content { min-height: 250px; }
.animacion-fade { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

/* Elementos Internos de Pestañas */
.tab-header-accion { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #eee; padding-bottom: 15px; margin-bottom: 20px;}
.tab-header-accion h3 { margin: 0; color: var(--terciary); font-size: 1.2rem;}

.caja-texto-lectura { padding: 15px; background: #fafafa; border: 1px solid #eee; border-radius: 6px; color: #444; line-height: 1.5; font-size: 0.95rem;}
.caja-texto-lectura.clickeable { cursor: pointer; color: var(--secondary); font-weight: 600; transition: background 0.2s;}
.caja-texto-lectura.clickeable:hover { background: #f0f0f0; }

.vacio { text-align: center; padding: 40px 20px; color: #888; }
.icon-large { font-size: 3rem; opacity: 0.5; margin-bottom: 10px; display: block;}


.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.grupo-input { display: flex; flex-direction: column; }
.grupo-input.full { grid-column: 1 / -1; }
.grupo-input label { font-weight: 600; color: var(--primary-dark); font-size: 0.9rem; margin-bottom: 8px; }
.mt-3 { margin-top: 15px; }
</style>