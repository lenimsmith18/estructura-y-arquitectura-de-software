/**
 * @file Utilidades de conexión a PostgreSQL (detalle de INFRAESTRUCTURA).
 *
 * MICROSERVICIOS — "Database per service": este servicio es el ÚNICO dueño de
 * la base `reportes_db`. Ningún otro microservicio la consulta directamente.
 */
const { Pool } = require('pg');
const { ServicioNoDisponible } = require('../../domain/errores');

/** Códigos de error que indican que la base de datos no es alcanzable. */
const ERRORES_DE_CONEXION = new Set(['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET', '57P01', '57P03']);

/** @param {string} url Cadena de conexión postgres://... */
function crearPool(url) {
  const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 3000 });
  // Evita que un error en un cliente inactivo tumbe el proceso.
  pool.on('error', (err) => console.error('[postgres] error en cliente inactivo:', err.message));
  return pool;
}

/**
 * Espera a que la base esté lista (útil al arrancar con docker-compose).
 * @param {import('pg').Pool} pool
 */
async function esperarBaseDeDatos(pool, intentos = 20, esperaMs = 2000) {
  for (let i = 1; i <= intentos; i++) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (err) {
      console.warn(`[postgres] no disponible (intento ${i}/${intentos}): ${err.message}`);
      await new Promise((r) => setTimeout(r, esperaMs));
    }
  }
  throw new Error('No fue posible conectar con PostgreSQL');
}

/**
 * Traduce errores técnicos de conexión al error de dominio ServicioNoDisponible
 * (flujo alterno "Error de conexión"). Los demás errores se propagan tal cual.
 */
function traducirError(err) {
  if (ERRORES_DE_CONEXION.has(err.code) || /connect|terminat|timeout/i.test(err.message)) {
    return new ServicioNoDisponible('base de datos');
  }
  return err;
}

module.exports = { crearPool, esperarBaseDeDatos, traducirError };
