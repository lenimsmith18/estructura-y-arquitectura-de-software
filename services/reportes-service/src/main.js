/**
 * @file Punto de entrada del microservicio de Reportes.
 *
 * MICROSERVICIOS: proceso independiente (puerto 3003, base reportes_db).
 * Responsabilidad: atender las consultas del administrador (movimientos por
 * período y reporte de horas) a partir de los eventos que recibe.
 */
const config = require('./config');
const crearContenedor = require('./container');
const crearApp = require('./infrastructure/http/crearApp');

async function iniciar() {
  const contenedor = await crearContenedor(config);

  const servidor = crearApp(contenedor.casosDeUso, contenedor.estaListo).listen(config.puerto, () => {
    console.log(`reportes-service escuchando en http://localhost:${config.puerto} ` +
      `(repositorio=${config.repositorio}, broker=${config.broker})`);
  });

  const apagar = async () => {
    console.log('Apagando reportes-service...');
    servidor.close();
    await contenedor.cerrar();
    process.exit(0);
  };
  process.on('SIGINT', apagar);
  process.on('SIGTERM', apagar);
}

iniciar().catch((err) => {
  console.error('No fue posible iniciar reportes-service:', err);
  process.exit(1);
});
