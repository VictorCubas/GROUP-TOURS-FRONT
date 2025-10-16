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

//tanstackquery ya maneja el error y en el interceptor tambien
export async function nuevoDataFetch(data: any) {
    await axiosInstance.post(`/reservas/`, data);    
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