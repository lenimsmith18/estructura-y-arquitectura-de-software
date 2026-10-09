/**
 * @file Caso de uso: Generar reporte de horas trabajadas por empleado.
 * Actor: Administrador — "generar reportes".
 */
const Periodo = require('../../domain/Periodo');
const { generarReporteDeHoras } = require('../../domain/ReporteDeHoras');

class GenerarReporteHoras {
  /** @param {{proyeccionRepository: import('../ports/ProyeccionRepository')}} deps */
  constructor({ proyeccionRepository }) {
    this.proyeccionRepository = proyeccionRepository;
  }

  /** @param {{desde?: string, hasta?: string}} filtro */
  async ejecutar({ desde, hasta } = {}) {
    const periodo = new Periodo(desde, hasta);
    const [empleados, movimientos] = await Promise.all([
      this.proyeccionRepository.listarEmpleados(),
      this.proyeccionRepository.listarMovimientos({ periodo }),
    ]);
    return { periodo: periodo.aDatos(), ...generarReporteDeHoras(empleados, movimientos) };
  }
}

module.exports = GenerarReporteHoras;
