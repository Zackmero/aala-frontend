<template>
  <div class="clientes-contenedor">
    <div class="cabecera-seccion">
      <div class="header-text">
        <h2>Directorio de Clientes</h2>
        <p class="subtitulo">
          Gestiona los expedientes y contactos de tu despacho.
        </p>
      </div>
      <button @click="abrirModalCrear" class="btn-primario">
        <span class="icon">+</span> Nuevo Cliente
      </button>
    </div>

    <div class="toolbar-tabla">
      <div class="buscador-wrapper">
        <span class="search-icon">🔍</span>
        <input
          v-model="filtroBusqueda"
          type="text"
          placeholder="Buscar por nombre o RFC..."
          class="input-buscador"
        />
      </div>
    </div>

    <div class="tarjeta-sistema">
      <div v-if="cargando" class="estado-msg">
        <span class="spinner-small"></span> Cargando base de datos legal...
      </div>

      <div v-else class="responsive-table-container">
        <table class="tabla-profesional">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Documentos</th>
              <th>Contacto</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="clientesPaginados.length === 0">
              <td colspan="5" class="vacio">
                <span class="vacio-icon">📭</span>
                <p>No se encontraron clientes.</p>
              </td>
            </tr>
            <tr v-for="cliente in clientesPaginados" :key="cliente.id">
              <td class="col-id">
                <span class="id-badge">#{{ cliente.id }}</span>
              </td>
              <td class="resaltado">
                <div class="avatar-text">
                  <div class="avatar-initial">{{ (cliente.nombre_completo || "?").charAt(0) }}</div>
                  <span>{{ cliente.nombre_completo }}</span>
                </div>
              </td>
              <td>
                <div class="tags-container">
                  <div class="tag-doc">RFC: <strong>{{ cliente.rfc || "N/A" }}</strong></div>
                  <div class="tag-doc">CURP: <strong>{{ cliente.curp || "N/A" }}</strong></div>
                </div>
              </td>
              <td class="col-contacto">
                <div class="tel-text"><span class="contacto-icon">📞</span> {{ cliente.telefono }}</div>
                <div class="mail-text"><span class="contacto-icon">✉️</span> {{ cliente.email }}</div>
              </td>
              <td>
                <div class="btn-groupacciones">
                  <button
                    @click="verDetalles(cliente)"
                    class="btn-accion view"
                    title="Ver Detalles"
                  >
                    👁️
                  </button>
                  <button
                    @click="abrirModalEditar(cliente)"
                    class="btn-accion edit"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <!-- <button
                    @click="confirmarEliminar(cliente.id)"
                    class="btn-accion delete"
                    title="Eliminar"
                  >
                    🗑️
                  </button> -->
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="paginacion-container" v-if="clientesFiltrados.length > 0">
        <span class="info-paginacion">
          Mostrando <strong>{{ indiceInicio + 1 }}</strong> a <strong>{{ indiceFin }}</strong> de
          <strong>{{ clientesFiltrados.length }}</strong>
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

    <!-- MODAL DETALLES -->
    <div v-if="mostrarModalDetalles" class="modal-overlay">
      <div class="modal-card">
        <header class="modal-header header-detail">
          <h3>Información del Cliente</h3>
          <button @click="mostrarModalDetalles = false" class="btn-close">
            &times;
          </button>
        </header>
        <div class="detail-grid" v-if="clienteSeleccionado">
          <div class="detail-item full">
            <strong>Nombre:</strong> {{ clienteSeleccionado.nombre_completo }}
          </div>
          <div class="detail-item">
            <strong>RFC:</strong> {{ clienteSeleccionado.rfc || "N/A" }}
          </div>
          <div class="detail-item">
            <strong>CURP:</strong> {{ clienteSeleccionado.curp || "N/A" }}
          </div>
          <div class="detail-item">
            <strong>Teléfono:</strong> {{ clienteSeleccionado.telefono }}
          </div>
          <div class="detail-item">
            <strong>Estado Civil:</strong>
            <span class="badge-estado">{{ clienteSeleccionado.estado_civil || "No registrado" }}</span>
          </div>
          <div class="detail-item full">
            <strong>Email:</strong> {{ clienteSeleccionado.email }}
          </div>
          <div class="detail-item full">
            <strong>Dirección:</strong>
            {{ clienteSeleccionado.direccion || "Sin dirección" }}
          </div>
        </div>
        <footer class="modal-footer">
          <button @click="mostrarModalDetalles = false" class="btn-primario">
            Cerrar
          </button>
        </footer>
      </div>
    </div>

    <!-- MODAL FORMULARIO -->
    <div v-if="mostrarModal" class="modal-overlay">
      <div class="modal-card">
        <header class="modal-header">
          <h3>
            {{ editando ? "Actualizar Cliente" : "Nuevo Registro de Cliente" }}
          </h3>
          <button @click="cerrarModal" class="btn-close">&times;</button>
        </header>
        <form @submit.prevent="guardarCliente" class="form-grid">
          <div class="grupo-input full">
            <label>Nombre Completo</label>
            <input
              v-model="form.nombre_completo"
              type="text"
              required
              placeholder="Ej. Juan Pérez López"
            />
          </div>
          <div class="grupo-input">
            <label>RFC</label>
            <input v-model="form.rfc" type="text" placeholder="ABCD123456" />
          </div>
          <div class="grupo-input">
            <label>CURP</label>
            <input v-model="form.curp" type="text" />
          </div>
          <div class="grupo-input">
            <label>Teléfono</label>
            <input v-model="form.telefono" type="tel" required />
          </div>
          <div class="grupo-input">
            <label>Estado Civil</label>
            <select v-model="form.estado_civil" class="input-select" required>
              <option value="" disabled>Seleccionar...</option>
              <option value="Soltero">Soltero</option>
              <option value="Casado">Casado</option>
              <option value="Divorciado">Divorciado</option>
              <option value="Viudo">Viudo</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div class="grupo-input full">
            <label>Email</label>
            <input
              v-model="form.email"
              type="email"
              
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div class="grupo-input full">
            <label>Dirección</label>
            <textarea
              v-model="form.direccion"
              rows="2"
              placeholder="Calle, Número, Colonia..."
            ></textarea>
          </div>

          <footer class="modal-footer full">
            <button type="button" @click="cerrarModal" class="btn-secundario">
              Cancelar
            </button>
            <button type="submit" class="btn-primario">
              {{ editando ? "Actualizar" : "Guardar Cliente" }}
            </button>
          </footer>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { API_URL } from "../services/api.js";
