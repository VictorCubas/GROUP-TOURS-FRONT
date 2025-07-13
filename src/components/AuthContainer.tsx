import React from 'react'
import { CiUser } from "react-icons/ci";

const AuthContainer = () => {
  return (
    <>
        <div className="flex items-center gap-x-4 space-x-1 cursor-pointer">
            <CiUser className="w-11 h-11 hover:text-amber-500" />
            <div className="text-normal">
            <div className="text-gray-800 hover:text-amber-400 text-md whitespace-nowrap">Iniciar sesión</div>
            <div className="text-gray-500 text-md hover:text-amber-400 whitespace-nowrap">Registrarme</div>
            </div>
        </div>
    </>
  )
}

export default AuthContainer