/**
 * @file Adaptador de salida: publicador de eventos en memoria.
 *
 * Implementa el mismo puerto PublicadorEventos que RabbitMQPublicador, pero
 * solo guarda los eventos en un arreglo. Se usa en pruebas (para comprobar
 * qué eventos se publicaron) y al ejecutar el servicio sin broker (BROKER=memoria).
 */
const PublicadorEventos = require('../../application/ports/PublicadorEventos');

class PublicadorEnMemoria extends PublicadorEventos {
  constructor({ silencioso = false } = {}) {
    super();
    this.silencioso = silencioso;
    /** @type {object[]} */
    this.eventos = [];
  }

  async publicar(evento) {
    this.eventos.push(evento);
    if (!this.silencioso) console.log(`[evento en memoria] ${evento.tipo}`);
  }
}

module.exports = PublicadorEnMemoria;
