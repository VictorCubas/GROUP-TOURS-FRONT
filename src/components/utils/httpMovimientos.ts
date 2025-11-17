/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/service/axiosInterceptor";

/**
 * Obtiene lista paginada de movimientos de caja con filtros
 */
export const fetchMovimientos = async (page: number, page_size: number = 10, filtros: any) => {
  let url = `/arqueo-caja/movimientos/?page=${page}&page_size=${page_size}`;

  // Filtro por búsqueda general (número de movimiento, descripción, etc.)
  if (filtros.busqueda) {
    url = url + `&busqueda=${filtros.busqueda}`;
  }

  // Filtro por tipo de movimiento (ingreso/egreso)
  if (filtros.tipo_movimiento && filtros.tipo_movimiento !== 'all') {
    url = url + `&tipo_movimiento=${filtros.tipo_movimiento}`;
  }

  // Filtro por método de pago
  if (filtros.metodo_pago && filtros.metodo_pago !== 'all') {
    url = url + `&metodo_pago=${filtros.metodo_pago}`;
  }

  // Filtro por concepto
  if (filtros.concepto && filtros.concepto !== 'all') {
    url = url + `&concepto=${filtros.concepto}`;
  }

  // Filtro por caja
  if (filtros.caja) {
    url = url + `&caja=${filtros.caja}`;
  }

  // Filtro por apertura
  if (filtros.apertura) {
    url = url + `&apertura=${filtros.apertura}`;
  }

  // Filtro por fecha desde/hasta
  if (filtros.fecha_desde && filtros.fecha_hasta) {
    url = url + `&fecha_desde=${filtros.fecha_desde}`;
    url = url + `&fecha_hasta=${filtros.fecha_hasta}`;
  }

  // Filtro por estado activo
  if (filtros.activo !== null && filtros.activo !== undefined) {
    url = url + `&activo=${filtros.activo}`;
  }

  // Filtro por tiene comprobante
  if (filtros.tiene_comprobante !== null && filtros.tiene_comprobante !== undefined) {
    url = url + `&tiene_comprobante=${filtros.tiene_comprobante}`;
  }

  try {
    const resp = await axiosInstance.get(url);
    console.log('movimientos list: ', resp?.data);
    if (resp?.data?.results) {
      return resp?.data ?? null;
    }
  } catch (error) {
    console.log(error);
  }
}

/**
 * Obtiene el resumen general de movimientos
 */
export async function fetchResumenMovimientos() {
  const resp = await axiosInstance.get(`/arqueo-caja/movimientos/resumen-general/`);
  return resp?.data;
}
