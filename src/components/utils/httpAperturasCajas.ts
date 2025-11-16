/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/service/axiosInterceptor";
// import type { NuevoModuloFormData } from "@/types/empleados";
// import type { NuevoAEditarPermisoFormData } from "@/types/permisos";


export const fetchData = async (page: number, page_size: number = 5, 
    filtros: any) => {

    console.log(page_size);
    let url = `/arqueo-caja/aperturas/?page=${page}&page_size=${page_size}`;

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



  export const fetchCajasDisponibles = async (page: 1, page_size: number = 10, 
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


//usuarios/responsables/?roles=cajero,admin
export const fetchDataResponsable = async (page: number, page_size: number = 5, 
    filtros: any) => {
    // let url = `/personas/?page=${page}&page_size=${page_size}`;
    let url = `usuarios/responsables/`;

    console.log('filtros: ', filtros)

    console.log('busqueda: ', filtros.busqueda) 
    if(filtros.busqueda){
      url = url + `?&busqueda=${filtros.busqueda}`;
    }

    // if(filtros.razon_social){
    //   url = url + `&razon_social=${filtros.razon_social}`;
    // }

    // if(filtros.tipo !== 'all'){
    //   url = url + `&tipo=${filtros.tipo}`;
    // }

    // if(filtros.sexo !== 'all'){
    //   url = url + `&sexo=${filtros.sexo}`;
    // }

    // if(filtros.documento){
    //   url = url + `&documento=${filtros.documento}`;
    // }

    // if(filtros.telefono){
    //   url = url + `&telefono=${filtros.telefono}`;
    // }

    // if(filtros.fecha_desde && filtros.fecha_hasta){
    //   url = url + `&fecha_desde=${filtros.fecha_desde}`;
    //   url = url + `&fecha_hasta=${filtros.fecha_hasta}`;
    // }

    // url = url + `&activo=${filtros.activo}`;

    try {
      const resp = await axiosInstance.get(url);
      console.log('personas list: ', resp?.data);
      if(resp?.data){
        // setPermisos(resp?.data?.results ?? []);

        return resp?.data ?? null;
      }
    } catch (error) {
      console.log(error);
    }
}


//tanstackquery ya maneja el error y en el interceptor tambien
export async function nuevoDataFetch(data: any) {
    await axiosInstance.post(`/arqueo-caja/aperturas/`, data); 
}

export async function guardarDataEditado(data: any) {
  await axiosInstance.put(`/arqueo-caja/aperturas/${data.id}/`, data);    
}

export async function activarDesactivarData({ dataId, activo }: { dataId: number; activo: boolean }) {
  await axiosInstance.patch(`/arqueo-caja/aperturas//${dataId}/`, {activo,});    
}

export async function fetchResumen() {
  const resp = await axiosInstance.get(`/arqueo-caja/aperturas/resumen-general/`);
  return resp?.data
}

export async function fetchContizacion() {
  const resp = await axiosInstance.get(`/moneda/cotizaciones/vigente/?moneda_codigo=USD`);
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

// SERVICIOS PARA CIERRE DE CAJA
export async function fetchResumenApertura(aperturaId: number) {
  const resp = await axiosInstance.get(`/arqueo-caja/aperturas/${aperturaId}/resumen/`);
  return resp?.data
}

export async function cerrarCajaSimple(payload: any) {
  const resp = await axiosInstance.post(`/arqueo-caja/cierres/cerrar-simple/`, payload);
  return resp?.data
}

