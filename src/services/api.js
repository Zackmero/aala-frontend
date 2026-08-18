// src/services/api.js

const BASE_URL = `${import.meta.env.VITE_API_URL}`;

export const apiFetch = async (endpoint, options = {}) => {
  // Obtenemos el token de manera centralizada
  const token = localStorage.getItem('token');
  
  // Configuramos las cabeceras por defecto
  const headers = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  // Si el body es un JSON, agregamos el Content-Type automáticamente
  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Error en la petición HTTP');
    }

    // Evitamos errores si el backend responde con un 204 (Sin contenido)
    if (response.status === 204) return null;
    
    return await response.json();
  } catch (error) {
    console.error(`Error en API (${endpoint}):`, error);
    throw error;
  }
};