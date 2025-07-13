import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


setTimeout(() => {
  const globalLoader = document.getElementById('global-loader');
  if (globalLoader) {
    globalLoader.remove();
  }
}, 100)