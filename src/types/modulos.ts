export interface Modulo {
  id: number;
  numero: number;
  nombre: string;
  descripcion: string;
  fecha_creacion: string;
  fecha_modificacion: string;
  activo: boolean;
  // en_uso: boolean;
}


export interface RespuestaPaginada {
  totalItems: number;
  next: string | null;
  previous: string | null;
  totalPages: number;
  pageSize: number;
}


export interface PermisoType{
  tipo: 'C' | 'R' | 'U' | 'D' | 'E';
}


export interface NuevoModuloFormData{ 
  nombre: string;
  descripcion: string;
  activo: boolean;
  en_uso: boolean; 
}

export interface aEditarDataForm{ 
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  fecha_creacion: string;      // O Date si luego lo conviertes
  fecha_modificacion: string;
}


export interface PermisoResumen {
  total_permisos: number;
  total_activos: number;
  total_inactivos: number;
  total_en_uso: number;
}
