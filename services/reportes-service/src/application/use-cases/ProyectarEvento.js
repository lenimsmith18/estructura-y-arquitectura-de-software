/**
 * @file Caso de uso: Proyectar un evento recibido.
 *
 * PATRÓN PUBLICADOR–SUSCRIPTOR — lado SUSCRIPTOR. El consumidor de RabbitMQ
 * (adaptador primario) entrega aquí cada evento; este caso de uso decide qué
 * hacer según su tipo. No sabe nada de RabbitMQ: podría recibir los eventos
 * desde Kafka, un webhook o una prueba unitaria.
 */
const TIPOS_SUSCRITOS = Object.freeze({
  EMPLEADO_REGISTRADO: 'empleado.registrado',
  EMPLEADO_ACTUALIZADO: 'empleado.actualizado',
  ENTRADA_REGISTRADA: 'asistencia.entrada_registrada',
  SALIDA_REGISTRADA: 'asistencia.salida_registrada',
});

class ProyectarEvento {
  /** @param {{proyeccionRepository: import('../ports/ProyeccionRepository')}} deps */
  constructor({ proyeccionRepository }) {
    this.proyeccionRepository = proyeccionRepository;
  }

  /** @param {{tipo: string, datos: object}} evento */
  async ejecutar({ tipo, datos }) {
    switch (tipo) {
      case TIPOS_SUSCRITOS.EMPLEADO_REGISTRADO:
      case TIPOS_SUSCRITOS.EMPLEADO_ACTUALIZADO:
        await this.proyeccionRepository.guardarEmpleado({
          id: datos.id, codigo: datos.codigo, nombre: datos.nombre, cargo: datos.cargo, activo: datos.activo,
        });
        return;

      case TIPOS_SUSCRITOS.ENTRADA_REGISTRADA:
      case TIPOS_SUSCRITOS.SALIDA_REGISTRADA:
        await this.proyeccionRepository.guardarMovimiento({
          id: datos.id,
          empleadoId: datos.empleadoId,
          empleadoCodigo: datos.empleadoCodigo,
          empleadoNombre: datos.empleadoNombre,
          tipo: datos.tipo,
          fechaHora: new Date(datos.fechaHora),
          duracionMinutos: datos.duracionMinutos ?? null,
        });
        return;

      default:
        console.warn(`[reportes] evento ignorado: ${tipo}`);
    }
  }
}

ProyectarEvento.PATRONES_DE_SUSCRIPCION = ['empleado.*', 'asistencia.*'];
module.exports = ProyectarEvento;
