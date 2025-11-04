export interface CompanyConfig {
  id?: string;
  companyName: string;
  businessActivity: string;
  address: string;
  phone: string;
  email: string;
  ruc: string;
  stampNumber: string;
  validityStart: string;
  electronicInvoicePrefix: string;
  logo?: string;
}

export interface TaxConfig {
  id: string;
  name: string;
  percentage: number;
  isActive: boolean;
  description?: string;
}

export interface InvoiceConfig {
  company: CompanyConfig;
  taxes: TaxConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  code: string;
  description: string;
  unitMeasure: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxType: "exenta" | "iva5" | "iva10";
}

export interface InvoiceData {
  // Company data
  ruc: string;
  timbrado: string;
  timbrado_numero: string;
  vigencyStartDate: string;
  invoiceNumber: string;

  // Invoice metadata
  emissionDate: string;
  saleCondition: string;
  currency: string;

  // Customer data
  customerRuc: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;

  // Items
  items: InvoiceItem[];
}