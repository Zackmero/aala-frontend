// src/services/api.js

// src/services/api.js
export const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:3000/api';

const API_ORIGIN = API_URL.replace(/\/api$/i, "");

export const assetUrl = (pathOrUrl) => {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (pathOrUrl.startsWith("/api/")) {
    return `${API_ORIGIN}${pathOrUrl}`;
  }
  if (pathOrUrl.startsWith("/")) {
    return `${API_ORIGIN}${pathOrUrl}`;
  }
  return `${API_URL}/${pathOrUrl}`;
};

export const apiFetch = async (endpoint, options = {}) => {
  // Obtenemos el token de manera centralizada
  const token = localStorage.getItem("token");

  // Configuramos las cabeceras por defecto
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Si el body es un JSON, agregamos el Content-Type automáticamente
  if (options.body && typeof options.body === "string") {
    headers["Content-Type"] = "application/json";
  }

  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || "Error en la petición HTTP");
    }

    // Evitamos errores si el backend responde con un 204 (Sin contenido)
    if (response.status === 204) return null;

    return await response.json();
  } catch (error) {
    console.error(`Error en API (${endpoint}):`, error);
    throw error;
  }
};
