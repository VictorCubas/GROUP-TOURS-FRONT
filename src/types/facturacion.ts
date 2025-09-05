export interface Timbrado {
  id: number,
  numero: string,
  inicio_vigencia: string,
  fin_vigencia?: string,
  empresa: number
}


export interface Establecimiento {
  id: number,
  codigo: string,
  direccion?: string,
  empresa: number,
  nombre: string
}

export interface EstablecimientByPuntosExpedicion{
  id: number,
  nombre: string
}

export interface PuntoExpedicion {
  id: number,
  codigo: string,
  direccion?: string,
  establecimiento: EstablecimientByPuntosExpedicion
}

export interface SubtipoImpuesto {
  id: number;
  nombre: string;
  porcentaje: number;
  tipo_impuesto: number;
}

export interface TipoImpuesto {
  id: number;
  nombre: string;
  descripcion: string;
  subtipos: SubtipoImpuesto[];
}

export interface Nacionalidad {
  id: number;
  nombre: string;
  codigo_alpha2: string;
}

export interface Puesto {
  id: number;
  nombre: string;
}


export interface RespuestaPaginada {
  totalItems: number;
  next: string | null;
  previous: string | null;
  totalPages: number;
  pageSize: number;
}