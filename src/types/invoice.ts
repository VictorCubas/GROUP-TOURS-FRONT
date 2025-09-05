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