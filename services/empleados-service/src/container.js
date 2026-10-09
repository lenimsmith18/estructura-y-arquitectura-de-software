/**
 * @file Contenedor de dependencias (Composition Root).
 *
 * PATRÓN INYECCIÓN DE DEPENDENCIAS — este es el ÚNICO lugar del microservicio
 * donde se crean objetos concretos y se conectan entre sí. Aquí se decide,
 * según la configuración, qué ADAPTADOR implementa cada PUERTO:
 *
 *   Puerto               | REPOSITORIO/BROKER=postgres/rabbitmq | =memoria
 *   ---------------------|--------------------------------------|----------------------
 *   EmpleadoRepository   | PostgresEmpleadoRepository           | InMemoryEmpleadoRepository
 *   PublicadorEventos    | RabbitMQPublicador                   | PublicadorEnMemoria
 *   HasherPin            | ScryptHasherPin                      | ScryptHasherPin
 *
 * Después, cada caso de uso recibe sus dependencias por constructor. Cambiar
 * de base de datos o de broker = cambiar una línea aquí, sin tocar el dominio
 * ni los casos de uso.
 */
const PostgresEmpleadoRepository = require('./infrastructure/persistence/PostgresEmpleadoRepository');
const InMemoryEmpleadoRepository = require('./infrastructure/persistence/InMemoryEmpleadoRepository');
const { crearPool, esperarBaseDeDatos } = require('./infrastructure/persistence/postgres');
const RabbitMQPublicador = require('./infrastructure/messaging/RabbitMQPublicador');
const PublicadorEnMemoria = require('./infrastructure/messaging/PublicadorEnMemoria');
const ScryptHasherPin = require('./infrastructure/security/ScryptHasherPin');

const RegistrarEmpleado = require('./application/use-cases/RegistrarEmpleado');
const ActualizarEmpleado = require('./application/use-cases/ActualizarEmpleado');
const ConsultarEmpleados = require('./application/use-cases/ConsultarEmpleados');
const VerificarIdentidad = require('./application/use-cases/VerificarIdentidad');

/**
 * @param {object} config Ver src/config.js
 * @returns {Promise<{casosDeUso: object, cerrar: () => Promise<void>}>}
 */
async function crearContenedor(config) {
  const recursosACerrar = [];

  // ---- Adaptadores de salida (driven adapters) ----
  let empleadoRepository;
  if (config.repositorio === 'postgres') {
    const pool = crearPool(config.databaseUrl);
    await esperarBaseDeDatos(pool);
    empleadoRepository = new PostgresEmpleadoRepository(pool);
    await empleadoRepository.inicializarEsquema();
    recursosACerrar.push(() => pool.end());
  } else {
    empleadoRepository = new InMemoryEmpleadoRepository();
  }

  let publicadorEventos;
  if (config.broker === 'rabbitmq') {
    publicadorEventos = new RabbitMQPublicador({ url: config.rabbitUrl, exchange: config.exchange });
    await publicadorEventos.conectar();
    recursosACerrar.push(() => publicadorEventos.cerrar());
  } else {
    publicadorEventos = new PublicadorEnMemoria();
  }

  const hasherPin = new ScryptHasherPin();

  // ---- Casos de uso (puertos de entrada) con dependencias inyectadas ----
  const casosDeUso = {
    registrarEmpleado: new RegistrarEmpleado({ empleadoRepository, hasherPin, publicadorEventos }),
    actualizarEmpleado: new ActualizarEmpleado({ empleadoRepository, publicadorEventos }),
    consultarEmpleados: new ConsultarEmpleados({ empleadoRepository }),
    verificarIdentidad: new VerificarIdentidad({ empleadoRepository, hasherPin }),
  };

  return {
    casosDeUso,
    empleadoRepository,
    cerrar: async () => {
      for (const cerrar of recursosACerrar.reverse()) await cerrar();
    },
  };
}

module.exports = crearContenedor;
