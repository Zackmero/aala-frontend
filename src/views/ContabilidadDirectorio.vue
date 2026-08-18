<template>
  <div class="clientes-contenedor">
    <div class="cabecera-seccion">
      <div class="header-text">
        <h2>Directorio Fiscal y Contable</h2>
        <p class="subtitulo">Gestión de clientes y obligaciones fiscales</p>
      </div>
      <button class="btn-primario" @click="abrirModalNuevo">
        + Dar de Alta Cliente Fiscal
      </button>
    </div>

    <div v-if="cargando" class="estado-msg">
      <span class="spinner">⏳</span> Cargando directorio...
    </div>

    <div v-else class="tarjeta-sistema mt-4">
      <div v-if="perfiles.length > 0" class="responsive-table-container">
        <table class="tabla-profesional">
          <thead>
            <tr>
              <th>Razón Social / Nombre</th>
              <th>RFC</th>
              <th>Régimen Fiscal</th>
              <th>Contacto</th>
              <th>Estatus</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="perfil in perfiles" :key="perfil.id">
              <td>
                <div class="resaltado">{{ perfil.razon_social }}</div>
                <small style="color: #666;">ID Legal: #{{ perfil.cliente_id }}</small>
              </td>
              <td><span class="tag-materia">{{ perfil.rfc }}</span></td>
              <td>{{ perfil.regimen_fiscal }}</td>
              <td>
                <div>✉️ {{ perfil.correo || 'Sin correo' }}</div>
                <div>📞 {{ perfil.telefono || 'Sin teléfono' }}</div>
              </td>
              <td>
                <span :class="['badge-estatus', perfil.estatus_contable === 'Activo' ? 'pagado' : 'pendiente']">
                  {{ perfil.estatus_contable }}
                </span>
              </td>
              <td class="text-center">
                <button @click="verExpedienteFiscal(perfil.cliente_id)" class="btn-accion view" title="Abrir Expediente Contable">
                  📂 Abrir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-else class="vacio">
        <span class="icon-large">📊</span>
        <p>No hay clientes dados de alta en el módulo de contabilidad.</p>
      </div>
    </div>

    <div v-if="mostrarModal" class="modal-overlay">
      <div class="modal-card">
        <header class="modal-header">
          <h3>Alta de Cliente Fiscal</h3>
          <button @click="cerrarModal" class="btn-close">&times;</button>
        </header>

        <form @submit.prevent="guardarPerfil" class="form-grid mt-4">
          <div class="group-input full" style="position: relative">
            <label>Buscar Cliente Base (Sistema Legal) *</label>
            <input 
              type="text" 
              v-model="busquedaCliente" 
              @focus="mostrarDropdown = true"
              @blur="ocultarDropdown"
              class="input-select" 
              placeholder="🔍 Escribe el nombre del cliente..." 
              required 
            />
            
            <ul v-if="mostrarDropdown && clientesFiltrados.length" class="autocomplete-lista">
              <li v-for="cliente in clientesFiltrados" :key="cliente.id" @mousedown.prevent="seleccionarCliente(cliente)">
                {{ "(#"+cliente.id +") " }}{{ cliente.nombreCompleto || '' }}
              </li>
            </ul>

            <ul v-if="mostrarDropdown && !clientesFiltrados.length" class="autocomplete-lista">
              <li class="sin-resultados">No se encontraron clientes...</li>
            </ul>
          </div>

          <div class="group-input full">
            <label>Nombre o Razón Social (Ante el SAT) *</label>
            <input v-model="formPerfil.razon_social" type="text" class="input-select" placeholder="Ej. Soluciones Z SA de CV" required />
          </div>

          <div class="group-input">
            <label>RFC *</label>
            <input v-model="formPerfil.rfc" type="text" class="input-select" placeholder="12 o 13 caracteres" required />
          </div>

          <div class="group-input full">
            <label>Régimen Fiscal *</label>
            <input v-model="formPerfil.regimen_fiscal" type="text" class="input-select" placeholder="Ej. RESICO, Persona Física..." required />
          </div>

          <div class="group-input full mt-2">
            <label>Actividad Económica Principal *</label>
            <input v-model="formPerfil.actividad_economica" type="text" class="input-select" placeholder="Ej. Desarrollo de software..." required />
          </div>

          <footer class="modal-footer full mt-4">
            <button type="button" @click="cerrarModal" class="btn-secundario">Cancelar</button>
            <button type="submit" class="btn-primario" :disabled="guardando">
              {{ guardando ? 'Guardando...' : 'Crear Perfil Fiscal' }}
            </button>
          </footer>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const token = localStorage.getItem("token");
const perfiles = ref([]);
const listaClientes = ref([]);
const cargando = ref(true);
const mostrarModal = ref(false);
const guardando = ref(false);

// TODO: Variables de Autocompletado
const busquedaCliente = ref("");
const mostrarDropdown = ref(false);

const formPerfil = ref({
  cliente_id: '',
  razon_social: '',
  rfc: '',
  regimen_fiscal: '',
  actividad_economica: ''
});

