/**
 * @file Configuración de notificaciones-service (variables de entorno).
 */
module.exports = {
  puerto: Number(process.env.PORT || 3004),
  /** "rabbitmq" | "memoria" (en memoria no se reciben eventos) */
  broker: process.env.BROKER || 'memoria',
  rabbitUrl: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  exchange: process.env.EXCHANGE || 'control_asistencia.eventos',
  cola: process.env.COLA || 'notificaciones-service.eventos',
};
