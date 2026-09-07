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

    <!-- TOOLBAR (BUSCADOR Y FILTROS) -->
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
    </div>

    <!-- TABLA DE EXPEDIENTES -->
    <div class="tarjeta-sistema">
      <div v-if="cargando" class="estado-msg">
        <span class="spinner-small"></span> Cargando base de datos legal...
      </div>

      <div v-else-if="errorMensaje" class="estado-msg error">
        <span class="vacio-icon">⚠️</span> 
        <p>{{ errorMensaje }}</p>
      </div>

      <div v-else class="responsive-table-container">
        <table class="tabla-profesional">
          <thead>
            <tr>
              <th>Expediente / Asunto</th>
              <th>Cliente</th>
              <th>Clasificación</th>
              <th>Abogado Responsable</th>
              <th>Estatus Procesal</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="casosFiltrados.length === 0">
              <td colspan="6" class="vacio">
                <span class="vacio-icon">📭</span>
                <p>No se encontraron expedientes con esa búsqueda.</p>
              </td>
            </tr>
            <tr v-for="caso in casosPaginados" :key="caso.id">
              <td>
                <div class="resaltado">{{ caso.titulo }}</div>
                <div class="expediente-num">
                  No. <strong>{{ caso.numero_expediente_judicial || "Sin asignar" }}</strong>
                </div>
              </td>
              <td class="cliente-nombre">
                <span class="contacto-icon">👤</span> {{ caso.cliente }}
              </td>
              <td>
                <div class="tag-materia">{{ caso.materia }}</div>
                <div class="tag-asunto">{{ caso.asunto }}</div>
              </td>

              <td class="col-abogado">{{ caso.abogado }}</td>

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

        <!-- PAGINACIÓN -->
        <div class="paginacion-footer" v-if="casosFiltrados.length > 0">
          <div class="paginacion-info">
            Mostrando <strong>{{ inicioPaginacion }}</strong> a <strong>{{ finPaginacion }}</strong> de
            <strong>{{ casosFiltrados.length }}</strong>
          </div>
          <div class="paginacion-controles">
            <button
              @click="paginaActual--"
              :disabled="paginaActual === 1"
              class="btn-page"
            >
              Anterior
            </button>
            <span class="page-current"
              >{{ paginaActual }} / {{ totalPaginas }}</span
            >
            <button
              @click="paginaActual++"
              :disabled="paginaActual === totalPaginas"
              class="btn-page"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE EDICIÓN -->
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
          style="margin-top: 20px"
        >
          <div class="grupo-input full">
            <label>Abogado Asignado *</label>
            <select
              v-model="formEditar.abogado_id"
              class="input-select"
              :disabled="!esAutorizadoParaAsignar"
              required
            >
              <option value="" disabled>Selecciona un abogado...</option>
              <option
                v-for="abogado in listaAbogados"
                :key="abogado.id"
                :value="abogado.id"
              >
                {{ abogado.nombre }}
              </option>
            </select>
            <small v-if="!esAutorizadoParaAsignar" class="nota-permiso">
              Solo un socio del despacho puede reasignar el expediente.
            </small>
          </div>

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

          <div class="grupo-input full">
            <label>No. de Expediente Juzgado</label>
            <input
              v-model="formEditar.numero_expediente_judicial"
              type="text"
              class="input-select"
              placeholder="Ej. 1245/2026-B"
            />
          </div>

          <div class="grupo-input full">
            <label>Actualizar Descripción / Notas</label>
            <textarea
              v-model="formEditar.descripcion"
              rows="3"
              class="input-select textarea"
              placeholder="Escribe un resumen de los cambios..."
            ></textarea>
          </div>

          <footer class="modal-footer full">
            <button
              type="button"
              @click="mostrarModalEditar = false"
              class="btn-secundario"
            >
              Cancelar
            </button>
            <button type="submit" class="btn-primario full-width-btn" :disabled="guardando">
              {{ guardando ? "Guardando..." : "Actualizar Expediente" }}
            </button>
          </footer>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { API_URL } from "../services/api.js";
