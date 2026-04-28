<template>
  <div class="clientes-contenedor">
    <div class="cabecera-seccion">
      <div class="header-text">
        <h2>Control de Expedientes</h2>
        <p class="subtitulo">
          Monitorea el estatus procesal de todos los asuntos del despacho.
        </p>
      </div>
      <button @click="irANuevoCaso" class="btn-primario">
        <span class="icon">+</span> Abrir Expediente
      </button>
    </div>

    <div class="toolbar-tabla">
      <div class="buscador-wrapper">
        <span class="search-icon">🔍</span>
        <input
          v-model="filtroBusqueda"
          type="text"
          placeholder="Buscar por título, expediente o cliente..."
          class="input-buscador"
        />
      </div>

      <div class="filtros-rapidos">
        <select class="input-select mini">
          <option value="">Todas las Materias</option>
          <option value="Familiar">Familiar</option>
          <option value="Penal">Penal</option>
        </select>
        <select class="input-select mini">
          <option value="">Todos los Estatus</option>
          <option value="Activo">Activos</option>
          <option value="Concluido">Concluidos</option>
        </select>
      </div>
    </div>

    <div class="tarjeta-sistema">
      <div v-if="cargando" class="estado-msg">
        <span class="spinner">⏳</span> Cargando base de datos legal...
      </div>

      <div v-else class="responsive-table-container">
        <table class="tabla-profesional">
          <thead>
            <tr>
              <th>Expediente / Asunto</th>
              <th>Cliente</th>
              <th>Clasificación</th>
              <th>Estatus Procesal</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="casosFiltrados.length === 0">
              <td colspan="5" class="vacio">
                No se encontraron expedientes con esa búsqueda.
              </td>
            </tr>
            <tr v-for="caso in casosFiltrados" :key="caso.id">
              <td>
                <div class="resaltado">{{ caso.titulo }}</div>
                <div class="expediente-num">
                  No. {{ caso.numero_expediente_judicial || "Sin asignar" }}
                </div>
              </td>
              <td class="cliente-nombre">👤 {{ caso.cliente }}</td>
              <td>
                <div class="tag-materia">{{ caso.materia }}</div>
                <div class="tag-asunto">{{ caso.asunto }}</div>
              </td>
              <td>
                <span class="badge-estatus activo">
                  {{ caso.estatus }}
                </span>
              </td>
              <td>
                <div class="btn-groupacciones">
                  <button
                    @click="verDetalles(caso.id)"
                    class="btn-accion view"
                    title="Ver Expediente Completo"
                  >
                    👁️
                  </button>
                  <button
                    @click="abrirModalEditar(caso)"
                    class="btn-accion edit"
                    title="Editar Detalles"
                  >
                    ✏️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="mostrarModalEditar" class="modal-overlay">
      <div class="modal-card">
        <header class="modal-header">
          <h3>Actualizar Expediente</h3>
          <button @click="mostrarModalEditar = false" class="btn-close">
            &times;
          </button>
        </header>

        <form
          @submit.prevent="guardarEdicion"
          class="form-grid"
          style="margin-top: 15px"
        >
          <div class="grupo-input full">
            <label>Estatus Procesal *</label>
            <select
              v-model="formEditar.estatus_id"
              class="input-select"
              required
            >
              <option value="" disabled>Selecciona el nuevo estatus...</option>
              <option
                v-for="est in listas.estatus"
                :key="est.id"
                :value="est.id"
              >
                {{ est.nombre }}
              </option>
            </select>
          </div>

          <div class="grupo-input full mt-2">
            <label>No. de Expediente Juzgado</label>
            <input
              v-model="formEditar.numero_expediente_judicial"
              type="text"
              class="input-select"
              placeholder="Ej. 1245/2026-B"
            />
          </div>

          <div class="grupo-input full mt-2">
            <label>Actualizar Descripción / Notas</label>
            <textarea
              v-model="formEditar.descripcion"
              rows="3"
              class="input-select"
              placeholder="Escribe un resumen de los cambios..."
            ></textarea>
          </div>

          <footer class="modal-footer full mt-4">
            <button
              type="button"
              @click="mostrarModalEditar = false"
              class="btn-secundario"
            >
              Cancelar
            </button>
            <button type="submit" class="btn-primario" :disabled="guardando">
              {{ guardando ? "Guardando..." : "Actualizar" }}
            </button>
          </footer>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const cargando = ref(false);
const guardando = ref(false);
const filtroBusqueda = ref("");

const expedientes = ref([]);
const listas = ref({ estatus: [] }); // Para llenar el selector del modal

// Estado del Modal de Edición
const mostrarModalEditar = ref(false);
const formEditar = ref({
  id: null,
  estatus_id: "",
  numero_expediente_judicial: "",
  descripcion: "",
});

// Función para navegar a la pantalla de crear
const irANuevoCaso = () => {
  router.push("/registrar-expediente");
};

// Función para navegar a la pantalla de perfil completo del expediente
const verDetalles = (id) => {
  router.push(`/expedientes/${id}`);
};

