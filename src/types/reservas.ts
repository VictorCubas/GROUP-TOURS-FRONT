export interface TipoPaquete{
  id: number;
  nombre: string;
}

export interface Servicio{
  id: number;
  nombre: string;
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

export interface Paquete {
  id: number;
  nombre: string;
  tipo_paquete: TipoPaquete;
  destino: Destino;
  distribuidora?: Distribuidora;
  precio: number;
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
}

export interface Reserva {
  id: number;
  numero?: number;
  codigo: string;
  titular: Persona;
  paquete: Paquete;
  fecha_reserva: string; // ISO datetime string
  cantidad_pasajeros: number;
  monto_pagado: number;
  estado: "pendiente" | "confirmada" | "incompleta" | "finalizada" | "cancelada";
  pasajeros: Pasajero[];
  activo: boolean;
  fecha_modificacion: string; // ISO datetime

  monto_total: number;
  saldo_pendiente: number;
  porcentaje_pagado: number;
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
export const getPaymentStatus = (reserva: Reserva): keyof typeof PAYMENT_STATUS => {
  const { monto_pagado, monto_total } = reserva;
  
  if (monto_pagado === 0) return 'sin_pagar';
  if (monto_pagado < monto_total) return 'pago_parcial';
  if (monto_pagado === monto_total) return 'pago_completo';
  return 'pago_parcial';
};

// Función helper para calcular porcentaje de pago
export const getPaymentPercentage = (reserva: Reserva): number => {
  if (reserva.monto_total === 0) return 0;
  return Math.min((reserva.monto_pagado / reserva.monto_total) * 100, 100);
};