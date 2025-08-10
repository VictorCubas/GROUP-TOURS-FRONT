export interface Permiso {
  id: number;
  numero: number;
  nombre: string;
  descripcion: string;
  tipo: 'C' | 'R' | 'U' | 'D' | 'E';
  modulo: string;
  fechaCreacion: string;
  activo: boolean;
  en_uso: boolean;
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


export interface NuevoPermisoFormData{ 
  nombre: string;
  descripcion: string;
  tipo: 'C' | 'R' | 'U' | 'D' | 'E' | "";
  modulo: string;
  activo: boolean;
  en_uso: boolean; 
}

export interface NuevoAEditarPermisoFormData{ 
  id: number;
  nombre: string;
  descripcion: string;
  tipo: 'C' | 'R' | 'U' | 'D' | 'E' | "";
  modulo: string;
  activo: boolean;
  en_uso: boolean; 
  fechaCreacion: string;
}