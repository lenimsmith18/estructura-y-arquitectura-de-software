/**
 * @file Caso de uso: listar las últimas notificaciones enviadas (para la demo).
 */
class ListarNotificaciones {
  /** @param {{notificacionRepository: import('../ports/NotificacionRepository')}} deps */
  constructor({ notificacionRepository }) {
    this.notificacionRepository = notificacionRepository;
  }

  async ejecutar(limite = 20) {
    const lista = await this.notificacionRepository.listarRecientes(limite);
    return lista.map((n) => n.aDatos());
  }
}

module.exports = ListarNotificaciones;
