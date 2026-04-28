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

.navbar-superior {
  background: white;
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-light);
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
  position: sticky;
  top: 0;
  z-index: 90;
}
.navbar-content { display: flex; justify-content: space-between; align-items: center; }
.domain-info { font-family: monospace; font-size: 1rem; color: var(--secondary); display: flex; align-items: center; gap: 8px; }
.server-status.ok { color: var(--accent-sage); }
.user-info { display: flex; align-items: center; gap: 10px; }
.user-name { font-weight: 500; color: var(--primary-dark); }
.user-avatar { background: var(--secondary); color: var(--primary); width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: bold; font-size: 0.9rem; }

@media (max-width: 768px) {
  .user-name { display: none; } 
}
</style>