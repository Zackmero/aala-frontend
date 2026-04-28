import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Ahora que la carpeta es 'router' en minúsculas
import './style.css';

createApp(App)
  .use(router)
  .mount('#app');