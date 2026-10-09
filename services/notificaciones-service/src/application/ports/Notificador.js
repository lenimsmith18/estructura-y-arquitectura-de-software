/**
 * @file Puerto de salida: Notificador (canal de envío).
 *
 * ARQUITECTURA HEXAGONAL — PUERTO. Adaptador actual: ConsolaNotificador
 * (simula el envío escribiendo en el log). Un EmailNotificador o
 * SmsNotificador podría reemplazarlo sin tocar el dominio ni los casos de uso.
 */
class Notificador {
  /** @param {import('../../domain/Notificacion').Notificacion} notificacion @returns {Promise<void>} */
  async enviar(notificacion) { throw new Error('Notificador.enviar no implementado'); }
}

module.exports = Notificador;
