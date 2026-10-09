/**
 * @file Caso de uso: Verificar identidad de un empleado (código + PIN).
 *
 * Lo consume el microservicio de Asistencia antes de registrar una entrada o
 * salida: "El sistema verifica que el empleado se encuentre registrado y activo".
 *
 * Devuelve un resultado (no lanza error) para que el servicio que pregunta
 * decida cómo reaccionar ante cada flujo alterno:
 *   - NO_IDENTIFICADO → "Empleado no registrado" (código inexistente o PIN incorrecto)
 *   - INACTIVO        → "Usuario inactivo"
 *   - AUTORIZADO      → puede registrar asistencia
 */
const Estados = Object.freeze({
  AUTORIZADO: 'AUTORIZADO',
  INACTIVO: 'INACTIVO',
  NO_IDENTIFICADO: 'NO_IDENTIFICADO',
});

class VerificarIdentidad {
  /**
   * @param {object} deps
   * @param {import('../ports/EmpleadoRepository')} deps.empleadoRepository
   * @param {import('../ports/HasherPin')}          deps.hasherPin
   */
  constructor({ empleadoRepository, hasherPin }) {
    this.empleadoRepository = empleadoRepository;
    this.hasherPin = hasherPin;
  }

  /**
   * @param {{codigo: string, pin: string}} credenciales
   * @returns {Promise<{estado: string, empleado: object|null}>}
   */
  async ejecutar({ codigo, pin }) {
    const empleado = await this.empleadoRepository.buscarPorCodigo(String(codigo || '').toUpperCase());

    // Por seguridad no se distingue "código inexistente" de "PIN incorrecto".
    if (!empleado || !(await this.hasherPin.verificar(String(pin ?? ''), empleado.pinHash))) {
      return { estado: Estados.NO_IDENTIFICADO, empleado: null };
    }
    if (!empleado.activo) {
      return { estado: Estados.INACTIVO, empleado: empleado.aDatosPublicos() };
    }
    return { estado: Estados.AUTORIZADO, empleado: empleado.aDatosPublicos() };
  }
}

VerificarIdentidad.Estados = Estados;
module.exports = VerificarIdentidad;
