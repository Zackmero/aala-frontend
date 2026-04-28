<template>
  <div class="portal-cliente">
    <div class="cabecera-portal">
      <h2>Bienvenido a tu Expediente Virtual</h2>
      <p>Aquí podrás dar seguimiento al avance de tu proceso legal.</p>
    </div>

    <div class="tarjetas-grid">
      <div class="tarjeta-info">
        <h3>📂 Mis Casos Activos</h3>
        <p class="estado-vacio">Aún no tienes casos asignados.</p>
      </div>
      
      <div class="tarjeta-info">
        <h3>💳 Mis Pagos</h3>
        <p class="estado-vacio">No hay pagos pendientes.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.portal-cliente { padding: 10px; }
.cabecera-portal { margin-bottom: 30px; }
.cabecera-portal h2 { color: var(--primary-teal-dark); margin: 0 0 5px 0; }
.cabecera-portal p { color: #666; margin: 0; }

.tarjetas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.tarjeta-info {
  background: white;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid var(--border-light);
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}

.tarjeta-info h3 { margin-top: 0; color: var(--text-dark); border-bottom: 2px solid var(--primary-teal-light); padding-bottom: 10px; }
.estado-vacio { color: #888; font-style: italic; font-size: 0.95rem; }
</style>