import { notificar } from "../composables/useNotificaciones";

const token = localStorage.getItem("token");

const router = useRouter();
const cargando = ref(false);
const guardando = ref(false);
const errorMensaje = ref("");
const filtroBusqueda = ref("");

const expedientes = ref([]);
const listas = ref({ estatus: [] }); 
const listaAbogados = ref([]); 

const mostrarModalEditar = ref(false);
const formEditar = ref({
  id: null,
  estatus_id: "",
  numero_expediente_judicial: "",
  descripcion: "",
  abogado_id: "",
});

const paginaActual = ref(1);
const elementosPorPagina = ref(6);

watch(filtroBusqueda, () => {
  paginaActual.value = 1;
});

const irANuevoCaso = () => {
  router.push("/registrar-expediente");
};

const verDetalles = (id) => {
  router.push(`/expedientes/${id}`);
};

// Solo un socio puede reasignar el expediente a otro abogado.
// Esto es únicamente para la interfaz: quien realmente decide es el backend,
// que valida `es_socio` desde el token firmado antes de aceptar el cambio.
const esAutorizadoParaAsignar = computed(
  () => String(localStorage.getItem("es_socio")) === "1",
);

const normalizarExpedientes = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.expedientes)) return payload.expedientes;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const abrirModalEditar = async (caso) => {
  formEditar.value = {
    id: caso.id,
    // Ahora el listado sí devuelve los ids; la búsqueda por nombre queda
    // solo como respaldo por si algún registro viene incompleto.
    estatus_id:
      caso.estatus_id ??
      listas.value.estatus.find((e) => e.nombre === caso.estatus)?.id ??
      "",
    numero_expediente_judicial: caso.numero_expediente_judicial || "",
    descripcion: caso.descripcion || "",
    abogado_id: caso.abogado_id ?? "",
  };

  mostrarModalEditar.value = true;
};

const guardarEdicion = async () => {
  guardando.value = true;
  try {
    const payload = {
      estatus_id: formEditar.value.estatus_id,
      numero_expediente_judicial: formEditar.value.numero_expediente_judicial,
      descripcion: formEditar.value.descripcion,
      abogado_id: formEditar.value.abogado_id,
    };

    const respuesta = await fetch(
      `${API_URL}/expedientes/${formEditar.value.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      // Aquí llega, entre otros, el 403 de "solo un socio puede reasignar":
      // antes se perdía y el usuario solo veía "hubo un error".
      throw new Error(datos.mensaje || "El servidor rechazó la actualización.");
    }

    notificar.exito("Expediente actualizado", datos.mensaje ? "" : "Los cambios quedaron guardados.");
    mostrarModalEditar.value = false;

    cargarExpedientes();
  } catch (error) {
    console.error(error);
    notificar.error("No se pudo actualizar el expediente", error.message);
  } finally {
    guardando.value = false;
  }
};

const cargarExpedientes = async () => {
  cargando.value = true;
  errorMensaje.value = "";

  try {
    if (!token) {
      throw new Error(
        "No hay sesión activa. Inicia sesión para ver los expedientes.",
      );
    }

    const respuesta = await fetch(`${API_URL}/expedientes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const payload = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      throw new Error(payload?.mensaje || "Error al obtener los expedientes");
    }

    expedientes.value = normalizarExpedientes(payload);
  } catch (error) {
    errorMensaje.value = error.message;
    console.error("Error cargando la tabla:", error);
    expedientes.value = [];
  } finally {
    cargando.value = false;
  }
};

