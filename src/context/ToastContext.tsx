/* eslint-disable @typescript-eslint/no-unused-vars */
import { registerToastHandler } from "@/helper/toastService";
import { createContext, useState, type ReactNode } from "react";

interface ShowMessageType{
    message: string,
    tipo: 'success' | 'error'
}

interface ToastContextType{
    handleShowToast: (message?: string, tipo?: 'success' | 'error') => void;
    showMessageToast: ShowMessageType | null
}

interface ToastConextProviderProps{
     children: ReactNode;
}


// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext<ToastContextType>({
    handleShowToast: (_message?: string, _tipo?: 'success' | 'error') => {},
    showMessageToast: null
});


export const ToastConextProvider = ({children}: ToastConextProviderProps  )=> {
    const [showMessageToast, setShowMessageSuccess] = useState<ShowMessageType | null>(null);

    /**
     * Setea el mensaje y el tipo de toast a mostrarse
     */
    const handleShowToast = (message?: string, tipo?: 'success' | 'error') => {
        let newMessage: ShowMessageType | null = null;

        if(message && tipo)
            newMessage =  {
                message,
                tipo
            }

        setShowMessageSuccess(newMessage)
    }

    
    const contextValue: ToastContextType = {
        handleShowToast,
        showMessageToast
    }

    registerToastHandler(handleShowToast);
    
    return (
        <ToastContext.Provider value={contextValue}>
            {children}
        </ToastContext.Provider>
    );
}