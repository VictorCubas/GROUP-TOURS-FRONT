/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/service/axiosInterceptor";
// import type { NuevoModuloFormData } from "@/types/empleados";
// import type { NuevoAEditarPermisoFormData } from "@/types/permisos";


export const fetchData = async (page: number, page_size: number = 5, 
    filtros: any) => {
    let url = `/paquete/?page=${page}&page_size=${page_size}`;

    console.log('filtros: ', filtros)

    console.log('nombre: ', filtros.nombre)
    if(filtros.nombre){
      url = url + `&busqueda=${filtros.nombre}`;
    }

    if(filtros.telefono){
      url = url + `&telefono=${filtros.telefono}`;
    }

    if(filtros.tipo_paquete !== 'all'){
      url = url + `&tipo_paquete=${filtros.tipo_paquete}`;
    }

    if(filtros.tipo_propiedad !== 'all'){
      url = url + `&propio=${filtros.tipo_propiedad === 'Propio'}`;
    }

    // if(filtros.sexo !== 'all'){
    //   url = url + `&sexo=${filtros.sexo}`;
    // }

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

        return resp?.data ?? null;
      }
    } catch (error) {
      console.log(error);
    }
  }


//tanstackquery ya maneja el error y en el interceptor tambien
export async function nuevoDataFetch(data: any) {
    await axiosInstance.post(`/paquete/`, data);    
}

export async function guardarDataEditado({ data, paqueteId }: { data: any; paqueteId: number | string }) {
  await axiosInstance.put(`/paquete/${paqueteId}/`, data);    
}

export async function activarDesactivarData({ dataId, activo }: { dataId: number; activo: boolean }) {
  await axiosInstance.patch(`/paquete/${dataId}/`, {activo,});    
}

export async function fetchResumen() {
  const resp = await axiosInstance.get(`/paquete/resumen/`);
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

export async function fetchDataTiposPaquetesTodos() {
  const resp = await axiosInstance.get(`/tipo_paquete/todos/`);
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