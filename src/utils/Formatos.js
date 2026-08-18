// ==========================================
// UTILIDADES DE FORMATO PARA EL PROYECTO
// ==========================================

// Formatea una fecha ISO para usarla en inputs de tipo <input type="date">
export const formatoInputDate = (fechaISO) => {
  if (!fechaISO) return "";
  const date = new Date(fechaISO);
  // Ajuste de zona horaria para que el input no retroceda un día por el UTC
  return new Date(date.getTime() + Math.abs(date.getTimezoneOffset() * 60000))
    .toISOString()
    .split("T")[0];
};

// Formatea un número o string a formato de moneda mexicana (MXN)
export const formatoMoneda = (monto) => {
  // Aseguramos que si viene vacío o null, se formatee como $0.00
  const valor = Number(monto) || 0; 
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(valor);
};

// Formatea una fecha para mostrarla de forma amigable (Ej. 15 de abril de 2026)
export const formatearFecha = (fechaString) => {
  if (!fechaString) return null;
  const opciones = { year: "numeric", month: "long", day: "numeric" };
  const date = new Date(fechaString);
  return new Date(
    date.getTime() + Math.abs(date.getTimezoneOffset() * 60000)
  ).toLocaleDateString("es-MX", opciones);
};

// Formatea fecha y hora (Ej. 15 abr 2026, 10:00 a.m.)
export const formatearFechaHoraTexto = (fechaISO) => {
  if (!fechaISO) return "Sin fecha";
  return new Date(fechaISO).toLocaleString("es-MX", { 
    year: 'numeric', month: 'short', day: 'numeric', 
    hour: '2-digit', minute: '2-digit', hour12: true 
  });
};
  
// Formatea fecha y hora (Ej. 15/03/2026, 10:00 a.m.)
export const formatearFechaHoraCorta = (fechaISO) => {
  if (!fechaISO) return "Sin fecha";
  return new Date(fechaISO).toLocaleString("es-MX", { 
    year: '2-digit', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute: '2-digit', hour12: true 
  });
};

