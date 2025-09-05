// store/useFacturaFormStore.ts
import type { Establecimiento, PuntoExpedicion, SubtipoImpuesto, Timbrado, TipoImpuesto } from "@/types/facturacion";
import { create } from "zustand";

export interface FacturaFormData {
  id?: number;
  nombreEmpresa?: string;
  ruc?: string;
  activadComercial?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  timbrado?: Timbrado;
  establecimiento?: Establecimiento;
  expedicion?: PuntoExpedicion;
  tipo_impuesto?: TipoImpuesto;
  subtipo_impuesto?: SubtipoImpuesto;
}

interface FacturaFormState {
  formData: FacturaFormData;
  updateFormData: (data: Partial<FacturaFormData>) => void;
}

export const useFacturaFormStore = create<FacturaFormState>((set) => ({
  formData: {},
  updateFormData: (data) =>
    set((state) => ({ formData: { ...state.formData, ...data } })),
}));
