/**
 * @file Puerto de salida: VerificadorEmpleados.
 *
 * ARQUITECTURA HEXAGONAL — PUERTO. Asistencia necesita saber si quien marca
 * está registrado y activo, pero esos datos pertenecen a OTRO microservicio
 * (empleados-service). Este puerto oculta cómo se obtiene la respuesta:
 *   - HttpVerificadorEmpleados  → llama por HTTP a empleados-service
 *   - VerificadorEnMemoria      → lista fija, para pruebas
 *
 * Si mañana la empresa decide usar tarjeta o biometría, solo cambia el adaptador.
 */
class VerificadorEmpleados {
  /**
   * @param {{codigo: string, pin: string}} credenciales
   * @returns {Promise<{estado: 'AUTORIZADO'|'INACTIVO'|'NO_IDENTIFICADO',
   *                    empleado: {id: string, codigo: string, nombre: string}|null}>}
   * @throws {import('../../domain/errores').ServicioNoDisponible} si no hay comunicación.
   */
  async verificar(credenciales) { throw new Error('VerificadorEmpleados.verificar no implementado'); }
}

module.exports = VerificadorEmpleados;