import { notificar, confirmar, avisar } from "../composables/useNotificaciones";

const token = localStorage.getItem("token");

// --- ESTADOS ---
const clientes = ref([]);
const cargando = ref(true);
const filtroBusqueda = ref("");
const paginaActual = ref(1); 
const clientesPorPagina = 6;
const mostrarModal = ref(false);
const mostrarModalDetalles = ref(false);
const editando = ref(false);
const clienteSeleccionado = ref(null);

const formDefault = {
  nombre_completo: "",
  rfc: "",
  curp: "",
  telefono: "",
  email: null,
  direccion: "",
  estado_civil: 'Soltero' 
};
const form = ref({ ...formDefault });

// --- LÓGICA DE FILTRADO Y PAGINACIÓN ---
const clientesFiltrados = computed(() => {
  const t = filtroBusqueda.value.toLowerCase();
  return clientes.value.filter(
    (c) =>
      (c.nombre_completo || "").toLowerCase().includes(t) ||
      (c.rfc && c.rfc.toLowerCase().includes(t)),
  );
});

const totalPaginas = computed(
  () => Math.ceil(clientesFiltrados.value.length / clientesPorPagina) || 1,
);
const clientesPaginados = computed(() => {
  const i = (paginaActual.value - 1) * clientesPorPagina;
  return clientesFiltrados.value.slice(i, i + clientesPorPagina);
});

const indiceInicio = computed(
  () => (paginaActual.value - 1) * clientesPorPagina,
);
const indiceFin = computed(() =>
  Math.min(
    indiceInicio.value + clientesPorPagina,
    clientesFiltrados.value.length,
  ),
);

watch(filtroBusqueda, () => {
  paginaActual.value = 1;
});

