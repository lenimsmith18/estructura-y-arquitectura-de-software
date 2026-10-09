/**
 * @file Objeto de valor Periodo.
 *
 * "El administrador podrá consultar los registros ... de acuerdo con el período
 *  que necesite." Encapsula la validación de fechas y la regla de que el rango
 * es INCLUSIVO en ambos extremos (desde 00:00 hasta 23:59:59 del día final).
 */
const { DatosInvalidos } = require('./errores');

const FORMATO = /^\d{4}-\d{2}-\d{2}$/;

class Periodo {
  /**
   * @param {string} [desde] YYYY-MM-DD. Por defecto: primer día del mes actual.
   * @param {string} [hasta] YYYY-MM-DD. Por defecto: hoy.
   */
  constructor(desde, hasta) {
    const hoy = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    this.desde = desde || `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-01`;
    this.hasta = hasta || `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;

    if (!FORMATO.test(this.desde) || !FORMATO.test(this.hasta)) {
      throw new DatosInvalidos('Las fechas deben tener el formato AAAA-MM-DD.');
    }
    // Fechas interpretadas en la zona horaria del servidor (variable TZ).
    this.inicio = new Date(`${this.desde}T00:00:00`);
    const fin = new Date(`${this.hasta}T00:00:00`);
    if (Number.isNaN(this.inicio.getTime()) || Number.isNaN(fin.getTime())) {
      throw new DatosInvalidos('Fecha inválida.');
    }
    if (fin < this.inicio) throw new DatosInvalidos('La fecha "desde" no puede ser posterior a "hasta".');
    // Límite exclusivo: inicio del día siguiente a "hasta".
    this.finExclusivo = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate() + 1);
  }

  /** @param {Date} fecha */
  contiene(fecha) {
    return fecha >= this.inicio && fecha < this.finExclusivo;
  }

  aDatos() {
    return { desde: this.desde, hasta: this.hasta };
  }
}

module.exports = Periodo;
