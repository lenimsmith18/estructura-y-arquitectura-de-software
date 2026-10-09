/**
 * @file Caso de uso: Consultar empleados (listar todos u obtener uno).
 * Actor: Administrador.
 */
const { EmpleadoNoEncontrado } = require('../../domain/errores');

class ConsultarEmpleados {
  /** @param {{empleadoRepository: import('../ports/EmpleadoRepository')}} deps */
  constructor({ empleadoRepository }) {
    this.empleadoRepository = empleadoRepository;
  }

  /** @returns {Promise<object[]>} */
  async listar() {
    const empleados = await this.empleadoRepository.listar();
    return empleados.map((e) => e.aDatosPublicos());
  }

  /** @param {string} id */
  async obtener(id) {
    const empleado = await this.empleadoRepository.buscarPorId(id);
    if (!empleado) throw new EmpleadoNoEncontrado(id);
    return empleado.aDatosPublicos();
  }
}

module.exports = ConsultarEmpleados;
