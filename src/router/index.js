import { createRouter, createWebHistory } from "vue-router";

import Dashboard from "../views/Dashboard.vue";
import ListaClientes from "../views/ListaClientes.vue";
import Login from "../views/Login.vue";
import PortalCliente from "../views/PortalCliente.vue";
import registrarExpediente from "../views/RegistrarExpediente.vue";
import ListaExpedientes from "../views/ListaExpedientes.vue";
import DetalleExpediente from "../views/DetalleExpediente.vue";
import ListaPagos from "../views/listaPagos.vue";
import ListaGastos from "../views/ListaGastos.vue";
import ContabilidadDirectorio from "../views/ContabilidadDirectorio.vue";
import ExpedienteFiscal from "../views/ExpedienteFiscal.vue";
import ListaAudiencias from "../views/ListaAudiencias.vue";

const routes = [
  { path: "/login", name: "Login", component: Login },
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/clientes",
    name: "Clientes",
    component: ListaClientes,
    meta: { requiresAuth: true },
  },
  {
    path: "/pagos",
    name: "Pagos",
    component: ListaPagos,
    meta: { requiresAuth: true },
  },
  {
    path: "/gastos",
    name: "Gastos",
    component: ListaGastos,
    meta: { requiresAuth: true },
  },
  {
    path: "/expedientes",
    name: "Expedientes",
    component: ListaExpedientes,
    meta: { requiresAuth: true },
  },
  {
    path: "/registrar-expediente",
    name: "RegistrarExpediente",
    component: registrarExpediente,
    meta: { requiresAuth: true },
  },
  {
    path: "/expedientes/:id",
    name: "DetalleExpediente",
    component: DetalleExpediente,
    meta: { requiresAuth: true },
  },
  {
    path: "/contabilidad",
    name: "Contabilidad",
    component: ContabilidadDirectorio,
    meta: { requiresAuth: true },
  },
  {
    path: "/contabilidad/perfiles/cliente/tramites/",
    name: "ExpedienteFiscal",
    component: ExpedienteFiscal,
    meta: { requiresAuth: true },
  },
  {
    path: "/mi-portal",
    name: "PortalCliente",
    component: PortalCliente,
    meta: { requiresAuth: true },
  },
  {
    path: "/lista-audiencias",
    name: "ListaAudiencias",
    component: ListaAudiencias,
    meta: { requiresAuth: true },
  }

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("token");
  const rol = localStorage.getItem("rol");

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
  } else if (to.path === "/login" && isAuthenticated) {
    if (rol === "abogado") {
      next("/");
    } else {
      next("/mi-portal");
    }
  } else {
    next();
  }
});

export default router;
