import axiosInstance from "@/service/axiosInterceptor";
import type { NuevoAEditarPermisoFormData, NuevoPermisoFormData } from "@/types/permisos";


export const fetchData = async (page: number, page_size: number = 5, selectedType: 'C' | 'R' | 'U' | 'D' | 'E' | 'all', 
    nombrePaquete: string = '', activo: boolean) => {
    let url = `/permisos/?page=${page}&page_size=${page_size}`;
 
    if(selectedType !== 'all'){
      url = url + `&tipo=${selectedType}`;
    }


    console.log('nombrePaquete: ', nombrePaquete)
    if(nombrePaquete){
      url = url + `&nombre=${nombrePaquete}`;
    }

    url = url + `&activo=${activo}`;

    try {
      const resp = await axiosInstance.get(url);
      console.log('permisos list: ', resp?.data);
      if(resp?.data?.results){
        // setPermisos(resp?.data?.results ?? []);

        return resp?.data ?? null;
      }
    } catch (error) {
      console.log(error);
    }
  }


//tanstackquery ya maneja el error y en el interceptor tambien
export async function nuevoPermisoFetch(permiso: NuevoPermisoFormData) {
    await axiosInstance.post(`/permisos/`, permiso);    
}

export async function guardarPermisoEditado(permiso: NuevoAEditarPermisoFormData) {
  console.log('permiso antes de guardar: ', permiso);
  console.log('permiso antes de guardar: ', permiso.id);
  await axiosInstance.put(`/permisos/${permiso.id}/`, permiso);    
}
