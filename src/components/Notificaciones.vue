<template>
  <Teleport to="body">
    <div class="pila-avisos" role="status" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="aviso">
        <div
          v-for="aviso in listaNotificaciones"
          :key="aviso.id"
          :class="['aviso', `aviso--${aviso.tipo}`]"
        >
          <span class="aviso__icono" aria-hidden="true">{{ iconos[aviso.tipo] }}</span>

          <div class="aviso__texto">
            <p class="aviso__titulo">{{ aviso.titulo }}</p>
            <p v-if="aviso.detalle" class="aviso__detalle">{{ aviso.detalle }}</p>
          </div>

          <button
            class="aviso__cerrar"
            type="button"
            :aria-label="`Cerrar aviso: ${aviso.titulo}`"
            @click="cerrarNotificacion(aviso.id)"
          >
            &times;
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { listaNotificaciones, cerrarNotificacion } from "../composables/useNotificaciones";

const iconos = {
  exito: "✅",
  error: "⛔",
  advertencia: "⚠️",
  info: "ℹ️",
};
</script>

<style scoped>
.pila-avisos {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: min(380px, calc(100vw - 40px));
  pointer-events: none;
}

.aviso {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.14);
  /* La franja de color es lo que distingue la categoría de un vistazo */
  border-left: 5px solid var(--color-aviso, #999);
}

.aviso--exito { --color-aviso: #15803d; }
.aviso--error { --color-aviso: #b42318; }
.aviso--advertencia { --color-aviso: #b45309; }
.aviso--info { --color-aviso: #1d4ed8; }

.aviso__icono {
  font-size: 1.15rem;
  line-height: 1.35;
  flex: none;
}

.aviso__texto {
  flex: 1;
  min-width: 0;
}

.aviso__titulo {
  margin: 0;
  font-weight: 700;
  font-size: 0.95rem;
  color: #2c2c2c;
  line-height: 1.35;
}

.aviso__detalle {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: #5f5f5f;
  line-height: 1.45;
  /* Un mensaje del servidor puede venir largo: se recorta a 3 líneas */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.aviso__cerrar {
  flex: none;
  background: none;
  border: none;
  font-size: 1.4rem;
  line-height: 1;
  color: #9a9a9a;
  cursor: pointer;
  padding: 0 2px;
  border-radius: 6px;
}
.aviso__cerrar:hover { color: #2c2c2c; }
.aviso__cerrar:focus-visible { outline: 2px solid var(--color-aviso); outline-offset: 2px; }

/* Entrada desde la derecha, salida encogiendo para que la pila se reacomode */
.aviso-enter-active { transition: transform 0.28s ease, opacity 0.28s ease; }
.aviso-leave-active { transition: transform 0.2s ease, opacity 0.2s ease; position: absolute; }
.aviso-enter-from { transform: translateX(28px); opacity: 0; }
.aviso-leave-to { transform: translateX(28px); opacity: 0; }
.aviso-move { transition: transform 0.28s ease; }

@media (prefers-reduced-motion: reduce) {
  .aviso-enter-active,
  .aviso-leave-active,
  .aviso-move { transition: none; }
}

@media (max-width: 600px) {
  .pila-avisos {
    top: auto;
    bottom: 16px;
    right: 16px;
    left: 16px;
    width: auto;
  }
}
</style>
