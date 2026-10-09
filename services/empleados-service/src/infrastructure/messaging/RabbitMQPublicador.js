/**
 * @file Adaptador de salida: publicador de eventos sobre RabbitMQ.
 *
 * PATRÓN PUBLICADOR–SUSCRIPTOR — implementación con un exchange de tipo
 * "topic". El publicador envía el evento al exchange con una routing key
 * (p. ej. "empleado.registrado") y NO conoce a los suscriptores: RabbitMQ
 * entrega una copia a cada cola enlazada con un patrón que coincida
 * (p. ej. "empleado.*"). Así se logra el desacoplamiento entre microservicios.
 *
 * ARQUITECTURA HEXAGONAL — ADAPTADOR del puerto PublicadorEventos.
 */
const amqp = require('amqplib');
const PublicadorEventos = require('../../application/ports/PublicadorEventos');

class RabbitMQPublicador extends PublicadorEventos {
  /**
   * @param {object} opciones
   * @param {string} opciones.url      amqp://usuario:clave@host:5672
   * @param {string} opciones.exchange Nombre del exchange compartido por el sistema.
   */
  constructor({ url, exchange }) {
    super();
    this.url = url;
    this.exchange = exchange;
    this.canal = null;
    this.conexion = null;
  }

  /** Abre la conexión (con reintentos, el broker puede tardar en arrancar). */
  async conectar(intentos = 20, esperaMs = 2000) {
    for (let i = 1; i <= intentos; i++) {
      try {
        this.conexion = await amqp.connect(this.url);
        this.canal = await this.conexion.createConfirmChannel();
        await this.canal.assertExchange(this.exchange, 'topic', { durable: true });
        this.conexion.on('close', () => {
          console.error('[rabbitmq] conexión cerrada');
          this.canal = null;
        });
        console.log(`[rabbitmq] publicador conectado al exchange "${this.exchange}"`);
        return;
      } catch (err) {
        console.warn(`[rabbitmq] no disponible (intento ${i}/${intentos}): ${err.message}`);
        await new Promise((r) => setTimeout(r, esperaMs));
      }
    }
    throw new Error('No fue posible conectar con RabbitMQ');
  }

  async publicar(evento) {
    if (!this.canal) {
      // Decisión de diseño: la operación principal ya se guardó; se registra el
      // fallo en vez de deshacerla. En producción se usaría el patrón Outbox.
      console.error(`[rabbitmq] evento NO publicado (sin conexión): ${evento.tipo} ${evento.id}`);
      return;
    }
    const contenido = Buffer.from(JSON.stringify(evento));
    this.canal.publish(this.exchange, evento.tipo, contenido, {
      contentType: 'application/json',
      messageId: evento.id,
      persistent: true,
    });
    await this.canal.waitForConfirms(); // confirma que el broker recibió el mensaje
    console.log(`[evento publicado] ${evento.tipo} → ${JSON.stringify(evento.datos)}`);
  }

  async cerrar() {
    await this.conexion?.close().catch(() => {});
  }
}

module.exports = RabbitMQPublicador;
