/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Eye, EyeOff, Lock, Mail, Shield, Plane, ArrowRight, Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useNavigate } from "react-router-dom"
import axiosInstance from "@/service/axiosConfig"
import axios from "axios"
import { API_BASE_URL } from "@/service/api"

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState("");
  const [anioActual, setAnioActual] = useState<number>();

  useEffect(() => {
    const fechaActual = new Date();
    const anio = fechaActual.getFullYear();
    setAnioActual(anio);
  }, []);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true);
    setError("");

    // Simulación de autenticación
    try {
      // await new Promise((resolve) => setTimeout(resolve, 2000))
      await loginFetch({username: loginData.username, password: loginData.password});
      // Validación simple para demo
      // if (loginData.email === "admin@grouptours.com" && loginData.password === "admin123") {
        // Redirigir al dashboard
        navigate('/');
      // } else {
      //   setError("Credenciales incorrectas.")
      // }
    } catch (err: any) {
      console.log(err);
      setError(err?.response?.data?.message ?? 'Ocurrió algo inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setLoginData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  const loginFetch = (credentials: { username: string; password: string }) => {
    return axios.post(`${API_BASE_URL}/login`, credentials);
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
            <form onSubmit={handleLogin} className="space-y-6">
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
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="username"
                    value={loginData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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
