<template>
  <div v-if="route.path === '/login'">
    <router-view></router-view>
  </div>

  <div v-else class="layout-sistema">
    <Sidebar class="sidebar-component" />

    <div class="main-container">
      <Navbar />

      <main class="content-wrapper">
        <router-view></router-view>
      </main>

      <Footer />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import Sidebar from './components/Sidebar.vue';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';

const route = useRoute();
</script>

<style>
/* Tu CSS está perfecto, mantenlo exactamente igual */
:root {
  --primary-teal-dark: #1D4F46;
  --primary-teal-medium: #6F9E8D;
  --primary-teal-light: #F0F7F4;
  --text-main: #2A3633;
  --border-light: #DEEAE5;
  --sidebar-width: 260px;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  font-family: 'Inter', sans-serif;
  background-color: var(--primary-teal-light);
}

#app {
  width: 100%;
  margin: 0;
  padding: 0;
  max-width: none;
}

.layout-sistema {
  display: flex;
  min-height: 100vh;
  width: 100vw;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-left: var(--sidebar-width);
}

.content-wrapper {
  padding: 30px;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  :root {
    --sidebar-width: 0px;
  }
  .main-container {
    margin-left: 0;
  }
  .content-wrapper {
    padding: 15px;
  }
}
</style>