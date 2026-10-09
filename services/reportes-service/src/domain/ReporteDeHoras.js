/**
 * @file Servicio de dominio: cálculo del reporte de horas trabajadas.
 *
 * ARQUITECTURA HEXAGONAL — DOMINIO. Función pura: recibe empleados y
 * movimientos ya filtrados por período y devuelve el resumen por empleado.
 */

/** @param {number} minutos @returns {string} p. ej. "8 h 30 min" */
function formatearDuracion(minutos) {
  return `${Math.floor(minutos / 60)} h ${minutos % 60} min`;
}

/**
 * @param {Array<{codigo: string, nombre: string, cargo: string, activo: boolean}>} empleados
 * @param {Array<{empleadoCodigo: string, tipo: string, fechaHora: Date, duracionMinutos: number|null}>} movimientos
 *        Ordenados por fecha ascendente.
 */
function generarReporteDeHoras(empleados, movimientos) {
  const resumen = new Map(
    empleados.map((e) => [e.codigo, {
      codigo: e.codigo,
      nombre: e.nombre,
      cargo: e.cargo,
      activo: e.activo,
      jornadasCompletas: 0,
      minutosTrabajados: 0,
      entradaAbierta: false,
      ultimaMarcacion: null,
    }])
  );

  for (const m of movimientos) {
    // Si llega un movimiento de un empleado aún no proyectado, se incluye igual.
    if (!resumen.has(m.empleadoCodigo)) {
      resumen.set(m.empleadoCodigo, {
        codigo: m.empleadoCodigo, nombre: m.empleadoNombre ?? '(desconocido)', cargo: '', activo: null,
        jornadasCompletas: 0, minutosTrabajados: 0, entradaAbierta: false, ultimaMarcacion: null,
      });
    }
    const r = resumen.get(m.empleadoCodigo);
    if (m.tipo === 'SALIDA') {
      r.jornadasCompletas += 1;
      r.minutosTrabajados += m.duracionMinutos ?? 0;
    }
    r.entradaAbierta = m.tipo === 'ENTRADA';
    r.ultimaMarcacion = m.fechaHora.toISOString();
  }

  const filas = [...resumen.values()]
    .map((r) => ({ ...r, horasTrabajadas: formatearDuracion(r.minutosTrabajados) }))
    .sort((a, b) => a.codigo.localeCompare(b.codigo));

  const totalMinutos = filas.reduce((s, r) => s + r.minutosTrabajados, 0);
  return { empleados: filas, totalHoras: formatearDuracion(totalMinutos), totalMinutos };
}

module.exports = { generarReporteDeHoras, formatearDuracion };
