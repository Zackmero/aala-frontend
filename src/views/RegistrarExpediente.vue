<template>
  <div class="clientes-contenedor">
    <div class="cabecera-seccion">
      <div class="header-text">
        <h2>Abrir Nuevo Expediente</h2>
        <p class="subtitulo">
          Completa la información inicial del caso jurídico.
        </p>
      </div>
    </div>

    <div class="tarjeta-sistema">
      <form @submit.prevent="guardarExpediente" class="form-grid">
        <div class="grupo-input full separador-seccion">
          <h3>👤 Involucrados</h3>
          <hr class="linea-divisora" />
        </div>

        <div class="grupo-input">
          <label for="cliente">Seleccionar Cliente *</label>
          <select
            id="cliente"
            v-model="form.cliente_id"
            class="input-select"
            required
          >
            <option value="" disabled>-- Elige un cliente --</option>
            <option
              v-for="cliente in listas.clientes"
              :key="cliente.id"
              :value="cliente.id"
            >
              {{ cliente.nombre_completo }}
            </option>
          </select>
        </div>

        <div class="grupo-input">
          <label for="abogado">Abogado Asignado *</label>
          <select
            id="abogado"
            v-model="form.abogado_id"
            class="input-select"
            required
          >
            <option value="" disabled>-- Asigna un responsable --</option>
            <option
              v-for="abogado in listas.abogados"
              :key="abogado.id"
              :value="abogado.id"
            >
              {{ abogado.nombre }}
            </option>
          </select>
        </div>

        <div class="grupo-input full separador-seccion mt-3">
          <h3>⚖️ Clasificación Legal</h3>
          <hr class="linea-divisora" />
        </div>

        <div class="grupo-input">
          <label for="materia">Materia *</label>
          <select
            id="materia"
            v-model="form.materia_id"
            @change="resetearAsunto"
            class="input-select"
            required
          >
            <option value="" disabled>-- Rama del derecho --</option>
            <option
              v-for="mat in listas.materias"
              :key="mat.id"
              :value="mat.id"
            >
              {{ mat.nombre }}
            </option>
          </select>
        </div>

        <div class="grupo-input">
          <label for="asunto">Asunto Específico *</label>
          <select
            id="asunto"
            v-model="form.asunto_id"
            :disabled="!form.materia_id"
            class="input-select"
            required
          >
            <option value="" disabled>
              -- Selecciona primero la materia --
            </option>
            <option
              v-for="asunto in asuntosFiltrados"
              :key="asunto.id"
              :value="asunto.id"
            >
              {{ asunto.nombre }}
            </option>
          </select>
        </div>

        <div class="grupo-input full separador-seccion mt-3">
          <h3>📂 Detalles del Asunto</h3>
          <hr class="linea-divisora" />
        </div>

        <div class="grupo-input">
          <label for="numero">No. de Expediente Juzgado </label>
          <input
            type="text"
            id="numero"
            v-model="form.numero_expediente_judicial"
            placeholder="Ej: 1245/2026-B"
          />
        </div>

        <div class="grupo-input">
          <label for="estatus">Estatus Procesal Inicial *</label>
          <select
            id="estatus"
            v-model="form.estatus_id"
            class="input-select"
            required
          >
            <option value="" disabled>
              -- Selecciona en qué etapa se encuentra --
            </option>
            <option
              v-for="estatus in listas.estatus"
              :key="estatus.id"
              :value="estatus.id"
            >
              {{ estatus.nombre }}
            </option>
          </select>
        </div>

        <div class="grupo-input full">
          <label for="descripcion">Descripción Inicial *</label>
          <textarea
            id="descripcion"
            v-model="form.descripcion"
            rows="3"
            placeholder="Redacta los hechos principales y la situación inicial del cliente..."
            required
          ></textarea>
        </div>

        <div class="grupo-input mt-2">
          <label for="fecha_cierre"
            >🗓️ Fecha de Cierre Esperada</label
          >
          <input
            type="date"
            id="fecha_cierre"
            v-model="form.fecha_cierre_esperada"
            class="input-select"
          />
        </div>

        <div class="grupo-input mt-2">
          <label for="prioridad">🔥 Prioridad del Asunto *</label>
          <select
            id="prioridad"
            v-model="form.prioridad"
            class="input-select"
            required
          >
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
            <option value="Urgente">Urgente</option>
          </select>
        </div>
        <footer class="modal-footer full mt-4">
          <button type="button" @click="cancelar" class="btn-secundario">
            Cancelar
          </button>
          <button type="submit" class="btn-primario">
            <span v-if="cargando">Guardando...</span>
            <span v-else>Guardar Expediente</span>
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const token = localStorage.getItem("token");
const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

