/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/service/axiosInterceptor";
import type { NuevoModuloFormData } from "@/types/modulos";


export const fetchData = async (page: number, page_size: number = 5, 
    nombre: string = '', activo: boolean) => {
    let url = `/tipo_habitacion/?page=${page}&page_size=${page_size}`;


    console.log('nombre: ', nombre)
    if(nombre){
      url = url + `&nombre=${nombre}`;
    }

    url = url + `&activo=${activo}`;

    try {
      const resp = await axiosInstance.get(url);
      console.log('modulos list: ', resp?.data);
      if(resp?.data?.results){
        // setPermisos(resp?.data?.results ?? []);

        return resp?.data ?? null;
      }
    } catch (error) {
      console.log(error);
    }
  }


//tanstackquery ya maneja el error y en el interceptor tambien
export async function guardarNuevaData(data: NuevoModuloFormData) {
    await axiosInstance.post(`/tipo_habitacion/`, data);    
}

export async function guardarDataEditado(data: any) {
  await axiosInstance.put(`/tipo_habitacion/${data.id}/`, data);    
}

export async function activarDesactivarData({ dataId, activo }: { dataId: number; activo: boolean }) {
  await axiosInstance.patch(`/tipo_habitacion/${dataId}/`, {activo});    
}

export async function fetchResumen() {
  const resp = await axiosInstance.get(`/tipo_habitacion/resumen/`);
  return resp?.data
}

export async function fetchDataTodo() {
  const resp = await axiosInstance.get(`/tipo_habitacion/todos/`);
  return resp?.data
}
