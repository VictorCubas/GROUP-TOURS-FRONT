import axiosInstance from "@/service/axiosInterceptor";
import type { NuevoAEditarRolFormData, NuevoRolFormData } from "@/types/roles";


export const fetchData = async (page: number, page_size: number = 5, 
    nombre: string = '', activo: boolean) => {
    let url = `/roles/?page=${page}&page_size=${page_size}`;


    console.log('nombre: ', nombre)
    if(nombre){
      url = url + `&nombre=${nombre}`;
    }

    url = url + `&activo=${activo}`;


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
export async function nuevoRolFetch(data: NuevoRolFormData) {
    await axiosInstance.post(`/roles/`, data);    
}

export async function guardarDataEditado(data: NuevoAEditarRolFormData) {
  await axiosInstance.put(`/roles/${data.id}/`, data);    
}

export async function activarDesactivarData({ dataId, activo }: { dataId: number; activo: boolean }) {
  await axiosInstance.patch(`/roles/${dataId}/`, {activo});    
}

export async function fetchResumen() {
  const resp = await axiosInstance.get(`/roles/resumen/`);
  return resp?.data
}

export async function fetchDataPermisos() {
  const resp = await axiosInstance.get(`/permisos/todos/`);
  return resp?.data
}
