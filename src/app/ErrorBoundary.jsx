// src/app/ErrorBoundary.jsx
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Este componente implementa un **Error Boundary (límite de error global)** para
// toda la aplicación Nimbus Solar.
//
// Su función es capturar cualquier error crítico que ocurra durante el renderizado
// de los componentes React y evitar que la app colapse o muestre pantalla en blanco.
//
// Además, registra automáticamente el error en la base de datos mediante la función
// `guardarLog`, dejando un historial interno de fallos con información útil para
// diagnóstico.
//
// -----------------------------------------------------------------------------
// CON QUÉ SE CONECTA
// -----------------------------------------------------------------------------
// 🔹 <App /> (src/app/App.jsx)
//    - Toda la aplicación se encuentra envuelta dentro de este componente.
//
// 🔹 guardarLog (src/utils/index.js o donde esté definida)
//    - Se utiliza para registrar errores globales en Supabase (si hay conexión activa).
//
// -----------------------------------------------------------------------------
// FLUJO GENERAL
// -----------------------------------------------------------------------------
// 1️⃣ Si ocurre un error en cualquier parte de la app:
//     - React invoca `getDerivedStateFromError()` → actualiza el estado local.
// 2️⃣ `componentDidCatch()` recibe el error y la traza (info) del árbol de componentes.
// 3️⃣ Se registra el error automáticamente con `guardarLog()` si la función existe.
// 4️⃣ Se muestra una pantalla controlada con un botón de recarga.
// 5️⃣ Al recargar, el usuario puede continuar normalmente.
//
// -----------------------------------------------------------------------------
// A FUTURO
// -----------------------------------------------------------------------------
// - Se puede ampliar para enviar los errores a un dashboard interno o a una
//   notificación de administrador.
// - También se puede guardar información del usuario actual si se pasa como prop.
// -----------------------------------------------------------------------------

import React from 'react';
import { guardarLog } from '../utils'; // ✅ se usa para registrar el error global

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, info: null };
  }

  // Método invocado por React cuando ocurre un error en los hijos
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  // Captura el error y la traza del árbol de componentes
  async componentDidCatch(error, info) {
    console.error('❌ Error global capturado por ErrorBoundary:', error, info);
    this.setState({ info });

    try {
      // Si existe guardarLog (para evitar errores en ambientes sin conexión)
      if (typeof guardarLog === 'function') {
        await guardarLog(
          null, // usuario desconocido (no está en sesión en este punto)
          'Error global',
          JSON.stringify({
            mensaje: error.message,
            componente: info?.componentStack || 'N/A',
            fecha: new Date().toISOString(),
          })
        );
      }
    } catch (err) {
      console.warn('No se pudo registrar el error en la base:', err.message);
    }
  }

  // Renderiza una vista alternativa cuando ocurre un error
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center p-6 text-center bg-gray-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-2 text-red-600">Algo salió mal 😞</h1>
            <p className="text-gray-600 mb-4">
              Ha ocurrido un error inesperado en el sistema.
              <br />
              Se ha registrado automáticamente para su revisión.
            </p>
            <button
              className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              onClick={() => window.location.reload()}
            >
              Recargar aplicación
            </button>
          </div>
        </div>
      );
    }

    // Si no hay error, renderiza normalmente los hijos
    return this.props.children;
  }
}
