/**
 * @file Adaptador de salida: hash de PIN con scrypt (módulo crypto nativo de Node).
 * Implementa el puerto HasherPin. Formato almacenado: "salt:hash" en hexadecimal.
 */
const { scrypt, randomBytes, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const HasherPin = require('../../application/ports/HasherPin');

const scryptAsync = promisify(scrypt);

class ScryptHasherPin extends HasherPin {
  async hashear(pin) {
    const salt = randomBytes(16).toString('hex');
    const hash = await scryptAsync(pin, salt, 32);
    return `${salt}:${hash.toString('hex')}`;
  }

  async verificar(pin, almacenado) {
    const [salt, hashHex] = String(almacenado).split(':');
    if (!salt || !hashHex) return false;
    const esperado = Buffer.from(hashHex, 'hex');
    const calculado = await scryptAsync(pin, salt, esperado.length);
    return timingSafeEqual(esperado, calculado); // comparación en tiempo constante
  }
}

module.exports = ScryptHasherPin;
