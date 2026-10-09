/**
 * @file Puerto de salida: MarcacionRepository.
 *
 * ARQUITECTURA HEXAGONAL — PUERTO. Adaptadores en infrastructure/persistence:
 * PostgresMarcacionRepository e InMemoryMarcacionRepository.
 */
class MarcacionRepository {
  /** @param {import('../../domain/Marcacion')} marcacion @returns {Promise<void>} */
  async guardar(marcacion) { throw new Error('MarcacionRepository.guardar no implementado'); }

  /**
   * "El sistema consulta el último registro de entrada."
   * @param {string} empleadoId
   * @returns {Promise<import('../../domain/Marcacion')|null>}
   */
  async buscarUltimaDeEmpleado(empleadoId) { throw new Error('MarcacionRepository.buscarUltimaDeEmpleado no implementado'); }

  /**
   * @param {string} empleadoId
   * @param {number} limite
   * @returns {Promise<import('../../domain/Marcacion')[]>} más recientes primero
   */
  async listarDeEmpleado(empleadoId, limite) { throw new Error('MarcacionRepository.listarDeEmpleado no implementado'); }
}

module.exports = MarcacionRepository;
