/**
 * @file Paso común a entrada y salida: identificar al empleado.
 *
 * Flujo básico: "El empleado se identifica en el sistema → el sistema verifica
 * que se encuentre registrado y activo". Traduce la respuesta del puerto
 * VerificadorEmpleados a los errores de dominio de los flujos alternos.
 */
const { DatosInvalidos, EmpleadoNoIdentificado, EmpleadoInactivo } = require('../../domain/errores');

/**
 * @param {import('../ports/VerificadorEmpleados')} verificadorEmpleados
 * @param {{codigo: string, pin: string}} credenciales
 * @returns {Promise<{id: string, codigo: string, nombre: string}>}
 */
async function identificarEmpleado(verificadorEmpleados, { codigo, pin } = {}) {
  if (!codigo || !pin) throw new DatosInvalidos('Debe ingresar el código de empleado y el PIN.');

  const { estado, empleado } = await verificadorEmpleados.verificar({ codigo, pin });

  if (estado === 'INACTIVO') throw new EmpleadoInactivo();
  if (estado !== 'AUTORIZADO' || !empleado) throw new EmpleadoNoIdentificado();
  return empleado;
}

module.exports = identificarEmpleado;
