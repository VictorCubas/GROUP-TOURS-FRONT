/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { Building2, Percent, Phone, Mail, MapPin } from 'lucide-react';
import { useFacturaFormStore } from '@/store/useFacturaFormStore';
import { formatearFecha } from '@/helper/formatter';

export const FacturaPreview: React.FC = () => {
  const { formData: config  } = useFacturaFormStore();

  console.log('config preview: ', config);
  // const activeTaxes = config.taxes.filter(tax => tax.isActive);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-600" />
          Vista Previa del Encabezado
        </h3>
        
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-6 border-l-4 border-emerald-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{config.nombreEmpresa}</h2>
              <p className="text-sm text-gray-600 mb-3">{config.activadComercial}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{config.direccion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{config.telefono}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{config.email}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-semibold text-gray-900 mb-3">Información Fiscal</h4>
              <div className="space-y-2 text-sm">
                <div><strong>RUC:</strong> {config.ruc}</div>
                <div><strong>Timbrado N°:</strong> {config?.timbrado?.numero}</div>
                <div><strong>Inicio de vigencia:</strong> {formatearFecha((config?.timbrado?.inicio_vigencia ?? ''), false)}</div>
                <div><strong>Factura electrónica N°:</strong> {config.establecimiento?.codigo}-{config.expedicion?.codigo}-0007110</div> 
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Percent className="w-5 h-5 text-blue-600" />
          Configuración de {config?.tipo_impuesto?.nombre}
        </h3>
        
        {!config?.subtipo_impuesto ? (
          <div className="text-center py-8 text-gray-500">
            <Percent className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No hay tipos de {config?.tipo_impuesto?.nombre} activos configurados</p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Liquidación {config?.tipo_impuesto?.nombre}</h4>
            <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700 mb-2">
              <div>Tipo</div>
              <div className="text-center">Porcentaje</div>
              <div className="text-center">Base Imponible</div>
              <div className="text-center">Total IVA</div>
            </div>
            {config.subtipo_impuesto && (
              <div className={`grid grid-cols-4 gap-4 text-sm py-2 bg-white rounded`}>
                <div className="font-medium">{config.subtipo_impuesto.nombre}</div>
                <div className="text-center">{config.subtipo_impuesto.porcentaje}%</div>
                <div className="text-center text-gray-500">0</div>
                <div className="text-center text-gray-500">0</div>
              </div>
            )}
            {/* {config.tipo_impuesto.subtipos.map((tax, index) => (
              <div key={tax.id} className={`grid grid-cols-4 gap-4 text-sm py-2 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} rounded`}>
                <div className="font-medium">{tax.nombre}</div>
                <div className="text-center">{tax.porcentaje}%</div>
                <div className="text-center text-gray-500">0</div>
                <div className="text-center text-gray-500">0</div>
              </div>
            ))} */}
            <div className="border-t border-gray-200 mt-2 pt-2">
              <div className="grid grid-cols-4 gap-4 text-sm font-semibold">
                <div>TOTAL IVA</div>
                <div></div>
                <div></div>
                <div className="text-center">0</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};