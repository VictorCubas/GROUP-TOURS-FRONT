/* eslint-disable @typescript-eslint/no-explicit-any */

export type PriceMode = "hotel" | "room";

export interface SalidaMoneda {
  id: number;
  nombre: string;
  simbolo: string;
  codigo: string;
}

export interface SalidaDestino {
  id: number;
  ciudad: string;
  pais: string;
}

export interface SalidaListado {
  id: number;
  numero?: number;
  codigo: string;
  paquete_id: number;
  paquete_nombre: string;
  paquete_propio: boolean;
  destino: SalidaDestino;
  moneda: SalidaMoneda;
  fecha_salida: string;
  fecha_regreso: string | null;
  precio_actual: string;
  precio_final: string;
  precio_venta_sugerido_min: string;
  precio_venta_sugerido_max: string;
  senia: string;
  cupo_disponible: number;
  cupo_total: number;
  total_reservas: number;
  activo: boolean;
  dias_hasta_salida: number;
}

export interface SalidaResumen {
  texto: string;
  valor: string;
}

export interface RespuestaPaginadaSalida {
  totalItems: number;
  next: string | null;
  previous: string | null;
  totalPages: number;
  pageSize: number;
}


export interface PasajeroSalida {
  id: number;
  reserva_codigo: string;
  reserva_estado: string;
  reserva_estado_display: string;
  es_titular: boolean;
  por_asignar: boolean;

  nombre: string;
  apellido: string;

  documento: string;
  tipo_documento: string;

  fecha_nacimiento: string; // ISO date: YYYY-MM-DD
  edad: number;

  precio_asignado: number;
  monto_pagado: number;
  saldo_pendiente: number;

  tiene_sena_pagada: boolean;
  esta_totalmente_pagado: boolean;

  ticket_numero: string | null;
  voucher_codigo: string;
}