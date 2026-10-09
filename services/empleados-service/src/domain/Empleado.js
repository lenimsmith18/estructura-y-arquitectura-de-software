/**
 * @file Entidad Empleado.
 *
 * ARQUITECTURA HEXAGONAL — capa de DOMINIO (centro del hexágono).
 * Contiene las reglas de negocio puras del empleado. NO importa Express,
 * PostgreSQL, RabbitMQ ni ningún otro detalle técnico: solo JavaScript.
 */
const { DatosInvalidos } = require('./errores');

class Empleado {
  /**
   * @param {object}  props
   * @param {string}  props.id        Identificador único (UUID).
   * @param {string}  props.codigo    Código de empleado con el que se identifica (p. ej. "E001").
   * @param {string}  props.nombre    Nombre completo.
   * @param {string}  props.cargo     Cargo dentro de la empresa.
   * @param {string}  props.pinHash   Hash del PIN (nunca se guarda el PIN en claro).
   * @param {boolean} [props.activo]  Solo los empleados activos pueden registrar asistencia.
   * @param {Date}    [props.creadoEn]
   */
  constructor({ id, codigo, nombre, cargo, pinHash, activo = true, creadoEn = new Date() }) {
    if (!id) throw new DatosInvalidos('El id es obligatorio.');
    if (!codigo || !/^[A-Za-z0-9-]{2,20}$/.test(codigo)) {
      throw new DatosInvalidos('El código debe tener entre 2 y 20 caracteres alfanuméricos.');
    }
    if (!nombre || nombre.trim().length < 3) {
      throw new DatosInvalidos('El nombre debe tener al menos 3 caracteres.');
    }
    if (!pinHash) throw new DatosInvalidos('El PIN es obligatorio.');

    this.id = id;
    this.codigo = codigo.toUpperCase();
    this.nombre = nombre.trim();
    this.cargo = (cargo || 'Sin cargo').trim();
    this.pinHash = pinHash;
    this.activo = Boolean(activo);
    this.creadoEn = new Date(creadoEn);
  }

  /**
   * Regla de negocio: el PIN que el empleado digita debe ser numérico de 4 a 6 dígitos.
   * @param {string} pin
   */
  static validarPin(pin) {
    if (!/^\d{4,6}$/.test(String(pin ?? ''))) {
      throw new DatosInvalidos('El PIN debe tener entre 4 y 6 dígitos numéricos.');
    }
  }

  /**
   * Modifica los datos editables por el administrador.
   * @param {{nombre?: string, cargo?: string, activo?: boolean}} cambios
   */
  actualizar({ nombre, cargo, activo }) {
    if (nombre !== undefined) {
      if (nombre.trim().length < 3) throw new DatosInvalidos('El nombre debe tener al menos 3 caracteres.');
      this.nombre = nombre.trim();
    }
    if (cargo !== undefined) this.cargo = cargo.trim();
    if (activo !== undefined) this.activo = Boolean(activo);
  }

  /** Representación segura (sin el hash del PIN) para exponer fuera del dominio. */
  aDatosPublicos() {
    return {
      id: this.id,
      codigo: this.codigo,
      nombre: this.nombre,
      cargo: this.cargo,
      activo: this.activo,
      creadoEn: this.creadoEn.toISOString(),
    };
  }
}

module.exports = Empleado;
