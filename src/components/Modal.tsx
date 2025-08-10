import React, { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps{
    children: ReactNode,
    onClose: () => void,
}


const Modal: React.FC<ModalProps> = ({children, onClose}) => {
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    useEffect(() => {
        const modal = dialogRef.current;
        if (modal) {
                modal.showModal();
        }

        return () => {
            if (modal?.open) {
                modal.close();
            }
        };
    }, []);


    const modalRoot = document.getElementById('modal');
    if (!modalRoot) return null;

    return createPortal(
        <dialog ref={dialogRef} onClose={onClose}
            className='modal'>
            {children}
        </dialog>, modalRoot);
}

export default Modal
