/**
 * @file Configuración leída de variables de entorno (12-factor).
 * Cada microservicio se configura de forma independiente.
 */
module.exports = {
  puerto: Number(process.env.PORT || 3001),
  /** "postgres" | "memoria" — qué adaptador de persistencia inyectar. */
  repositorio: process.env.REPOSITORIO || 'memoria',
  /** "rabbitmq" | "memoria" — qué adaptador de mensajería inyectar. */
  broker: process.env.BROKER || 'memoria',
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/empleados_db',
  rabbitUrl: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  exchange: process.env.EXCHANGE || 'control_asistencia.eventos',
  /** Si es "true" crea empleados de ejemplo cuando la base está vacía. */
  datosDemo: (process.env.DATOS_DEMO || 'true') === 'true',
};
