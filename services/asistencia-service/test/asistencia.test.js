/**
 * Pruebas unitarias de los casos de uso de Asistencia: flujo básico y TODOS
 * los flujos alternos del documento.
 *
 * INYECCIÓN DE DEPENDENCIAS en acción: se inyectan adaptadores en memoria y un
 * reloj falso para controlar la hora (y así comprobar el cálculo de la jornada).
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const InMemoryMarcacionRepository = require('../src/infrastructure/persistence/InMemoryMarcacionRepository');
const VerificadorEnMemoria = require('../src/infrastructure/clients/VerificadorEnMemoria');
const PublicadorEnMemoria = require('../src/infrastructure/messaging/PublicadorEnMemoria');
const { Reloj } = require('../src/application/ports/Reloj');
const RegistrarEntrada = require('../src/application/use-cases/RegistrarEntrada');
const RegistrarSalida = require('../src/application/use-cases/RegistrarSalida');
const {
  EmpleadoNoIdentificado, EmpleadoInactivo, EntradaDuplicada, SalidaSinEntrada, ServicioNoDisponible,
} = require('../src/domain/errores');

/** Reloj controlable para las pruebas (otro adaptador del puerto Reloj). */
class RelojFalso extends Reloj {
  constructor(fecha) { super(); this.fecha = new Date(fecha); }
  ahora() { return new Date(this.fecha); }
  avanzarHoras(h) { this.fecha = new Date(this.fecha.getTime() + h * 3600000); }
}

function crearEscenario() {
  const deps = {
    marcacionRepository: new InMemoryMarcacionRepository(),
    verificadorEmpleados: new VerificadorEnMemoria(),
    publicadorEventos: new PublicadorEnMemoria({ silencioso: true }),
    reloj: new RelojFalso('2026-10-09T08:00:00-05:00'),
  };
  return { ...deps, entrada: new RegistrarEntrada(deps), salida: new RegistrarSalida(deps) };
}

const ANA = { codigo: 'E001', pin: '1234' };

test('flujo básico: entrada y salida con cálculo de jornada y eventos publicados', async () => {
  const { entrada, salida, reloj, publicadorEventos } = crearEscenario();

  const r1 = await entrada.ejecutar(ANA);
  assert.equal(r1.marcacion.tipo, 'ENTRADA');

  reloj.avanzarHoras(8.5);
  const r2 = await salida.ejecutar(ANA);
  assert.equal(r2.marcacion.tipo, 'SALIDA');
  assert.equal(r2.marcacion.duracionMinutos, 510);
  assert.equal(r2.marcacion.entradaId, r1.marcacion.id);

  assert.deepEqual(publicadorEventos.eventos.map((e) => e.tipo),
    ['asistencia.entrada_registrada', 'asistencia.salida_registrada']);
});

test('flujo alterno: empleado no registrado o PIN incorrecto', async () => {
  const { entrada } = crearEscenario();
  await assert.rejects(entrada.ejecutar({ codigo: 'X999', pin: '1234' }), EmpleadoNoIdentificado);
  await assert.rejects(entrada.ejecutar({ codigo: 'E001', pin: '0000' }), EmpleadoNoIdentificado);
});

test('flujo alterno: usuario inactivo', async () => {
  const { entrada } = crearEscenario();
  await assert.rejects(entrada.ejecutar({ codigo: 'E003', pin: '1234' }), EmpleadoInactivo);
});

test('flujo alterno: entrada duplicada', async () => {
  const { entrada, publicadorEventos } = crearEscenario();
  await entrada.ejecutar(ANA);
  await assert.rejects(entrada.ejecutar(ANA), EntradaDuplicada);
  assert.equal(publicadorEventos.eventos.length, 1, 'no se publica evento si la regla falla');
});

test('flujo alterno: salida sin entrada (nunca marcó o ya salió)', async () => {
  const { entrada, salida } = crearEscenario();
  await assert.rejects(salida.ejecutar(ANA), SalidaSinEntrada);
  await entrada.ejecutar(ANA);
  await salida.ejecutar(ANA);
  await assert.rejects(salida.ejecutar(ANA), SalidaSinEntrada);
});

test('flujo alterno: error de conexión con el servicio de empleados', async () => {
  const { entrada, verificadorEmpleados, marcacionRepository } = crearEscenario();
  verificadorEmpleados.disponible = false;
  await assert.rejects(entrada.ejecutar(ANA), ServicioNoDisponible);
  assert.equal(marcacionRepository.marcaciones.length, 0);
});
