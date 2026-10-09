/**
 * @file Entidad Marcacion: un registro de ENTRADA o SALIDA de un empleado.
 *
 * ARQUITECTURA HEXAGONAL — capa de DOMINIO. Sin dependencias técnicas.
 * "Se guardará el registro indicando si corresponde a una entrada o a una
 *  salida, junto con la fecha y la hora."
 */
const { DatosInvalidos } = require('./errores');

const TiposMarcacion = Object.freeze({ ENTRADA: 'ENTRADA', SALIDA: 'SALIDA' });

class Marcacion {
  /**
   * @param {object} props
   * @param {string} props.id
   * @param {string} props.empleadoId
   * @param {string} props.empleadoCodigo
   * @param {string} props.empleadoNombre
   * @param {'ENTRADA'|'SALIDA'} props.tipo
   * @param {Date}   props.fechaHora
   * @param {string|null} [props.entradaId]       Solo SALIDA: entrada que cierra.
   * @param {number|null} [props.duracionMinutos] Solo SALIDA: minutos trabajados en la jornada.
   */
  constructor({ id, empleadoId, empleadoCodigo, empleadoNombre, tipo, fechaHora, entradaId = null, duracionMinutos = null }) {
    if (!Object.values(TiposMarcacion).includes(tipo)) throw new DatosInvalidos(`Tipo de marcación inválido: ${tipo}`);
    if (!id || !empleadoId) throw new DatosInvalidos('La marcación requiere id y empleado.');

    this.id = id;
    this.empleadoId = empleadoId;
    this.empleadoCodigo = empleadoCodigo;
    this.empleadoNombre = empleadoNombre;
    this.tipo = tipo;
    this.fechaHora = new Date(fechaHora);
    this.entradaId = entradaId;
    this.duracionMinutos = duracionMinutos;
  }

  esEntrada() {
    return this.tipo === TiposMarcacion.ENTRADA;
  }

  aDatos() {
    return {
      id: this.id,
      empleadoId: this.empleadoId,
      empleadoCodigo: this.empleadoCodigo,
      empleadoNombre: this.empleadoNombre,
      tipo: this.tipo,
      fechaHora: this.fechaHora.toISOString(),
      entradaId: this.entradaId,
      duracionMinutos: this.duracionMinutos,
    };
  }
}

Marcacion.Tipos = TiposMarcacion;
module.exports = Marcacion;
