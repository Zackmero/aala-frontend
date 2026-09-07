<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-circle">
          <span class="logo-icon">⚖️</span>
        </div>
        <h1>AALA Despacho</h1>
        <p>Ingresa a tu oficina virtual</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>Correo Electrónico</label>
          <div class="input-wrapper">
            <input
              v-model="email"
              type="email"
              required
              placeholder="abogado@despacho.com"
            />
          </div>
        </div>

        <div class="form-group">
          <label>Contraseña</label>
          <div class="input-wrapper password-wrapper">
            <input
              v-model="password"
              :type="mostrarPassword ? 'text' : 'password'"
              required
              placeholder="••••••••"
            />
            <button
              type="button"
              class="btn-toggle-password"
              @click="mostrarPassword = !mostrarPassword"
              title="Mostrar/Ocultar contraseña"
            >
              {{ mostrarPassword ? "🙈" : "👁️" }}
            </button>
          </div>
        </div>

        <button type="submit" class="btn-login" :disabled="cargando">
          <span v-if="cargando" class="spinner"></span>
          {{ cargando ? "Verificando..." : "Iniciar Sesión" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { API_URL } from "../services/api.js";
import { notificar } from "../composables/useNotificaciones";

const email = ref("");
const password = ref("");
const cargando = ref(false);
const mostrarPassword = ref(false);
const router = useRouter();

const handleLogin = async () => {
  cargando.value = true;
  try {
    const url_final = `${API_URL}/auth/login`;
    const res = await fetch(url_final, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value, password: password.value }),
    });

    const data = await res.json();

    if (res.ok) {
      // 1. Guardamos los datos exactamente como vienen de Postman
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario_id", data.id);
      localStorage.setItem("es_socio", data.es_socio ?? 0);
      localStorage.setItem("rol", data.rol); // <-- Corregido
      localStorage.setItem("nombre", data.nombre);

      notificar.exito(`Bienvenido, ${data.nombre || "usuario"}`, "Sesión iniciada correctamente.");

      // 2. Redireccionamos leyendo la propiedad directa
      if (data.rol === "abogado") {
        // <-- Corregido
        router.push("/");
      } else {
        router.push("/mi-portal");
      }
    } else if (res.status === 429) {
      // El backend limita los intentos fallidos: hay que decirlo, no dejar
      // al usuario adivinando por qué de pronto no entra.
      notificar.advertencia(
        "Demasiados intentos fallidos",
        data.mensaje || "Espera unos minutos antes de volver a intentarlo."
      );
    } else {
      notificar.error(
        "No pudimos iniciar tu sesión",
        data.mensaje || "Revisa que el correo y la contraseña sean correctos."
      );
    }
  } catch (e) {
    console.error("Detalle del error:", e);
    notificar.error(
      "No pudimos conectar con el servidor",
      "Si acabas de abrir el sistema, puede tardar unos segundos en responder. Vuelve a intentarlo."
    );
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
/* Contenedor principal con un fondo sutilmente más elegante */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary);
  /* Un ligero degradado para darle profundidad sin cambiar tus colores */
  background-image: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.1) 100%);
  padding: 20px;
}

/* Tarjeta principal con sombras modernas en capas */
.login-card {
  background: var(--secondary);
  padding: 45px 40px;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
              0 20px 25px -5px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 420px;
  transition: transform 0.3s ease;
}

/* Cabecera y tipografía */
.login-header {
  text-align: center;
  margin-bottom: 35px;
}

.logo-circle {
  background-color: rgba(0, 0, 0, 0.04);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px auto;
  font-size: 2rem;
}

.login-header h1 {
  color: var(--primary);
  margin: 0 0 8px 0;
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.login-header p {
  color: var(--primary);
  opacity: 0.8;
  margin: 0;
  font-size: 0.95rem;
}

/* Grupos del formulario */
.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary);
  opacity: 0.9;
}

/* Estilos de los inputs mejorados */
.input-wrapper input {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: all 0.3s ease;
  background-color: #fcfcfc;
}

/* Efecto focus súper elegante */
.input-wrapper input:focus {
  outline: none;
  border-color: var(--primary);
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.05); /* Cambiaremos el color del shadow cuando me des tu CSS global */
}

/* Contenedor de la contraseña */
.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
  padding-right: 50px;
}

.btn-toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-toggle-password:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.btn-toggle-password:active {
  transform: scale(0.9);
}

/* Botón de login con animaciones */
.btn-login {
  width: 100%;
  padding: 14px;
  background: var(--primary);
  color: var(--secondary); /* Asegura contraste, asumiendo que secondary es blanco o claro */
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
  filter: brightness(1.1);
}

.btn-login:active:not(:disabled) {
  transform: translateY(1px);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Pequeño spinner de carga CSS */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>