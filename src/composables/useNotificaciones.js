import { ref, readonly } from "vue";

/**
 * Sistema único de avisos del despacho.
 *
 * Sustituye a los alert() y confirm() del navegador, que bloquean la ventana,
 * no se pueden estilizar y en móvil se ven mal.
 *
 *   import { notificar, confirmar, avisar } from "../composables/useNotificaciones";
 *
 *   notificar.exito("Gasto registrado", "Se guardó por $350.00");
 *   notificar.error("No se pudo guardar el gasto", detalleTecnico);
 *
 *   if (await confirmar({ titulo: "...", mensaje: "...", tipo: "peligro" })) { ... }
 */

// ---------------------------------------------------------------- avisos
const notificaciones = ref([]);
let siguienteId = 1;

// Cuántos avisos se ven a la vez antes de empezar a descartar los más viejos.
const MAXIMO_VISIBLES = 4;

// Un error necesita más tiempo en pantalla que una confirmación: hay que
// leerlo y a veces copiarlo.
const DURACIONES = {
  exito: 4000,
  info: 4500,
  advertencia: 6000,
  error: 9000,
};

const cerrarNotificacion = (id) => {
  notificaciones.value = notificaciones.value.filter((n) => n.id !== id);
};

const agregar = (tipo, titulo, detalle = "", duracion) => {
  const id = siguienteId++;
  const ms = duracion ?? DURACIONES[tipo] ?? 4500;

  notificaciones.value = [
    ...notificaciones.value.slice(-(MAXIMO_VISIBLES - 1)),
    { id, tipo, titulo, detalle, ms },
  ];

  if (ms > 0) {
    setTimeout(() => cerrarNotificacion(id), ms);
  }
  return id;
};

export const notificar = {
  exito: (titulo, detalle, duracion) => agregar("exito", titulo, detalle, duracion),
  error: (titulo, detalle, duracion) => agregar("error", titulo, detalle, duracion),
  advertencia: (titulo, detalle, duracion) => agregar("advertencia", titulo, detalle, duracion),
  info: (titulo, detalle, duracion) => agregar("info", titulo, detalle, duracion),
};

export const listaNotificaciones = readonly(notificaciones);
export { cerrarNotificacion };

// ---------------------------------------------------- diálogo de confirmación
const dialogo = ref(null);
let resolverDialogo = null;

/**
 * Devuelve una promesa con true (confirmó) o false (canceló).
 * Sustituye a confirm(): `if (await confirmar({...})) { ... }`
 *
 * tipo: "peligro" para acciones destructivas, "normal" para el resto.
 */
export const confirmar = (opciones = {}) =>
  new Promise((resolve) => {
    // Si ya había un diálogo abierto, se resuelve como cancelado para no
    // dejar promesas colgadas.
    if (resolverDialogo) resolverDialogo(false);
    resolverDialogo = resolve;

    dialogo.value = {
      titulo: "¿Confirmas la acción?",
      mensaje: "",
      detalle: "",
      textoConfirmar: "Confirmar",
      textoCancelar: "Cancelar",
      tipo: "normal",
      textoCopiable: "",
      ...opciones,
    };
  });

/** Aviso modal de un solo botón, para información que hay que leer sí o sí. */
export const avisar = (opciones = {}) =>
  confirmar({
    titulo: "Aviso",
    textoConfirmar: "Entendido",
    textoCancelar: null,
    tipo: "info",
    ...opciones,
  });

export const dialogoActivo = readonly(dialogo);

export const responderDialogo = (respuesta) => {
  dialogo.value = null;
  if (resolverDialogo) {
    resolverDialogo(respuesta);
    resolverDialogo = null;
  }
};
