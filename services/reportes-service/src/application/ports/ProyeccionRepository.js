/**
 * @file Puerto de salida: ProyeccionRepository.
 *
 * reportes-service NO consulta las bases de datos de otros microservicios.
 * Construye su propia "proyección" (modelo de lectura) a partir de los
 * eventos que recibe como SUSCRIPTOR. Este puerto define cómo se guarda y
 * consulta esa proyección. Adaptadores: PostgresProyeccionRepository,
 * InMemoryProyeccionRepository.
 */
class ProyeccionRepository {
  /**
   * Inserta o actualiza la copia local de un empleado.
   * @param {{id: string, codigo: string, nombre: string, cargo: string, activo: boolean}} empleado
   */
  async guardarEmpleado(empleado) { throw new Error('ProyeccionRepository.guardarEmpleado no implementado'); }

  /** @returns {Promise<Array<object>>} */
  async listarEmpleados() { throw new Error('ProyeccionRepository.listarEmpleados no implementado'); }

  /**
   * Guarda un movimiento. Debe ser IDEMPOTENTE: si el mismo evento llega dos
   * veces (entrega "al menos una vez" del broker) no se duplica.
   * @param {{id: string, empleadoId: string, empleadoCodigo: string, empleadoNombre: string,
   *          tipo: string, fechaHora: Date, duracionMinutos: number|null}} movimiento
   * @returns {Promise<boolean>} true si era nuevo.
   */
  async guardarMovimiento(movimiento) { throw new Error('ProyeccionRepository.guardarMovimiento no implementado'); }

  /**
   * @param {{periodo: import('../../domain/Periodo'), empleadoCodigo?: string}} filtro
   * @returns {Promise<Array<object>>} ordenados por fecha ascendente.
   */
  async listarMovimientos(filtro) { throw new Error('ProyeccionRepository.listarMovimientos no implementado'); }
}

module.exports = ProyeccionRepository;
