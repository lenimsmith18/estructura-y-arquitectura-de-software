/**
 * @file Errores de dominio de reportes-service (capa de DOMINIO, sin HTTP).
 */
class ErrorDeDominio extends Error {
  /** @param {string} codigo @param {string} mensaje */
  constructor(codigo, mensaje) {
    super(mensaje);
    this.name = this.constructor.name;
    this.codigo = codigo;
  }
}

class DatosInvalidos extends ErrorDeDominio {
  constructor(mensaje) {
    super('DATOS_INVALIDOS', mensaje);
  }
}

class ServicioNoDisponible extends ErrorDeDominio {
  constructor(detalle = '') {
    super(
      'SERVICIO_NO_DISPONIBLE',
      'La operación no pudo ser procesada: no fue posible comunicarse con el servidor o la base de datos.' +
        (detalle ? ` (${detalle})` : '')
    );
  }
}

module.exports = { ErrorDeDominio, DatosInvalidos, ServicioNoDisponible };
