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