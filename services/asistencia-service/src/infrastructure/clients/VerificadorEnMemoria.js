/**
 * @file Adaptador de salida: verificador de empleados con una lista fija.
 *
 * Implementa el puerto VerificadorEmpleados sin red. Se usa en pruebas y al
 * ejecutar el servicio aislado (VERIFICADOR=memoria). Permite también simular
 * el "Error de conexión" con `disponible = false`.
 */
const VerificadorEmpleados = require('../../application/ports/VerificadorEmpleados');
const { ServicioNoDisponible } = require('../../domain/errores');

/** Empleados por defecto (los mismos de los datos demo de empleados-service). */
const EMPLEADOS_POR_DEFECTO = [
  { id: '00000000-0000-4000-8000-000000000001', codigo: 'E001', nombre: 'Ana Gómez', pin: '1234', activo: true },
  { id: '00000000-0000-4000-8000-000000000002', codigo: 'E002', nombre: 'Carlos Pérez', pin: '1234', activo: true },
  { id: '00000000-0000-4000-8000-000000000003', codigo: 'E003', nombre: 'Laura Ríos', pin: '1234', activo: false },
];

class VerificadorEnMemoria extends VerificadorEmpleados {
  constructor(empleados = EMPLEADOS_POR_DEFECTO) {
    super();
    this.empleados = empleados;
    this.disponible = true;
  }

  async verificar({ codigo, pin }) {
    if (!this.disponible) throw new ServicioNoDisponible('servicio de empleados');
    const e = this.empleados.find((x) => x.codigo === String(codigo).toUpperCase() && x.pin === String(pin));
    if (!e) return { estado: 'NO_IDENTIFICADO', empleado: null };
    const empleado = { id: e.id, codigo: e.codigo, nombre: e.nombre };
    return { estado: e.activo ? 'AUTORIZADO' : 'INACTIVO', empleado };
  }
}

module.exports = VerificadorEnMemoria;
