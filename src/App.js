import Login from './Login';
import Personal from './componentes/personal/Personal';
import PreciosTrabajos from './componentes/PreciosTrabajos';
import Proyectos from './componentes/Proyectos/Proyectos';
import Contabilidad from './componentes/contabilidad/Contabilidad';
import React, { useState } from 'react';
import { supabase } from './supabase';
import Supervisor from './componentes/Supervisor';

function App() {
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
        backgroundPosition: "center"
        }}
    >
      <h1 className="text-2xl font-bold text-center mt-4 text-white drop-shadow-md">
        Bienvenido {esAdmin ? 'Administrador' : usuario.rol === 'contabilidad' ? 'Usuario de Contabilidad' : usuario.rol === 'reportador' ? 'Reportador' : 'Usuario'}
      </h1>

     {esAdmin && (
  <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg mt-6">
    <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Panel de Control</h2>
    <nav className="flex flex-wrap justify-center gap-6 text-lg font-medium text-gray-700">
      <button
        onClick={() => setTab("personal")}
        className={`pb-1 border-b-4 transition-all ${
          tab === "personal" ? "border-blue-600 text-blue-700 font-bold" : "border-transparent hover:text-blue-600"
        }`}
      >
        Personal
      </button>
     
      <button
        onClick={() => setTab("proyectos")}
        className={`pb-1 border-b-4 transition-all ${
          tab === "proyectos" ? "border-blue-600 text-blue-700 font-bold" : "border-transparent hover:text-blue-600"
        }`}
      >
        Proyectos
      </button>
      <button
        onClick={() => setTab("contabilidad")}
        className={`pb-1 border-b-4 transition-all ${
          tab === "contabilidad" ? "border-blue-600 text-blue-700 font-bold" : "border-transparent hover:text-blue-600"
        }`}
      >
        Contabilidad
      </button>
    </nav>
  </div>
)}

      {esAdmin && tab === "personal" && <Personal usuario={usuario} />}
      {esAdmin && tab === "precios" && <PreciosTrabajos />}
      {esAdmin && tab === "proyectos" && <Proyectos />}
      {esAdmin && tab === "contabilidad" && <Contabilidad />}

      {usuario.rol === 'contabilidad' && <div className="mt-6 text-center text-white">Aquí irán las funciones de contabilidad.</div>}
      {usuario.rol === 'reportador' && <div className="mt-6 text-center text-white">Aquí irán las funciones del reportador.</div>}
      {usuario.rol === 'supervisor' && <Supervisor />}
    </div>
  );
}

export default App;
