/**
 * @file Caso de uso: Registrar entrada (actor: Empleado).
 *
 * Flujo básico del documento:
 *   1. El empleado se identifica (código + PIN).
 *   2. Se verifica que esté registrado y activo        → puerto VerificadorEmpleados
 *   3. Se determina que corresponde una entrada         → dominio: PoliticaDeMarcacion
 *   4. Se registra la fecha y hora de ingreso           → puerto MarcacionRepository
 *   5. Se confirma al empleado                          → valor de retorno
 *   + Se publica "asistencia.entrada_registrada"        → puerto PublicadorEventos
 *
 * INYECCIÓN DE DEPENDENCIAS: las 4 dependencias llegan por constructor.
 */
const { randomUUID } = require('node:crypto');
const { crearEntrada } = require('../../domain/PoliticaDeMarcacion');
const identificarEmpleado = require('./identificarEmpleado');
const { TIPOS, crearEvento } = require('../eventos');

class RegistrarEntrada {
  /**
   * @param {object} deps
   * @param {import('../ports/VerificadorEmpleados')} deps.verificadorEmpleados
   * @param {import('../ports/MarcacionRepository')}  deps.marcacionRepository
   * @param {import('../ports/PublicadorEventos')}    deps.publicadorEventos
   * @param {import('../ports/Reloj').Reloj}           deps.reloj
   */
  constructor({ verificadorEmpleados, marcacionRepository, publicadorEventos, reloj }) {
    this.verificadorEmpleados = verificadorEmpleados;
    this.marcacionRepository = marcacionRepository;
    this.publicadorEventos = publicadorEventos;
    this.reloj = reloj;
  }

  /**
   * @param {{codigo: string, pin: string}} credenciales
   * @returns {Promise<{mensaje: string, marcacion: object}>}
   */
  async ejecutar(credenciales) {
    const empleado = await identificarEmpleado(this.verificadorEmpleados, credenciales);
    const ultimaMarcacion = await this.marcacionRepository.buscarUltimaDeEmpleado(empleado.id);

    const marcacion = crearEntrada({ id: randomUUID(), empleado, ultimaMarcacion, ahora: this.reloj.ahora() });
    await this.marcacionRepository.guardar(marcacion);

    // PUBLICADOR–SUSCRIPTOR: reportes y notificaciones reaccionan de forma asíncrona.
    await this.publicadorEventos.publicar(crearEvento(TIPOS.ENTRADA_REGISTRADA, marcacion.aDatos()));

    return {
      mensaje: `Entrada registrada correctamente. ¡Bienvenido(a), ${empleado.nombre}!`,
      marcacion: marcacion.aDatos(),
    };
  }
}

module.exports = RegistrarEntrada;
