/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/service/axiosInterceptor";
// import type { NuevoModuloFormData } from "@/types/empleados";
// import type { NuevoAEditarPermisoFormData } from "@/types/permisos";


export const fetchData = async (page: number, page_size: number = 5, 
    filtros: any) => {

    console.log(page_size);
    let url = `/arqueo-caja/cajas/?page=${page}&page_size=${page_size}`;

    console.log('filtros: ', filtros)

    console.log('nombre: ', filtros.nombre)
    if(filtros.nombre){
      url = url + `&busqueda=${filtros.nombre}`;
    }

    if(filtros.estado !== 'all'){
      url = url + `&estado_actual=${filtros.estado}`;
    }

    if(filtros.fecha_desde && filtros.fecha_hasta){
      url = url + `&fecha_registro_desde=${filtros.fecha_desde}`;
      url = url + `&fecha_registro_hasta=${filtros.fecha_hasta}`;
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
export async function nuevoDataFetch(data: any) {
    await axiosInstance.post(`/arqueo-caja/cajas`, data); 
}

export async function guardarDataEditado(data: any) {
  await axiosInstance.put(`/arqueo-caja/cajas/${data.id}/`, data);    
}

export async function activarDesactivarData({ dataId, activo }: { dataId: number; activo: boolean }) {
  await axiosInstance.patch(`/arqueo-caja/cajas/${dataId}/`, {activo,});    
}

export async function fetchResumen() {
  const resp = await axiosInstance.get(`/arqueo-caja/cajas/resumen/`);
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

export async function fetchDataPuestosTodos() {
  const resp = await axiosInstance.get(`/puestos/todos/`);
  return resp?.data
}


export async function fetchDataRoles() {
  const resp = await axiosInstance.get(`/roles/todos/`);
  return resp?.data
}

export async function resetearContrasenia(new_password: string) {
  const resp = await axiosInstance.post(`/usuarios/resetear/`, {new_password});
  return resp?.data
}


export async function registrarCotizaccicon(payload: any) {
  const resp = await axiosInstance.post(`/moneda/cotizaciones/`, {...payload});
  return resp?.data
}