// Lógica para abrir el modal y pre-llenar los datos
const abrirModalEditar = async (caso) => {
  // Primero necesitamos traer los datos completos de ese caso específico (para obtener la descripcion original que no viene en la tabla general)
  // O como atajo, puedes llenarlo con los datos básicos que ya tienes

  // Vamos a usar los datos que ya sabemos y la descripción la dejaremos para que pongan la actualización
  formEditar.value = {
    id: caso.id,
    // Buscamos el ID del estatus basado en el nombre que viene en la tabla
    estatus_id:
      listas.value.estatus.find((e) => e.nombre === caso.estatus)?.id || "",
    numero_expediente_judicial: caso.numero_expediente_judicial || "",
    descripcion: caso.descripcion || "",
  };

  mostrarModalEditar.value = true;
};

// Lógica para enviar el PUT al backend
const guardarEdicion = async () => {
  guardando.value = true;
  try {
    const payload = {
      estatus_id: formEditar.value.estatus_id,
      numero_expediente_judicial: formEditar.value.numero_expediente_judicial,
      descripcion: formEditar.value.descripcion,
      actualizado_por: localStorage.getItem("usuario_id") || 1,
    };

    const respuesta = await fetch(
      `http://localhost:3000/api/expedientes/${formEditar.value.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!respuesta.ok) throw new Error("Error actualizando");

    alert("Expediente actualizado correctamente");
    mostrarModalEditar.value = false;

    // Recargamos la tabla para ver los cambios
    cargarExpedientes();
  } catch (error) {
    console.error(error);
    alert("Hubo un error al actualizar.");
  } finally {
    guardando.value = false;
  }
};

const cargarExpedientes = async () => {
  cargando.value = true;
  try {
    const respuesta = await fetch("http://localhost:3000/api/expedientes");
    if (!respuesta.ok) throw new Error("Error al obtener los expedientes");
    expedientes.value = await respuesta.json();
  } catch (error) {
    console.error("Error cargando la tabla:", error);
  } finally {
    cargando.value = false;
  }
};

onMounted(async () => {
  cargarExpedientes();

  // Cargamos el catálogo de estatus para usarlo en el Modal
  try {
    const resCat = await fetch("http://localhost:3000/api/catalogos");
    const catalogos = await resCat.json();
    listas.value.estatus = catalogos.estatus.sort((a, b) => a.orden - b.orden);
  } catch (e) {
    console.error("No se pudo cargar el catálogo de estatus");
  }
});

// 2. MAGIA DEL BUSCADOR: Filtra la tabla en tiempo real
const casosFiltrados = computed(() => {
  const busqueda = filtroBusqueda.value.toLowerCase();
  if (!busqueda) return expedientes.value;

  return expedientes.value.filter((caso) => {
    return (
      (caso.titulo && caso.titulo.toLowerCase().includes(busqueda)) ||
      (caso.cliente && caso.cliente.toLowerCase().includes(busqueda)) ||
      (caso.numero_expediente_judicial &&
        caso.numero_expediente_judicial.toLowerCase().includes(busqueda))
    );
  });
});
</script>

<style scoped>
/* ====================================================
   ESTILOS ADAPTADOS A TU DISEÑO EXISTENTE
   ==================================================== */
/* ... (Tus estilos anteriores de la tabla se mantienen iguales) ... */
.clientes-contenedor {
  padding: 20px;
}
.cabecera-seccion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.header-text h2 {
  color: var(--primary-dark);
  font-size: 1.8rem;
  margin: 0 0 5px 0;
}
.subtitulo {
  color: #666;
  margin: 0;
}
.tarjeta-sistema {
  background: var(--primary);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid var(--border-light);
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
  max-width: 400px;
}
.input-buscador {
  width: 100%;
  padding: 10px 10px 10px 35px;
  border: 1px solid #ccc;
  border-radius: 6px;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 12px;
  color: var(--secondary);
}
.filtros-rapidos {
  display: flex;
  gap: 10px;
}
.input-select.mini {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
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
.resaltado {
  font-weight: 600;
  color: var(--primary-dark);
  margin-bottom: 4px;
}
.expediente-num {
  font-size: 0.85rem;
  color: #777;
  font-family: monospace;
}
.cliente-nombre {
  font-weight: 500;
  color: var(--terciary);
}
.tag-materia,
.tag-asunto {
  display: inline-block;
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 4px;
  margin-bottom: 3px;
  margin-right: 5px;
}
.tag-materia {
  background-color: rgba(97, 45, 83, 0.1);
  color: var(--terciary);
  font-weight: 600;
}
.tag-asunto {
  background-color: #f0f0f0;
  color: #555;
}
.badge-estatus {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}
.badge-estatus.activo {
  background-color: rgba(133, 57, 83, 0.1);
  color: var(--secondary);
}
.btn-primario {
  background-color: var(--secondary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}
.btn-primario:hover {
  background-color: var(--terciary);
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
.btn-secundario:hover {
  background-color: #f5f5f5;
}
.btn-groupacciones {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.btn-accion {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background 0.2s;
}
.btn-accion:hover {
  background: #f5f5f5;
}

/* ====================================================
   ESTILOS PARA EL MODAL DE EDICIÓN
   ==================================================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-card {
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}
.modal-header h3 {
  margin: 0;
  color: var(--primary-dark);
}
.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
}
.btn-close:hover {
  color: var(--secondary);
}
.grupo-input label {
  display: block;
  font-weight: 600;
  color: var(--primary-dark);
  font-size: 0.9rem;
  margin-bottom: 8px;
}
.input-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-family: inherit;
}
.mt-2 {
  margin-top: 15px;
}
.mt-4 {
  margin-top: 25px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
