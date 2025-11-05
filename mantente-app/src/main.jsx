// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary';

// Importar Bootstrap CSS y JS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';  // Añadido para que funcionen los componentes interactivos

import './styles/variables.css';
import './index.css';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registrado:', registration);
      })
      .catch((error) => {
        console.warn('[PWA] Error registrando Service Worker:', error);
      });
  });
}