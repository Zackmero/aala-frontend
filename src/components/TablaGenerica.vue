
<template>
  <div class="clientes-contenedor">
    <div class="cabecera-seccion">
      <div class="header-text">
        <h2>{{ titulo }}</h2>
        <p class="subtitulo">{{ subtitulo }}</p>
      </div>
      <!-- Botón dinámico, emite un evento al componente padre -->
      <button v-if="mostrarBotonNuevo" @click="$emit('nuevo')" class="btn-primario">
        <span class="icon">+</span> {{ textoBoton }}
      </button>
    </div>

    <div class="toolbar-tabla">
      <div class="buscador-wrapper">
        <svg class="search-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <circle cx="8.8" cy="8.8" r="5.6" fill="none" stroke="currentColor" stroke-width="1.7"/>
          <path d="M13 13l4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
        </svg>
        <input
          v-model="filtroBusqueda"
          type="text"
          :placeholder="placeholderBuscador"
          class="input-buscador"
        />
      </div>
      <!-- La vista que use la tabla puede colgar aquí sus propios filtros -->
      <div class="toolbar-extras">
        <slot name="filtros"></slot>
      </div>
    </div>

    <div class="tarjeta-sistema">
      <div v-if="cargando" class="estado-msg">
        {{ mensajeCarga }}
      </div>

      <div v-else class="responsive-table-container">
        <table class="tabla-profesional">
          <thead>
            <tr>
              <!-- Renderizamos las columnas pasadas por props -->
              <th v-for="(columna, index) in columnas" :key="index" :class="columna.clase">
                {{ columna.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="datosPaginados.length === 0">
              <td :colspan="columnas.length" class="vacio">No se encontraron registros.</td>
            </tr>
            <!-- Iteramos los datos paginados -->
            <tr v-for="item in datosPaginados" :key="item.id || item._id">
              <!-- Usamos un slot dinámico para cada columna, permitiendo personalizar el contenido desde el padre -->
              <td v-for="(columna, index) in columnas" :key="index" :class="columna.claseCelda">
                <slot :name="columna.key" :item="item">
                  <!-- Valor por defecto si no se usa el slot -->
                  {{ item[columna.key] }}
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="paginacion-container" v-if="datosFiltrados.length > 0">
        <span class="info-paginacion">
          Mostrando {{ indiceInicio + 1 }} a {{ indiceFin }} de
          {{ datosFiltrados.length }}
        </span>
        <div class="botones-paginacion">
          <button
            :disabled="paginaActual === 1"
            @click="paginaActual--"
            class="btn-page"
          >
            Anterior
          </button>
          <span class="page-current"
            >{{ paginaActual }} / {{ totalPaginas }}</span
          >
          <button
            :disabled="paginaActual === totalPaginas"
            @click="paginaActual++"
            class="btn-page"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

// Definición de Props para hacer el componente reutilizable
const props = defineProps({
  titulo: { type: String, required: true },
  subtitulo: { type: String, default: "" },
  datos: { type: Array, required: true },
  columnas: { type: Array, required: true }, // Ej: [{ key: 'nombre', label: 'Nombre Completo' }]
  cargando: { type: Boolean, default: false },
  mensajeCarga: { type: String, default: "Cargando datos..." },
  mostrarBotonNuevo: { type: Boolean, default: true },
  textoBoton: { type: String, default: "Nuevo Registro" },
  placeholderBuscador: { type: String, default: "Buscar..." },
  itemsPorPagina: { type: Number, default: 6 }
});

defineEmits(['nuevo']);

// --- ESTADOS ---
const filtroBusqueda = ref("");
const paginaActual = ref(1); 

// --- LÓGICA DE FILTRADO Y PAGINACIÓN ---
const datosFiltrados = computed(() => {
  if (!filtroBusqueda.value) return props.datos;
  const t = filtroBusqueda.value.toLowerCase();
  
  // Búsqueda genérica en todas las propiedades del objeto
  return props.datos.filter(item => {
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(t)
    );
  });
});

const totalPaginas = computed(
  () => Math.ceil(datosFiltrados.value.length / props.itemsPorPagina) || 1,
);

const datosPaginados = computed(() => {
  const i = (paginaActual.value - 1) * props.itemsPorPagina;
  return datosFiltrados.value.slice(i, i + props.itemsPorPagina);
});

const indiceInicio = computed(
  () => (paginaActual.value - 1) * props.itemsPorPagina,
);
const indiceFin = computed(() =>
  Math.min(
    indiceInicio.value + props.itemsPorPagina,
    datosFiltrados.value.length,
  ),
);

watch(filtroBusqueda, () => {
  paginaActual.value = 1;
});
</script>

<style scoped>
.clientes-contenedor {
  width: 100%;
  margin-top: 5px;
}

.cabecera-seccion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.header-text h2 {
  margin: 0;
  color: var(--primary-dark);
  font-size: 1.8rem;
  font-weight: 700;
}

.subtitulo {
  color: var(--secondary);
  margin: 5px 0 0;
}

/* Buscador */
.toolbar-tabla {
  margin-bottom: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}
.toolbar-extras {
  display: flex;
  align-items: center;
  gap: 12px;
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
  width: 17px;
  height: 17px;
  color: var(--terciary);
  opacity: 0.85;
  pointer-events: none;
}
.input-buscador {
  width: 100%;
  padding: 14px 16px 14px 45px;
  border: 1.5px solid rgba(133, 57, 83, 0.2);
  border-radius: 12px;
  font-size: 1rem;
  background-color: #ffffff;
  color: var(--primary-dark);
  box-shadow: 0 2px 6px rgba(44, 44, 44, 0.02);
  transition: all 0.3s ease;
  box-sizing: border-box;
  outline: none;
}

.input-buscador:focus {
  border-color: var(--secondary);
  box-shadow: 0 0 0 4px rgba(133, 57, 83, 0.1);
}

/* Tabla */
.tarjeta-sistema {
  background: var(--primary);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid var(--border-light);
}

.tabla-profesional {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.tabla-profesional th {
  background: var(--secondary);
  color: var(--primary);
  padding: 15px;
  font-size: 0.85rem;
  text-transform: uppercase;
  border-bottom: 2px solid var(--secondary);
  letter-spacing: 0.5px;
}

.tabla-profesional td {
  padding: 15px;
  border-bottom: 1px solid var(--border-light);
  color: var(--primary-dark);
  vertical-align: middle;
}

.vacio {
  text-align: center;
  padding: 30px;
  color: var(--secondary);
}

/* Paginación */
.paginacion-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: var(--primary);
  border-top: 1px solid var(--secondary);
}
.info-paginacion {
  font-size: 0.9rem;
  color: var(--primary-dark);
}

.btn-page {
  padding: 8px 16px;
  border: 1px solid var(--border-light);
  background: var(--primary);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  color: var(--secondary);
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-current {
  font-weight: 600;
  color: var(--primary-dark);
  margin: 0 10px;
}

.btn-primario {
  background: var(--secondary);
  color: var(--primary);
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.3s;
}

.btn-primario:hover {
  background: var(--terciary);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .cabecera-seccion {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  .btn-primario {
    width: 100%;
  }
}
</style>