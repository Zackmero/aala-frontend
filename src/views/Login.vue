<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>⚖️ AALA Despacho</h1>
        <p>Ingresa a tu oficina virtual</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>Correo Electrónico</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="abogado@despacho.com"
          />
        </div>

        <div class="form-group">
          <label>Contraseña</label>
          <div class="password-wrapper">
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
            >
              {{ mostrarPassword ? "🙈" : "👁️" }}
            </button>
          </div>
        </div>

        <button type="submit" class="btn-login" :disabled="cargando">
          {{ cargando ? "Verificando..." : "Iniciar Sesión" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const cargando = ref(false);
const mostrarPassword = ref(false);
const router = useRouter();

const handleLogin = async () => {
  cargando.value = true;
  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value, password: password.value }),
    });

    const data = await res.json();

    if (res.ok) {
      // 1. Guardamos los datos exactamente como vienen de Postman
      localStorage.setItem("token", data.token);
      localStorage.setItem("rol", data.rol); // <-- Corregido
      localStorage.setItem("nombre", data.nombre);

      // 2. Redireccionamos leyendo la propiedad directa
      if (data.rol === "abogado") {
        // <-- Corregido
        router.push("/");
      } else {
        router.push("/mi-portal");
      }
    } else {
      alert(data.mensaje);
    }
  } catch (e) {
    console.error("Detalle del error:", e);
    alert("Error de conexión. Revisa la consola (F12).");
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary)
}
.login-card {
  background: var(--secondary);
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}
.login-header {
  text-align: center;
  margin-bottom: 30px;
}
.login-header h1 {
  color: var(--primary);
  margin: 0;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--primary);
}
.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--primary);
  border-radius: 8px;
}
.btn-login {
  width: 100%;
  padding: 12px;
  background: var(--primary);
  color: var(--primary-dark);
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

/* ... tus estilos anteriores ... */

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
  width: 100%;
  padding-right: 45px; /* Espacio para que el texto no se encime con el ojo */
}

.btn-toggle-password {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  transition: opacity 0.2s;
}

.btn-toggle-password:hover {
  opacity: 0.7;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--primary);
  border-radius: 8px;
  box-sizing: border-box; /* Asegura que el padding no rompa el ancho */
}

p{
  color: var(--primary);
}
</style>
