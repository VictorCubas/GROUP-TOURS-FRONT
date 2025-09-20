/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/service/axiosInterceptor";
// import type { NuevoAEditarRolFormData, NuevoRolFormData } from "@/types/roles";


export const fetchData = async (page: number, page_size: number = 5, 
    filtros: any) => {
    let url = `/destino/?page=${page}&page_size=${page_size}`;


    console.log('filtros: ', filtros)

    console.log('nombre: ', filtros.nombre)
    if(filtros.nombre){
      url = url + `&busqueda=${filtros.nombre}`;
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
export async function nuevoRolFetch(data: any) {
    await axiosInstance.post(`/destino/`, data);    
}

export async function guardarDataEditado(data: any) {
  await axiosInstance.put(`/destino/${data.id}/`, data);    
}

export async function activarDesactivarData({ dataId, activo }: { dataId: number; activo: boolean }) {
  await axiosInstance.patch(`/destino/${dataId}/`, {activo});    
}

export async function fetchResumen() {
  const resp = await axiosInstance.get(`/destino/resumen/`);
  return resp?.data
}

export async function fetchDataHoteles(nombre_ciudad: string, pais: string) {
  console.log(pais);
  const resp = await axiosInstance.get(`/hotel/?page=${1}&page_size=${10}&${nombre_ciudad ? '&ciudad=' + nombre_ciudad: ''}${pais ? '&pais=' + pais: ''}`);
  // const resp = await axiosInstance.get(`/hotel/todos/page=1&page_size=10&pais_nombre=&pais=19`);
  return resp?.data.results
}

export async function fetchDataDestinosTodos() {
  const resp = await axiosInstance.get(`/destino/todos/`);
  return resp?.data
}
