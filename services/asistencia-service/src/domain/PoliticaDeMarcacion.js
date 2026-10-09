/**
 * @file Servicio de dominio: reglas para crear marcaciones.
 *
 * ARQUITECTURA HEXAGONAL — DOMINIO. Aquí viven las reglas de negocio de los
 * flujos alternos "Registro de entrada duplicado" y "Registro de salida sin
 * entrada". Son funciones puras: reciben la última marcación y la hora actual
 * y devuelven la nueva marcación o lanzan el error de negocio correspondiente.
 */
const Marcacion = require('./Marcacion');
const { EntradaDuplicada, SalidaSinEntrada } = require('./errores');

/**
 * @param {object} p
 * @param {string} p.id
 * @param {{id: string, codigo: string, nombre: string}} p.empleado
 * @param {Marcacion|null} p.ultimaMarcacion Última marcación del empleado (o null).
 * @param {Date} p.ahora
 * @returns {Marcacion}
 */
function crearEntrada({ id, empleado, ultimaMarcacion, ahora }) {
  // Regla: no se permite una entrada si la anterior sigue abierta (sin salida).
  if (ultimaMarcacion && ultimaMarcacion.esEntrada()) {
    throw new EntradaDuplicada(ultimaMarcacion.fechaHora);
  }
  return new Marcacion({
    id,
    empleadoId: empleado.id,
    empleadoCodigo: empleado.codigo,
    empleadoNombre: empleado.nombre,
    tipo: Marcacion.Tipos.ENTRADA,
    fechaHora: ahora,
  });
}

/**
 * @param {object} p  Mismos parámetros que crearEntrada.
 * @returns {Marcacion}
 */
function crearSalida({ id, empleado, ultimaMarcacion, ahora }) {
  // Regla: solo se puede salir si existe una entrada abierta.
  if (!ultimaMarcacion || !ultimaMarcacion.esEntrada()) {
    throw new SalidaSinEntrada();
  }
  const duracionMinutos = Math.max(0, Math.round((ahora - ultimaMarcacion.fechaHora) / 60000));
  return new Marcacion({
    id,
    empleadoId: empleado.id,
    empleadoCodigo: empleado.codigo,
    empleadoNombre: empleado.nombre,
    tipo: Marcacion.Tipos.SALIDA,
    fechaHora: ahora,
    entradaId: ultimaMarcacion.id,
    duracionMinutos,
  });
}

module.exports = { crearEntrada, crearSalida };
