/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/service/axiosInterceptor";
// import type { NuevoModuloFormData } from "@/types/empleados";
// import type { NuevoAEditarPermisoFormData } from "@/types/permisos";


export const fetchData = async (page: number, page_size: number = 5, 
    filtros: any) => {
    let url = `/reservas/?page=${page}&page_size=${page_size}`;

    console.log('filtros: ', filtros)

    console.log('nombre: ', filtros.nombre)
    if(filtros.nombre){
      url = url + `&busqueda=${filtros.nombre}`;
    }

    if(filtros.estado !== 'all'){
      url = url + `&estado=${filtros.estado}`;
    }

    // if(filtros.sexo !== 'all'){
    //   url = url + `&sexo=${filtros.sexo}`;
    // }

    if(filtros.fecha_desde && filtros.fecha_hasta){
      url = url + `&fecha_reserva_desde=${filtros.fecha_desde}`;
      url = url + `&fecha_reserva_hasta=${filtros.fecha_hasta}`;
    }

    url = url + `&activo=${filtros.activo}`;

    try {
      const resp = await axiosInstance.get(url);
      console.log('personas list: ', resp?.data);
      if(resp?.data?.results){
        // setPermisos(resp?.data?.results ?? []);

        return resp?.data ?? null;
      }
    } catch (error) {
      console.log(error);
    }
  }


export const fetchDataPersonaTitular = async (page: number, page_size: number = 5, 
    filtros: any) => {
    let url = `/personas/?page=${page}&page_size=${page_size}`;

    console.log('filtros: ', filtros)

    console.log('busqueda: ', filtros.busqueda) 
    if(filtros.busqueda){
      url = url + `&busqueda=${filtros.busqueda}`;
    }

    if(filtros.razon_social){
      url = url + `&razon_social=${filtros.razon_social}`;
    }

    if(filtros.tipo !== 'all'){
      url = url + `&tipo=${filtros.tipo}`;
    }

    if(filtros.sexo !== 'all'){
      url = url + `&sexo=${filtros.sexo}`;
    }

    if(filtros.documento){
      url = url + `&documento=${filtros.documento}`;
    }

    if(filtros.telefono){
      url = url + `&telefono=${filtros.telefono}`;
    }

    if(filtros.fecha_desde && filtros.fecha_hasta){
      url = url + `&fecha_desde=${filtros.fecha_desde}`;
      url = url + `&fecha_hasta=${filtros.fecha_hasta}`;
    }

    url = url + `&activo=${filtros.activo}`;

    try {
      const resp = await axiosInstance.get(url);
      console.log('personas list: ', resp?.data);
      if(resp?.data?.results){
        // setPermisos(resp?.data?.results ?? []);

        return resp?.data.results ?? null;
      }
    } catch (error) {
      console.log(error);
    }
  }


export const fetchDataPasajeros = async (page: number, page_size: number = 5, 
    filtros: any) => {
    let url = `/personas/?page=${page}&page_size=${page_size}`;

    console.log('filtros: ', filtros)

    console.log('busqueda: ', filtros.busqueda) 
    if(filtros.busqueda){
      url = url + `&busqueda=${filtros.busqueda}`;
    }

    if(filtros.tipo !== 'all'){
      url = url + `&tipo=${filtros.tipo}`;
    }


    if(filtros.fecha_desde && filtros.fecha_hasta){
      url = url + `&fecha_desde=${filtros.fecha_desde}`;
      url = url + `&fecha_hasta=${filtros.fecha_hasta}`;
    }

    url = url + `&activo=${filtros.activo}`;

    try {
      const resp = await axiosInstance.get(url);
      console.log('personas list: ', resp?.data);
      if(resp?.data?.results){
        // setPermisos(resp?.data?.results ?? []);

        return resp?.data.results ?? null;
      }
    } catch (error) {
      console.log(error);
    }
  }

export const fetchDataPaquetes = async (page: number, page_size: number = 5, 
    filtros: any) => {
    let url = `/paquete/?page=${page}&page_size=${page_size}`;

    console.log('filtros: ', filtros)

    console.log('busqueda: ', filtros.busqueda)
    if(filtros.busqueda){
      url = url + `&busqueda=${filtros.busqueda}`;
    }

    if(filtros.zona_geografica){
      url = url + `&zona_geografica=${filtros.zona_geografica}`;
    }

    if(filtros.fecha_desde && filtros.fecha_hasta){
      url = url + `&fecha_creacion_desde=${filtros.fecha_desde}`;
      url = url + `&fecha_creacion_hasta=${filtros.fecha_hasta}`;
    }

    url = url + `&activo=${filtros.activo}`;

    try {
      const resp = await axiosInstance.get(url);
      console.log('personas list: ', resp?.data);
      if(resp?.data?.results){
        // setPermisos(resp?.data?.results ?? []);

        return resp?.data.results ?? null;
      }
    } catch (error) {
      console.log(error);
    }
  }


