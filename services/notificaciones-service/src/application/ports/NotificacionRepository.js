/**
 * @file Puerto de salida: historial de notificaciones enviadas.
 * Adaptador actual: InMemoryNotificacionRepository.
 */
class NotificacionRepository {
  /** @param {import('../../domain/Notificacion').Notificacion} notificacion */
  async guardar(notificacion) { throw new Error('NotificacionRepository.guardar no implementado'); }

  /** @param {number} limite @returns {Promise<import('../../domain/Notificacion').Notificacion[]>} más recientes primero */
  async listarRecientes(limite) { throw new Error('NotificacionRepository.listarRecientes no implementado'); }
}

module.exports = NotificacionRepository;
