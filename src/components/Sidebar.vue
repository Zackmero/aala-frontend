<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <span class="brand-icon">⚖️</span>
      <span class="brand-name">AALA</span>
    </div>


    <nav class="sidebar-nav">
      <template v-if="rol === 'abogado'">
      <router-link to="/" class="nav-item" active-class="active">
        <span class="nav-icon">📊</span> Dashboard
      </router-link>
      <router-link to="/clientes" class="nav-item" active-class="active">
        <span class="nav-icon">👥</span> Clientes
      </router-link>
      <router-link to="/expedientes" class="nav-item" active-class="active">
        <span class="nav-icon">📂</span> Expedientes
      </router-link>
      <router-link to="/pagos" class="nav-item" active-class="active">
        <span class="nav-icon">💰</span> Pagos
      </router-link>
      <router-link to="/configuracion" class="nav-item" active-class="active">
        <span class="nav-icon">⚙️</span> Configuración
      </router-link>
      </template>

      <template v-if="rol === 'cliente'">
        <router-link to="/mi-portal" class="nav-item" active-class="active">
          <span class="nav-icon">📂</span> Mi Expediente
        </router-link>
        <router-link to="/mis-pagos-cliente" class="nav-item" active-class="active">
          <span class="nav-icon">💳</span> Mis Pagos
        </router-link>
      </template>
    </nav>

    <div class="sidebar-footer">
      <button @click="cerrarSesion" class="btn-logout">
        <span class="icon">🚪</span> Cerrar Sesión
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const rol = ref("");
const nombreUsuario = ref("");

onMounted(() => {

  rol.value = localStorage.getItem("rol") || "";
  nombreUsuario.value = localStorage.getItem("nombre") || "Usuario";
});


const inicial = computed(() => {
  return nombreUsuario.value ? nombreUsuario.value.charAt(0).toUpperCase() : "U";
});

const cerrarSesion = () => {

  localStorage.removeItem("token");
  localStorage.removeItem("rol");
  localStorage.removeItem("nombre");


  router.push("/login");
};
</script>

<style scoped>


/* --- Panel Lateral Fijo --- */
.sidebar {
  width: var(
    --sidebar-width
  ); 
  background-color: var(--secondary); 
  display: flex;
  flex-direction: column;
  padding: 25px 0;
  border-right: 1px solid var(--terciary); 
  box-shadow: 2px 0 10px rgba(44, 95, 86, 0.03); 
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 100;
  box-sizing: border-box;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 25px;
  margin-bottom: 40px;
}

.brand-icon {
  font-size: 2rem;
}

.brand-name {
  font-weight: 700;
  font-size: 1.4rem;
  color: var(--primary); 
}

.sidebar-nav {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 8px; 
  padding: 0 15px; 
}

/* --- Elementos de Navegación --- */
.nav-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 20px;
  text-decoration: none;
  color: var(--primary); 
  font-weight: 500;
  border-radius: 8px; 
  transition: all 0.2s ease;
}

.nav-item .nav-icon {
  font-size: 1.3rem;
  opacity: 0.8;
  color: var(--primary);
}

/* Estado Hover */
.nav-item:hover {
  background-color: var(--terciary);
  color: var(--primary);
}
.nav-item:hover .nav-icon {
  opacity: 1;
  color: var(--primary);
}

/* Estado Activo (Página actual) */
.nav-item.active {
  background-color: var(--terciary);
  color: var(--primary);
  font-weight: 600;
}
.nav-item.active .nav-icon {
  opacity: 1;
  color: var(--primary);
}

/* --- Footer del Sidebar --- */
.sidebar-footer {
  padding: 20px 25px;
  margin-top: auto;
}

.sidebar-footer p {
  margin: 0 0 15px 0;
  color: var(--primary);
  font-size: 0.9rem;
  opacity: 0.8;
}

/* --- BOTÓN FIJO: Alto Contraste --- */
.btn-logout {
  width: 100%;
  background-color: var(--primary); 
  color: var(--sb-primary-dark); 
  border: none;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
}

.btn-logout:hover {
  background-color: var(--terciary); 
  color: var(--primary);
}

.btn-logout:active {
  transform: translateY(1px); 
}

/* --- RESPONSIVO --- */
@media (max-width: 768px) {
 
  .brand-name,
  .sidebar-footer p,
  .nav-item::after {
    display: none;
  }

  .sidebar-header {
    justify-content: center;
    padding: 0 10px;
  }

  .sidebar-nav {
    padding: 0 10px;
  }

  .nav-item {
    justify-content: center;
    padding: 15px;
  }

  .nav-icon {
    font-size: 1.8rem;
  }

  .sidebar-footer {
    padding: 15px 10px;
  }

  .btn-logout {
    padding: 10px;
    font-size: 0.9rem;
  }
}
</style>
