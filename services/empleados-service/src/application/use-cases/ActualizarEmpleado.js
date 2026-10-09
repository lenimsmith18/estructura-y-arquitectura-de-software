/**
 * @file Caso de uso: Actualizar empleado (nombre, cargo, activar/desactivar).
 * Actor: Administrador ("podrá administrar la información de los empleados").
 *
 * Dependencias inyectadas por constructor (Inyección de Dependencias).
 */
const { EmpleadoNoEncontrado } = require('../../domain/errores');
const { TIPOS, crearEvento } = require('../eventos');

class ActualizarEmpleado {
  /**
   * @param {object} deps
   * @param {import('../ports/EmpleadoRepository')} deps.empleadoRepository
   * @param {import('../ports/PublicadorEventos')}  deps.publicadorEventos
   */
  constructor({ empleadoRepository, publicadorEventos }) {
    this.empleadoRepository = empleadoRepository;
    this.publicadorEventos = publicadorEventos;
  }

  /**
   * @param {string} id
   * @param {{nombre?: string, cargo?: string, activo?: boolean}} cambios
   */
  async ejecutar(id, cambios) {
    const empleado = await this.empleadoRepository.buscarPorId(id);
    if (!empleado) throw new EmpleadoNoEncontrado(id);

    empleado.actualizar(cambios);
    await this.empleadoRepository.guardar(empleado);

    await this.publicadorEventos.publicar(
      crearEvento(TIPOS.EMPLEADO_ACTUALIZADO, empleado.aDatosPublicos())
    );

    return empleado.aDatosPublicos();
  }
}

module.exports = ActualizarEmpleado;
