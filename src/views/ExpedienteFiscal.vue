<template>
  <div class="clientes-contenedor">
    <div class="cabecera-seccion">
      <div class="header-text">
        <button @click="regresar" class="btn-regresar">
          &larr; Volver al Directorio
        </button>
        <h2 v-if="perfil">{{ perfil.razon_social }}</h2>
        <h2 v-else>Cargando expediente fiscal...</h2>
        <p class="subtitulo" v-if="perfil">
          RFC: <span class="tag-materia">{{ perfil.rfc }}</span> | Régimen: {{ perfil.regimen_fiscal }}
        </p>
      </div>
    </div>

    <div v-if="cargando" class="estado-msg">
      <span class="spinner">⏳</span> Abriendo expediente contable...
    </div>

    <div v-else-if="perfil" class="tarjeta-sistema">
      
      <div class="tabs-nav">
        <button :class="['tab-btn', { active: pestanaActiva === 'perfil' }]" @click="pestanaActiva = 'perfil'">
          👤 Perfil y Accesos
        </button>
        <button :class="['tab-btn', { active: pestanaActiva === 'documentos' }]" @click="pestanaActiva = 'documentos'">
          📂 Documentos
        </button>
        <button :class="['tab-btn', { active: pestanaActiva === 'tramites' }]" @click="pestanaActiva = 'tramites'">
          📊 Declaraciones y Trámites
        </button>
        <button :class="['tab-btn', { active: pestanaActiva === 'pagos' }]" @click="pestanaActiva = 'pagos'">
          💰 Finanzas Contables
        </button>
      </div>

      <div class="tab-content">
        
        <div v-if="pestanaActiva === 'perfil'" class="animacion-fade">
          <h3>Información Base y Credenciales</h3>
          </div>

        <div v-if="pestanaActiva === 'documentos'" class="animacion-fade">
          <h3>Expediente de Documentos Fiscales</h3>
          </div>

        <div v-if="pestanaActiva === 'tramites'" class="animacion-fade">
          <h3>Control de Declaraciones y Obligaciones</h3>
          </div>

        <div v-if="pestanaActiva === 'pagos'" class="animacion-fade">
          <h3>Control de Honorarios y Pagos de Declaración</h3>
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
const token = localStorage.getItem("token");

const perfil = ref(null);
const cargando = ref(true);
const pestanaActiva = ref('perfil');

const regresar = () => {
  router.push('/contabilidad');
};

const cargarPerfilFiscal = async () => {
  try {
    const id = route.params.id;
    // Petición al endpoint que ya creamos en perfilFiscalController
    const res = await fetch(`http://localhost:3000/api/contabilidad/perfiles/cliente/tramites/${id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
      perfil.value = await res.json();
    } else {
      alert("No se encontró el perfil fiscal.");
      regresar();
    }
  } catch (error) {
    console.error("Error al cargar perfil:", error);
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  cargarPerfilFiscal();
});
</script>

<style scoped>
/* Reutiliza exactamente los mismos estilos de DetalleExpediente.vue (tabs, contenedores, etc.) */
.clientes-contenedor { padding: 20px; }
.cabecera-seccion { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.header-text h2 { color: var(--primary-dark); font-size: 1.8rem; margin: 10px 0 5px 0; }
.subtitulo { color: #666; margin: 0; font-family: monospace; font-size: 1rem; }
.tarjeta-sistema { background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); }
.btn-regresar { background: none; border: none; color: #666; cursor: pointer; font-weight: 600; padding: 0; margin-bottom: 5px; font-size: 1.2rem; }
.tabs-nav { display: flex; border-bottom: 2px solid #eee; margin-bottom: 25px; gap: 10px; }
.tab-btn { padding: 12px 20px; background: none; border: none; cursor: pointer; font-weight: 600; color: #888; font-size: 0.95rem; border-bottom: 3px solid transparent; transition: all 0.3s ease; }
.tab-btn.active { color: var(--secondary); border-bottom-color: var(--secondary); }
.tag-materia { display: inline-block; font-size: 0.85rem; padding: 3px 8px; border-radius: 4px; background-color: rgba(97, 45, 83, 0.1); color: var(--terciary); font-weight: 600; }
.animacion-fade { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>