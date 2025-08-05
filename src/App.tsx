/* eslint-disable @typescript-eslint/no-unused-vars */
import './App.css';
import ToastContainer from './components/ToastContainer';
import { queryClient } from './components/utils/http';
import { ToastConextProvider } from './context/ToastContext';
import AppRouter from './router/AppRouter';
import { QueryClientProvider } from '@tanstack/react-query';


function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <ToastConextProvider>
          <AppRouter />
          <ToastContainer/>
      </ToastConextProvider>
    </QueryClientProvider>
  )
}

export default App
