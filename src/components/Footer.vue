<template>
  <footer class="footer-sistema">
    <p>&copy; {{ new Date().getFullYear() }} AALA. Todos los derechos reservados.</p>
   
  </footer>
</template>

<style scoped>

.footer-sistema {
  text-align: center;
  padding: 20px;
  margin-top: auto; 
  color: #888;
  font-size: 0.85rem;
  border-top: 1px solid var(--border-light);
}
.footer-sistema p { margin: 5px 0; }
.footer-version { color: #aaa; font-size: 0.75rem; }
</style>