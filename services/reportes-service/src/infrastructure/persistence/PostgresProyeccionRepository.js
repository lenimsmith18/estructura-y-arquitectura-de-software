/**
 * @file Adaptador de salida: proyección de reportes en PostgreSQL (base reportes_db).
 *
 * MICROSERVICIOS: esta base es propia de reportes-service y se llena SOLO con
 * eventos. Es un modelo de lectura optimizado para consultas por período.
 */
const ProyeccionRepository = require('../../application/ports/ProyeccionRepository');
const { traducirError } = require('./postgres');

class PostgresProyeccionRepository extends ProyeccionRepository {
  /** @param {import('pg').Pool} pool */
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async inicializarEsquema() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS empleados_proyeccion (
        id      UUID PRIMARY KEY,
        codigo  VARCHAR(20) UNIQUE NOT NULL,
        nombre  VARCHAR(120) NOT NULL,
        cargo   VARCHAR(120) NOT NULL,
        activo  BOOLEAN NOT NULL
      );
      CREATE TABLE IF NOT EXISTS movimientos (
        id                UUID PRIMARY KEY,
        empleado_id       UUID NOT NULL,
        empleado_codigo   VARCHAR(20) NOT NULL,
        empleado_nombre   VARCHAR(120) NOT NULL,
        tipo              VARCHAR(10) NOT NULL,
        fecha_hora        TIMESTAMPTZ NOT NULL,
        duracion_minutos  INTEGER NULL
      );
      CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos (fecha_hora);`);
  }

  async guardarEmpleado(e) {
    await this.#consultar(
      `INSERT INTO empleados_proyeccion (id, codigo, nombre, cargo, activo) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, cargo = EXCLUDED.cargo, activo = EXCLUDED.activo`,
      [e.id, e.codigo, e.nombre, e.cargo, e.activo]
    );
  }

  async listarEmpleados() {
    const { rows } = await this.#consultar('SELECT * FROM empleados_proyeccion ORDER BY codigo');
    return rows;
  }

  async guardarMovimiento(m) {
    // ON CONFLICT DO NOTHING = idempotencia ante eventos repetidos.
    const { rowCount } = await this.#consultar(
      `INSERT INTO movimientos (id, empleado_id, empleado_codigo, empleado_nombre, tipo, fecha_hora, duracion_minutos)
       VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
      [m.id, m.empleadoId, m.empleadoCodigo, m.empleadoNombre, m.tipo, m.fechaHora, m.duracionMinutos]
    );
    return rowCount === 1;
  }

  async listarMovimientos({ periodo, empleadoCodigo }) {
    const params = [periodo.inicio, periodo.finExclusivo];
    let sql = 'SELECT * FROM movimientos WHERE fecha_hora >= $1 AND fecha_hora < $2';
    if (empleadoCodigo) {
      params.push(empleadoCodigo);
      sql += ' AND empleado_codigo = $3';
    }
    const { rows } = await this.#consultar(`${sql} ORDER BY fecha_hora ASC`, params);
    return rows.map((f) => ({
      id: f.id,
      empleadoId: f.empleado_id,
      empleadoCodigo: f.empleado_codigo,
      empleadoNombre: f.empleado_nombre,
      tipo: f.tipo,
      fechaHora: f.fecha_hora,
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

module.exports = PostgresProyeccionRepository;
