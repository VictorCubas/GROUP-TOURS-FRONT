/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/service/axiosInterceptor";


export const fetchData = async (page: number, page_size: number = 5, 
    nombre: string = '', activo: boolean) => {
    let url = `/nacionalidades/?page=${page}&page_size=${page_size}`;


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
export async function nuevoDataFetch(data: any) {
    await axiosInstance.post(`/facturacion/guardar-config/`, data);    
}

export async function guardarDataEditado(data: any) {
  await axiosInstance.put(`/nacionalidades/${data.id}/`, data);    
}

export async function activarDesactivarData({ dataId, activo }: { dataId: number; activo: boolean }) {
  await axiosInstance.patch(`/nacionalidades/${dataId}/`, {activo});    
}

export async function fetchResumen() {
  const resp = await axiosInstance.get(`/nacionalidades/resumen/`);
  return resp?.data
}

export async function fetchDataEstablecimientosTodo() {
  const resp = await axiosInstance.get(`facturacion/establecimientos/todos/`);
  return resp?.data
}

export async function fetchDataPuntoExpedicionTodo() {
  const resp = await axiosInstance.get(`facturacion/puntos-expedicion/todos/`);
  return resp?.data
}

export async function fetchEstablecimientoTodo() {
  const resp = await axiosInstance.get(`facturacion/establecimientos/todos/`);
  return resp?.data
}

export async function fetchDataTimbradosTodo() {
  const resp = await axiosInstance.get(`facturacion/timbrados/todos/`);
  return resp?.data
}

export async function fetchDataTiposImpuestosTodo() {
  const resp = await axiosInstance.get(`facturacion/tipos-impuesto/todos/`);
  return resp?.data
}

export async function fetchDataEmpresaTodo() {
  const resp = await axiosInstance.get(`facturacion/empresa/`);
  return resp?.data
}

export async function fetchDataConfigFactura() {
  const resp = await axiosInstance.get(`facturacion/obtener-config/`);
  return resp?.data
}
