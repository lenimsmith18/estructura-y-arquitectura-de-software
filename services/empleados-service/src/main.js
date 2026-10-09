/**
 * @file Punto de entrada del microservicio de Empleados.
 *
 * MICROSERVICIOS: proceso independiente, con su propio puerto, su propia base
 * de datos (empleados_db) y su propio ciclo de despliegue (Dockerfile propio).
 *
 * Responsabilidad (bounded context): administrar la información de los
 * empleados y verificar su identidad.
 */
const config = require('./config');
const crearContenedor = require('./container');
const crearApp = require('./infrastructure/http/crearApp');

/** Empleados de ejemplo para la demostración (se registran usando el propio caso de uso). */
const EMPLEADOS_DEMO = [
  { codigo: 'E001', nombre: 'Ana Gómez', cargo: 'Analista', pin: '1234' },
  { codigo: 'E002', nombre: 'Carlos Pérez', cargo: 'Desarrollador', pin: '1234' },
  { codigo: 'E003', nombre: 'Laura Ríos', cargo: 'Diseñadora', pin: '1234', activo: false },
];

async function iniciar() {
  const contenedor = await crearContenedor(config);
  const { casosDeUso, empleadoRepository } = contenedor;

  if (config.datosDemo && (await empleadoRepository.contar()) === 0) {
    for (const datos of EMPLEADOS_DEMO) await casosDeUso.registrarEmpleado.ejecutar(datos);
    console.log('[demo] empleados de ejemplo creados: E001, E002 (PIN 1234) y E003 inactivo');
  }

  const servidor = crearApp(casosDeUso).listen(config.puerto, () => {
    console.log(`empleados-service escuchando en http://localhost:${config.puerto} ` +
      `(repositorio=${config.repositorio}, broker=${config.broker})`);
  });

  const apagar = async () => {
    console.log('Apagando empleados-service...');
    servidor.close();
    await contenedor.cerrar();
    process.exit(0);
  };
  process.on('SIGINT', apagar);
  process.on('SIGTERM', apagar);
}

iniciar().catch((err) => {
  console.error('No fue posible iniciar empleados-service:', err);
  process.exit(1);
});
