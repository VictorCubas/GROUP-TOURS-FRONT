export interface Rol {
  id: number;
  numero: number;
  nombre: string;
  descripcion: string;
  permisos: PermisoAsociado[];
  fecha_creacion: string;
  fecha_modificacion: string;
  activo: boolean;
  en_uso: boolean;
}

export interface PermisoAsociado{
    id: number,
    nombre: string
}

export interface RolPaginatedResponse {
  totalItems: number;
  pageSize: number;
  totalPages: number;
  next: string | null;
  previous: string | null;
  results: Rol[];
}


// export interface aEditarDataForm{ 
//   id: number;
//   nombre: string;
//   descripcion: string;
//   activo: boolean;
//   fecha_creacion: string;      // O Date si luego lo conviertes
//   fecha_modificacion: string;
// }


export interface NuevoRolFormData{ 
  nombre: string;
  descripcion: string;
  modulo: string;
  activo: boolean;
  en_uso: boolean; 
}

export interface NuevoAEditarPermisoFormData{ 
  id: number;
  nombre: string;
  descripcion: string;
  modulo: string;
  activo: boolean;
  en_uso: boolean; 
  fechaCreacion: string;
}


export interface RolResumen {
  total_permisos: number;
  total_activos: number;
  total_inactivos: number;
  total_en_uso: number;
}
