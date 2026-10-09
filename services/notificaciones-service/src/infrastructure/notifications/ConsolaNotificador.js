/**
 * @file Adaptador de salida: "envía" notificaciones escribiéndolas en consola.
 * Implementa el puerto Notificador. Simula un correo/SMS para la demostración.
 */
const Notificador = require('../../application/ports/Notificador');

class ConsolaNotificador extends Notificador {
  async enviar(notificacion) {
    console.log(`[notificación → ${notificacion.destinatario}] ${notificacion.asunto}: ${notificacion.mensaje}`);
  }
}

module.exports = ConsolaNotificador;
