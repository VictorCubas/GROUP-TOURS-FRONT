/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/service/axiosInterceptor";

// Listar facturas con paginación y filtros
export const fetchFacturas = async (page: number, page_size: number = 10, filtros: any) => {
    let url = `/facturacion/facturas/?page=${page}&page_size=${page_size}`;

    // Filtro por estado activo/anulado
    if (filtros.activo !== null && filtros.activo !== undefined) {
      url = url + `&activo=${filtros.activo}`;
    }

    // Filtro por fechas
    if (filtros.fecha_emision_desde) {
      url = url + `&fecha_emision_desde=${filtros.fecha_emision_desde}`;
    }
    if (filtros.fecha_emision_hasta) {
      url = url + `&fecha_emision_hasta=${filtros.fecha_emision_hasta}`;
    }

    // Filtro por búsqueda (número de factura o cliente)
    if (filtros.busqueda) {
      url = url + `&busqueda=${filtros.busqueda}`;
    }

    const resp = await axiosInstance.get(url);
    return resp?.data ?? null;
}

// Obtener resumen de facturas
export async function fetchResumenFacturas() {
  const resp = await axiosInstance.get(`/facturacion/facturas/resumen/`);
  // Si la respuesta es un array directo, retornarlo
  if (Array.isArray(resp?.data)) {
    return resp.data;
  }
  // Si la respuesta tiene resumen_general, retornar ese array
  if (resp?.data?.resumen_general && Array.isArray(resp.data.resumen_general)) {
    return resp.data.resumen_general;
  }
  // Por defecto, retornar data tal cual
  return resp?.data;
}

// Anular una factura
export async function anularFactura({ facturaId, motivo }: { facturaId: number; motivo: string }) {
  const resp = await axiosInstance.post(`/facturacion/facturas/${facturaId}/anular/`, { motivo });
  return resp?.data;
}

// Descargar factura en PDF
export async function descargarFacturaPDF(facturaId: number) {
  const resp = await axiosInstance.get(`/facturacion/descargar-pdf/${facturaId}/`, {
    responseType: 'blob'
  });

  // Crear un blob URL y descargarlo
  const blob = new Blob([resp.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `factura_${facturaId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Servicios antiguos para configuración de facturación
export const fetchData = async (page: number, page_size: number = 5,
    nombre: string = '', activo: boolean) => {
    let url = `/nacionalidades/?page=${page}&page_size=${page_size}`;

    console.log('nombre: ', nombre)
    if(nombre){
      url = url + `&nombre=${nombre}`;
    }

    url = url + `&activo=${activo}`;

    try {
      const resp = await axiosInstance.get(url);
      console.log('modulos list: ', resp?.data);
      if(resp?.data?.results){
        return resp?.data ?? null;
      }
    } catch (error) {
      console.log(error);
    }
}

export async function nuevoDataFetch(data: any) {
    await axiosInstance.post(`/facturacion/guardar-config/`, data);
}

export async function guardarDataEditado(data: any) {
  await axiosInstance.put(`/nacionalidades/${data.id}/`, data);
}

export async function activarDesactivarData({ dataId, activo }: { dataId: number; activo: boolean }) {
  await axiosInstance.patch(`/nacionalidades/${dataId}/`, {activo});
}

export async function fetchResumen() {
  const resp = await axiosInstance.get(`/nacionalidades/resumen/`);
  return resp?.data
}

export async function fetchDataEstablecimientosTodo() {
  const resp = await axiosInstance.get(`facturacion/establecimientos/todos/`);
  return resp?.data
}

export async function fetchDataPuntoExpedicionTodo() {
  const resp = await axiosInstance.get(`facturacion/puntos-expedicion/todos/`);
  return resp?.data
}

export async function fetchEstablecimientoTodo() {
  const resp = await axiosInstance.get(`facturacion/establecimientos/todos/`);
  return resp?.data
}

export async function fetchDataTimbradosTodo() {
  const resp = await axiosInstance.get(`facturacion/timbrados/todos/`);
  return resp?.data
}

export async function fetchDataTiposImpuestosTodo() {
  const resp = await axiosInstance.get(`facturacion/tipos-impuesto/todos/`);
  return resp?.data
}

export async function fetchDataEmpresaTodo() {
  const resp = await axiosInstance.get(`facturacion/empresa/`);
  return resp?.data
}

export async function fetchDataConfigFactura() {
  const resp = await axiosInstance.get(`facturacion/obtener-config/`);
  return resp?.data
}
