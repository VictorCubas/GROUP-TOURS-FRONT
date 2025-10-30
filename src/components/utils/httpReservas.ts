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