/**
 * @file Punto de entrada del microservicio de Notificaciones.
 *
 * MICROSERVICIOS: proceso independiente (puerto 3004). Responsabilidad:
 * avisar a los empleados cada vez que se registra su entrada o salida.
 */
const config = require('./config');
const crearContenedor = require('./container');
const crearApp = require('./infrastructure/http/crearApp');

async function iniciar() {
  const contenedor = await crearContenedor(config);

  const servidor = crearApp(contenedor.casosDeUso, contenedor.estaListo).listen(config.puerto, () => {
    console.log(`notificaciones-service escuchando en http://localhost:${config.puerto} (broker=${config.broker})`);
  });

  const apagar = async () => {
    console.log('Apagando notificaciones-service...');
    servidor.close();
    await contenedor.cerrar();
    process.exit(0);
  };
  process.on('SIGINT', apagar);
  process.on('SIGTERM', apagar);
}

iniciar().catch((err) => {
  console.error('No fue posible iniciar notificaciones-service:', err);
  process.exit(1);
});
