/**
 * @file Caso de uso: Registrar empleado (actor: Administrador).
 *
 * ARQUITECTURA HEXAGONAL — capa de APLICACIÓN. Los casos de uso son los
 * PUERTOS DE ENTRADA (driving ports): los adaptadores primarios (HTTP) los invocan.
 *
 * INYECCIÓN DE DEPENDENCIAS: el caso de uso NO crea sus dependencias
 * (repositorio, hasher, publicador); las recibe por constructor. Solo conoce
 * los puertos (contratos), nunca las clases concretas de infraestructura.
 * El ensamblaje real se hace en src/container.js (Composition Root).
 */
const { randomUUID } = require('node:crypto');
const Empleado = require('../../domain/Empleado');
const { CodigoDuplicado } = require('../../domain/errores');
const { TIPOS, crearEvento } = require('../eventos');

class RegistrarEmpleado {
  /**
   * @param {object} deps
   * @param {import('../ports/EmpleadoRepository')} deps.empleadoRepository
   * @param {import('../ports/HasherPin')}          deps.hasherPin
   * @param {import('../ports/PublicadorEventos')}  deps.publicadorEventos
   */
  constructor({ empleadoRepository, hasherPin, publicadorEventos }) {
    this.empleadoRepository = empleadoRepository;
    this.hasherPin = hasherPin;
    this.publicadorEventos = publicadorEventos;
  }

  /**
   * @param {{codigo: string, nombre: string, cargo?: string, pin: string, activo?: boolean}} entrada
   * @returns {Promise<object>} Datos públicos del empleado creado.
   */
  async ejecutar({ codigo, nombre, cargo, pin, activo = true }) {
    Empleado.validarPin(pin);

    const existente = await this.empleadoRepository.buscarPorCodigo(String(codigo || '').toUpperCase());
    if (existente) throw new CodigoDuplicado(existente.codigo);

    const empleado = new Empleado({
      id: randomUUID(),
      codigo,
      nombre,
      cargo,
      activo,
      pinHash: await this.hasherPin.hashear(String(pin)),
    });

    await this.empleadoRepository.guardar(empleado);

    // PUBLICADOR–SUSCRIPTOR: se anuncia el hecho; reportes y notificaciones reaccionarán.
    await this.publicadorEventos.publicar(
      crearEvento(TIPOS.EMPLEADO_REGISTRADO, empleado.aDatosPublicos())
    );

    return empleado.aDatosPublicos();
  }
}

module.exports = RegistrarEmpleado;
