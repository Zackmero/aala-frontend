<template>
  <Teleport to="body">
    <Transition name="dialogo">
      <div
        v-if="dialogoActivo"
        class="dialogo-fondo"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="idTitulo"
        @click.self="cancelar"
      >
        <div :class="['dialogo', `dialogo--${dialogoActivo.tipo}`]">
          <div class="dialogo__cabecera">
            <span class="dialogo__icono" aria-hidden="true">
              {{ iconos[dialogoActivo.tipo] || "❓" }}
            </span>
            <h3 :id="idTitulo" class="dialogo__titulo">{{ dialogoActivo.titulo }}</h3>
          </div>

          <p v-if="dialogoActivo.mensaje" class="dialogo__mensaje">
            {{ dialogoActivo.mensaje }}
          </p>

          <p v-if="dialogoActivo.detalle" class="dialogo__detalle">
            {{ dialogoActivo.detalle }}
          </p>

          <!-- Caja para datos que el usuario necesita copiar, como las
               credenciales que se entregan al dar de alta un cliente -->
          <div v-if="dialogoActivo.textoCopiable" class="dialogo__copiable">
            <pre>{{ dialogoActivo.textoCopiable }}</pre>
            <button type="button" class="dialogo__copiar" @click="copiar">
              {{ copiado ? "✅ Copiado" : "📋 Copiar" }}
            </button>
          </div>

          <div class="dialogo__acciones">
            <button
              v-if="dialogoActivo.textoCancelar"
              ref="botonCancelar"
              type="button"
              class="dialogo__btn dialogo__btn--secundario"
              @click="cancelar"
            >
              {{ dialogoActivo.textoCancelar }}
            </button>
            <button
              ref="botonConfirmar"
              type="button"
              class="dialogo__btn dialogo__btn--principal"
              @click="responderDialogo(true)"
            >
              {{ dialogoActivo.textoConfirmar }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import { dialogoActivo, responderDialogo } from "../composables/useNotificaciones";

const idTitulo = "dialogo-titulo";
const botonConfirmar = ref(null);
const botonCancelar = ref(null);
const copiado = ref(false);

const iconos = {
  peligro: "🗑️",
  info: "ℹ️",
  normal: "❓",
};

const cancelar = () => responderDialogo(false);

const copiar = async () => {
  try {
    await navigator.clipboard.writeText(dialogoActivo.value.textoCopiable);
    copiado.value = true;
    setTimeout(() => (copiado.value = false), 2000);
  } catch (error) {
    // Si el navegador no da permiso al portapapeles, el texto sigue visible
    // y seleccionable a mano.
    console.error("No se pudo copiar al portapapeles:", error);
  }
};

// Al abrir: reiniciar el "copiado" y colocar el foco.
// En acciones destructivas el foco va al botón de CANCELAR a propósito: así
// un Enter por inercia no borra nada. En el resto va al botón principal.
watch(dialogoActivo, async (valor) => {
  if (!valor) return;
  copiado.value = false;
  await nextTick();

  if (valor.tipo === "peligro" && botonCancelar.value) {
    botonCancelar.value.focus();
  } else {
    botonConfirmar.value?.focus();
  }
});

// Escape cancela, como en cualquier diálogo del sistema.
const alPresionarTecla = (evento) => {
  if (evento.key === "Escape" && dialogoActivo.value) cancelar();
};
onMounted(() => window.addEventListener("keydown", alPresionarTecla));
onUnmounted(() => window.removeEventListener("keydown", alPresionarTecla));
</script>

<style scoped>
.dialogo-fondo {
  position: fixed;
  inset: 0;
  background: rgba(20, 14, 18, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 9500;
}

.dialogo {
  background: #ffffff;
  border-radius: 14px;
  padding: 26px 28px 22px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  border-top: 5px solid var(--color-dialogo, #853953);
}

.dialogo--peligro { --color-dialogo: #b42318; }
.dialogo--info { --color-dialogo: #1d4ed8; }
.dialogo--normal { --color-dialogo: #853953; }

.dialogo__cabecera {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.dialogo__icono { font-size: 1.5rem; }

.dialogo__titulo {
  margin: 0;
  font-size: 1.2rem;
  color: #2c2c2c;
  line-height: 1.3;
}

.dialogo__mensaje {
  margin: 0;
  color: #4a4a4a;
  line-height: 1.55;
  white-space: pre-line;
}

.dialogo__detalle {
  margin: 10px 0 0;
  font-size: 0.88rem;
  color: #7a7a7a;
  line-height: 1.5;
  white-space: pre-line;
}

.dialogo__copiable {
  margin-top: 16px;
  background: #f6f2f4;
  border: 1px solid #e7dde1;
  border-radius: 10px;
  padding: 14px;
}
.dialogo__copiable pre {
  margin: 0 0 10px;
  font-family: "IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace;
  font-size: 0.88rem;
  color: #2c2c2c;
  white-space: pre-wrap;
  word-break: break-all;
}
.dialogo__copiar {
  background: #ffffff;
  border: 1px solid #d2c2c9;
  border-radius: 8px;
  padding: 7px 14px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  color: #612d53;
}
.dialogo__copiar:hover { background: #f0e8ec; }

.dialogo__acciones {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.dialogo__btn {
  padding: 10px 20px;
  border-radius: 9px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  border: 1px solid transparent;
}
.dialogo__btn:focus-visible { outline: 2px solid var(--color-dialogo); outline-offset: 2px; }

.dialogo__btn--secundario {
  background: #ffffff;
  border-color: #d6d0d3;
  color: #4a4a4a;
}
.dialogo__btn--secundario:hover { background: #f4f1f2; }

.dialogo__btn--principal {
  background: var(--color-dialogo);
  color: #ffffff;
}
.dialogo__btn--principal:hover { filter: brightness(1.08); }

.dialogo-enter-active,
.dialogo-leave-active { transition: opacity 0.18s ease; }
.dialogo-enter-from,
.dialogo-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .dialogo-enter-active,
  .dialogo-leave-active { transition: none; }
}

@media (max-width: 600px) {
  .dialogo__acciones { flex-direction: column-reverse; }
  .dialogo__btn { width: 100%; }
}
</style>
