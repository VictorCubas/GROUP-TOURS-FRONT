export const formatearFecha = (fechaString: string | Date): string => {
  const fecha = new Date(fechaString);

  const pad = (n: number) => (n < 10 ? `0${n}` : n);

  const dia = pad(fecha.getDate());
  const mes = pad(fecha.getMonth() + 1); // enero es 0
  const anio = fecha.getFullYear();

  const horas = pad(fecha.getHours());
  const minutos = pad(fecha.getMinutes());

  return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}

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