// --- FUNCIONES API ---
const obtenerClientes = async () => {
  try {
    const res = await fetch(`${API_URL}/clientes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const datos = await res.json();
    clientes.value = Array.isArray(datos) ? datos : [];
  } catch (e) {
    console.error(e);
    notificar.error("No se pudo cargar el directorio de clientes", e.message);
  } finally {
    cargando.value = false;
  }
};

const guardarCliente = async () => {
  const url = editando.value
    ? `${API_URL}/clientes/${clienteSeleccionado.value.id}`
    : `${API_URL}/clientes`;
  const method = editando.value ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form.value),
    });

    const data = await res.json();

    if (res.ok) {
      cerrarModal();
      obtenerClientes();

      if (editando.value) {
        notificar.exito(
          "Cliente actualizado",
          data.accesoActualizado
            ? "También se actualizó su correo de acceso al portal: ahora entra con el correo nuevo y la misma contraseña."
            : ""
        );
      }

      if (!editando.value && data.credenciales) {
        if (data.credenciales.sin_email) {
          // El correo es generado por el sistema: no existe y el cliente no
          // podría recibir nada ahí. Decirlo, en vez de pedir que lo entregue.
          await avisar({
            titulo: "Cliente registrado, pero sin acceso al portal",
            mensaje:
              "Como no capturaste un correo, el cliente todavía no puede entrar a su portal.",
            detalle:
              "Cuando te dé su correo, edítalo desde la ficha del cliente y el acceso se activa solo.",
            tipo: "info",
          });
        } else {
          // Las credenciales hay que poder copiarlas, no transcribirlas a mano.
          await avisar({
            titulo: "Cliente registrado con éxito",
            mensaje: "Entrégale estos datos al cliente para que entre a su portal:",
            detalle: "La contraseña se generó con los primeros 10 caracteres de su CURP.",
            textoCopiable:
              `Portal: ${window.location.origin}\n` +
              `Correo: ${data.credenciales.usuario}\n` +
              `Contraseña: ${data.credenciales.password}`,
            textoConfirmar: "Listo",
          });
        }
      } else if (!editando.value) {
        notificar.exito("Cliente registrado", form.value.nombre_completo);
      }
    } else {
      notificar.error(
        "No se pudo guardar el cliente",
        data.mensaje || "El servidor rechazó los datos."
      );
    }
  } catch (e) {
    console.error(e);
    notificar.error(
      "No pudimos conectar con el servidor",
      "Revisa tu conexión e inténtalo de nuevo."
    );
  }
};

const confirmarEliminar = async (id) => {
  const cliente = clientes.value.find((c) => c.id === id);

  const confirmacion = await confirmar({
    titulo: "¿Eliminar este cliente?",
    mensaje: cliente?.nombre_completo || `Cliente #${id}`,
    detalle:
      "Se borra el registro del despacho. Si el cliente tiene expedientes " +
      "abiertos, la operación será rechazada por la base de datos.",
    textoConfirmar: "Sí, eliminar",
    textoCancelar: "Conservar",
    tipo: "peligro",
  });
  if (!confirmacion) return;

  try {
    const respuesta = await fetch(`${API_URL}/clientes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) throw new Error(datos.mensaje || "El servidor rechazó la baja.");

    notificar.exito("Cliente eliminado", cliente?.nombre_completo || "");
    obtenerClientes();
  } catch (error) {
    notificar.error("No se pudo eliminar el cliente", error.message);
  }
};

// --- MODALES ---
const abrirModalCrear = () => {
  editando.value = false;
  form.value = { ...formDefault };
  mostrarModal.value = true;
};

const abrirModalEditar = (c) => {
  editando.value = true;
  clienteSeleccionado.value = c;
  form.value = { ...c };
  mostrarModal.value = true;
};

const verDetalles = (c) => {
  clienteSeleccionado.value = c;
  mostrarModalDetalles.value = true;
};

const cerrarModal = () => {
  mostrarModal.value = false;
};

onMounted(obtenerClientes);
</script>

<style scoped>
/* ====================================================
   ESTILOS DE CLIENTES (Paleta estricta Color Hunt)
   ==================================================== */
.clientes-contenedor {
  width: 100%;
  padding: 20px 30px;
  animation: fadeIn 0.4s ease-out;
  background-color: #F3F4F4; /* Fondo principal de la paleta */
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
  color: #2C2C2C; /* Color oscuro principal */
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.subtitulo {
  color: #612D53; /* Tono intermedio de la paleta */
  margin: 0;
  font-size: 1rem;
  opacity: 0.85;
}

/* Buscador */
.toolbar-tabla {
  margin-bottom: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  border-color: #853953; /* Color de acento */
  box-shadow: 0 0 0 4px rgba(133, 57, 83, 0.1);
}

/* Tarjeta y Tabla */
.tarjeta-sistema {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(44, 44, 44, 0.03), 0 10px 15px -3px rgba(44, 44, 44, 0.04);
  border: 1px solid rgba(133, 57, 83, 0.1);
  overflow: hidden;
}

.estado-msg {
  padding: 40px;
  text-align: center;
  color: #612D53;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
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

.tabla-profesional tbody tr:last-child td {
  border-bottom: none;
}

/* Celdas Específicas */
.col-id {
  width: 80px;
}

.id-badge {
  background: #F3F4F4;
  color: #612D53;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
}

.avatar-text {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-initial {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #853953 0%, #612D53 100%);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}

.resaltado {
  font-weight: 700;
  color: #2C2C2C;
  font-size: 1.05rem;
}

.tags-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tag-doc {
  font-size: 0.75rem;
  background: rgba(133, 57, 83, 0.08);
  color: #853953;
  padding: 4px 10px;
  border-radius: 20px;
  width: fit-content;
  font-weight: 500;
}

.tag-doc strong {
  font-weight: 700;
}

.col-contacto {
  font-size: 0.9rem;
  color: #2C2C2C;
  opacity: 0.8;
}

.col-contacto div {
  margin-bottom: 4px;
}

.contacto-icon {
  margin-right: 6px;
}

/* Botones de Acción de Tabla */
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

/* Paginación */
.paginacion-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #F3F4F4;
  border-top: 1px solid rgba(133, 57, 83, 0.1);
}

.info-paginacion {
  font-size: 0.9rem;
  color: #2C2C2C;
}

.botones-paginacion {
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

/* Modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(44, 44, 44, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

.modal-card {
  background: #ffffff;
  width: 95%;
  max-width: 650px;
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
  background: #ffffff;
  border-bottom: 1px solid rgba(133, 57, 83, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-detail {
  background: linear-gradient(135deg, #853953 0%, #612D53 100%);
  color: #ffffff;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: #2C2C2C;
}

.header-detail h3 {
  color: #ffffff;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.2s;
  color: inherit;
}

.btn-close:hover {
  opacity: 1;
}

/* Formularios y Grids */
.form-grid, .detail-grid {
  padding: 30px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.grupo-input.full, .detail-item.full { grid-column: span 2; }
.modal-footer.full { grid-column: span 2; margin: 0 -30px -30px -30px; }

.grupo-input label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  color: #2C2C2C;
}

.grupo-input input,
.grupo-input textarea,
.input-select {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid rgba(133, 57, 83, 0.2);
  border-radius: 10px;
  font-size: 1rem;
  color: #2C2C2C;
  transition: all 0.2s ease;
  background-color: #F3F4F4;
  box-sizing: border-box;
}

.grupo-input input:focus,
.grupo-input textarea:focus,
.input-select:focus {
  background-color: #ffffff;
  border-color: #853953;
  box-shadow: 0 0 0 4px rgba(133, 57, 83, 0.1);
  outline: none;
}

.detail-item {
  background: #F3F4F4;
  padding: 16px;
  border-radius: 10px;
  border: 1px solid rgba(133, 57, 83, 0.1);
  color: #2C2C2C;
}

.detail-item strong {
  display: block;
  font-size: 0.75rem;
  color: #612D53;
  text-transform: uppercase;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}

.badge-estado {
  background: rgba(133, 57, 83, 0.12);
  color: #853953;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}

.modal-footer {
  padding: 20px 30px;
  background: #F3F4F4;
  border-top: 1px solid rgba(133, 57, 83, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Botones Finales */
.btn-primario {
  background: #853953;
  color: #ffffff;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secundario {
  background: #ffffff;
  color: #2C2C2C;
  border: 1.5px solid rgba(133, 57, 83, 0.3);
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;
} 

.btn-primario:hover {
  background: #612D53;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(133, 57, 83, 0.3);
}

.btn-secundario:hover {
  background: #F3F4F4;
  border-color: #853953;
  color: #853953;
}

.vacio {
  text-align: center;
  padding: 40px;
  color: #612D53;
}

.vacio-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 10px;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .clientes-contenedor { padding: 15px; }
  .form-grid, .detail-grid { grid-template-columns: 1fr; padding: 20px; }
  .grupo-input.full, .detail-item.full { grid-column: span 1; }
  .modal-footer.full { grid-column: span 1; margin: 0 -20px -20px -20px; padding: 20px; }
  .cabecera-seccion { flex-direction: column; align-items: flex-start; gap: 15px; }
  .btn-primario { width: 100%; justify-content: center; }
  .toolbar-tabla { flex-direction: column; }
  .buscador-wrapper { max-width: 100%; width: 100%; }
}
</style>