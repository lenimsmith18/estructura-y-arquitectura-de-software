/**
 * @file Contenedor de dependencias (Composition Root) de reportes-service.
 *
 * PATRÓN INYECCIÓN DE DEPENDENCIAS:
 *   Puerto                 | Producción                     | Memoria / pruebas
 *   -----------------------|--------------------------------|------------------------------
 *   ProyeccionRepository   | PostgresProyeccionRepository   | InMemoryProyeccionRepository
 *
 * Adaptadores PRIMARIOS que invocan los casos de uso:
 *   - RabbitMQConsumidor → ProyectarEvento          (suscriptor)
 *   - HTTP (Express)     → ConsultarMovimientos, GenerarReporteHoras
 */
const PostgresProyeccionRepository = require('./infrastructure/persistence/PostgresProyeccionRepository');
const InMemoryProyeccionRepository = require('./infrastructure/persistence/InMemoryProyeccionRepository');
const { crearPool, esperarBaseDeDatos } = require('./infrastructure/persistence/postgres');
const RabbitMQConsumidor = require('./infrastructure/messaging/RabbitMQConsumidor');

const ProyectarEvento = require('./application/use-cases/ProyectarEvento');
const ConsultarMovimientos = require('./application/use-cases/ConsultarMovimientos');
const GenerarReporteHoras = require('./application/use-cases/GenerarReporteHoras');

async function crearContenedor(config) {
  const recursosACerrar = [];

  let proyeccionRepository;
  if (config.repositorio === 'postgres') {
    const pool = crearPool(config.databaseUrl);
    await esperarBaseDeDatos(pool);
    proyeccionRepository = new PostgresProyeccionRepository(pool);
    await proyeccionRepository.inicializarEsquema();
    recursosACerrar.push(() => pool.end());
  } else {
    proyeccionRepository = new InMemoryProyeccionRepository();
  }

  const casosDeUso = {
    proyectarEvento: new ProyectarEvento({ proyeccionRepository }),
    consultarMovimientos: new ConsultarMovimientos({ proyeccionRepository }),
    generarReporteHoras: new GenerarReporteHoras({ proyeccionRepository }),
  };

  // Suscriptor: el adaptador primario de mensajería se conecta al caso de uso.
  let consumidor = null;
  if (config.broker === 'rabbitmq') {
    consumidor = new RabbitMQConsumidor({
      url: config.rabbitUrl,
      exchange: config.exchange,
      cola: config.cola,
      patrones: ProyectarEvento.PATRONES_DE_SUSCRIPCION,
    });
    await consumidor.iniciar((evento) => casosDeUso.proyectarEvento.ejecutar(evento));
    recursosACerrar.push(() => consumidor.cerrar());
  } else {
    console.warn('[reportes] BROKER=memoria: no se recibirán eventos de otros servicios');
  }

  return {
    casosDeUso,
    estaListo: () => (consumidor ? consumidor.listo : true),
    cerrar: async () => {
      for (const cerrar of recursosACerrar.reverse()) await cerrar();
    },
  };
}

module.exports = crearContenedor;
