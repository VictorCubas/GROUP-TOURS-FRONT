/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { use, useEffect, useState } from "react"
import { Eye, EyeOff, Lock, Plane, Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useNavigate } from "react-router-dom"
import { useForm } from 'react-hook-form';
import axios from "axios"
import { API_BASE_URL } from "@/service/api"
import { useSessionStore, type SessionDataStore } from "@/store/sessionStore"
import { ToastContext } from "@/context/ToastContext"

interface LoginFormData{
  username: string,
  password: string
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useSessionStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [anioActual, setAnioActual] = useState<number>();
  const {handleShowToast} = use(ToastContext);

  const {register, handleSubmit, formState: {errors, }} = useForm<LoginFormData>({mode: "onBlur"});

  useEffect(() => {
    const fechaActual = new Date();
    const anio = fechaActual.getFullYear();
    setAnioActual(anio);
  }, []);


  const handleLogin = async (dataForm: LoginFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const dataResp = await loginFetch({username: dataForm.username.trim(), password: dataForm.password.trim()});

      const session: SessionDataStore = {
        usuario: dataForm.username,
        token: dataResp.data.access
      }

      login(session);
      handleShowToast('Bienvenido a GroupTours', "success");
      navigate('/');
      
    } catch (err: any) {
      console.log(err);
      setError(err?.response?.data?.message ?? 'Ocurrió algo inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  const loginFetch = (credentials: LoginFormData) => {
    return axios.post(`${API_BASE_URL}/login/`, credentials);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="2" fill="#9C92AC" fillOpacity="0.05" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo y Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <Plane className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">GROUP TOURS</h1>
          <p className="text-blue-200">Sistema de Gestión de Tours</p>
        </div>

        {/* Card de Login */}
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700 text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Usuario
                </Label>
                <div className="relative margin-bottom-cero">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="username"
                    className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    {...register('username', {
                      required: true, 
                      validate: {blankSpace: (value) => !!value.trim()},
                      minLength: 3})}
                  />
                </div>
                <div className="text-center">
                  {(errors?.username?.type === 'required' || errors?.username?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                  {errors?.username?.type === 'minLength' && <span className='text-red-400 text-sm'>El username debe tener minimo 3 caracteres</span>}
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <div className="relative margin-bottom-cero">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                     {...register('password', {
                      required: true, 
                      validate: {blankSpace: (value) => !!value.trim()},
                      minLength: 3
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="text-center">
                  {(errors?.password?.type === 'required' || errors?.password?.type === 'blankSpace') && <span className='text-red-400 text-sm'>Este campo es requerido</span>}
                  {errors?.password?.type === 'minLength' && <span className='text-red-400 text-sm'>La contraseña debe tener minimo 3 caracteres</span>}
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-end">
                
                <button type="button" className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200
                cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    Iniciar Sesión
                    {/* <ArrowRight className="w-4 h-4 ml-2" /> */}
                  </>
                )}
              </Button>

            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Credenciales de Demo:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>
                  <strong>Usuario:</strong> grouptours
                </p>
                <p>
                  <strong>Contraseña:</strong> admin123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-blue-200 text-sm">
            ¿No tienes una cuenta?{" "}
            <button className="text-white font-medium hover:underline">Contacta al administrador</button>
          </p>
          <p className="text-blue-300 text-xs mt-2">© {anioActual} Group Tours. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}
