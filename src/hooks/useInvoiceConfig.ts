import type { CompanyConfig, InvoiceConfig, TaxConfig } from '@/types/invoice';
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'invoice_config';

const defaultCompanyConfig: CompanyConfig = {
  companyName: '',
  businessActivity: '',
  address: '',
  phone: '',
  email: '',
  ruc: '',
  stampNumber: '',
  validityStart: '',
  electronicInvoicePrefix: ''
};

const defaultTaxes: TaxConfig[] = [
    {
    id: '2',
    name: 'IVA 10%',
    percentage: 10,
    isActive: true,
    description: 'IVA general'
  },
  {
    id: '1',
    name: 'IVA 5%',
    percentage: 5,
    isActive: false,
    description: 'IVA reducido'
  },
  {
    id: '3',
    name: 'IVA 0%',
    percentage: 0,
    isActive: false,
    description: 'Excenta'
  },
];

export const useInvoiceConfig = () => {
    console.log(defaultTaxes)
  const [config, setConfig] = useState<InvoiceConfig>(() => {
    const saved = null
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          company: defaultCompanyConfig,
          taxes: defaultTaxes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    }
    return {
      company: defaultCompanyConfig,
      taxes: defaultTaxes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  const updateCompanyConfig = (companyConfig: CompanyConfig) => {
    const updatedConfig = {
      ...config,
      company: companyConfig,
      updatedAt: new Date().toISOString()
    };
    setConfig(updatedConfig);
  };

  const updateTaxConfig = (taxes: TaxConfig[]) => {
    const updatedConfig = {
      ...config,
      taxes,
      updatedAt: new Date().toISOString()
    };
    setConfig(updatedConfig);
  };

  const saveConfig = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  };

  const exportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `invoice_config_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const validateConfig = () => {
    const errors: string[] = [];
    
    // Validar empresa
    if (!config.company.companyName) errors.push('Nombre de empresa es requerido');
    if (!config.company.businessActivity) errors.push('Actividad comercial es requerida');
    if (!config.company.address) errors.push('Dirección es requerida');
    if (!config.company.phone) errors.push('Teléfono es requerido');
    if (!config.company.email) errors.push('Correo electrónico es requerido');
    if (!config.company.ruc) errors.push('RUC es requerido');
    if (!config.company.stampNumber) errors.push('Número de timbrado es requerido');
    if (!config.company.validityStart) errors.push('Fecha de inicio de vigencia es requerida');
    if (!config.company.electronicInvoicePrefix) errors.push('Prefijo de factura electrónica es requerido');
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (config.company.email && !emailRegex.test(config.company.email)) {
      errors.push('Formato de correo electrónico inválido');
    }
    
    // Validar que hay al menos un IVA activo
    const activeTaxes = config.taxes.filter(tax => tax.isActive);
    if (activeTaxes.length === 0) {
      errors.push('Debe tener al menos un tipo de IVA activo');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  useEffect(() => {
    const autoSave = setTimeout(() => {
      saveConfig();
    }, 1000);

    return () => clearTimeout(autoSave);
  }, [config]);

  return {
    config,
    updateCompanyConfig,
    updateTaxConfig,
    saveConfig,
    exportConfig,
    validateConfig
  };
};