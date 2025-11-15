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


export interface Caja {
  numero?: number;
  id: number;
  nombre: string;                 // Nombre de la caja (ej. "Caja Principal")
  numero_caja: number;            // Número identificador de la caja
  punto_expedicion: number;       // Código del punto de expedición
  punto_expedicion_nombre: string; // Descripción completa del punto (ej. "001-001 - Casa Matriz")
  establecimiento_nombre: string;
  establecimiento_codigo: string;
  punto_expedicion_codigo: string;
  descripcion: string; // Descripción completa del punto (ej. "001-001 - Casa Matriz")\
  emite_facturas: boolean;        // Indica si la caja puede emitir facturas
  ubicacion: string;              // Ubicación física (ej. "Piso 1 - Ventas")
  estado_actual: 'abierta' | 'cerrada' | 'bloqueada' | string; // Estado actual de la caja
  saldo_actual: string;           // Saldo expresado como string (ej. "2500000.00")
  activo: boolean;                // Indica si la caja está activa
  saldo_actual_alternativo: number | string,
  moneda_alternativa: string;
}
// Lista de empleados
export type Cajas = Caja[];



export interface RespuestaPaginada {
  totalItems: number;
  next: string | null;
  previous: string | null;
  totalPages: number;
  pageSize: number;
}

// Tipos para Apertura de Cajas
export interface AperturaListado {
  numero?: number;
  id: number;
  codigo_apertura: string;
  caja: number;
  caja_nombre: string;
  caja_numero: number;
  responsable: number;
  responsable_nombre: string;
  responsable_puesto: string;
  fecha_hora_apertura: string;  // ISO 8601
  monto_inicial: string;  // Decimal como string
  monto_inicial_alternativo: string | null;  // Decimal como string
  esta_abierta: boolean;
  activo: boolean;
  movimientos_count: number;
  observaciones_apertura: string;
}