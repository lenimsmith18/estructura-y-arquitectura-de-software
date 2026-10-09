/**
 * @file Puerto de salida: Reloj.
 *
 * La hora actual también es una dependencia externa. Inyectarla permite
 * probar los casos de uso con una hora fija (p. ej. calcular 8 h de jornada)
 * sin esperar ni depender del reloj del sistema.
 */
class Reloj {
  /** @returns {Date} */
  ahora() { throw new Error('Reloj.ahora no implementado'); }
}

/** Adaptador por defecto: la hora real del sistema. */
class RelojDelSistema extends Reloj {
  ahora() {
    return new Date();
  }
}

module.exports = { Reloj, RelojDelSistema };
