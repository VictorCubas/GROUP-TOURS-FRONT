// export interface Hotel {
//   id: number;
//   nombre: string;
//   descripcion: string;
//   activo: boolean;
//   precio_habitacion: number;
//   moneda: number;
//   moneda_nombre: string;
//   moneda_codigo: string;
//   fecha_creacion: string; // formato ISO con zona horaria
//   fecha_modificacion: string;
// }

import type { Hotel } from "./hotel";

export interface Ciudad{
  id: number,
  nombre: string,
  pais_nombre: string;
  pais_id: number;
}

export interface Destino {
  id: number;
  numero?: number;
  nombre: string;
  descripcion: string;
  ciudad: Ciudad;
  hoteles: Hotel[];
  activo: boolean;
  en_uso: boolean;
  zona_geografica?: string;
  fecha_creacion: string; // formato ISO con zona horaria
  fecha_modificacion: string;
}



export interface PermisoAsociado{
    id: number,
    nombre: string
}

export interface DestinoPaginatedResponse {
  totalItems: number;
  pageSize: number;
  totalPages: number;
  next: string | null;
  previous: string | null;
  results: Destino[];
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
  permisos_id: number[];
  activo: boolean;
  en_uso: boolean; 
}

export interface NuevoAEditarRolFormData{ 
  id: number;
  nombre: string;
  descripcion: string;
  permisos_id: number[];
  activo: boolean;
  en_uso: boolean; 
}


export interface RolResumen {
  total_permisos: number;
  total_activos: number;
  total_inactivos: number;
  total_en_uso: number;
}
