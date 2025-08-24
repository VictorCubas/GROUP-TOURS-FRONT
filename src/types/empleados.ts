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