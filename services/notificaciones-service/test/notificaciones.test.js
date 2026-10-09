/**
 * Pruebas unitarias de notificaciones-service con un Notificador espía
 * (otro adaptador del puerto, inyectado en lugar del de consola).
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const Notificador = require('../src/application/ports/Notificador');
const InMemoryNotificacionRepository = require('../src/infrastructure/persistence/InMemoryNotificacionRepository');
const NotificarEvento = require('../src/application/use-cases/NotificarEvento');
const ListarNotificaciones = require('../src/application/use-cases/ListarNotificaciones');

class NotificadorEspia extends Notificador {
  constructor() { super(); this.enviadas = []; }
  async enviar(n) { this.enviadas.push(n); }
}

test('notifica la salida al empleado con la duración de la jornada', async () => {
  const notificador = new NotificadorEspia();
  const notificacionRepository = new InMemoryNotificacionRepository();
  const notificar = new NotificarEvento({ notificador, notificacionRepository });

  await notificar.ejecutar({
    tipo: 'asistencia.salida_registrada',
    datos: { empleadoCodigo: 'E001', empleadoNombre: 'Ana Gómez', fechaHora: '2026-10-09T22:00:00Z', duracionMinutos: 510 },
  });

  assert.equal(notificador.enviadas.length, 1);
  assert.equal(notificador.enviadas[0].destinatario, 'E001');
  assert.match(notificador.enviadas[0].mensaje, /8 h 30 min/);

  const historial = await new ListarNotificaciones({ notificacionRepository }).ejecutar();
  assert.equal(historial.length, 1);
});

test('ignora eventos que no requieren notificación', async () => {
  const notificador = new NotificadorEspia();
  const notificar = new NotificarEvento({ notificador, notificacionRepository: new InMemoryNotificacionRepository() });
  assert.equal(await notificar.ejecutar({ tipo: 'empleado.actualizado', datos: {} }), null);
  assert.equal(notificador.enviadas.length, 0);
});
