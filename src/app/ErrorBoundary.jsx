// src/app/ErrorBoundary.jsx
import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, info: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Puedes enviar a un logger si quieres
    console.error('App crashed:', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center p-6 text-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Algo salió mal</h1>
            <p className="text-gray-600 mb-4">Intenta recargar la página o volver al inicio.</p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-xl"
              onClick={() => window.location.reload()}
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
