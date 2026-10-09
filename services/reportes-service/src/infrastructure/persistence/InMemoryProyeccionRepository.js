/**
 * @file Adaptador de salida: proyección en memoria (pruebas / REPOSITORIO=memoria).
 */
const ProyeccionRepository = require('../../application/ports/ProyeccionRepository');

class InMemoryProyeccionRepository extends ProyeccionRepository {
  constructor() {
    super();
    this.empleados = new Map();
    this.movimientos = new Map();
  }

  async guardarEmpleado(empleado) {
    this.empleados.set(empleado.id, { ...empleado });
  }

  async listarEmpleados() {
    return [...this.empleados.values()].sort((a, b) => a.codigo.localeCompare(b.codigo));
  }

  async guardarMovimiento(movimiento) {
    if (this.movimientos.has(movimiento.id)) return false; // idempotente
    this.movimientos.set(movimiento.id, { ...movimiento });
    return true;
  }

  async listarMovimientos({ periodo, empleadoCodigo }) {
    return [...this.movimientos.values()]
      .filter((m) => periodo.contiene(m.fechaHora))
      .filter((m) => !empleadoCodigo || m.empleadoCodigo === empleadoCodigo)
      .sort((a, b) => a.fechaHora - b.fechaHora);
  }
}

module.exports = InMemoryProyeccionRepository;
