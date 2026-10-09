/**
 * @file Errores de dominio del microservicio de Asistencia.
 *
 * ARQUITECTURA HEXAGONAL — capa de DOMINIO. Cada clase corresponde a uno de
 * los FLUJOS ALTERNOS del caso de uso. El adaptador HTTP los traduce a status
 * codes; el dominio no conoce HTTP.
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

/** Flujo alterno: "Empleado no registrado". */
class EmpleadoNoIdentificado extends ErrorDeDominio {
  constructor() {
    super('EMPLEADO_NO_IDENTIFICADO', 'No fue posible identificar al usuario. El registro no se realizó.');
  }
}

/** Flujo alterno: "Usuario inactivo". */
class EmpleadoInactivo extends ErrorDeDominio {
  constructor() {
    super('EMPLEADO_INACTIVO', 'El empleado se encuentra inactivo. Comuníquese con el administrador.');
  }
}

/** Flujo alterno: "Registro de entrada duplicado". */
class EntradaDuplicada extends ErrorDeDominio {
  constructor(desde) {
    super(
      'ENTRADA_DUPLICADA',
      `Ya existe una entrada abierta${desde ? ` (desde ${desde.toLocaleString('es-CO')})` : ''}. Debe registrar primero la salida.`
    );
  }
}

/** Flujo alterno: "Registro de salida sin entrada". */
class SalidaSinEntrada extends ErrorDeDominio {
  constructor() {
    super('SALIDA_SIN_ENTRADA', 'No existe una entrada previa abierta. No es posible registrar la salida.');
  }
}

/** Flujo alterno: "Error de conexión" (servidor o base de datos no disponibles). */
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
  EmpleadoNoIdentificado,
  EmpleadoInactivo,
  EntradaDuplicada,
  SalidaSinEntrada,
  ServicioNoDisponible,
};
