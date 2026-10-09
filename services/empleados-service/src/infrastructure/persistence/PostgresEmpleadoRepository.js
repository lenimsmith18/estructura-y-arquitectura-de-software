/**
 * @file Adaptador de salida: repositorio de empleados sobre PostgreSQL.
 *
 * ARQUITECTURA HEXAGONAL — ADAPTADOR (driven adapter) que implementa el
 * puerto EmpleadoRepository. Toda la SQL vive aquí; el dominio y los casos de
 * uso nunca ven una consulta SQL.
 */
const EmpleadoRepository = require('../../application/ports/EmpleadoRepository');
const Empleado = require('../../domain/Empleado');
const { traducirError } = require('./postgres');

class PostgresEmpleadoRepository extends EmpleadoRepository {
  /** @param {import('pg').Pool} pool Inyectado desde el contenedor de dependencias. */
  constructor(pool) {
    super();
    this.pool = pool;
  }

  /** Crea la tabla si no existe. El microservicio es dueño de su propio esquema. */
  async inicializarEsquema() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS empleados (
        id         UUID PRIMARY KEY,
        codigo     VARCHAR(20) UNIQUE NOT NULL,
        nombre     VARCHAR(120) NOT NULL,
        cargo      VARCHAR(120) NOT NULL,
        pin_hash   TEXT NOT NULL,
        activo     BOOLEAN NOT NULL DEFAULT TRUE,
        creado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`);
  }

  async guardar(empleado) {
    await this.#consultar(
      `INSERT INTO empleados (id, codigo, nombre, cargo, pin_hash, activo, creado_en)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE
         SET nombre = EXCLUDED.nombre, cargo = EXCLUDED.cargo,
             pin_hash = EXCLUDED.pin_hash, activo = EXCLUDED.activo`,
      [empleado.id, empleado.codigo, empleado.nombre, empleado.cargo, empleado.pinHash, empleado.activo, empleado.creadoEn]
    );
  }

  async buscarPorId(id) {
    // Un id que no es UUID válido simplemente no existe.
    if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
    const { rows } = await this.#consultar('SELECT * FROM empleados WHERE id = $1', [id]);
    return rows[0] ? this.#aEntidad(rows[0]) : null;
  }

  async buscarPorCodigo(codigo) {
    const { rows } = await this.#consultar('SELECT * FROM empleados WHERE codigo = $1', [codigo]);
    return rows[0] ? this.#aEntidad(rows[0]) : null;
  }

  async listar() {
    const { rows } = await this.#consultar('SELECT * FROM empleados ORDER BY codigo');
    return rows.map((r) => this.#aEntidad(r));
  }

  async contar() {
    const { rows } = await this.#consultar('SELECT COUNT(*)::int AS total FROM empleados');
    return rows[0].total;
  }

  /** Ejecuta SQL traduciendo errores de conexión a ServicioNoDisponible. */
  async #consultar(sql, params) {
    try {
      return await this.pool.query(sql, params);
    } catch (err) {
      throw traducirError(err);
    }
  }

  /** Mapea una fila de la tabla a la entidad de dominio. */
  #aEntidad(fila) {
    return new Empleado({
      id: fila.id,
      codigo: fila.codigo,
      nombre: fila.nombre,
      cargo: fila.cargo,
      pinHash: fila.pin_hash,
      activo: fila.activo,
      creadoEn: fila.creado_en,
    });
  }
}

module.exports = PostgresEmpleadoRepository;
