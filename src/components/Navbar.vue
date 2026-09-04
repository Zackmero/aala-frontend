<template>
  <header class="navbar-superior">
    <div class="navbar-content">
      <div class="domain-info">
        <span class="server-status ok">●</span> aala.mx
      </div>
      <div class="user-info">
        <span class="user-name">{{ nombreUsuario}}</span>
        <span class="user-avatar">{{ inicial }}</span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const nombreUsuario = ref('');

onMounted(() => {

  nombreUsuario.value = localStorage.getItem('nombre') || 'Usuario';
});

const inicial = computed(() => {
return nombreUsuario.value ? nombreUsuario.value.charAt(0).toUpperCase() : 'U';});
</script>

<style scoped>
/* Contenedor principal con efecto cristal (Glassmorphism) */
.navbar-superior {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px); /* Efecto difuminado al hacer scroll */
  -webkit-backdrop-filter: blur(10px);
  padding: 16px 28px;
  border-bottom: 1px solid var(--border-light, #f0f0f0);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  position: sticky;
  top: 0;
  z-index: 90;
  transition: all 0.3s ease;
}

.navbar-content { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}

/* Indicador de dominio estilo "píldora" */
.domain-info { 
  font-family: 'Courier New', Courier, monospace; 
  font-size: 0.95rem; 
  font-weight: 600;
  color: var(--secondary); 
  display: flex; 
  align-items: center; 
  gap: 10px;
  background: rgba(0, 0, 0, 0.04);
  padding: 6px 14px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

/* Animación de latido para el estado del servidor */
.server-status.ok { 
  color: var(--accent-sage, #4ade80); 
  font-size: 0.9rem;
  animation: pulso-servidor 2s infinite ease-in-out;
}

@keyframes pulso-servidor {
  0% { opacity: 0.4; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0.4; transform: scale(0.85); }
}

/* Sección de usuario con efecto hover interactivo */
.user-info { 
  display: flex; 
  align-items: center; 
  gap: 12px;
  padding: 4px 6px 4px 12px;
  border-radius: 30px;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.user-info:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.user-name { 
  font-weight: 600; 
  color: var(--primary-dark);
  font-size: 0.95rem;
  letter-spacing: -0.2px;
}

/* Avatar con sombra suave y borde */
.user-avatar { 
  background: var(--secondary); 
  color: var(--primary); 
  width: 38px; 
  height: 38px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  border-radius: 50%; 
  font-weight: 700; 
  font-size: 1.05rem; 
  border: 2px solid #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.user-info:hover .user-avatar {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
}

/* Responsividad para móviles */
@media (max-width: 768px) {
  .user-name { display: none; } 
  .navbar-superior { padding: 12px 20px; }
  .domain-info { font-size: 0.85rem; padding: 5px 10px; }
}
</style>