/**
 * @file Caso de uso: Registrar salida (actor: Empleado).
 *
 * Flujo básico del documento:
 *   1. El empleado se identifica.
 *   2. Se verifica su información                       → puerto VerificadorEmpleados
 *   3. Se consulta el último registro de entrada        → puerto MarcacionRepository
 *   4. Se registra la fecha y hora de salida            → dominio + repositorio
 *   5. Se confirma la salida                            → valor de retorno
 *   + Se publica "asistencia.salida_registrada"         → puerto PublicadorEventos
 */
const { randomUUID } = require('node:crypto');
const { crearSalida } = require('../../domain/PoliticaDeMarcacion');
const identificarEmpleado = require('./identificarEmpleado');
const { TIPOS, crearEvento } = require('../eventos');

class RegistrarSalida {
  /** @param {object} deps Mismas dependencias que RegistrarEntrada (inyectadas). */
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

    const marcacion = crearSalida({ id: randomUUID(), empleado, ultimaMarcacion, ahora: this.reloj.ahora() });
    await this.marcacionRepository.guardar(marcacion);

    await this.publicadorEventos.publicar(crearEvento(TIPOS.SALIDA_REGISTRADA, marcacion.aDatos()));

    const horas = Math.floor(marcacion.duracionMinutos / 60);
    const minutos = marcacion.duracionMinutos % 60;
    return {
      mensaje: `Salida registrada correctamente. Jornada de ${horas} h ${minutos} min. ¡Hasta pronto, ${empleado.nombre}!`,
      marcacion: marcacion.aDatos(),
    };
  }
}

module.exports = RegistrarSalida;
