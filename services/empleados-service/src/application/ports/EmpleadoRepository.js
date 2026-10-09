/**
 * @file Puerto de salida: EmpleadoRepository.
 *
 * ARQUITECTURA HEXAGONAL — PUERTO (driven / secondary port).
 * Define QUÉ necesita la aplicación para persistir empleados, sin decir CÓMO.
 * Implementaciones (adaptadores) disponibles en infrastructure/persistence:
 *   - PostgresEmpleadoRepository  (producción, docker-compose)
 *   - InMemoryEmpleadoRepository  (pruebas / ejecución sin base de datos)
 *
 * JavaScript no tiene interfaces, así que el puerto se modela como una clase
 * abstracta: cada método lanza un error si el adaptador no lo implementa.
 */
class EmpleadoRepository {
  /** @param {import('../../domain/Empleado')} empleado Inserta o actualiza. @returns {Promise<void>} */
  async guardar(empleado) { throw new Error('EmpleadoRepository.guardar no implementado'); }

  /** @param {string} id @returns {Promise<import('../../domain/Empleado')|null>} */
  async buscarPorId(id) { throw new Error('EmpleadoRepository.buscarPorId no implementado'); }

  /** @param {string} codigo @returns {Promise<import('../../domain/Empleado')|null>} */
  async buscarPorCodigo(codigo) { throw new Error('EmpleadoRepository.buscarPorCodigo no implementado'); }

  /** @returns {Promise<import('../../domain/Empleado')[]>} */
  async listar() { throw new Error('EmpleadoRepository.listar no implementado'); }

  /** @returns {Promise<number>} */
  async contar() { throw new Error('EmpleadoRepository.contar no implementado'); }
}

module.exports = EmpleadoRepository;
