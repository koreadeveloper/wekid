import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

if (import.meta.env.DEV) {
  if (import.meta.env.VITE_DISABLE_REACT_DEVTOOLS !== '1') {
    void import('./lib/optionalDevTools').then(({ loadOptionalDevTools }) => {
      loadOptionalDevTools({
        enableReactGrab: import.meta.env.VITE_ENABLE_REACT_GRAB === '1',
        enableReactScan: import.meta.env.VITE_ENABLE_REACT_SCAN === '1',
      });
    });
  }
}

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('Wekid root element is missing.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
