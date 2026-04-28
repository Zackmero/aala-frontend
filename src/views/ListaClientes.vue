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
        Cargando base de datos legal...
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
              <td colspan="5" class="vacio">No se encontraron clientes.</td>
            </tr>
            <tr v-for="cliente in clientesPaginados" :key="cliente.id">
              <td class="col-id">#{{ cliente.id }}</td>
              <td class="resaltado">{{ cliente.nombre_completo }}</td>
              <td>
                <div class="tag-doc">RFC: {{ cliente.rfc || "N/A" }}</div>
                <div class="tag-doc">CURP: {{ cliente.curp || "N/A" }}</div>
              </td>
              <td>
                <div class="tel-text">📞 {{ cliente.telefono }}</div>
                <div class="mail-text">✉️ {{ cliente.email }}</div>
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
                  <button
                    @click="confirmarEliminar(cliente.id)"
                    class="btn-accion delete"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="paginacion-container" v-if="clientesFiltrados.length > 0">
        <span class="info-paginacion">
          Mostrando {{ indiceInicio + 1 }} a {{ indiceFin }} de
          {{ clientesFiltrados.length }}
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
            {{ clienteSeleccionado.estado_civil || "No registrado" }}
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
              required
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
  email: "",
  direccion: "",
  estado_civil: 'Soltero' 
};
const form = ref({ ...formDefault });

// --- LÓGICA DE FILTRADO Y PAGINACIÓN ---
const clientesFiltrados = computed(() => {
  const t = filtroBusqueda.value.toLowerCase();
  return clientes.value.filter(
    (c) =>
      c.nombre_completo.toLowerCase().includes(t) ||
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
    const res = await fetch("http://localhost:3000/api/clientes");
    clientes.value = await res.json();
  } catch (e) {
    console.error(e);
  } finally {
    cargando.value = false;
  }
};

const guardarCliente = async () => {
  const url = editando.value
    ? `http://localhost:3000/api/clientes/${clienteSeleccionado.value.id}`
    : "http://localhost:3000/api/clientes";
  const method = editando.value ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form.value),
    });

    const data = await res.json();

    if (res.ok) {
      cerrarModal();
      obtenerClientes();

      if (!editando.value && data.credenciales) {
        alert(
          `✅ CLIENTE REGISTRADO CON ÉXITO\n\n` +
          `Entrégale estos datos al cliente para su portal:\n\n` +
          `📧 Correo: ${data.credenciales.usuario}\n` +
          `🔑 Contraseña: ${data.credenciales.password}\n\n` +
          `(Generada con los primeros 10 dígitos de su CURP)`
        );
      }
    } else {
      const errorServidor = await res.json();
      alert("Error del servidor: " + errorServidor.mensaje);
    }
  } catch (e) {
    alert("Error de conexión. Revisa que el Backend esté encendido.");
  }
};

const confirmarEliminar = async (id) => {
  if (confirm("¿Estás seguro de que deseas eliminar este expediente?")) {
    await fetch(`http://localhost:3000/api/clientes/${id}`, {
      method: "DELETE",
    });
    obtenerClientes();
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

.resaltado {
  font-weight: 600;
  color: var(--primary-dark);
}

.tag-doc {
  font-size: 0.75rem;
  background: var(--primary);
  color: var(--primary-dark);
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 4px;
  display: block;
  width: fit-content;
  font-weight: 500;
}

.btn-groupacciones {
  display: flex;
  gap: 8px;
}

.btn-accion {
  border: none;
  background: var(--secondary);
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
  font-size: 1.1rem;
}

.btn-accion:hover {
  background: var(--terciary);
  transform: translateY(-1px);
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

/* Modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}
.modal-card {
  background: var(--primary);
  width: 95%;
  max-width: 600px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}
.modal-header {
  padding: 20px;
  background: var(--secondary);
  color: var(--primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-detail {
  background: var(--secondary) !important;
}
.btn-close {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 1.8rem;
  cursor: pointer;
  line-height: 1;
}

/* Formularios y Grids */
.form-grid,
.detail-grid {
  padding: 25px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.grupo-input.full,
.detail-item.full {
  grid-column: span 2;
}
.grupo-input label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--primary-dark);
}
.grupo-input input,
.grupo-input textarea,
.input-select {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--primary-dark);
  border-color: var(--terciary);
  border-radius: 8px;
  font-size: 1rem;
  transition: 0.2s;
}
.grupo-input input:focus,
.input-select:focus {
  border-color: var(--primary-dark);
  outline: none;
}
.input-select {
  background-color: var(--primary);
  cursor: pointer;
}

.detail-item strong {
  display: block;
  font-size: 0.8rem;
  color: var(--terciary);
  text-transform: uppercase;
  margin-bottom: 4px;
}
.detail-item {
  font-size: 1.05rem;
}

.modal-footer {
  padding: 15px 25px;
  border-top: 1px solid var(--primary);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: var(--primary);
}

/* Botones Finales */
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
.btn-secundario {
  background: var(--secondary);
  color: var(--primary);
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
} 

.btn-primario:hover {
  background: var(--terciary);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.btn-secundario:hover{
  background: var(--terciary);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}



@media (max-width: 768px) {
  .form-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .grupo-input.full,
  .detail-item.full {
    grid-column: span 1;
  }
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
