/**
 * @file Adaptador de entrada HTTP (API REST con Express).
 *
 * ARQUITECTURA HEXAGONAL — ADAPTADOR PRIMARIO (driving adapter). Traduce
 * peticiones HTTP a llamadas a los casos de uso y los resultados/errores a
 * respuestas HTTP. No contiene reglas de negocio.
 *
 * INYECCIÓN DE DEPENDENCIAS: recibe los casos de uso ya construidos; no sabe
 * si detrás hay PostgreSQL, memoria, RabbitMQ...
 */
const express = require('express');
const { ErrorDeDominio } = require('../../domain/errores');

/** Traducción de códigos de error de dominio a status HTTP. */
const STATUS_POR_CODIGO = {
  DATOS_INVALIDOS: 400,
  EMPLEADO_NO_ENCONTRADO: 404,
  CODIGO_DUPLICADO: 409,
  SERVICIO_NO_DISPONIBLE: 503,
};

/**
 * @param {object} casosDeUso
 * @param {import('../../application/use-cases/RegistrarEmpleado')}  casosDeUso.registrarEmpleado
 * @param {import('../../application/use-cases/ActualizarEmpleado')} casosDeUso.actualizarEmpleado
 * @param {import('../../application/use-cases/ConsultarEmpleados')} casosDeUso.consultarEmpleados
 * @param {import('../../application/use-cases/VerificarIdentidad')} casosDeUso.verificarIdentidad
 */
function crearApp({ registrarEmpleado, actualizarEmpleado, consultarEmpleados, verificarIdentidad }) {
  const app = express();
  app.use(express.json());

  // Envuelve handlers async para enviar los errores al middleware de errores.
  const manejar = (fn) => (req, res, next) => fn(req, res).catch(next);

  app.get('/health', (req, res) => res.json({ servicio: 'empleados-service', estado: 'ok' }));

  /** Administrador: listar empleados. */
  app.get('/empleados', manejar(async (req, res) => {
    res.json(await consultarEmpleados.listar());
  }));

  /** Administrador: registrar un empleado. Body: {codigo, nombre, cargo, pin, activo?} */
  app.post('/empleados', manejar(async (req, res) => {
    res.status(201).json(await registrarEmpleado.ejecutar(req.body ?? {}));
  }));

  /**
   * Endpoint interno usado por asistencia-service (comunicación síncrona entre
   * microservicios). El gateway lo bloquea para que no sea público.
   * Body: {codigo, pin}
   */
  app.post('/empleados/verificacion', manejar(async (req, res) => {
    res.json(await verificarIdentidad.ejecutar(req.body ?? {}));
  }));

  /** Administrador: obtener un empleado. */
  app.get('/empleados/:id', manejar(async (req, res) => {
    res.json(await consultarEmpleados.obtener(req.params.id));
  }));

  /** Administrador: actualizar nombre, cargo o estado (activo/inactivo). */
  app.patch('/empleados/:id', manejar(async (req, res) => {
    const { nombre, cargo, activo } = req.body ?? {};
    res.json(await actualizarEmpleado.ejecutar(req.params.id, { nombre, cargo, activo }));
  }));

  // Middleware de errores: dominio → HTTP.
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
