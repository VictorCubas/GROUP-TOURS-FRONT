/* eslint-disable no-useless-escape */

import { use, useState } from 'react';
import Modal from './Modal';
import { AlertCircle, Eye, EyeOff, Lock, X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { resetearContrasenia } from './utils/httpUsuario';
import { ToastContext } from '@/context/ToastContext';
import { useSessionStore } from '@/store/sessionStore';

const ResetearContrasenia = () => {
    const {setDebeResetearContrasenia} = useSessionStore();
    const {handleShowToast} = use(ToastContext);
    const [formData, setFormData] = useState({
            newPassword: '',
            confirmPassword: ''
        });
        
        const [showPassword, setShowPassword] = useState({
            newPassword: false,
            confirmPassword: false
        });

        const [errors, setErrors] = useState<string[]>([]);
        const [success, setSuccess] = useState(false);


     const {mutate, isPending} = useMutation({
        mutationFn: resetearContrasenia,
        onSuccess: () => {
            handleShowToast('Se ha cambiado la contraseña satisfactoriamente', 'success');
            setDebeResetearContrasenia(false);
            setErrors([]);
            if (success) {
                setSuccess(false);
            }
            // reset({
            //   salario: '',
            //   porcentaje_comision: '',
            //   puesto: '',
            //   persona: '',
            //   tipo_remuneracion: '',
            //   fecha_ingreso: ''
            // });
        },
    })


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Limpiar errores cuando el usuario empiece a escribir
        if (errors.length > 0) {
            setErrors([]);
        }
    };

    const handleCloseVerDetalles = () => {
        // setOnVerDetalles(false);
        // setDataDetalle(undefined);
    }

     const togglePasswordVisibility = (field: 'newPassword' | 'confirmPassword') => {
        setShowPassword(prev => ({
        ...prev,
        [field]: !prev[field]
        }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { newPassword, confirmPassword } = formData;
    const validationErrors: string[] = [];

    // Validar contraseña
    const passwordErrors = validatePassword(newPassword);
    validationErrors.push(...passwordErrors);

    // Validar confirmación
    if (newPassword !== confirmPassword) {
      validationErrors.push('Las contraseñas no coinciden');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // setErrors([]);

    // Simular llamada API
    try {
      mutate(newPassword);
      setFormData({ newPassword: '', confirmPassword: '' });
    
    } catch (error) {
      console.log(error)
      setErrors(['Error al actualizar la contraseña. Intente nuevamente.']);
    }
  };

const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una letra mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Debe contener al menos una letra minúscula');
    }
    if (!/\d/.test(password)) {
      errors.push('Debe contener al menos un número');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Debe contener al menos un carácter especial');
    }
    return errors;
  };
  

  return (
    <Modal onClose={handleCloseVerDetalles} claseCss={'modal-detalles'}>
          <div className=" bg-white rounded-lg shadow-lg p-6">
               <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lock size={20} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Resetear Contraseña</h2>
          </div>
          <button
            // onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">

          {errors.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-700 font-medium mb-1">Error de validación:</p>
                  <ul className="text-red-600 text-sm space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Nueva contraseña */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nueva contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword.newPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 pr-12"
                  placeholder="Ingrese su nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('newPassword')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  {showPassword.newPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword.confirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 pr-12"
                  placeholder="Confirme su nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  {showPassword.confirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Requisitos de contraseña */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-700 mb-2">Requisitos de la contraseña:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Al menos 8 caracteres</li>
              <li>• Una letra mayúscula y una minúscula</li>
              <li>• Al menos un número</li>
              <li>• Al menos un carácter especial (!@#$%^&*)</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            
            <button
              type="submit"
              disabled={isPending || success}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? 'Actualizando...' : success ? '¡Actualizada!' : 'Actualizar contraseña'}
            </button>
          </div>
        </form>
          </div>
    </Modal>
  )
}

export default ResetearContrasenia