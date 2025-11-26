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


interface Rol {
  id: number;
  nombre: string;
}

export interface Usuario {
  numero?: number;
  id: number;
  username: string;
  empleado_id: number;
  empleado_nombre: string;
  empleado_puesto: string;
  empleado_email: string;
  empleado_telefono: string;
  roles: Rol[];
  activo: boolean;
  last_login: string; // ISO date string
  fecha_creacion: string; // ISO date string
  fecha_modificacion: string; // ISO date string
}

// Lista de empleados
export type Usuarios = Usuario[];



export interface RespuestaPaginada {
  totalItems: number;
  next: string | null;
  previous: string | null;
  totalPages: number;
  pageSize: number;
}