/**
 * @file Puerto de salida: HasherPin.
 *
 * ARQUITECTURA HEXAGONAL — PUERTO.
 * El método de identificación lo decide la empresa (código + PIN, tarjeta,
 * biometría...). La aplicación solo depende de este contrato; cambiar el
 * algoritmo (scrypt, bcrypt, un servicio biométrico) = escribir otro adaptador.
 * Adaptador actual: infrastructure/security/ScryptHasherPin.
 */
class HasherPin {
  /** @param {string} pin @returns {Promise<string>} hash */
  async hashear(pin) { throw new Error('HasherPin.hashear no implementado'); }

  /** @param {string} pin @param {string} hash @returns {Promise<boolean>} */
  async verificar(pin, hash) { throw new Error('HasherPin.verificar no implementado'); }
}

module.exports = HasherPin;
