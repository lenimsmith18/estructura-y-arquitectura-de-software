/**
 * @file Adaptador de salida: verificación de empleados vía HTTP.
 *
 * MICROSERVICIOS — comunicación SÍNCRONA entre servicios. Asistencia no lee la
 * base de datos de empleados: le pregunta a empleados-service por su API.
 * Se eligió una llamada síncrona (y no una réplica por eventos) porque la
 * autorización debe ser inmediata: si el administrador desactiva a un
 * empleado, su siguiente marcación ya debe ser rechazada.
 *
 * ARQUITECTURA HEXAGONAL — ADAPTADOR del puerto VerificadorEmpleados.
 * Cubre el flujo alterno "Error de conexión": si empleados-service no responde,
 * lanza ServicioNoDisponible.
 */
const VerificadorEmpleados = require('../../application/ports/VerificadorEmpleados');
const { ServicioNoDisponible } = require('../../domain/errores');

class HttpVerificadorEmpleados extends VerificadorEmpleados {
  /**
   * @param {object} opciones
   * @param {string} opciones.urlBase   p. ej. http://empleados-service:3001
   * @param {number} [opciones.timeoutMs]
   */
  constructor({ urlBase, timeoutMs = 3000 }) {
    super();
    this.urlBase = urlBase;
    this.timeoutMs = timeoutMs;
  }

  async verificar({ codigo, pin }) {
    let respuesta;
    try {
      respuesta = await fetch(`${this.urlBase}/empleados/verificacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, pin }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (err) {
      console.error(`[empleados-service] sin comunicación: ${err.message}`);
      throw new ServicioNoDisponible('servicio de empleados');
    }
    if (!respuesta.ok) {
      console.error(`[empleados-service] respondió ${respuesta.status}`);
      throw new ServicioNoDisponible('servicio de empleados');
    }
    return respuesta.json();
  }
}

module.exports = HttpVerificadorEmpleados;
