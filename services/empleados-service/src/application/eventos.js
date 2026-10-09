/**
 * @file Catálogo y fábrica de eventos de dominio publicados por este microservicio.
 *
 * PATRÓN PUBLICADOR–SUSCRIPTOR: este es el "contrato" que comparten los
 * microservicios. Los suscriptores (reportes, notificaciones) solo conocen el
 * `tipo` y la forma de `datos`, nunca el código de este servicio.
 */
const { randomUUID } = require('node:crypto');

const TIPOS = Object.freeze({
  EMPLEADO_REGISTRADO: 'empleado.registrado',
  EMPLEADO_ACTUALIZADO: 'empleado.actualizado',
});

/**
 * Construye un evento con un sobre (envelope) común a todo el sistema.
 * @param {string} tipo  Uno de TIPOS (también es la routing key en RabbitMQ).
 * @param {object} datos Carga útil del evento.
 */
function crearEvento(tipo, datos) {
  return {
    id: randomUUID(),
    tipo,
    ocurridoEn: new Date().toISOString(),
    origen: 'empleados-service',
    datos,
  };
}

module.exports = { TIPOS, crearEvento };
