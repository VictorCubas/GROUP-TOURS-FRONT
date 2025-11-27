/* eslint-disable @typescript-eslint/no-explicit-any */
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
  pais: string
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

interface Habitacion {
  capacidad: number;
  hotel_nombre: string;
  id: number;
  numero: number | string;
  precio_noche: number;
  tipo: "single" | "doble" | "triple" | "suite" | "premium"    // ISO datetime en string
}

export interface Paquete {
  id: number;
  nombre: string;
  tipo_paquete: TipoPaquete;
  destino: Destino;
  distribuidora?: Distribuidora;
  precio: number;
  precio_unitario: number;
  sena: number;
  moneda: Moneda;
  fecha_inicio: string | null; // formato YYYY-MM-DD
  fecha_fin: string | null; // formato YYYY-MM-DD
  personalizado: boolean;
  cantidad_pasajeros: number | null;
  servicios: Servicio[] ;
  propio: boolean;
  activo: boolean;
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

export interface Persona {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  email: string;
  telefono: string;
  tipo_documento_nombre?: string;
  nacionalidad_nombre?: string;
  genero_display?: string;
  fecha_nacimiento?: string; // formato YYYY-MM-DD
}

// export interface PersonaJuridica {
//   id: number;
//   tipo: "juridica";
//   razon_social: string;
//   representante: string | null;
//   tipo_documento: TipoDocumento;
//   documento: string;
//   email: string;
//   telefono: string;
//   direccion: string;
//   activo: boolean;
//   fecha_creacion: string; // ISO datetime
//   fecha_modificacion: string; // ISO datetime
// }

// export type Persona = PersonaFisica | PersonaJuridica;

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


export interface Pasajero {
  id: number;
  persona: Persona;
  es_titular: boolean;
  ticket_numero?: string | null;
  voucher_codigo?: string | null;
  fecha_registro: string; // ISO datetime string
  nota_credito_individual_ya_generada?: boolean; // Indica si tiene NC activa (modalidad individual)
  nota_credito_individual_id?: number; // ID de la nota de crédito individual activa
}

export interface Reserva {
  id: number;
  numero?: number;
  codigo: string;
  titular: Persona;
  paquete: Paquete;
  fecha_reserva: string; // ISO datetime string
  habitacion: Habitacion;
  precio_unitario: number;
  cantidad_pasajeros: number;
  monto_pagado: number;
  estado: "pendiente" | "confirmada" |  "finalizada" | "cancelada";
  estado_display: string;
  modalidad_facturacion: "global" | 'individual';
  pasajeros: Pasajero[];
  paquete_codigo: string;
  activo: boolean;
  condicion_pago: string;
  condicion_pago_display: string;
  fecha_modificacion: string; // ISO datetime
  moneda: Moneda;

  monto_total: number;
  saldo_pendiente: number;
  porcentaje_pagado: number;
  nota_credito_global_ya_generada?: boolean; // Indica si la factura global tiene NC activa (modalidad global)
  nota_credito_global_id?: number; // ID de la nota de crédito global activa
  dias_hasta_salida?: number; // Días restantes hasta la fecha de salida del paquete
}

export interface ReservaListado {
  id: number;
  numero?: number;
  codigo: string;
  titular: Persona;
  paquete: Paquete;
  fecha_reserva: string; // ISO datetime string
  habitacion: Habitacion;
  precio_unitario: number;
  cantidad_pasajeros: number;
  costo_total_estimado: number;
  monto_pagado: number;
  estado: "pendiente" | "confirmada" |  "finalizada" | "cancelada";
  estado_display: string;
  pasajeros: Pasajero[];
  activo: boolean;
  fecha_modificacion: string; // ISO datetime
  moneda: Moneda;
  monto_total: number;
  saldo_pendiente: number;
  porcentaje_pagado: number;

  paquete_ciudad: string;
  paquete_nombre: string;
  paquete_pais: string;
  paquete_imagen: string | null;
  titular_documento: string;
  titular_nombre: string;
}


export const RESERVATION_STATES = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  confirmada: { label: 'Confirmada', color: 'bg-green-100 text-green-800', icon: '✅' },
  incompleta: { label: 'Incompleta', color: 'bg-orange-100 text-orange-800', icon: '⚠️' },
  finalizada: { label: 'Finalizada', color: 'bg-blue-100 text-blue-800', icon: '🎯' },
  cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: '❌' }
} as const;



