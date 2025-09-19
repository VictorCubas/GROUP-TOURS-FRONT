import type { Servicio } from "./paquetes";

export interface Habitacion {
  id: number;
  hotel: number;
  numero: string;
  tipo: string;
  capacidad: number;
  precio_noche: number;           // número con decimales
  moneda: number;
  moneda_nombre: string;
  servicios: number[];            // array de IDs de servicios
  activo: boolean;
  fecha_creacion: string;         // ISO datetime en string
  fecha_modificacion: string;     // ISO datetime en string
}

export interface Hotel {
  id: number;
  numero?: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  estrellas: number;
  direccion: string | null;
  ciudad: number;
  ciudad_nombre: string;
  pais_nombre: string;
  cadena: number;
  cadena_nombre: string;
  servicios_detalle: Servicio[];
  servicios: number[];            // array de IDs de servicios
  habitaciones: Habitacion[];     // lista de habitaciones
  fecha_creacion: string;         // ISO datetime en string
  fecha_modificacion: string;     // ISO datetime en string
}


// export interface Destino {
//   id: number;
//   numero?: number;
//   nombre: string;
//   descripcion: string;
//   ciudad: Ciudad;
//   hoteles: Hotel[];
//   activo: boolean;
//   en_uso: boolean;
//   fecha_creacion: string; // formato ISO con zona horaria
//   fecha_modificacion: string;
// }



export interface PermisoAsociado{
    id: number,
    nombre: string
}

export interface HotelPaginatedResponse {
  totalItems: number;
  pageSize: number;
  totalPages: number;
  next: string | null;
  previous: string | null;
  results: Hotel[];
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
