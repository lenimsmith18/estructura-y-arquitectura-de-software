/**
 * @file Adaptador de entrada HTTP de reportes-service (consultas del Administrador).
 */
const express = require('express');
const { ErrorDeDominio } = require('../../domain/errores');

const STATUS_POR_CODIGO = { DATOS_INVALIDOS: 400, SERVICIO_NO_DISPONIBLE: 503 };

/**
 * @param {object} casosDeUso
 * @param {import('../../application/use-cases/ConsultarMovimientos')} casosDeUso.consultarMovimientos
 * @param {import('../../application/use-cases/GenerarReporteHoras')}  casosDeUso.generarReporteHoras
 * @param {() => boolean} estaListo Indica si el suscriptor ya está escuchando eventos.
 */
function crearApp({ consultarMovimientos, generarReporteHoras }, estaListo = () => true) {
  const app = express();
  const manejar = (fn) => (req, res, next) => fn(req, res).catch(next);

  /** Responde 503 hasta que el suscriptor esté conectado (docker-compose lo usa como healthcheck). */
  app.get('/health', (req, res) => {
    const listo = estaListo();
    res.status(listo ? 200 : 503).json({ servicio: 'reportes-service', estado: listo ? 'ok' : 'iniciando' });
  });

  /** GET /reportes/movimientos?desde=AAAA-MM-DD&hasta=AAAA-MM-DD&empleado=E001 */
  app.get('/reportes/movimientos', manejar(async (req, res) => {
    const { desde, hasta, empleado } = req.query;
    res.json(await consultarMovimientos.ejecutar({ desde, hasta, empleado }));
  }));

  /** GET /reportes/horas?desde=AAAA-MM-DD&hasta=AAAA-MM-DD */
  app.get('/reportes/horas', manejar(async (req, res) => {
    const { desde, hasta } = req.query;
    res.json(await generarReporteHoras.ejecutar({ desde, hasta }));
  }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof ErrorDeDominio) {
      return res.status(STATUS_POR_CODIGO[err.codigo] ?? 400).json({ error: err.codigo, mensaje: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'ERROR_INTERNO', mensaje: 'La operación no pudo ser procesada.' });
  });

  return app;
}

module.exports = crearApp;
