import React, { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps{
    children: ReactNode,
    claseCss: string,
    onClose: () => void,
    preventClickOutsideClose?: boolean,
}


const Modal: React.FC<ModalProps> = ({children, onClose, claseCss, preventClickOutsideClose = false}) => {

    useEffect(() => {
        // Bloquear scroll del body cuando el modal está abierto
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        // Manejar tecla ESC para cerrar
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEsc);

        return () => {
            document.body.style.overflow = originalOverflow;
            document.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);


    const modalRoot = document.getElementById('modal');
    if (!modalRoot) return null;

    return createPortal(
        <div
            className={claseCss}
            onClick={(e) => {
                // Cerrar si se hace clic en el overlay (fuera del contenido)
                if (!preventClickOutsideClose && e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            {children}
        </div>, modalRoot);
}

export default Modal
