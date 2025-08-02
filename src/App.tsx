/* eslint-disable @typescript-eslint/no-unused-vars */
import './App.css';
import ToastContainer from './components/ToastContainer';
import { ToastConextProvider } from './context/ToastContext';
import AppRouter from './router/AppRouter';


function App() {

  return (
    <>
      <ToastConextProvider>
          <AppRouter />
          <ToastContainer/>
      </ToastConextProvider>
    </>
  )
}

export default App
