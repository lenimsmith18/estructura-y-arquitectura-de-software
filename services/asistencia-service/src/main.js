/**
 * @file Punto de entrada del microservicio de Asistencia.
 *
 * MICROSERVICIOS: proceso independiente (puerto 3002, base asistencia_db).
 * Responsabilidad: registrar entradas y salidas aplicando las reglas del
 * caso de uso, y anunciar cada marcación mediante eventos.
 */
const config = require('./config');
const crearContenedor = require('./container');
const crearApp = require('./infrastructure/http/crearApp');

async function iniciar() {
  const contenedor = await crearContenedor(config);

  const servidor = crearApp(contenedor.casosDeUso).listen(config.puerto, () => {
    console.log(`asistencia-service escuchando en http://localhost:${config.puerto} ` +
      `(repositorio=${config.repositorio}, broker=${config.broker}, verificador=${config.verificador})`);
  });

  const apagar = async () => {
    console.log('Apagando asistencia-service...');
    servidor.close();
    await contenedor.cerrar();
    process.exit(0);
  };
  process.on('SIGINT', apagar);
  process.on('SIGTERM', apagar);
}

iniciar().catch((err) => {
  console.error('No fue posible iniciar asistencia-service:', err);
  process.exit(1);
});