export const PAYMENT_STATUS = {
  sin_pagar: { label: 'Sin Pagar', color: 'bg-red-100 text-red-800' },
  pago_parcial: { label: 'Pago Parcial', color: 'bg-yellow-100 text-yellow-800' },
  pago_completo: { label: 'Pago Completo', color: 'bg-green-100 text-green-800' },
  sobrepago: { label: 'Sobrepago', color: 'bg-blue-100 text-blue-800' }
} as const;

// Función helper para calcular estado de pago
export const getPaymentStatus = (reserva: any): keyof typeof PAYMENT_STATUS => {
  // Validar que reserva exista y tenga los campos necesarios
  if (!reserva || reserva.monto_pagado === undefined || reserva.costo_total_estimado === undefined) {
    return 'sin_pagar';
  }

  const monto_pagado = reserva.monto_pagado;
  const costo_total_estimado = reserva.costo_total_estimado;

  if (monto_pagado === 0) return 'sin_pagar';
  if (monto_pagado < costo_total_estimado) return 'pago_parcial';
  if (monto_pagado === costo_total_estimado) return 'pago_completo';
  return 'pago_parcial';
};

// Función helper para calcular porcentaje de pago
export const getPaymentPercentage = (reserva: any): number => {
  // Validar que reserva exista y tenga los campos necesarios
  if (!reserva || !reserva.costo_total_estimado) return 0;
  if (reserva.costo_total_estimado === 0) return 0;
  return Math.min((reserva.monto_pagado / reserva.costo_total_estimado) * 100, 100);
};


export const DOCUMENT_TYPES: Record<string, string> = {
  'RUC': 'RUC',
  'PASAPORTE': 'Pasaporte',
  'DNI': 'DNI',
  'CI': 'Cédula de Identidad',
  // Mantenemos compatibilidad con valores en minúsculas si existen
  'ruc': 'RUC',
  'pasaporte': 'Pasaporte',
  'dni': 'DNI',
  'ci': 'Cédula de Identidad',
  'cedula': 'Cédula de Identidad',
  'tarjeta_identidad': 'Tarjeta de Identidad'
} as const;

// Constantes para cancelación de reservas
export const MOTIVOS_CANCELACION = [
  { id: '1', label: 'Cancelación voluntaria del cliente' },
  { id: '2', label: 'Cambio de planes del cliente' },
  { id: '3', label: 'Problemas de salud' },
  { id: '4', label: 'Problemas con documentación' },
  { id: '5', label: 'Cancelación automática por falta de pago' },
  { id: '6', label: 'Fuerza mayor / Caso fortuito' },
  { id: '7', label: 'Error en la reserva' },
  { id: '8', label: 'Otro motivo' }
] as const;

export const METODOS_DEVOLUCION = [
  { id: 'efectivo', label: 'Efectivo' },
  { id: 'transferencia', label: 'Transferencia' },
  { id: 'tarjeta_debito', label: 'Tarjeta de Débito' },
  { id: 'tarjeta_credito', label: 'Tarjeta de Crédito' },
  { id: 'cheque', label: 'Cheque' }
] as const;

// Interfaz para información de cancelación
export interface InfoCancelacion {
  puede_cancelar: boolean;
  tipo_cancelacion: 'total' | 'parcial';
  modalidad_facturacion: 'global' | 'individual';
  pasajeros_afectados: number;
  facturas_activas: number;
  dias_hasta_salida: number;
  aplica_reembolso: boolean;
  monto_reembolsable: number;
  politica: string;
  advertencia: string | null;
}

// Interfaz para el payload de cancelación
export interface CancelarReservaPayload {
  motivo_cancelacion_id: string;
  motivo_observaciones: string;
  metodo_devolucion?: string;
  observaciones?: string;
  referencia?: string;
}

// Interfaz para la respuesta de cancelación
export interface CancelarReservaResponse {
  message: string;
  reserva_id: number;
  estado: string;
  comprobante_devolucion?: {
    id: number;
    numero: string;
    monto: number;
    metodo_pago: string;
    fecha_creacion: string;
  };
  detalles: {
    pasajeros_cancelados: number;
    cupos_liberados: boolean;
    monto_devuelto: number;
    facturas_afectadas: number;
  };
}