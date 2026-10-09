/**
 * @file Entidad Notificacion y regla para construirla a partir de un evento.
 *
 * ARQUITECTURA HEXAGONAL — DOMINIO. Decide QUÉ se le comunica al empleado
 * ante cada hecho del sistema; CÓMO se envía (correo, SMS, consola) lo decide
 * el adaptador del puerto Notificador.
 */
const { randomUUID } = require('node:crypto');

class Notificacion {
  /**
   * @param {{id: string, destinatario: string, asunto: string, mensaje: string, eventoTipo: string, creadaEn?: Date}} props
   */
  constructor({ id, destinatario, asunto, mensaje, eventoTipo, creadaEn = new Date() }) {
    Object.assign(this, { id, destinatario, asunto, mensaje, eventoTipo, creadaEn: new Date(creadaEn) });
  }

  aDatos() {
    return { ...this, creadaEn: this.creadaEn.toISOString() };
  }
}

/** Formatea fecha y hora en español de Colombia (zona horaria del servidor). */
const fechaLegible = (iso) => new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

/**
 * Regla de negocio: traduce un evento a la notificación que corresponde.
 * @param {{tipo: string, datos: object}} evento
 * @returns {Notificacion|null} null si el evento no requiere notificación.
 */
function notificacionDesdeEvento({ tipo, datos }) {
  const base = { id: randomUUID(), eventoTipo: tipo };
  switch (tipo) {
    case 'asistencia.entrada_registrada':
      return new Notificacion({
        ...base,
        destinatario: datos.empleadoCodigo,
        asunto: 'Entrada registrada',
        mensaje: `Hola ${datos.empleadoNombre}, registramos tu ENTRADA: ${fechaLegible(datos.fechaHora)}`,
      });
    case 'asistencia.salida_registrada': {
      const h = Math.floor((datos.duracionMinutos ?? 0) / 60);
      const m = (datos.duracionMinutos ?? 0) % 60;
      return new Notificacion({
        ...base,
        destinatario: datos.empleadoCodigo,
        asunto: 'Salida registrada',
        mensaje: `Hola ${datos.empleadoNombre}, registramos tu SALIDA: ${fechaLegible(datos.fechaHora)} · Jornada: ${h} h ${m} min.`,
      });
    }
    case 'empleado.registrado':
      return new Notificacion({
        ...base,
        destinatario: datos.codigo,
        asunto: 'Bienvenido al sistema de control de asistencia',
        mensaje: `Hola ${datos.nombre}, ya puedes registrar tu entrada y salida con el código ${datos.codigo}.`,
      });
    default:
      return null;
  }
}

module.exports = { Notificacion, notificacionDesdeEvento };
