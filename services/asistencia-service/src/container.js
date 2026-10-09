/**
 * @file Contenedor de dependencias (Composition Root) de asistencia-service.
 *
 * PATRÓN INYECCIÓN DE DEPENDENCIAS — único lugar donde se eligen y crean los
 * adaptadores concretos y se inyectan en los casos de uso:
 *
 *   Puerto                | Producción (docker-compose)   | Memoria / pruebas
 *   ----------------------|-------------------------------|-------------------------
 *   MarcacionRepository   | PostgresMarcacionRepository   | InMemoryMarcacionRepository
 *   VerificadorEmpleados  | HttpVerificadorEmpleados      | VerificadorEnMemoria
 *   PublicadorEventos     | RabbitMQPublicador            | PublicadorEnMemoria
 *   Reloj                 | RelojDelSistema               | (en pruebas: reloj fijo)
 */
const PostgresMarcacionRepository = require('./infrastructure/persistence/PostgresMarcacionRepository');
const InMemoryMarcacionRepository = require('./infrastructure/persistence/InMemoryMarcacionRepository');
const { crearPool, esperarBaseDeDatos } = require('./infrastructure/persistence/postgres');
const HttpVerificadorEmpleados = require('./infrastructure/clients/HttpVerificadorEmpleados');
const VerificadorEnMemoria = require('./infrastructure/clients/VerificadorEnMemoria');
const RabbitMQPublicador = require('./infrastructure/messaging/RabbitMQPublicador');
const PublicadorEnMemoria = require('./infrastructure/messaging/PublicadorEnMemoria');
const { RelojDelSistema } = require('./application/ports/Reloj');

const RegistrarEntrada = require('./application/use-cases/RegistrarEntrada');
const RegistrarSalida = require('./application/use-cases/RegistrarSalida');
const ConsultarMisMarcaciones = require('./application/use-cases/ConsultarMisMarcaciones');

async function crearContenedor(config) {
  const recursosACerrar = [];

  let marcacionRepository;
  if (config.repositorio === 'postgres') {
    const pool = crearPool(config.databaseUrl);
    await esperarBaseDeDatos(pool);
    marcacionRepository = new PostgresMarcacionRepository(pool);
    await marcacionRepository.inicializarEsquema();
    recursosACerrar.push(() => pool.end());
  } else {
    marcacionRepository = new InMemoryMarcacionRepository();
  }

  const verificadorEmpleados = config.verificador === 'http'
    ? new HttpVerificadorEmpleados({ urlBase: config.empleadosUrl })
    : new VerificadorEnMemoria();

  let publicadorEventos;
  if (config.broker === 'rabbitmq') {
    publicadorEventos = new RabbitMQPublicador({ url: config.rabbitUrl, exchange: config.exchange });
    await publicadorEventos.conectar();
    recursosACerrar.push(() => publicadorEventos.cerrar());
  } else {
    publicadorEventos = new PublicadorEnMemoria();
  }

  const reloj = new RelojDelSistema();
  const deps = { verificadorEmpleados, marcacionRepository, publicadorEventos, reloj };

  const casosDeUso = {
    registrarEntrada: new RegistrarEntrada(deps),
    registrarSalida: new RegistrarSalida(deps),
    consultarMisMarcaciones: new ConsultarMisMarcaciones(deps),
  };

  return {
    casosDeUso,
    cerrar: async () => {
      for (const cerrar of recursosACerrar.reverse()) await cerrar();
    },
  };
}

module.exports = crearContenedor;
