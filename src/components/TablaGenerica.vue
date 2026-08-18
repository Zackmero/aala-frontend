
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
        <span class="search-icon">🔍</span>
        <input
          v-model="filtroBusqueda"
          type="text"
          :placeholder="placeholderBuscador"
          class="input-buscador"
        />
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
  margin-bottom: 20px;
}
.buscador-wrapper {
  position: relative;
  flex-grow: 1;
  max-width: 400px;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 12px;
  color: var(--secondary);
}
.input-buscador {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid var(--secondary);
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
}

.input-buscador:focus {
  border-color: var(--primary-dark);
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