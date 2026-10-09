/**
 * @file Adaptador de salida: repositorio de empleados en memoria.
 *
 * ARQUITECTURA HEXAGONAL — segundo ADAPTADOR del mismo puerto EmpleadoRepository.
 * Demuestra que el núcleo no cambia aunque cambie la tecnología de persistencia:
 * se usa en las pruebas unitarias y con REPOSITORIO=memoria.
 */
const EmpleadoRepository = require('../../application/ports/EmpleadoRepository');

class InMemoryEmpleadoRepository extends EmpleadoRepository {
  constructor() {
    super();
    /** @type {Map<string, import('../../domain/Empleado')>} */
    this.empleados = new Map();
  }

  async guardar(empleado) {
    this.empleados.set(empleado.id, empleado);
  }

  async buscarPorId(id) {
    return this.empleados.get(id) ?? null;
  }

  async buscarPorCodigo(codigo) {
    return [...this.empleados.values()].find((e) => e.codigo === codigo) ?? null;
  }

  async listar() {
    return [...this.empleados.values()].sort((a, b) => a.codigo.localeCompare(b.codigo));
  }

  async contar() {
    return this.empleados.size;
  }
}

module.exports = InMemoryEmpleadoRepository;