// TODO: Logica de Filtrado de Autocompletado
const clientesFiltrados = computed(() => {
  if (!busquedaCliente.value) return listaClientes.value;
  const texto = busquedaCliente.value.toLowerCase();
  return listaClientes.value.filter(c => `${c.nombreCompleto || ''}`.toLowerCase().includes(texto));
});

const seleccionarCliente = (cliente) => {
  formPerfil.value.cliente_id = cliente.id;
  busquedaCliente.value = `${cliente.nombreCompleto || ''}`.trim();
  mostrarDropdown.value = false;
};

const ocultarDropdown = () => setTimeout(() => mostrarDropdown.value = false, 150);

// TODO: Peticiones a la API
const cargarDirectorio = async () => {
  cargando.value = true;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/perfil-fiscal`, { 
      headers: { "Authorization": `Bearer ${token}` } 
    });
    if (res.ok){
      const data = await res.json();
      data.forEach(element => {
        perfiles.value.push({
          id: element.id,
          cliente_id: element.cliente_id || '',
          razon_social: element.razon_social || '',
          rfc: element.rfc || '',
          regimen_fiscal: element.regimen_fiscal || '',
          actividad_economica: element.actividad_economica || '',
          estatus_contable: element.estatus_contable || 'Pendiente'
        });
      });
    }
    console.log("Directorio cargado:", perfiles.value);
  } catch (e) { 
    console.error("Error cargando directorio:", e); 
  } finally { 
    cargando.value = false; 
  }
};

const cargarClientesBase = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/clientes`, { 
      headers: { "Authorization": `Bearer ${token}` } 
    });
    
    if (res.ok) {
      const data = await res.json();
      data.forEach(element => {
        listaClientes.value.push({
          id: element.id,
          nombreCompleto: element.nombre_completo || '',
          rfc: element.rfc || '',
          curp: element.curp || '',
          telefono: element.telefono || '',
          estado_civil: element.estado_civil || '',
          email: element.email || '',
          direccion: element.direccion || '',
          usuario_id: element.usuario_id || ''
        }); 
      });
    }
  
    
  } catch (e) { 
    console.error("Error cargando clientes base:", e); 
  }
};

const abrirModalNuevo = () => {
  formPerfil.value = { cliente_id: '', razon_social: '', rfc: '', regimen_fiscal: '', actividad_economica: '' };
  busquedaCliente.value = "";
  mostrarModal.value = true;
  if (!listaClientes.value.length) cargarClientesBase();
};

const cerrarModal = () => mostrarModal.value = false;

const guardarPerfil = async () => {
  if (!formPerfil.value.cliente_id) {
    alert("Debes seleccionar un cliente base del buscador.");
    return;
  }
  
  guardando.value = true;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/perfil-fiscal`, {
      method: 'POST',
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(formPerfil.value)
    });
    if (res.ok) {
      alert("¡Cliente fiscal creado correctamente!");
      cerrarModal();
      await cargarDirectorio();
    } else {
      const errorData = await res.json();
      alert(errorData.mensaje || "Error al crear perfil.");
    }
  } catch (e) { 
    alert("Error de conexión al guardar"); 
  } finally { 
    guardando.value = false; 
  }
};

const verExpedienteFiscal = (cliente_id) => {
  router.push(`/contabilidad/perfiles/cliente/tramites/${cliente_id}`);
};

onMounted(() => {
  cargarDirectorio();
});
</script>

<style scoped>
/* ====================================================
   ESTILOS BASE (Mismos que DetalleExpediente.vue)
   ==================================================== */
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
.estado-msg {
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
  color: #666;
}

/* Botones */
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
.btn-accion {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background 0.2s;
  color: var(--primary-dark);
}
.btn-accion:hover {
  background: #f5f5f5;
}

/* Tablas */
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

/* Etiquetas y Badges */
.tag-materia {
  display: inline-block;
  font-size: 0.85rem;
  padding: 3px 8px;
  border-radius: 4px;
  background-color: rgba(97, 45, 83, 0.1);
  color: var(--terciary);
  font-weight: 600;
}
.badge-estatus {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}
.badge-estatus.pagado {
  background-color: #e6f4ea;
  color: #137333;
}
.badge-estatus.pendiente {
  background-color: #fef7e0;
  color: #b06000;
}

/* Modal y Formularios */
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
  max-width: 600px;
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
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.group-input {
  display: flex;
  flex-direction: column;
}
.group-input.full {
  grid-column: 1 / -1;
}
.group-input label {
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
  box-sizing: border-box;
}
.modal-footer {
  display: flex;
  justify-content: center;
  gap: 15px;
}
.mt-2 { margin-top: 15px; }
.mt-4 { margin-top: 25px; }

/* TODO: ESTILOS DEL AUTOCOMPLETADO */
.autocomplete-lista {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 6px 6px;
  margin: 0;
  padding: 0;
  list-style: none;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.autocomplete-lista li {
  padding: 10px 15px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  font-size: 0.95rem;
  color: #333;
}
.autocomplete-lista li:last-child {
  border-bottom: none;
}
.autocomplete-lista li:hover {
  background-color: #f0f4f8;
  color: var(--primary-dark);
}
.autocomplete-lista li.sin-resultados {
  color: #888;
  font-style: italic;
  cursor: default;
}
.autocomplete-lista li.sin-resultados:hover {
  background-color: white;
}
</style>