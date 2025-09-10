/* eslint-disable @typescript-eslint/no-unused-vars */
export const formatearFecha = (fechaString: string | Date, mostrarMinuto: boolean = true): string => {

  let fecha: Date;

  // Si es string con formato YYYY-MM-DD sin hora
  if (typeof fechaString === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fechaString)) {
    const [anio, mes, dia] = fechaString.split("-").map(Number);
    // Creamos fecha en local sin ajustar por zona horaria
    fecha = new Date(anio, mes - 1, dia);
  } else {
    fecha = new Date(fechaString);
  }

  const pad = (n: number) => (n < 10 ? `0${n}` : n);

  const dia = pad(fecha.getDate());
  const mes = pad(fecha.getMonth() + 1); // enero es 0
  const anio = fecha.getFullYear();

  const horas = pad(fecha.getHours());
  const minutos = pad(fecha.getMinutes());

  let fechaResult: string = `${dia}/${mes}/${anio}`;

  if (mostrarMinuto) {
    fechaResult += ` ${horas}:${minutos}`;
  }

  return fechaResult;
};

export const formatearMoneda = new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG'
  });

export const formatearSeparadorMiles = new Intl.NumberFormat('es-PY', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });


export function capitalizePrimeraLetra(text: string): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function getNombreCompleto(nombre?: string, apellido?: string): string{
  if (!nombre && !apellido) return "";

  return `${nombre} ${apellido}`
}

/**
 * Función que retorna la fecha correspondiente al 01 de enero 
 * de hace 20 años a partir del año actual.
 * 
 * Esta fecha se puede utilizar como valor por defecto para 
 * campos de fecha de nacimiento en formularios.
 * 
 * @returns {string} Fecha en formato 'YYYY-01-01'
 */
export function getFechaPorDefecto() {
    const hoy = new Date();
    const hace20Anios = hoy.getFullYear() - 20;
    return `${hace20Anios}-01-01`;
  }


/**
 * Elimina acentos y diacríticos de un texto.
 * @param text Texto de entrada.
 * @returns Texto sin acentos.
 */
export function quitarAcentos(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}


export const formatDate = (originalDate: string) => {
  const [day, month, year] = originalDate.split("/");
  return `${year}-${month}-${day}`;
}



/**
/**
 * Calcula la cantidad de días entre dos fechas en formato dd-mm-yyyy.
 * @param startDateStr Fecha inicial en formato dd-mm-yyyy
 * @param endDateStr Fecha final en formato dd-mm-yyyy
 * @returns Número de días entre las fechas
 */ 
/**
 * Calcula la cantidad de días entre dos fechas (acepta yyyy-mm-dd o dd-mm-yyyy).
 * @param startDateStr Fecha inicial
 * @param endDateStr Fecha final
 * @returns Número de días entre las fechas
 */
export function getDaysBetweenDates(startDateStr: string, endDateStr: string): number {
  // Función para convertir string a Date
  const parseDate = (dateStr: string): Date => {
    const parts = dateStr.split("-").map(Number);
    if (parts[0] > 31) {
      // Formato yyyy-mm-dd
      return new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      // Formato dd-mm-yyyy
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
  };

  const start = parseDate(startDateStr);
  const end = parseDate(endDateStr);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Ejemplo de uso
// console.log(getDaysBetweenDates("2026-01-02", "2026-01-10")); // 8
// console.log(getDaysBetweenDates("02-01-2026", "10-01-2026")); // 8
