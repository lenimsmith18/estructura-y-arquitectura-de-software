/**
 * @file Adaptador de entrada HTTP de asistencia-service.
 *
 * ARQUITECTURA HEXAGONAL — ADAPTADOR PRIMARIO: convierte peticiones HTTP en
 * llamadas a los casos de uso y los errores de dominio en status HTTP.
 */
const express = require('express');
const { ErrorDeDominio } = require('../../domain/errores');

const STATUS_POR_CODIGO = {
  DATOS_INVALIDOS: 400,
  EMPLEADO_NO_IDENTIFICADO: 401,   // Flujo alterno: empleado no registrado
  EMPLEADO_INACTIVO: 403,          // Flujo alterno: usuario inactivo
  ENTRADA_DUPLICADA: 409,          // Flujo alterno: entrada duplicada
  SALIDA_SIN_ENTRADA: 409,         // Flujo alterno: salida sin entrada
  SERVICIO_NO_DISPONIBLE: 503,     // Flujo alterno: error de conexión
};

/**
 * @param {object} casosDeUso
 * @param {import('../../application/use-cases/RegistrarEntrada')}        casosDeUso.registrarEntrada
 * @param {import('../../application/use-cases/RegistrarSalida')}         casosDeUso.registrarSalida
 * @param {import('../../application/use-cases/ConsultarMisMarcaciones')} casosDeUso.consultarMisMarcaciones
 */
function crearApp({ registrarEntrada, registrarSalida, consultarMisMarcaciones }) {
  const app = express();
  app.use(express.json());
  const manejar = (fn) => (req, res, next) => fn(req, res).catch(next);

  app.get('/health', (req, res) => res.json({ servicio: 'asistencia-service', estado: 'ok' }));

  /** Empleado: registrar entrada. Body: {codigo, pin} */
  app.post('/marcaciones/entrada', manejar(async (req, res) => {
    res.status(201).json(await registrarEntrada.ejecutar(req.body ?? {}));
  }));

  /** Empleado: registrar salida. Body: {codigo, pin} */
  app.post('/marcaciones/salida', manejar(async (req, res) => {
    res.status(201).json(await registrarSalida.ejecutar(req.body ?? {}));
  }));

  /** Empleado: ver sus últimas 10 marcaciones. Body: {codigo, pin} */
  app.post('/marcaciones/mias', manejar(async (req, res) => {
    res.json(await consultarMisMarcaciones.ejecutar(req.body ?? {}));
  }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof ErrorDeDominio) {
      return res.status(STATUS_POR_CODIGO[err.codigo] ?? 400).json({ error: err.codigo, mensaje: err.message });
    }
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'JSON_INVALIDO', mensaje: 'El cuerpo de la petición no es JSON válido.' });
    }
    console.error(err);
    res.status(500).json({ error: 'ERROR_INTERNO', mensaje: 'La operación no pudo ser procesada.' });
  });

  return app;
}

module.exports = crearApp;
