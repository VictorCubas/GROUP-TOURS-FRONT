/* eslint-disable @typescript-eslint/no-explicit-any */
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
  nombre: string,
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


export interface DatosFacturaPreview {
  informacionEmpresa?: any;
  impuestoConfig?: any;
}


export interface RespuestaPaginada {
  totalItems: number;
  next: string | null;
  previous: string | null;
  totalPages: number;
  pageSize: number;
}

export interface FacturaListado {
  id: number;
  numero_factura: string;
  fecha_emision: string;
  cliente_nombre: string;
  total_general: string;
  activo: boolean;
  fecha_anulacion: string | null;
  motivo_anulacion: string | null;
  tipo_facturacion: string;
  condicion_venta: string;
  numero?: number; // Para la numeración en la tabla
}

export interface FacturaResumen {
  total_facturas: number;
  facturas_activas: number;
  facturas_anuladas: number;
  monto_total_facturado: string;
}