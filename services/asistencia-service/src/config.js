/**
 * @file Configuración de asistencia-service (variables de entorno).
 */
module.exports = {
  puerto: Number(process.env.PORT || 3002),
  /** "postgres" | "memoria" */
  repositorio: process.env.REPOSITORIO || 'memoria',
  /** "rabbitmq" | "memoria" */
  broker: process.env.BROKER || 'memoria',
  /** "http" | "memoria" — cómo se verifica la identidad del empleado. */
  verificador: process.env.VERIFICADOR || 'memoria',
  empleadosUrl: process.env.EMPLEADOS_URL || 'http://localhost:3001',
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/asistencia_db',
  rabbitUrl: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  exchange: process.env.EXCHANGE || 'control_asistencia.eventos',
};
