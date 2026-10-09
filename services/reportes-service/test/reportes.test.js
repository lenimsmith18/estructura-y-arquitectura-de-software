/**
 * Pruebas unitarias de reportes-service: se simulan los eventos que llegarían
 * por RabbitMQ entregándolos directamente al caso de uso ProyectarEvento.
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const InMemoryProyeccionRepository = require('../src/infrastructure/persistence/InMemoryProyeccionRepository');
const ProyectarEvento = require('../src/application/use-cases/ProyectarEvento');
const ConsultarMovimientos = require('../src/application/use-cases/ConsultarMovimientos');
const GenerarReporteHoras = require('../src/application/use-cases/GenerarReporteHoras');
const { DatosInvalidos } = require('../src/domain/errores');

const EMP = { id: '00000000-0000-4000-8000-000000000001', codigo: 'E001', nombre: 'Ana Gómez', cargo: 'Analista', activo: true };

const mov = (id, tipo, fechaHora, duracionMinutos = null) => ({
  tipo: tipo === 'ENTRADA' ? 'asistencia.entrada_registrada' : 'asistencia.salida_registrada',
  datos: { id, empleadoId: EMP.id, empleadoCodigo: 'E001', empleadoNombre: EMP.nombre, tipo, fechaHora, duracionMinutos },
});

async function crearEscenario() {
  const proyeccionRepository = new InMemoryProyeccionRepository();
  const proyectar = new ProyectarEvento({ proyeccionRepository });
  await proyectar.ejecutar({ tipo: 'empleado.registrado', datos: EMP });
  await proyectar.ejecutar(mov('a0000000-0000-4000-8000-000000000001', 'ENTRADA', '2026-10-01T08:00:00'));
  await proyectar.ejecutar(mov('a0000000-0000-4000-8000-000000000002', 'SALIDA', '2026-10-01T17:00:00', 540));
  await proyectar.ejecutar(mov('a0000000-0000-4000-8000-000000000003', 'ENTRADA', '2026-10-02T08:00:00'));
  await proyectar.ejecutar(mov('a0000000-0000-4000-8000-000000000004', 'SALIDA', '2026-10-02T16:30:00', 510));
  await proyectar.ejecutar(mov('a0000000-0000-4000-8000-000000000005', 'ENTRADA', '2026-10-03T08:00:00'));
  return {
    proyectar,
    consultar: new ConsultarMovimientos({ proyeccionRepository }),
    reporte: new GenerarReporteHoras({ proyeccionRepository }),
  };
}

test('consulta de movimientos por período (rango inclusivo)', async () => {
  const { consultar } = await crearEscenario();
  const r = await consultar.ejecutar({ desde: '2026-10-01', hasta: '2026-10-02' });
  assert.equal(r.total, 4);
  const soloDia3 = await consultar.ejecutar({ desde: '2026-10-03', hasta: '2026-10-03', empleado: 'e001' });
  assert.equal(soloDia3.total, 1);
});

test('reporte de horas: suma jornadas y detecta entrada abierta', async () => {
  const { reporte } = await crearEscenario();
  const r = await reporte.ejecutar({ desde: '2026-10-01', hasta: '2026-10-31' });
  const ana = r.empleados.find((e) => e.codigo === 'E001');
  assert.equal(ana.jornadasCompletas, 2);
  assert.equal(ana.minutosTrabajados, 1050);
  assert.equal(ana.horasTrabajadas, '17 h 30 min');
  assert.equal(ana.entradaAbierta, true);
});

test('un evento repetido no duplica movimientos (idempotencia)', async () => {
  const { proyectar, consultar } = await crearEscenario();
  await proyectar.ejecutar(mov('a0000000-0000-4000-8000-000000000001', 'ENTRADA', '2026-10-01T08:00:00'));
  const r = await consultar.ejecutar({ desde: '2026-10-01', hasta: '2026-10-31' });
  assert.equal(r.total, 5);
});

test('valida el período', async () => {
  const { consultar } = await crearEscenario();
  await assert.rejects(consultar.ejecutar({ desde: '2026-10-10', hasta: '2026-10-01' }), DatosInvalidos);
  await assert.rejects(consultar.ejecutar({ desde: '10/01/2026' }), DatosInvalidos);
});
