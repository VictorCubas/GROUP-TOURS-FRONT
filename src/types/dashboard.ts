/* eslint-disable @typescript-eslint/no-explicit-any */

// ========== Tipos para Dashboard ==========

export interface DashboardResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  errors?: string[];
}

// ========== Resumen General ==========

export interface ResumenFinanciero {
  cajas_abiertas: number;
  cajas_cerradas: number;
  saldo_total_cajas: string;
  ingresos_periodo: string;
  egresos_periodo: string;
  balance_periodo: string;
  moneda: string;
}

export interface ResumenReservas {
  pendientes: number;
  confirmadas: number;
  finalizadas_mes: number;
  canceladas_mes: number;
  proximas_salidas_7d: number;
  ocupacion_porcentaje: number;
  cupos_totales: number;
  cupos_ocupados: number;
  cupos_disponibles: number;
}

export interface ComparacionMesAnterior {
  monto_mes_anterior: string;
  diferencia: string;
  porcentaje_crecimiento: number;
  tendencia: 'positiva' | 'negativa' | 'estable' | 'nueva';
}

export interface ResumenFacturacion {
  facturas_emitidas_hoy: number;
  facturas_emitidas_mes: number;
  monto_total_hoy: string;
  monto_total_mes: string;
  saldo_por_cobrar: string;
  comparacion_mes_anterior: ComparacionMesAnterior;
}

export interface ResumenGeneralData {
  financiero: ResumenFinanciero;
  reservas: ResumenReservas;
  facturacion: ResumenFacturacion;
}

export interface ResumenGeneralResponse {
  success: boolean;
  periodo: 'hoy' | 'semana' | 'mes';
  fecha_actualizacion: string;
  data: ResumenGeneralData;
}

// ========== Alertas ==========

export interface AlertaMetadata {
  [key: string]: any;
  caja_id?: number;
  caja_nombre?: string;
  horas_abierta?: number;
  reserva_id?: number;
  reserva_codigo?: string;
  dias_hasta_salida?: number;
  dias_vencido?: number;
  monto_pendiente?: string;
  cantidad?: number;
  reservas_ids?: number[];
  paquetes?: Array<{
    id: number;
    nombre: string;
    cupos_disponibles: number;
    dias_hasta_salida: number;
    fecha_salida: string;
  }>;
}

export interface Alerta {
  id: string;
  tipo: string;
  severidad: 'alta' | 'media' | 'baja';
  titulo: string;
  mensaje: string;
  accion_url: string | null;
  accion_texto: string | null;
  fecha_creacion: string;
  metadata: AlertaMetadata;
}

export interface AlertasData {
  criticas: Alerta[];
  advertencias: Alerta[];
  informativas: Alerta[];
}

export interface AlertasResponse {
  success: boolean;
  total_alertas: number;
  fecha_actualizacion: string;
  data: AlertasData;
}

// ========== Métricas de Ventas ==========

export interface VentaDiaria {
  fecha: string;
  cantidad_reservas: number;
  monto_total: string;
}

export interface ResumenPeriodo {
  total_reservas: number;
  monto_total: string;
}

export interface MetricasVentasData {
  ventas_diarias: VentaDiaria[];
  resumen_periodo: ResumenPeriodo;
}

export interface MetricasVentasResponse {
  success: boolean;
  periodo: '7d' | '30d';
  fecha_desde: string;
  fecha_hasta: string;
  data: MetricasVentasData;
}

// ========== Top Destinos ==========

export interface TopDestino {
  destino_id: number;
  ciudad: string;
  pais: string;
  destino_completo: string;
  cantidad_reservas: number;
  monto_total: string;
  paquetes_activos: number;
}

export interface TopDestinosData {
  top_destinos: TopDestino[];
}

export interface TopDestinosResponse {
  success: boolean;
  periodo: 'mes' | 'trimestre' | 'año';
  fecha_desde: string;
  fecha_hasta: string;
  data: TopDestinosData;
}



