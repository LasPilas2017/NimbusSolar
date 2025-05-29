import Login from './Login';
import Personal from './componentes/personal/Personal';
import Proyectos from './componentes/Proyectos/Proyectos';
import Contabilidad from './componentes/contabilidad/Contabilidad';
import Supervisor from './componentes/Supervisor';
import React, { useState } from 'react';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [tab, setTab] = useState("personal");

  if (!usuario) return <Login onLogin={setUsuario} />;

  const esAdmin = usuario.rol === 'admin';

  return (
    <div
      className="min-h-screen bg-cover bg-center p-4"
      style={{
        backgroundImage: "url('/fondo.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Cuadro difuminado que contiene todo el contenido */}
      <div className="flex flex-col items-center justify-center w-full h-full p-6 bg-white/40 backdrop-blur-lg rounded-2xl shadow-lg max-w-6xl mx-auto mt-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Bienvenido {esAdmin ? 'Administrador' : usuario.rol === 'contabilidad' ? 'Usuario de Contabilidad' : usuario.rol === 'reportador' ? 'Reportador' : 'Usuario'}
        </h1>

        {esAdmin && (
          <div className="w-full">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Panel de Control</h2>
            <nav className="flex flex-wrap justify-center gap-6 text-lg font-medium text-gray-700 mb-6">
              <button
                onClick={() => setTab("personal")}
                className={`pb-1 border-b-4 transition-all ${tab === "personal" ? "border-blue-600 text-blue-700 font-bold" : "border-transparent hover:text-blue-600"}`}
              >
                Personal
              </button>
              <button
                onClick={() => setTab("proyectos")}
                className={`pb-1 border-b-4 transition-all ${tab === "proyectos" ? "border-blue-600 text-blue-700 font-bold" : "border-transparent hover:text-blue-600"}`}
              >
                Proyectos
              </button>
              <button
                onClick={() => setTab("Liquidez")}
                className={`pb-1 border-b-4 transition-all ${tab === "Liquidez" ? "border-blue-600 text-blue-700 font-bold" : "border-transparent hover:text-blue-600"}`}
              >
                Liquidez
              </button>
            </nav>
          </div>
        )}

        {/* Secciones adaptables para todas las pestañas */}
        <div className="w-full flex flex-col gap-4">
          {esAdmin && tab === "personal" && (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full">
                <Personal usuario={usuario} />
              </div>
            </div>
          )}

          {esAdmin && tab === "proyectos" && (
            <div className="flex flex-col gap-4">
              <Proyectos />
            </div>
          )}

          {esAdmin && tab === "Liquidez" && (
            <div className="flex flex-col gap-4">
              <Contabilidad />
            </div>
          )}
        </div>

        {/* Vistas para otros roles */}
        {usuario.rol === 'contabilidad' && (
          <div className="mt-6 text-center text-gray-800">Aquí irán las funciones de contabilidad.</div>
        )}
        {usuario.rol === 'reportador' && (
          <div className="mt-6 text-center text-gray-800">Aquí irán las funciones del reportador.</div>
        )}
        {usuario.rol === 'supervisor' && <Supervisor />}
      </div>
    </div>
  );
}
