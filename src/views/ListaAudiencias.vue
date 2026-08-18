<template>
  <div class="clientes-contenedor">
    <div v-if="cargando" class="estado-msg">
      <span class="spinner">⏳</span> Cargando información...
    </div>

    <div v-else class="tarjeta-sistema mt-4">
      <!-- Tabla puramente visual sin botones de edición ni apertura -->
      <!-- Solo un botón para regresar, sin opciones de creación -->
      <button class="btn-secundario" @click="router.push('/')">
        ⬅ Volver al Dashboard
      </button>
      <div v-if="listaAudiencias.length > 0" class="responsive-table-container">
        <TablaGenerica
          :titulo="'Audiencias Programadas'"
          :mostrar-boton-nuevo="false"
          :subtitulo="'Visualización de todas las audiencias registradas en el sistema'"
          :columnas="[
            { label: '⚖️ Asunto', key: 'titulo', clase: 'resaltado' },
            { label: '📋 Expediente', key: 'numero_expediente', clase: '' },
            { label: '📅 Fecha y Hora', key: 'fecha_hora', clase: '' },
            { label: '📍Ubicación', key: 'lugar', clase: '' },
            { label: '📊 Estatus', key: 'estatus', clase: '' },
            { label: '🔧 Acciones', key: 'acciones', clase: '' },
          ]"
          :datos="listaAudiencias"
          :cargando="cargando"
          :mensajeCarga="'Cargando audiencias...'"
          :placeholderBuscador="'Buscar audiencia...'"
        >
          <!-- Slot para la columna 'titulo' -->
          <template #fecha_hora="{ item }">
            <span class="">
              {{ formato.formatearFechaHoraCorta(item.fecha_hora) }}</span
            >
          </template>

          <!-- Slot para la columna 'estatus' -->
          <template #estatus="{ item }">
            <span :class="['badge-estatus', item.estatus.toLowerCase()]">
              {{ item.estatus }}
            </span>
          </template>

          Slot para la columna de acciones
          <template #acciones="{ item }">
            <div class="btn-groupacciones" style="justify-content: center">
              <!-- Botón que ejecuta la función y pasa los datos de esta fila -->
              <button
                @click="irADetalles(item)"
                class="btn-primario tooltip-custom"
                style="padding: 6px 12px; font-size: 1.2rem; cursor: pointer;"
                data-tooltip="Ir a expediente vinculado"
              >
                👁️
              </button>
            </div>
          </template>
        </TablaGenerica>
      </div>

      <div v-else class="vacio">
        <span class="icon-large">⚖️</span>
        <p>No hay audiencias registradas para mostrar.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import TablaGenerica from "../components/TablaGenerica.vue";

// Importación de todo el archivo de utilidades
import * as formato from "../utils/Formatos.js";

const token = localStorage.getItem("token");

const router = useRouter();
const listaAudiencias = ref([]);
const cargando = ref(true);

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

const cargarAudienciasVisualizacion = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/audiencias`, {
      headers,
    });
    listaAudiencias.value = await res.json();
  } catch (e) {
    console.error(e);
  } finally {
    cargando.value = false;
  }
};

const irADetalles = (audiencia) => {
  // Verificamos que la audiencia tenga un expediente vinculado
  if (audiencia.expediente_id) {
    // Redirigimos a la vista del expediente usando su ID
    router.push(`/expedientes/${audiencia.expediente_id}`);
  } else {
    alert("Esta audiencia no tiene un expediente legal vinculado.");
  }
};

onMounted(() => {
  cargarAudienciasVisualizacion();
});
</script>

<style scoped>
/* Estilos para mantener la congruencia con el resto del sistema */
.clientes-contenedor {
  padding: 20px;
}
.cabecera-seccion {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.header-text h2 {
  color: var(--primary-dark);
  font-size: 1.8rem;
  margin: 10px 0 5px 0;
}
.subtitulo {
  color: #666;
  margin: 0;
  font-family: monospace;
  font-size: 1rem;
}
.tarjeta-sistema {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
.btn-secundario {
  background-color: white;
  color: var(--primary-dark);
  border: 1px solid #ccc;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
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
  background-color: var(--primary);
  padding: 12px 15px;
  color: var(--primary-dark);
  font-weight: 600;
  border-bottom: 2px solid #ddd;
}
.tabla-profesional td {
  padding: 15px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}
.resaltado {
  font-weight: 600;
  color: var(--primary-dark);
}
.badge-estatus {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 400;
  display: inline-block;
}
/* Agrega las clases de colores de estatus que necesites */
.badge-estatus.programada {
  background: #eeff00;
  color: #000000;
}
.badge-estatus.realizada {
  background: #dcfce7;
  color: #166534;
}
.badge-estatus.cancelada {
  background: #fee2e2;
  color: #991b1b;
}

.vacio {
  text-align: center;
  padding: 40px 20px;
  color: #888;
}
.icon-large {
  font-size: 3rem;
  opacity: 0.5;
  margin-bottom: 10px;
  display: block;
}

.tooltip-custom {
  position: relative;
  display: inline-flex;
  border: none;
}

.tooltip-custom::after {
  content: attr(data-tooltip); /* Toma el texto del atributo data-tooltip */
  position: absolute;
  bottom: 110%; /* Lo posiciona arriba del botón */
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--primary-dark);
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.2s ease,
    visibility 0.2s ease;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

/* Triangulito del tooltip */
.tooltip-custom::before {
  content: "";
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 5px;
  border-style: solid;
  border-color: var(--primary-dark) transparent transparent transparent;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.2s ease,
    visibility 0.2s ease;
}

/* Mostrar al hacer hover */
.tooltip-custom:hover::after,
.tooltip-custom:hover::before {
  opacity: 1;
  visibility: visible;
}
</style>
