// src/main.jsx o src/index.jsx
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Este archivo es el **punto de entrada principal** de la aplicación Nimbus Solar.
// Se encarga de:
//   - Importar los estilos globales (`index.css`).
//   - Inicializar ReactDOM y renderizar el componente raíz (<App />).
//   - Envolver toda la aplicación dentro de <ErrorBoundary /> para protegerla
//     de errores inesperados en tiempo de ejecución.
//
// -----------------------------------------------------------------------------
// CON QUÉ SE CONECTA
// -----------------------------------------------------------------------------
// 🔹 <App />
//    - Contiene toda la lógica principal (login, layout, router, etc.).
//
// 🔹 <ErrorBoundary />
//    - Intercepta errores globales y muestra una pantalla controlada si ocurre
//      un fallo en cualquier parte del árbol de componentes.
// -----------------------------------------------------------------------------

import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import ErrorBoundary from './app/ErrorBoundary'; // ✅ Importamos el límite de errores global

// Creamos el contenedor raíz de React
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render principal
root.render(
  <React.StrictMode>
    {/* Protege toda la aplicación ante errores de renderizado */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
