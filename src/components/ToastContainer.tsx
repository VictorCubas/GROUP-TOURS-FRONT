import { ToastContext } from '@/context/ToastContext';
import { use, useEffect } from 'react'
import { toast, Toaster, type ToastOptions } from 'react-hot-toast';

const ToastContainer = () => {
    const {showMessageToast} = use(ToastContext);

    useEffect(() => {
        if (showMessageToast) {
          const { message } = showMessageToast;

          const config: ToastOptions = {
                  duration: 4000,
                  position: 'bottom-center',
    
                  // Change colors of success/error/loading icon
                  iconTheme: {
                    primary: '#0a0',
                    secondary: '#fff',
                  },
                  // styling
                  style: {
                    border: '1px solid #22C55E',
                    padding: '10px 10px',
                    color: '#713200',
                    backgroundColor: '#DCFCE7',
                    minWidth: 'fit-content'
                    // minWidth: '300px'
                  },
                  // Aria
                  ariaProps: {
                    role: 'status',
                    'aria-live': 'polite',
                  },
              };

          
            if(showMessageToast.tipo === 'success'){
              toast.success(message, config);
            }

            if(showMessageToast.tipo === 'error'){
              config!.iconTheme!.primary = '#f00';
              config!.style!.border = '1px solid #EF4444';
              config!.style!.backgroundColor = '#FEE2E2';
              toast.error(message, config);
            }

            if(showMessageToast.tipo === 'warning'){
              config!.iconTheme!.primary = '#f00';
              config!.style!.border = '1px solid #fb923c';
              config!.style!.backgroundColor = '#FFEDD5';
              toast.error(message, config);
            }
          

        }
      }, [showMessageToast]);


  return (
    <>
        {<Toaster
            position="bottom-center"
            reverseOrder={false}
            containerStyle={{
              zIndex: 999999,
            }}
            toastOptions={{
              style: {
                zIndex: 999999,
              },
            }}
            />}
    </>
  )
}

export default ToastContainer;