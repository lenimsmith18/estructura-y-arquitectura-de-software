/**
 * @file Caso de uso: Notificar un evento.
 *
 * PATRÓN PUBLICADOR–SUSCRIPTOR — segundo SUSCRIPTOR de los mismos eventos que
 * consume reportes-service. asistencia-service no sabe que este servicio
 * existe: agregarlo no requirió cambiar ni una línea del publicador.
 */
const { notificacionDesdeEvento } = require('../../domain/Notificacion');

class NotificarEvento {
  /**
   * @param {object} deps  (inyectadas por el contenedor)
   * @param {import('../ports/Notificador')}            deps.notificador
   * @param {import('../ports/NotificacionRepository')} deps.notificacionRepository
   */
  constructor({ notificador, notificacionRepository }) {
    this.notificador = notificador;
    this.notificacionRepository = notificacionRepository;
  }

  /** @param {{tipo: string, datos: object}} evento */
  async ejecutar(evento) {
    const notificacion = notificacionDesdeEvento(evento);
    if (!notificacion) return null;
    await this.notificador.enviar(notificacion);
    await this.notificacionRepository.guardar(notificacion);
    return notificacion.aDatos();
  }
}

NotificarEvento.PATRONES_DE_SUSCRIPCION = ['asistencia.*', 'empleado.registrado'];
module.exports = NotificarEvento;
