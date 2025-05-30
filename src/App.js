// App.jsx
import Login from './Login';
import Personal from './componentes/personal/Personal';
import Contabilidad from './componentes/contabilidad/Contabilidad';
import VistaMovimientos from './componentes/VistaMovimientos';
import React, { useState } from 'react';
import { guardarLog } from './utils';
import Servicios from './componentes/Servicios/Servicios';

import Vehiculos from './componentes/Servicios/vehiculos';
import Maquinaria from './componentes/Servicios/maquinaria';
export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [tab, setTab] = useState("personal");
  const [vistaServicio, setVistaServicio] = useState("principal"); // 👈 este estado controla la vista en "servicios"

  if (!usuario) {
    return (
      <Login
        onLogin={async (user) => {
          await guardarLog(user, "Inicio de sesión", "El usuario ingresó al sistema");
          setUsuario(user);
        }}
      />
    );
  }

  const esAdmin = usuario.rol === 'admin';

  const cambiarTab = async (nuevoTab) => {
    setTab(nuevoTab);
    setVistaServicio("principal"); // 👈 reinicia la vista de "servicios" cuando cambias de pestaña
    await guardarLog(usuario, "Cambio de pestaña", `Se cambió a la pestaña: ${nuevoTab}`);
  };

  const handleLogout = async () => {
    await guardarLog(usuario, "Cierre de sesión", "El usuario salió del sistema");
    setUsuario(null);
  };

  const handleSelectServicio = (seleccion) => {
    setVistaServicio(seleccion); // 👈 cambia la vista según la selección
  };

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
      <div className="flex flex-col items-center justify-center w-full h-full p-6 bg-white/40 backdrop-blur-lg rounded-2xl shadow-lg max-w-6xl mx-auto mt-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Bienvenido {esAdmin ? 'Administrador' : 'Usuario'}
        </h1>

        {/* Panel de Control */}
        {esAdmin && (
          <div className="w-full">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Panel de Control</h2>
            <nav className="flex flex-wrap justify-center gap-4 text-lg font-medium text-gray-800 mb-6">
  <button
    onClick={() => cambiarTab("personal")}
    className={`px-4 py-2 rounded-xl transition-all duration-300 shadow-sm ${
      tab === "personal"
        ? "bg-gray-900 text-white font-bold"
        : "bg-gray-200 hover:bg-gray-300 text-gray-800"
    }`}
  >
    Personal
  </button>

  <button
    onClick={() => cambiarTab("Liquidez")}
    className={`px-4 py-2 rounded-xl transition-all duration-300 shadow-sm ${
      tab === "Liquidez"
        ? "bg-gray-900 text-white font-bold"
        : "bg-gray-200 hover:bg-gray-300 text-gray-800"
    }`}
  >
    Liquidez
  </button>

  <button
    onClick={() => cambiarTab("servicios")}
    className={`px-4 py-2 rounded-xl transition-all duration-300 shadow-sm ${
      tab === "servicios"
        ? "bg-gray-900 text-white font-bold"
        : "bg-gray-200 hover:bg-gray-300 text-gray-800"
    }`}
  >
    Servicios
  </button>

  <button
    onClick={() => cambiarTab("VistaMovimientos")}
    className={`px-4 py-2 rounded-xl transition-all duration-300 shadow-sm ${
      tab === "VistaMovimientos"
        ? "bg-gray-900 text-white font-bold"
        : "bg-gray-200 hover:bg-gray-300 text-gray-800"
    }`}
  >
    Registro de Movimientos
  </button>

  <button
    onClick={handleLogout}
    className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 shadow-sm bg-gray-200 hover:bg-red-200 text-red-700 hover:text-red-800 font-semibold"
  >
    Cerrar Sesión
  </button>
</nav>
          </div>
        )}

        {/* Vistas */}
        <div className="w-full flex flex-col gap-4">
          {esAdmin && tab === "personal" && <Personal usuario={usuario} />}
          {esAdmin && tab === "Liquidez" && <Contabilidad usuario={usuario} />}
          {esAdmin && tab === "VistaMovimientos" && <VistaMovimientos />}

          {/* Servicios con control interno de vista */}
          {esAdmin && tab === "servicios" && (
            <>
              {vistaServicio === "principal" && (
                <Servicios onSelect={handleSelectServicio} />
              )}
              {vistaServicio === "vehiculos" && (
                <Vehiculos />
              )}
              {vistaServicio === "maquinaria" && (
                <Maquinaria />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}