export async function descargarComprobantePDF(id: number | string) {
  const response = await axiosInstance.get(`/comprobantes/${id}/descargar-comprobante/`, {
    responseType: 'blob',
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `comprobante-${id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}


export async function generarComprobante(reservaId: number | string) {
  const response = await axiosInstance.post(`/reservas/${reservaId}/generar-comprobante/`, {});
  return response.data;
}

export async function pagarSenia(reservaId: number | string, payload: any) {
  console.log(payload)
  const response = await axiosInstance.post(`/reservas/${reservaId}/registrar-senia/`, payload);
  return response.data;
}

export async function pagoTotal(reservaId: number | string, payload: any) {
  const response = await axiosInstance.post(`/reservas/${reservaId}/registrar-pago/`, payload);
  return response.data;
}

export async function registrarPago(reservaId: number | string, payload: any) {
  const response = await axiosInstance.post(`/reservas/${reservaId}/registrar-pago/`, payload);
  return response.data;
}

export async function asignarPasajero(pasajeroId: number | string, payload: any) {
  const response = await axiosInstance.patch(`/reservas/pasajeros/${pasajeroId}`, payload);
  return response.data;
}

export async function asignarTipoFacturaModalidad(reservaId: number | string, payload: any) {
  const response = await axiosInstance.patch(`/reservas/${reservaId}`, payload);
  return response.data;
}

export async function descargarComprobanteById(comprobanteId: number | string) {
  const response = await axiosInstance.get(
    `/comprobantes/${comprobanteId}/descargar-pdf/`,
    { responseType: 'blob' } // 👈 importante: indica que es un archivo binario
  );

  // Crear una URL temporal del archivo
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));

  // Crear un enlace temporal para forzar la descarga
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `comprobante-${comprobanteId}.pdf`); // 👈 nombre del archivo
  document.body.appendChild(link);
  link.click();

  // Limpieza
  link.remove();
  window.URL.revokeObjectURL(url);

  return response;
}

export async function descargarFacturaGlobalById(id: number | string, params: string | null) {
  let url_fetch = `/reservas/${id}/descargar-factura-global/`;

  if(params)
    url_fetch += `${params}`


  console.log(url_fetch);

  const response = await axiosInstance.get(
    url_fetch,
    { responseType: 'blob' } // 👈 importante: indica que es un archivo binario
  );

  // Crear una URL temporal del archivo
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));

  // Crear un enlace temporal para forzar la descarga
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `comprobante-${id}.pdf`); // 👈 nombre del archivo
  document.body.appendChild(link);
  link.click();

  // Limpieza
  link.remove();
  window.URL.revokeObjectURL(url);

  return response;
}

export async function
generarNotaCreditoGlobal(id: number | string, payload: any) {
  const urlGenerar = `/facturacion/generar-nota-credito-total/${id}`;

  try {
    // 1️⃣ Generar la nota de crédito
    const response = await axiosInstance.post(urlGenerar, payload);

    // Asumimos que el backend devuelve el ID de la nota de crédito generada
    const notaCreditoId = response.data?.nota_credito?.id;

    if (!notaCreditoId) {
      throw new Error('No se recibió el ID de la nota de crédito generada.');
    }

    // 2️⃣ Descargar el PDF correspondiente
    await descargarPdfNotaCredito(notaCreditoId);

    return response;
  } catch (error) {
    console.error('❌ Error al generar o descargar la nota de crédito:', error);
    throw error;
  }
}

// 🆕 Función para generar Nota de Crédito PARCIAL
export async function generarNotaCreditoParcial(id: number | string, payload: any) {
  const urlGenerar = `/facturacion/generar-nota-credito-parcial/${id}`;

  try {
    // 1️⃣ Generar la nota de crédito parcial
    const response = await axiosInstance.post(urlGenerar, payload);

    // Asumimos que el backend devuelve el ID de la nota de crédito generada
    const notaCreditoId = response.data?.nota_credito?.id;

    if (!notaCreditoId) {
      throw new Error('No se recibió el ID de la nota de crédito generada.');
    }

    // 2️⃣ Descargar el PDF correspondiente
    await descargarPdfNotaCredito(notaCreditoId);

    return response;
  } catch (error) {
    console.error('❌ Error al generar o descargar la nota de crédito parcial:', error);
    throw error;
  }
}

// 🔽 Servicio auxiliar para descargar el PDF de una NC
async function descargarPdfNotaCredito(notaCreditoId: number | string) {
  const urlDescarga = `/facturacion/descargar-pdf-nota-credito/${notaCreditoId}`;

  try {
    const response = await axiosInstance.get(urlDescarga, {
      responseType: 'blob',
    });

    // Intentar obtener el nombre del archivo
    const contentDisposition = response.headers['content-disposition'];
    let fileName = `nota-credito-${notaCreditoId}.pdf`;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        fileName = decodeURIComponent(match[1]);
      }
    }

    // Crear el archivo descargable
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('⚠️ Error al descargar el PDF de la nota de crédito:', error);
    throw error;
  }
}

// 🔽 Servicio para descargar directamente una NC ya generada (exportado)
export async function descargarNotaCreditoYaGenerada(notaCreditoId: number | string) {
  await descargarPdfNotaCredito(notaCreditoId);
}

export async function descargarFacturaIndividualById(reservaId: number | string, params: string) {
  let url_fetch = `/reservas/${reservaId}/descargar-factura-individual/`;

  if(params)
    url_fetch += `${params}`


  const response = await axiosInstance.get(
      url_fetch,
      { responseType: 'blob' }
  );

  // Intentar obtener el nombre desde el header Content-Disposition
  const disposition = response.headers['content-disposition'];
  let filename = `factura-${reservaId}.pdf`; // valor por defecto

  if (disposition && disposition.includes('filename=')) {
    const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
    if (filenameMatch && filenameMatch.length > 1) {
      filename = decodeURIComponent(filenameMatch[1]);
    }
  }

  // Crear la URL del archivo
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));

  // Crear el enlace temporal para la descarga
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();

  // Limpieza
  link.remove();
  window.URL.revokeObjectURL(url);

  return response;
}


export async function descargaVoucherById(id: number | string) {
  const response = await axiosInstance.get(
    `/vouchers/${id}/descargar-pdf/`,
    { responseType: 'blob' } // 👈 importante: indica que es un archivo binario
  );

  // Crear una URL temporal del archivo
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));

  // Crear un enlace temporal para forzar la descarga
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `comprobante-${id}.pdf`); // 👈 nombre del archivo
  document.body.appendChild(link);
  link.click();

  // Limpieza
  link.remove();
  window.URL.revokeObjectURL(url);

  return response;
}



export async function descargarComprobanteDesdeUrl(pdfUrl: string, fileName = 'comprobante.pdf') {
  const response = await axiosInstance.get(pdfUrl, { responseType: 'blob' });

  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
}


//tanstackquery ya maneja el error y en el interceptor tambien
export async function nuevoDataFetch(data: any) {
    const response = await axiosInstance.post(`/reservas/`, data);    
    console.log(response)
    return response.data
}

export async function guardarDataEditado({ data, paqueteId }: { data: any; paqueteId: number | string }) {
  await axiosInstance.put(`/paquete/${paqueteId}/`, data);    
}

export async function activarDesactivarData({ dataId, activo }: { dataId: number; activo: boolean }) {
  await axiosInstance.patch(`/paquete/${dataId}/`, {activo,});    
}

export async function fetchResumen() {
  const resp = await axiosInstance.get(`/reservas/resumen/`);
  return resp?.data
}

export async function fetchDataModulo() {
  const resp = await axiosInstance.get(`/personas/todos/`);
  return resp?.data
}


export async function fetchDataTodo() {
  const resp = await axiosInstance.get(`/tipo_remuneracion/todos/`);
  return resp?.data
}

interface FetchEventParams {
  id: string | number;
  signal?: AbortSignal;
}

export async function fetchDataHotelesPorSalida({ id, signal }: FetchEventParams) {
  const resp = await axiosInstance.get(`/hotel/por-salida/${id}`, { signal });
  return resp?.data
}

export async function fetchReservaDetallesById({ id, signal }: FetchEventParams) {
  const resp = await axiosInstance.get(`/reservas/${id}`, { signal });
  return resp?.data
}

export async function fetchDataMonedaTodos() {
  const resp = await axiosInstance.get(`/moneda/todos/`);
  return resp?.data
}

export async function fetchDataServiciosTodos() {
  const resp = await axiosInstance.get(`/servicio/todos/`);
  return resp?.data
}

export async function fetchDataDistribuidoraTodos() {
  const resp = await axiosInstance.get(`/distribuidora/todos/`);
  return resp?.data
}

export async function fetchDataPaqueteTodos() {
  const resp = await axiosInstance.get(`/paquete/todos/`);
  return resp?.data
}

// Función para cancelar una reserva
export async function cancelarReserva(reservaId: number | string, payload: any) {
  try {
    const response = await axiosInstance.post(`/reservas/${reservaId}/cancelar/`, payload);
    return response.data;
  } catch (error) {
    console.error('Error al cancelar la reserva:', error);
    throw error;
  }
}