/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext } from 'react';
import type { ClienteFacturaData } from '@/components/InfoFacturaTitular';
import type { InvoiceData } from '@/types/invoice';

// 🧠 Context para compartir datos del modal
interface FacturaContextType {
  clienteData: ClienteFacturaData | null;
  setClienteData: (data: ClienteFacturaData | null) => void;
  invoiceData: InvoiceData | null;
  setInvoiceData: (data: InvoiceData | null) => void;
  configFacturaData: any;
  payLoad: any;
  setPayLoad: (data: any) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  formData: ClienteFacturaData | null;
  setFormData: (data: ClienteFacturaData | null) => void;
  reservaData: any;
}

export const FacturaContext = createContext<FacturaContextType | undefined>(undefined);

// Hook personalizado
export const useFacturaContext = () => {
  const context = useContext(FacturaContext);
  if (!context) {
    throw new Error('useFacturaContext debe usarse dentro de <FacturaProvider>');
  }
  return context;
};
