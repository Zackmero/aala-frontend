<template>
  <aside class="sidebar">
    <div class="sidebar-header" @click="router.push('/')" style="cursor: pointer;">
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
      <router-link to="/gastos" class="nav-item" active-class="active">
        <span class="nav-icon">🧾</span> Gastos
      </router-link>
      <router-link to="/contabilidad" class="nav-item" active-class="active">
        <span class="nav-icon">📊</span> Contabilidad
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
  width: var(--sidebar-width); 
  background-color: var(--secondary); 
  display: flex;
  flex-direction: column;
  padding: 25px 0;
  border-right: 1px solid rgba(0, 0, 0, 0.05); /* Borde más sutil y moderno */
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.02); /* Sombra difuminada de profundidad */
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 100;
  box-sizing: border-box;
  transition: width 0.3s ease;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 25px;
  margin-bottom: 40px;
  transition: transform 0.2s ease;
}

.sidebar-header:hover {
  transform: translateX(3px);
}

.brand-icon {
  font-size: 2.2rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.brand-name {
  font-weight: 800;
  font-size: 1.5rem;
  color: var(--primary); 
  letter-spacing: -0.5px;
}

.sidebar-nav {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 6px; /* Ajustado para que se vean más como botones independientes */
  padding: 0 15px; 
  overflow-y: auto;
}

/* Barra de scroll oculta pero funcional */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}
.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.1);
  border-radius: 4px;
}

/* --- Elementos de Navegación --- */
.nav-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 18px;
  text-decoration: none;
  color: var(--primary); 
  font-weight: 500;
  font-size: 0.95rem;
  border-radius: 10px; /* Bordes más redondeados y amigables */
  transition: all 0.3s ease;
  position: relative;
}

.nav-item .nav-icon {
  font-size: 1.3rem;
  opacity: 0.7;
  color: var(--primary);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* Decorador de barra izquierda para el estado activo */
.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%) scaleY(0);
  height: 60%;
  width: 4px;
  background-color: var(--primary);
  border-radius: 0 4px 4px 0;
  transition: transform 0.2s ease;
}

/* Estado Hover */
.nav-item:hover {
  background-color: var(--terciary);
  color: var(--primary);
  transform: translateX(4px); /* Deslizamiento sutil hacia la derecha */
}
.nav-item:hover .nav-icon {
  opacity: 1;
  transform: scale(1.15); /* El icono se asoma */
}

/* Estado Activo (Página actual) */
.nav-item.active {
  background-color: var(--terciary);
  color: var(--primary);
  font-weight: 700;
}
.nav-item.active::before {
  transform: translateY(-50%) scaleY(1); /* Despliega la barra lateral */
}
.nav-item.active .nav-icon {
  opacity: 1;
  color: var(--primary);
}

/* --- Footer del Sidebar --- */
.sidebar-footer {
  padding: 20px 20px;
  margin-top: auto;
  border-top: 1px solid rgba(0,0,0,0.04); /* Separador sutil */
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
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08); /* Sombra elegante */
}

.btn-logout:hover {
  background-color: var(--terciary); 
  color: var(--primary);
  transform: translateY(-2px); /* Se eleva al pasar el mouse */
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.12);
}

.btn-logout:active {
  transform: translateY(1px); 
}

/* --- RESPONSIVO --- */
@media (max-width: 768px) {
  .sidebar {
    width: 80px; /* Fuerza un ancho estrecho */
    padding: 20px 0;
  }

  .brand-name,
  .sidebar-footer p,
  .nav-item::after {
    display: none;
  }

  .sidebar-header {
    justify-content: center;
    padding: 0;
    margin-bottom: 25px;
  }

  .sidebar-nav {
    padding: 0 10px;
  }

  /* Truco de CSS: El font-size en 0 oculta el texto sin romper los márgenes */
  .nav-item {
    justify-content: center;
    padding: 14px;
    font-size: 0; 
  }

  .nav-item .nav-icon {
    font-size: 1.6rem; /* Mantiene grande el icono */
    margin: 0;
  }

  /* Ajuste de la barra indicadora para versión móvil */
  .nav-item::before {
    left: -10px;
  }

  .sidebar-footer {
    padding: 15px 10px;
  }

  .btn-logout {
    padding: 14px;
    font-size: 0; /* Oculta el texto */
  }

  .btn-logout .icon {
    font-size: 1.4rem; /* Mantiene el emoji de la puerta */
    margin: 0;
  }
}
</style>