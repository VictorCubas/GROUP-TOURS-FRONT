/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/service/axiosInterceptor";
// import type { NuevoAEditarRolFormData, NuevoRolFormData } from "@/types/roles";


export const fetchData = async (page: number, page_size: number = 5, 
    filtros: any) => {
    let url = `/hotel/?page=${page}&page_size=${page_size}`;


    console.log('filtros: ', filtros)

    console.log('nombre: ', filtros.nombre)
    if(filtros.nombre){
      url = url + `&busqueda=${filtros.nombre}`;
    }

    url = url + `&estrellas=`;
    if(filtros.estrellas){
      url = url + `${filtros.estrellas}`;
    }

    if(filtros.telefono){
      url = url + `&telefono=${filtros.telefono}`;
    }

    console.log(filtros)

    if(filtros.fecha_desde && filtros.fecha_hasta){
      url = url + `&fecha_creacion_desde=${filtros.fecha_desde}`;
      url = url + `&fecha_creacion_hasta=${filtros.fecha_hasta}`;
    }

    url = url + `&activo=${filtros.activo}`;


    try {
      const resp = await axiosInstance.get(url);
      console.log('roles list: ', resp?.data);
      if(resp?.data?.results){
        // setPermisos(resp?.data?.results ?? []);

        return resp?.data ?? null;
      }
    } catch (error) {
      console.log(error);
    }
  }


//tanstackquery ya maneja el error y en el interceptor tambien
export async function nuevoDataFetch(data: any) {
    await axiosInstance.post(`/hotel/`, data);    
}

export async function guardarDataEditado(data: any) {
  await axiosInstance.put(`/hotel/${data.id}/`, data);    
}

export async function activarDesactivarData({ dataId, activo }: { dataId: number; activo: boolean }) {
  await axiosInstance.patch(`/hotel/${dataId}/`, {activo});    
}

export async function fetchResumen() {
  const resp = await axiosInstance.get(`/hotel/resumen/`);
  return resp?.data
}

export async function fetchDataCadenas() {
  const resp = await axiosInstance.get(`/hotel/cadenas/todos/`);
  return resp?.data
}

export async function fetchDataHoteles() {
  const resp = await axiosInstance.get(`/hotel/todos/`);
  return resp?.data
}


export async function fetchDataServiciosTodos() {
  const resp = await axiosInstance.get(`/servicio/todos/?tipo=hotel`);
  return resp?.data?.results;
}