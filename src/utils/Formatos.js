// ==========================================
// UTILIDADES DE FORMATO PARA EL PROYECTO
// ==========================================
//
// Regla del sistema: todas las fechas/horas se manejan como hora LOCAL
// (México) de extremo a extremo, en texto plano ("YYYY-MM-DD" o
// "YYYY-MM-DD HH:MM:SS"), sin pasar nunca por conversiones UTC reales.
// El backend (mysql2 con dateStrings:true) ya no envía valores con 'Z';
// aquí solo hace falta convertir ese texto a un formato que el
// constructor Date() interprete como hora LOCAL en vez de UTC, cosa que
// solo pasa si la cadena no trae sufijo de zona horaria ('Z' o '+HH:MM')
// y usa 'T' (no espacio) como separador entre fecha y hora.

// Convierte cualquier valor de fecha/fecha-hora que venga del backend o de
// un input a un objeto Date interpretado en hora LOCAL, nunca en UTC.
export const aFechaLocal = (valor) => {
  if (!valor) return null;
  if (valor instanceof Date) return valor;
  let texto = String(valor).trim();
  // "YYYY-MM-DD HH:MM:SS" (como lo devuelve MySQL) -> con 'T'
  texto = texto.replace(" ", "T");
  // Solo fecha ("YYYY-MM-DD"): forzamos medianoche LOCAL, si no
  // Date() la interpreta como medianoche UTC y retrocede un día en México.
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    texto += "T00:00:00";
  }
  const date = new Date(texto);
  return Number.isNaN(date.getTime()) ? null : date;
};

// Formatea una fecha para usarla en inputs de tipo <input type="date">
export const formatoInputDate = (fechaISO) => {
  const date = aFechaLocal(fechaISO);
  if (!date) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// Formatea una fecha y hora para usarla en <input type="datetime-local">
export const formatoInputDateTime = (fechaISO) => {
  const date = aFechaLocal(fechaISO);
  if (!date) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Fecha/hora LOCAL actual en formato "YYYY-MM-DD HH:MM:SS", lista para
// guardarse en una columna DATETIME de MySQL sin ninguna conversión UTC.
export const ahoraMysqlDateTime = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// Fecha LOCAL de hoy en formato "YYYY-MM-DD", para precargar inputs type="date".
export const hoyInputDate = () => formatoInputDate(new Date());

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
  const date = aFechaLocal(fechaString);
  if (!date) return null;
  const opciones = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("es-MX", opciones);
};

// Formatea fecha y hora (Ej. 15 abr 2026, 10:00 a.m.)
export const formatearFechaHoraTexto = (fechaISO) => {
  const date = aFechaLocal(fechaISO);
  if (!date) return "Sin fecha";
  return date.toLocaleString("es-MX", {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
};

// Formatea fecha y hora (Ej. 15/03/2026, 10:00 a.m.)
export const formatearFechaHoraCorta = (fechaISO) => {
  const date = aFechaLocal(fechaISO);
  if (!date) return "Sin fecha";
  return date.toLocaleString("es-MX", {
    year: '2-digit', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
};

