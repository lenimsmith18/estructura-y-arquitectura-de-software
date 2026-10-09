/**
 * Pruebas unitarias de los casos de uso de Empleados.
 *
 * Gracias a la INYECCIÓN DE DEPENDENCIAS y a los PUERTOS de la arquitectura
 * hexagonal, los casos de uso se prueban con adaptadores en memoria: sin
 * PostgreSQL, sin RabbitMQ y sin levantar el servidor HTTP.
 *
 * Ejecutar: npm test
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const InMemoryEmpleadoRepository = require('../src/infrastructure/persistence/InMemoryEmpleadoRepository');
const PublicadorEnMemoria = require('../src/infrastructure/messaging/PublicadorEnMemoria');
const ScryptHasherPin = require('../src/infrastructure/security/ScryptHasherPin');
const RegistrarEmpleado = require('../src/application/use-cases/RegistrarEmpleado');
const ActualizarEmpleado = require('../src/application/use-cases/ActualizarEmpleado');
const VerificarIdentidad = require('../src/application/use-cases/VerificarIdentidad');
const { CodigoDuplicado, DatosInvalidos } = require('../src/domain/errores');

function crearEscenario() {
  const empleadoRepository = new InMemoryEmpleadoRepository();
  const publicadorEventos = new PublicadorEnMemoria({ silencioso: true });
  const hasherPin = new ScryptHasherPin();
  return {
    publicadorEventos,
    registrar: new RegistrarEmpleado({ empleadoRepository, hasherPin, publicadorEventos }),
    actualizar: new ActualizarEmpleado({ empleadoRepository, publicadorEventos }),
    verificar: new VerificarIdentidad({ empleadoRepository, hasherPin }),
  };
}

test('registrar un empleado publica el evento empleado.registrado', async () => {
  const { registrar, publicadorEventos } = crearEscenario();
  const empleado = await registrar.ejecutar({ codigo: 'e010', nombre: 'Pedro Díaz', cargo: 'QA', pin: '4321' });

  assert.equal(empleado.codigo, 'E010');
  assert.equal(empleado.pinHash, undefined, 'el hash del PIN nunca se expone');
  assert.equal(publicadorEventos.eventos.length, 1);
  assert.equal(publicadorEventos.eventos[0].tipo, 'empleado.registrado');
});

test('no permite códigos duplicados', async () => {
  const { registrar } = crearEscenario();
  await registrar.ejecutar({ codigo: 'E010', nombre: 'Pedro Díaz', pin: '4321' });
  await assert.rejects(registrar.ejecutar({ codigo: 'E010', nombre: 'Otra Persona', pin: '1111' }), CodigoDuplicado);
});

test('valida el formato del PIN', async () => {
  const { registrar } = crearEscenario();
  await assert.rejects(registrar.ejecutar({ codigo: 'E011', nombre: 'Pedro Díaz', pin: 'abc' }), DatosInvalidos);
});

test('verificar identidad: autorizado, PIN incorrecto, inexistente e inactivo', async () => {
  const { registrar, actualizar, verificar } = crearEscenario();
  const { id } = await registrar.ejecutar({ codigo: 'E020', nombre: 'Marta Ruiz', pin: '1234' });

  assert.equal((await verificar.ejecutar({ codigo: 'E020', pin: '1234' })).estado, 'AUTORIZADO');
  assert.equal((await verificar.ejecutar({ codigo: 'E020', pin: '9999' })).estado, 'NO_IDENTIFICADO');
  assert.equal((await verificar.ejecutar({ codigo: 'X999', pin: '1234' })).estado, 'NO_IDENTIFICADO');

  await actualizar.ejecutar(id, { activo: false });
  assert.equal((await verificar.ejecutar({ codigo: 'E020', pin: '1234' })).estado, 'INACTIVO');
});