// 1. Estado del Formulario
const form = ref({
  cliente_id: "",
  abogado_id: "", // <--- Añadido al estado
  materia_id: "",
  asunto_id: "",
  estatus_id: "",
  numero_expediente_judicial: "",
  descripcion: "",
});

// Añadimos 'abogados' a la lista de catálogos
const listas = ref({
  clientes: [],
  abogados: [],
  materias: [],
  asuntos: [],
  estatus: [],
});
const cargando = ref(false);

const asuntosFiltrados = computed(() => {
  console.log("Materia seleccionada:", form.value.materia_id);
  if (!form.value.materia_id) return [];
  return listas.value.asuntos.filter(
    (a) => a.materia_id === form.value.materia_id,
  );
});

const resetearAsunto = () => {
  form.value.asunto_id = "";
};

onMounted(async () => {
  try {
    // 1. Cargar Catálogos Generales
    const resCatalogos = await fetch(`${import.meta.env.VITE_API_URL}/catalogos`, {
      headers,
    });
    const dataCatalogos = await resCatalogos.json();
    listas.value.materias = dataCatalogos.materias;
    listas.value.asuntos = dataCatalogos.asuntos;
    listas.value.estatus = dataCatalogos.estatus.sort(
      (a, b) => a.orden - b.orden,
    );
    listas.value.abogados = dataCatalogos.abogados;

    // 2. Cargar Clientes
    const resClientes = await fetch(`${import.meta.env.VITE_API_URL}/clientes`, {
      headers,
    });
    listas.value.clientes = await resClientes.json();
  } catch (error) {
    console.error("Error cargando los datos iniciales:", error);
  }
});

const guardarExpediente = async () => {
  cargando.value = true;
  try {
    const payload = {
      ...form.value,
      creado_por: localStorage.getItem("usuario_id") || 1,
      actualizado_por: localStorage.getItem("usuario_id") || 1,
    };

    const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/expedientes`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!respuesta.ok) throw new Error("Error en el servidor");

    const dataRespuesta = await respuesta.json();
    alert(`¡Éxito! Se ha creado el ${dataRespuesta.titulo}`);
    router.push("/expedientes");
  } catch (error) {
    console.error("Error guardando:", error);
    alert("Hubo un problema al guardar el expediente.");
  } finally {
    cargando.value = false;
  }
};

const cancelar = () => {
  router.push("/expedientes");
};
</script>

<style scoped>
/* Tus estilos exactos se mantienen idénticos aquí... */
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
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.grupo-input {
  display: flex;
  flex-direction: column;
}
.grupo-input.full {
  grid-column: 1 / -1;
}
.grupo-input label {
  font-weight: 600;
  color: var(--primary-dark);
  font-size: 0.9rem;
  margin-bottom: 8px;
}
input,
textarea,
.input-select {
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.95rem;
  background-color: #fff;
  color: var(--primary-dark);
  transition: border-color 0.3s;
  width: 100%;
  cursor: pointer;
}
input:focus,
textarea:focus,
.input-select:focus {
  outline: none;
  border-color: var(--secondary);
}
.input-select:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}
.separador-seccion h3 {
  color: var(--terciary);
  font-size: 1.1rem;
  margin: 0;
}
.linea-divisora {
  border: none;
  border-top: 1px solid #eee;
  margin-top: 10px;
  width: 100%;
}
.mt-3 {
  margin-top: 15px;
}
.mt-4 {
  margin-top: 30px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
.btn-primario {
  background-color: var(--secondary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
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
  transition: background-color 0.2s;
}
.btn-secundario:hover {
  background-color: #f5f5f5;
}
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
