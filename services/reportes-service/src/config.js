/**
 * @file Configuración de reportes-service (variables de entorno).
 */
module.exports = {
  puerto: Number(process.env.PORT || 3003),
  /** "postgres" | "memoria" */
  repositorio: process.env.REPOSITORIO || 'memoria',
  /** "rabbitmq" | "memoria" (en memoria no se reciben eventos) */
  broker: process.env.BROKER || 'memoria',
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/reportes_db',
  rabbitUrl: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  exchange: process.env.EXCHANGE || 'control_asistencia.eventos',
  cola: process.env.COLA || 'reportes-service.eventos',
};