onMounted(async () => {
  cargarExpedientes();

  try {
    const resCat = await fetch(`${API_URL}/catalogos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const catalogos = await resCat.json();

    listas.value.estatus = Array.isArray(catalogos.estatus)
      ? [...catalogos.estatus].sort((a, b) => a.orden - b.orden)
      : [];

    // Sin esto el select de abogado del modal quedaba vacío y el
    // formulario de edición no se podía enviar nunca.
    listaAbogados.value = Array.isArray(catalogos.abogados)
      ? catalogos.abogados
      : [];
  } catch (e) {
    console.error("No se pudieron cargar los catálogos", e);
  }
});

const casosFiltrados = computed(() => {
  const busqueda = filtroBusqueda.value.toLowerCase().trim();
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

const totalPaginas = computed(() => {
  return Math.ceil(casosFiltrados.value.length / elementosPorPagina.value) || 1;
});

const casosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * elementosPorPagina.value;
  const fin = inicio + elementosPorPagina.value;
  return casosFiltrados.value.slice(inicio, fin);
});

const inicioPaginacion = computed(() => {
  if (casosFiltrados.value.length === 0) return 0;
  return (paginaActual.value - 1) * elementosPorPagina.value + 1;
});

const finPaginacion = computed(() => {
  const fin = paginaActual.value * elementosPorPagina.value;
  return fin > casosFiltrados.value.length ? casosFiltrados.value.length : fin;
});
</script>

<style scoped>
/* ====================================================
   ESTILOS EXPEDIENTES (Paleta estricta Color Hunt)
   ==================================================== */
.clientes-contenedor {
  width: 100%;
  padding: 20px 30px;
  animation: fadeIn 0.4s ease-out;
  background-color: #F3F4F4;
  min-height: 100vh;
  box-sizing: border-box;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Cabecera */
.cabecera-seccion {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
}

.header-text h2 {
  margin: 0 0 8px 0;
  color: #2C2C2C;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.subtitulo {
  color: #612D53;
  margin: 0;
  font-size: 1rem;
  opacity: 0.85;
}

/* BUSCADOR Y FILTROS */
.toolbar-tabla {
  margin-bottom: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
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
  color: #612D53;
  font-size: 1.1rem;
}

.input-buscador {
  width: 100%;
  padding: 14px 16px 14px 45px;
  border: 1.5px solid rgba(133, 57, 83, 0.2);
  border-radius: 12px;
  font-size: 1rem;
  background-color: #ffffff;
  color: #2C2C2C;
  box-shadow: 0 2px 6px rgba(44, 44, 44, 0.02);
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-buscador:focus {
  outline: none;
  border-color: #853953;
  box-shadow: 0 0 0 4px rgba(133, 57, 83, 0.1);
}

/* TARJETA Y TABLA */
.tarjeta-sistema {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(44, 44, 44, 0.03), 0 10px 15px -3px rgba(44, 44, 44, 0.04);
  border: 1px solid rgba(133, 57, 83, 0.1);
  overflow: hidden;
}

.estado-msg {
  padding: 50px;
  text-align: center;
  color: #612D53;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
}

.estado-msg.error {
  color: #dc2626;
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
  background: #F3F4F4;
  color: #612D53;
  padding: 16px 20px;
  font-size: 0.85rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
  border-bottom: 2px solid rgba(133, 57, 83, 0.15);
}

.tabla-profesional td {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(44, 44, 44, 0.05);
  vertical-align: middle;
  color: #2C2C2C;
  transition: background-color 0.2s ease;
}

.tabla-profesional tbody tr:hover td {
  background-color: rgba(243, 244, 244, 0.6);
}

/* Celdas de la tabla */
.resaltado {
  font-weight: 700;
  color: #2C2C2C;
  font-size: 1.05rem;
  margin-bottom: 4px;
}

.expediente-num {
  font-size: 0.85rem;
  color: #612D53;
  background: rgba(133, 57, 83, 0.05);
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
  font-family: monospace;
}

.cliente-nombre {
  font-weight: 600;
  color: #612D53;
}

.contacto-icon {
  margin-right: 4px;
  opacity: 0.7;
}

.col-abogado {
  font-weight: 700;
  color: #2C2C2C;
}

.tag-materia,
.tag-asunto {
  display: inline-block;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 20px;
  margin-bottom: 4px;
  margin-right: 6px;
  font-weight: 600;
}
.tag-materia {
  background-color: rgba(97, 45, 83, 0.1);
  color: #612D53;
}
.tag-asunto {
  background-color: rgba(133, 57, 83, 0.08);
  color: #853953;
}

.badge-estatus.activo {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: #e0e7ff; 
  color: #4338ca;
}

/* BOTONES GLOBALES */
.btn-primario {
  background: #853953;
  color: #ffffff;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-primario:hover {
  background: #612D53;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(133, 57, 83, 0.3);
}

.btn-secundario {
  background: #F3F4F4;
  color: #2C2C2C;
  border: 1px solid rgba(133, 57, 83, 0.2);
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-secundario:hover {
  background: #ffffff;
  border-color: #853953;
}

/* BOTONES TABLA */
.btn-groupacciones {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-accion {
  border: none;
  background: #F3F4F4;
  border: 1px solid rgba(133, 57, 83, 0.2);
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-accion:hover {
  background: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(44, 44, 44, 0.08);
  border-color: #853953;
}

/* PAGINACIÓN */
.paginacion-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #F3F4F4;
  border-top: 1px solid rgba(133, 57, 83, 0.1);
}

.paginacion-info {
  font-size: 0.9rem;
  color: #2C2C2C;
}

.paginacion-controles {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-page {
  padding: 8px 16px;
  border: 1px solid rgba(133, 57, 83, 0.2);
  background: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #2C2C2C;
  transition: all 0.2s ease;
}

.btn-page:not(:disabled):hover {
  background: #853953;
  color: #ffffff;
  border-color: #853953;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #F3F4F4;
}

.page-current {
  font-weight: 700;
  color: #2C2C2C;
}

/* MODALES */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(44, 44, 44, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

.modal-card {
  background: #ffffff;
  width: 95%;
  max-width: 550px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(44, 44, 44, 0.3);
  animation: modalSlideUp 0.3s ease-out;
}

@keyframes modalSlideUp {
  from { opacity: 0; transform: translateY(30px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  padding: 24px;
  background: linear-gradient(135deg, #853953 0%, #612D53 100%);
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffffff;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
  color: #ffffff;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.btn-close:hover { opacity: 1; }

.form-grid {
  padding: 0 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.grupo-input {
  display: flex;
  flex-direction: column;
}

.grupo-input label {
  font-weight: 700;
  color: #2C2C2C;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

/* Aviso bajo el select de abogado cuando quien edita no es socio */
.nota-permiso {
  margin-top: 6px;
  font-size: 0.8rem;
  color: #6b6b6b;
  font-style: italic;
}

.input-select {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid rgba(133, 57, 83, 0.2);
  border-radius: 10px;
  background-color: #ffffff;
  color: #2C2C2C;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-select:focus {
  outline: none;
  border-color: #853953;
  box-shadow: 0 0 0 4px rgba(133, 57, 83, 0.1);
}

.input-select:disabled {
  background-color: #F3F4F4;
  color: #888;
  cursor: not-allowed;
  border-color: rgba(44, 44, 44, 0.1);
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-footer {
  padding: 24px 30px;
  background: #F3F4F4;
  border-top: 1px solid rgba(133, 57, 83, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 10px;
}

/* ESTADOS VACÍOS */
.vacio {
  text-align: center;
  padding: 60px 20px;
  color: #612D53;
}
.vacio-icon {
  font-size: 3.5rem;
  display: block;
  margin-bottom: 15px;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .clientes-contenedor { padding: 15px; }
  .cabecera-seccion { flex-direction: column; align-items: flex-start; gap: 15px; }
  .toolbar-tabla { flex-direction: column; align-items: stretch; }
  .buscador-wrapper { max-width: 100%; }
}
</style>