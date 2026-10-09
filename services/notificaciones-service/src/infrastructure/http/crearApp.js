/**
 * @file Adaptador de entrada HTTP de notificaciones-service.
 */
const express = require('express');

/**
 * @param {{listarNotificaciones: import('../../application/use-cases/ListarNotificaciones')}} casosDeUso
 * @param {() => boolean} estaListo
 */
function crearApp({ listarNotificaciones }, estaListo = () => true) {
  const app = express();

  app.get('/health', (req, res) => {
    const listo = estaListo();
    res.status(listo ? 200 : 503).json({ servicio: 'notificaciones-service', estado: listo ? 'ok' : 'iniciando' });
  });

  /** GET /notificaciones?limite=20 */
  app.get('/notificaciones', async (req, res, next) => {
    try {
      const limite = Math.min(Number(req.query.limite) || 20, 200);
      res.json(await listarNotificaciones.ejecutar(limite));
    } catch (err) {
      next(err);
    }
  });

  return app;
}

module.exports = crearApp;
