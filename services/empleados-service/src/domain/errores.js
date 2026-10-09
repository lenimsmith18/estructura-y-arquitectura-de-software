/**
 * @file Errores de dominio del microservicio de Empleados.
 *
 * ARQUITECTURA HEXAGONAL — capa de DOMINIO.
 * Los errores expresan reglas de negocio violadas. No saben nada de HTTP:
 * es el adaptador HTTP (infraestructura) quien traduce cada `codigo` a un
 * status code. Así el núcleo permanece independiente del mecanismo de entrega.
 */

/** Error base de todas las reglas de negocio. */
class ErrorDeDominio extends Error {
  /**
   * @param {string} codigo  Identificador estable del error (p. ej. "CODIGO_DUPLICADO").
   * @param {string} mensaje Mensaje legible para el usuario final.
   */
  constructor(codigo, mensaje) {
    super(mensaje);
    this.name = this.constructor.name;
    this.codigo = codigo;
  }
}

/** Los datos recibidos no cumplen las invariantes de la entidad. */
class DatosInvalidos extends ErrorDeDominio {
  constructor(mensaje) {
    super('DATOS_INVALIDOS', mensaje);
  }
}

/** Ya existe un empleado con el mismo código. */
class CodigoDuplicado extends ErrorDeDominio {
  constructor(codigo) {
    super('CODIGO_DUPLICADO', `Ya existe un empleado con el código ${codigo}.`);
  }
}

/** No existe el empleado solicitado. */
class EmpleadoNoEncontrado extends ErrorDeDominio {
  constructor(id) {
    super('EMPLEADO_NO_ENCONTRADO', `No existe un empleado con id ${id}.`);
  }
}

/**
 * Un recurso externo (base de datos, broker...) no está disponible.
 * Lo lanzan los adaptadores de infraestructura para cubrir el flujo alterno
 * "Error de conexión" del caso de uso.
 */
class ServicioNoDisponible extends ErrorDeDominio {
  constructor(detalle = '') {
    super(
      'SERVICIO_NO_DISPONIBLE',
      'La operación no pudo ser procesada: no fue posible comunicarse con el servidor o la base de datos.' +
        (detalle ? ` (${detalle})` : '')
    );
  }
}

module.exports = {
  ErrorDeDominio,
  DatosInvalidos,
  CodigoDuplicado,
  EmpleadoNoEncontrado,
  ServicioNoDisponible,
};
