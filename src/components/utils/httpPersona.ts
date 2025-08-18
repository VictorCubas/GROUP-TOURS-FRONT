/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/service/axiosInterceptor";
import type { NuevoModuloFormData } from "@/types/personas";
import type { NuevoAEditarPermisoFormData } from "@/types/permisos";


export const fetchData = async (page: number, page_size: number = 5, 
    filtros: any) => {
    let url = `/personas/?page=${page}&page_size=${page_size}`;

    console.log('filtros: ', filtros)

    console.log('nombre: ', filtros.nombre)
    if(filtros.nombre){
      url = url + `&nombre=${filtros.nombre}`;
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

        return resp?.data ?? null;
      }
    } catch (error) {
      console.log(error);
    }
  }


//tanstackquery ya maneja el error y en el interceptor tambien
export async function nuevoDataFetch(data: NuevoModuloFormData) {
    await axiosInstance.post(`/personas/`, data);    
}

export async function guardarDataEditado(data: NuevoAEditarPermisoFormData) {
  await axiosInstance.put(`/personas/${data.id}/`, data);    
}

export async function activarDesactivarData({ dataId, activo, tipo }: { dataId: number; activo: boolean, tipo: string }) {
  await axiosInstance.patch(`/personas/${dataId}/`, {activo, tipo});    
}

export async function fetchResumen() {
  const resp = await axiosInstance.get(`/personas/resumen/`);
  return resp?.data
}

export async function fetchDataModulo() {
  const resp = await axiosInstance.get(`/personas/todos/`);
  return resp?.data
}