/**
 * @file Contenedor de dependencias (Composition Root) de notificaciones-service.
 *
 * PATRÓN INYECCIÓN DE DEPENDENCIAS:
 *   Puerto                   | Adaptador inyectado
 *   -------------------------|--------------------------------
 *   Notificador              | ConsolaNotificador (simula correo/SMS)
 *   NotificacionRepository   | InMemoryNotificacionRepository
 *
 * Adaptador primario: RabbitMQConsumidor → NotificarEvento (suscriptor).
 */
const ConsolaNotificador = require('./infrastructure/notifications/ConsolaNotificador');
const InMemoryNotificacionRepository = require('./infrastructure/persistence/InMemoryNotificacionRepository');
const RabbitMQConsumidor = require('./infrastructure/messaging/RabbitMQConsumidor');
const NotificarEvento = require('./application/use-cases/NotificarEvento');
const ListarNotificaciones = require('./application/use-cases/ListarNotificaciones');

async function crearContenedor(config) {
  const notificador = new ConsolaNotificador();
  const notificacionRepository = new InMemoryNotificacionRepository();

  const casosDeUso = {
    notificarEvento: new NotificarEvento({ notificador, notificacionRepository }),
    listarNotificaciones: new ListarNotificaciones({ notificacionRepository }),
  };

  let consumidor = null;
  if (config.broker === 'rabbitmq') {
    consumidor = new RabbitMQConsumidor({
      url: config.rabbitUrl,
      exchange: config.exchange,
      cola: config.cola,
      patrones: NotificarEvento.PATRONES_DE_SUSCRIPCION,
    });
    await consumidor.iniciar((evento) => casosDeUso.notificarEvento.ejecutar(evento));
  } else {
    console.warn('[notificaciones] BROKER=memoria: no se recibirán eventos de otros servicios');
  }

  return {
    casosDeUso,
    estaListo: () => (consumidor ? consumidor.listo : true),
    cerrar: async () => consumidor?.cerrar(),
  };
}

module.exports = crearContenedor;
