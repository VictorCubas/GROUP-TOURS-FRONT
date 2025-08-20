export interface TipoDocumento {
    id: number;
    nombre: string;
    descripcion: string;
}

export interface Persona {
    id: number;
    numero: number;
    tipo: 'fisica' | 'juridica';
    nombre?: string;
    apellido?: string;
    fecha_nacimiento?: string; // Podés usar Date si lo parseás
    edad?: number;
    sexo?: 'M' | 'F';
    nacionalidad?: Nacionalidad;
    documento: string;
    email: string;
    telefono: string;
    direccion?: string;
    activo: boolean;
    fecha_creacion: string; // Podés usar Date si lo parseás
    fecha_modificacion: string; // Podés usar Date si lo parseás
    tipo_documento: TipoDocumento;
    razon_social?: string;
    representante?: string;
}

interface Nacionalidad{
  id: number;
  nombre: string;
  codigo_alpha2: string;
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


export interface PersonaResumen {
  total_permisos: number;
  total_activos: number;
  total_inactivos: number;
  total_en_uso: number;
}
