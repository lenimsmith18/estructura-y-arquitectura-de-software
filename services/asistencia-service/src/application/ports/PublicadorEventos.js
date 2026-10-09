/**
 * @file Puerto de salida: PublicadorEventos.
 *
 * ARQUITECTURA HEXAGONAL — PUERTO.  PATRÓN PUBLICADOR–SUSCRIPTOR — lado PUBLICADOR.
 * Los casos de uso anuncian "algo pasó" (un evento de dominio) a través de este
 * puerto, sin saber quién lo escucha ni qué broker se usa. Adaptadores:
 *   - RabbitMQPublicador   (exchange tipo "topic" en RabbitMQ)
 *   - PublicadorEnMemoria  (pruebas: guarda los eventos en un arreglo)
 */
class PublicadorEventos {
  /**
   * @param {{id: string, tipo: string, ocurridoEn: string, origen: string, datos: object}} evento
   *        `tipo` se usa como routing key (p. ej. "empleado.registrado").
   * @returns {Promise<void>}
   */
  async publicar(evento) { throw new Error('PublicadorEventos.publicar no implementado'); }
}

module.exports = PublicadorEventos;
