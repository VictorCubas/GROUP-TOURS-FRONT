/* eslint-disable @typescript-eslint/no-explicit-any */

export type PriceMode = "hotel" | "room"
export interface TipoPaquete{
  id: number;
  nombre: string;
}

export interface TipoPaquete{
  id: number;
  nombre: string;
}

export interface Servicio{
  id: number;
  nombre_servicio: string;
}

export interface Destino{
  id: number;
  ciudad: string;
  // pais: Pais
  pais: string
}
export interface ZonaGeografica{
  id: number;
  nombre: string;
  // pais: Pais
  descripcion: string
}

export interface Pais{
  id: number;
  nombre: string;
}

export interface Distribuidora{
  id: number;
  nombre: string;
}

export interface Moneda{
  id: number;
  nombre: string;
  simbolo: string;
  codigo: string;
}


export interface PrecioCatalogo{
  id: number;
  nombre: string;
}

export interface SalidaPaquete {
  id: number;
  fecha_salida: string;      // ISO date en formato 'YYYY-MM-DD'
  fecha_regreso: string;      // ISO date en formato 'YYYY-MM-DD'
  moneda: Moneda;            // Objeto con id y nombre
  temporada: string | null;  // Puede ser null
  precio_actual: number;     // Precio numérico
  precio_final?: number;     // Precio numérico
  senia: number;     // Precio numérico
  cupo: number;              // Cupo numérico
  activo: boolean;           // Estado booleano
  hoteles: number[];
  habitacion_fija?: any;
  ganancia?: any;
  comision?: any;
  cupos_habitaciones?: any[];
  precios_catalogo?: any[];
  precios_catalogo_hoteles?: any[];
}

export interface Paquete {
  id: number;
  numero?: number
  nombre: string;
  tipo_paquete: TipoPaquete;
  destino: Destino;
  zona_geografica?: ZonaGeografica;
  distribuidora?: Distribuidora;
  precio_venta_desde: number;
  senia: number;
  moneda: Moneda;
  modalidad: 'flexible' | 'fijo';
  fecha_inicio: string | null; // formato YYYY-MM-DD
  fecha_fin: string | null; // formato YYYY-MM-DD
  personalizado: boolean;
  cantidad_pasajeros: number | null;
  servicios: Servicio[] ;
  propio: boolean;
  salidas: SalidaPaquete[]
  activo: boolean;
  hoteles_ids: number[];
  imagen: string | null;
  imagen_url: string | null;
  fecha_creacion: string; // ISO datetime
  fecha_modificacion: string; // ISO datetime
}

export interface PaqueteResponse {
  totalItems: number;
  pageSize: number;
  totalPages: number;
  next: string | null;
  previous: string | null;
  results: Paquete[];
}



export interface TipoDocumento {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface Nacionalidad {
  id: number;
  nombre: string;
  codigo_alpha2: string;
}

export interface PersonaFisica {
  id: number;
  tipo: "fisica" | "juridica"
  nombre: string;
  apellido: string;
  fecha_nacimiento: string; // formato YYYY-MM-DD
  edad: number;
  sexo: "M" | "F"; // Ej: "M" o "F"
  nacionalidad: Nacionalidad;
  documento: string;
  email: string;
  telefono: string;
  direccion: string;
  activo: boolean;
  fecha_creacion: string; // ISO datetime
  fecha_modificacion: string; // ISO datetime
  tipo_documento: TipoDocumento;
}

export interface PersonaJuridica {
  id: number;
  tipo: "juridica";
  razon_social: string;
  representante: string | null;
  tipo_documento: TipoDocumento;
  documento: string;
  email: string;
  telefono: string;
  direccion: string;
  activo: boolean;
  fecha_creacion: string; // ISO datetime
  fecha_modificacion: string; // ISO datetime
}

export type Persona = PersonaFisica | PersonaJuridica;

export interface Puesto {
  id: number;
  nombre: string;
}

export interface TipoRemuneracion {
  id: number;
  nombre: 'Comisión' |'Mixto' | 'Salario fijo' | 'Comision';
  descripcion: string;
}

export interface Empleado {
  id: number;
  numero?: number;
  persona: Persona;
  puesto: Puesto;
  tipo_remuneracion: TipoRemuneracion;
  salario: number;
  porcentaje_comision: number;
  activo: boolean;
  fecha_ingreso: string; // formato YYYY-MM-DD
  fecha_creacion: string; // ISO datetime
  fecha_modificacion: string; // ISO datetime
}

// Lista de empleados
export type Empleados = Empleado[];



export interface RespuestaPaginada {
  totalItems: number;
  next: string | null;
  previous: string | null;
  totalPages: number;
  pageSize: number;
}