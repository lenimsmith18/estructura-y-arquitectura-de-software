/**
 * @file Caso de uso: Consultar movimientos (entradas/salidas) por período.
 * Actor: Administrador — "consultar movimientos".
 */
const Periodo = require('../../domain/Periodo');

class ConsultarMovimientos {
  /** @param {{proyeccionRepository: import('../ports/ProyeccionRepository')}} deps */
  constructor({ proyeccionRepository }) {
    this.proyeccionRepository = proyeccionRepository;
  }

  /** @param {{desde?: string, hasta?: string, empleado?: string}} filtro */
  async ejecutar({ desde, hasta, empleado } = {}) {
    const periodo = new Periodo(desde, hasta);
    const empleadoCodigo = empleado ? String(empleado).toUpperCase() : undefined;
    const movimientos = await this.proyeccionRepository.listarMovimientos({ periodo, empleadoCodigo });
    return {
      periodo: periodo.aDatos(),
      empleado: empleadoCodigo ?? 'TODOS',
      total: movimientos.length,
      movimientos: movimientos.map((m) => ({ ...m, fechaHora: m.fechaHora.toISOString() })),
    };
  }
}

module.exports = ConsultarMovimientos;
