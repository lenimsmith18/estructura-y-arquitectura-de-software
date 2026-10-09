/**
 * @file Adaptador de salida: historial de notificaciones en memoria (máx. 200).
 */
const NotificacionRepository = require('../../application/ports/NotificacionRepository');

class InMemoryNotificacionRepository extends NotificacionRepository {
  constructor(maximo = 200) {
    super();
    this.maximo = maximo;
    this.notificaciones = [];
  }

  async guardar(notificacion) {
    this.notificaciones.unshift(notificacion);
    this.notificaciones.length = Math.min(this.notificaciones.length, this.maximo);
  }

  async listarRecientes(limite) {
    return this.notificaciones.slice(0, limite);
  }
}

module.exports = InMemoryNotificacionRepository;
