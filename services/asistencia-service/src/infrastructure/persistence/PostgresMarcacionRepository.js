/**
 * @file Adaptador de salida: marcaciones en PostgreSQL (base asistencia_db).
 * ARQUITECTURA HEXAGONAL — implementa el puerto MarcacionRepository.
 */
const MarcacionRepository = require('../../application/ports/MarcacionRepository');
const Marcacion = require('../../domain/Marcacion');
const { traducirError } = require('./postgres');

class PostgresMarcacionRepository extends MarcacionRepository {
  /** @param {import('pg').Pool} pool */
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async inicializarEsquema() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS marcaciones (
        id                UUID PRIMARY KEY,
        secuencia         BIGSERIAL,  -- desempata marcaciones con la misma fecha_hora
        empleado_id       UUID NOT NULL,
        empleado_codigo   VARCHAR(20) NOT NULL,
        empleado_nombre   VARCHAR(120) NOT NULL,
        tipo              VARCHAR(10) NOT NULL CHECK (tipo IN ('ENTRADA', 'SALIDA')),
        fecha_hora        TIMESTAMPTZ NOT NULL,
        entrada_id        UUID NULL,
        duracion_minutos  INTEGER NULL
      );
      CREATE INDEX IF NOT EXISTS idx_marcaciones_empleado_fecha
        ON marcaciones (empleado_id, fecha_hora DESC);`);
  }

  async guardar(m) {
    await this.#consultar(
      `INSERT INTO marcaciones (id, empleado_id, empleado_codigo, empleado_nombre, tipo, fecha_hora, entrada_id, duracion_minutos)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [m.id, m.empleadoId, m.empleadoCodigo, m.empleadoNombre, m.tipo, m.fechaHora, m.entradaId, m.duracionMinutos]
    );
  }

  async buscarUltimaDeEmpleado(empleadoId) {
    const [ultima] = await this.listarDeEmpleado(empleadoId, 1);
    return ultima ?? null;
  }

  async listarDeEmpleado(empleadoId, limite) {
    const { rows } = await this.#consultar(
      'SELECT * FROM marcaciones WHERE empleado_id = $1 ORDER BY fecha_hora DESC, secuencia DESC LIMIT $2',
      [empleadoId, limite]
    );
    return rows.map((f) => new Marcacion({
      id: f.id,
      empleadoId: f.empleado_id,
      empleadoCodigo: f.empleado_codigo,
      empleadoNombre: f.empleado_nombre,
      tipo: f.tipo,
      fechaHora: f.fecha_hora,
      entradaId: f.entrada_id,
      duracionMinutos: f.duracion_minutos,
    }));
  }

  async #consultar(sql, params) {
    try {
      return await this.pool.query(sql, params);
    } catch (err) {
      throw traducirError(err);
    }
  }
}

module.exports = PostgresMarcacionRepository;
