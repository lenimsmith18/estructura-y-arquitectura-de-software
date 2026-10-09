/**
 * @file Caso de uso: el empleado consulta sus últimas marcaciones
 * (requiere identificarse igual que para marcar).
 */
const identificarEmpleado = require('./identificarEmpleado');

class ConsultarMisMarcaciones {
  /**
   * @param {object} deps
   * @param {import('../ports/VerificadorEmpleados')} deps.verificadorEmpleados
   * @param {import('../ports/MarcacionRepository')}  deps.marcacionRepository
   */
  constructor({ verificadorEmpleados, marcacionRepository }) {
    this.verificadorEmpleados = verificadorEmpleados;
    this.marcacionRepository = marcacionRepository;
  }

  /** @param {{codigo: string, pin: string}} credenciales */
  async ejecutar(credenciales) {
    const empleado = await identificarEmpleado(this.verificadorEmpleados, credenciales);
    const marcaciones = await this.marcacionRepository.listarDeEmpleado(empleado.id, 10);
    return { empleado, marcaciones: marcaciones.map((m) => m.aDatos()) };
  }
}

module.exports = ConsultarMisMarcaciones;
