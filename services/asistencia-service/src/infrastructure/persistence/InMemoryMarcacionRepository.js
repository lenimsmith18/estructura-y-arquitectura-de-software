/**
 * @file Adaptador de salida: marcaciones en memoria (pruebas / REPOSITORIO=memoria).
 * Implementa el mismo puerto MarcacionRepository que el adaptador de PostgreSQL.
 */
const MarcacionRepository = require('../../application/ports/MarcacionRepository');

class InMemoryMarcacionRepository extends MarcacionRepository {
  constructor() {
    super();
    /** @type {import('../../domain/Marcacion')[]} */
    this.marcaciones = [];
  }

  async guardar(marcacion) {
    this.marcaciones.push(marcacion);
  }

  async buscarUltimaDeEmpleado(empleadoId) {
    const [ultima] = await this.listarDeEmpleado(empleadoId, 1);
    return ultima ?? null;
  }

  async listarDeEmpleado(empleadoId, limite) {
    // Se recorre al revés para que, a igual fecha, gane la insertada más tarde.
    return [...this.marcaciones]
      .reverse()
      .filter((m) => m.empleadoId === empleadoId)
      .sort((a, b) => b.fechaHora - a.fechaHora)
      .slice(0, limite);
  }
}

module.exports = InMemoryMarcacionRepository;
