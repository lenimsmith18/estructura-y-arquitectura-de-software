/**
 * @file Catálogo y fábrica de eventos publicados por asistencia-service.
 *
 * PATRÓN PUBLICADOR–SUSCRIPTOR: contrato compartido con los suscriptores
 * (reportes-service y notificaciones-service).
 */
const { randomUUID } = require('node:crypto');

const TIPOS = Object.freeze({
  ENTRADA_REGISTRADA: 'asistencia.entrada_registrada',
  SALIDA_REGISTRADA: 'asistencia.salida_registrada',
});

/** @param {string} tipo @param {object} datos */
function crearEvento(tipo, datos) {
  return {
    id: randomUUID(),
    tipo,
    ocurridoEn: new Date().toISOString(),
    origen: 'asistencia-service',
    datos,
  };
}

module.exports = { TIPOS, crearEvento };
