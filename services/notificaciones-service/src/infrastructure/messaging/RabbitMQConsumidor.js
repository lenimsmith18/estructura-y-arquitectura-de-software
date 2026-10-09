/**
 * @file Adaptador de entrada: consumidor de eventos de RabbitMQ.
 *
 * PATRÓN PUBLICADOR–SUSCRIPTOR — lado SUSCRIPTOR. Este microservicio declara
 * su PROPIA cola durable y la enlaza al exchange "topic" con patrones como
 * "asistencia.*". RabbitMQ copia cada evento coincidente a esta cola, de forma
 * independiente a las colas de los demás suscriptores (fan-out).
 *
 * ARQUITECTURA HEXAGONAL — ADAPTADOR PRIMARIO (driving adapter), igual que el
 * adaptador HTTP: recibe un estímulo externo (un mensaje) e invoca un caso de uso.
 */
const amqp = require('amqplib');
const { ServicioNoDisponible } = require('../../domain/errores');

class RabbitMQConsumidor {
  /**
   * @param {object} opciones
   * @param {string}   opciones.url
   * @param {string}   opciones.exchange
   * @param {string}   opciones.cola      Cola exclusiva de este microservicio.
   * @param {string[]} opciones.patrones  Routing keys a las que se suscribe (p. ej. ["asistencia.*"]).
   */
  constructor({ url, exchange, cola, patrones }) {
    Object.assign(this, { url, exchange, cola, patrones });
    this.conexion = null;
    this.listo = false;
  }

  /**
   * Conecta, crea/enlaza la cola y comienza a consumir.
   * @param {(evento: object) => Promise<void>} manejador Normalmente `casoDeUso.ejecutar`.
   */
  async iniciar(manejador, intentos = 20, esperaMs = 2000) {
    for (let i = 1; i <= intentos; i++) {
      try {
        this.conexion = await amqp.connect(this.url);
        break;
      } catch (err) {
        console.warn(`[rabbitmq] no disponible (intento ${i}/${intentos}): ${err.message}`);
        if (i === intentos) throw new Error('No fue posible conectar con RabbitMQ');
        await new Promise((r) => setTimeout(r, esperaMs));
      }
    }

    const canal = await this.conexion.createChannel();
    await canal.assertExchange(this.exchange, 'topic', { durable: true });
    await canal.assertQueue(this.cola, { durable: true });
    for (const patron of this.patrones) await canal.bindQueue(this.cola, this.exchange, patron);
    await canal.prefetch(10);

    this.conexion.on('close', () => {
      console.error('[rabbitmq] conexión cerrada; el consumidor dejó de recibir eventos');
      this.listo = false;
    });

    await canal.consume(this.cola, async (mensaje) => {
      if (!mensaje) return;
      let evento;
      try {
        evento = JSON.parse(mensaje.content.toString());
        console.log(`[evento recibido] ${evento.tipo} (${evento.id})`);
        await manejador(evento);
        canal.ack(mensaje); // confirmación: el evento fue procesado
      } catch (err) {
        // Si la base de datos no está disponible se reintenta más tarde;
        // un mensaje malformado se descarta para no bloquear la cola.
        const reintentar = err instanceof ServicioNoDisponible;
        console.error(`[evento con error] ${evento?.tipo ?? 'desconocido'}: ${err.message} (reintentar=${reintentar})`);
        if (reintentar) await new Promise((r) => setTimeout(r, 2000));
        canal.nack(mensaje, false, reintentar);
      }
    });

    this.listo = true;
    console.log(`[rabbitmq] cola "${this.cola}" suscrita a: ${this.patrones.join(', ')}`);
  }

  async cerrar() {
    this.listo = false;
    await this.conexion?.close().catch(() => {});
  }
}

module.exports = RabbitMQConsumidor;
