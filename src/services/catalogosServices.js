import { apiFetch } from './api';

export const catalogosService = {
  // Obtener todos los abogados
  obtenerAbogados: () => {
    return apiFetch('/catalogos'); // Usa la ruta de tu backend
  },
  
  // Obtener los tipos de gastos
  obtenerTiposGastos: () => {
    return apiFetch('/catalogos/tipos-gastos');
  }
};