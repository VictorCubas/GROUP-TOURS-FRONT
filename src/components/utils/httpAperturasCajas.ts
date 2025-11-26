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
      console.log(page_size, page);
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
    const response = await axiosInstance.post(`/arqueo-caja/aperturas/`, data);

    // Obtener el ID de la apertura creada
    const aperturaId = response.data?.id;

    if (aperturaId) {
        // Descargar automáticamente el PDF de la apertura
        await descargarPDFApertura(aperturaId);
    }

    return response.data;
}

// Servicio auxiliar para descargar el PDF de apertura de caja
async function descargarPDFApertura(aperturaId: number | string) {
    try {
        const response = await axiosInstance.get(
            `/arqueo-caja/aperturas/${aperturaId}/pdf/`,
            { responseType: 'blob' }
        );

        // Intentar obtener el nombre del archivo desde el header Content-Disposition
        const contentDisposition = response.headers['content-disposition'];
        let fileName = `apertura-caja-${aperturaId}.pdf`;

        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match && match[1]) {
                fileName = decodeURIComponent(match[1]);
            }
        }

        // Crear el blob y la URL para descargar
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();

        // Limpieza
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('⚠️ Error al descargar el PDF de la apertura:', error);
        // No lanzamos el error para que no afecte el flujo principal
        // La apertura ya fue creada exitosamente
    }
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
  const response = await axiosInstance.post(`/arqueo-caja/cierres/cerrar-simple/`, payload);

  // Obtener el ID del cierre creado
  const cierreId = response.data?.id;

  if (cierreId) {
    // Descargar automáticamente el PDF del cierre
    await descargarPDFCierre(cierreId);
  }

  return response?.data;
}

// Servicio auxiliar para descargar el PDF de cierre de caja
async function descargarPDFCierre(cierreId: number | string) {
  try {
    const response = await axiosInstance.get(
      `/arqueo-caja/cierres/${cierreId}/pdf/`,
      { responseType: 'blob' }
    );

    // Intentar obtener el nombre del archivo desde el header Content-Disposition
    const contentDisposition = response.headers['content-disposition'];
    let fileName = `cierre-caja-${cierreId}.pdf`;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        fileName = decodeURIComponent(match[1]);
      }
    }

    // Crear el blob y la URL para descargar
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    // Limpieza
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('⚠️ Error al descargar el PDF del cierre:', error);
    // No lanzamos el error para que no afecte el flujo principal
    // El cierre ya fue creado exitosamente
  }
}

// Función pública para re-descargar el PDF de una apertura existente
export async function descargarPDFAperturaById(aperturaId: number | string) {
  return await descargarPDFApertura(aperturaId);
}

// Función pública para re-descargar el PDF de un cierre existente
export async function descargarPDFCierreById(cierreId: number | string) {
  return await descargarPDFCierre(cierreId);
}

/**
 * Obtiene la apertura de caja activa del usuario actual
 * @returns Datos de la apertura activa o null si no tiene caja abierta
 */
export async function fetchAperturaActiva() {
  try {
    const resp = await axiosInstance.get(`/arqueo-caja/aperturas/tengo-caja-abierta/`);
    return resp?.data ?? null;
  } catch (error) {
    console.log('Error al obtener apertura activa:', error);
    return null;
  }
}

