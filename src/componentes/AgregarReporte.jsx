// AgregarReporte.jsx
import { useState, useEffect } from "react";
import supabase from "../supabase";
import { guardarLog } from "../utils"; // 👈 Agregado para guardar los logs
import { Plus, Pencil, FileText } from "lucide-react";

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [tab, setTab] = useState("personal");

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
    await guardarLog(usuario, "Cambio de pestaña", `Se cambió a la pestaña: ${nuevoTab}`);
  };

  const handleLogout = async () => {
    await guardarLog(usuario, "Cierre de sesión", "El usuario salió del sistema");
    setUsuario(null);
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

        {esAdmin && (
          <div className="w-full">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Panel de Control</h2>
            <nav className="flex flex-wrap justify-center gap-6 text-lg font-medium text-gray-700 mb-6">
              <button
                onClick={() => cambiarTab("personal")}
                className={`pb-1 border-b-4 transition-all ${tab === "personal" ? "border-blue-600 text-blue-700 font-bold" : "border-transparent hover:text-blue-600"}`}
              >
                Personal
              </button>
              <button
                onClick={() => cambiarTab("verPlanilla")}
                className={`pb-1 border-b-4 transition-all ${tab === "verPlanilla" ? "border-blue-600 text-blue-700 font-bold" : "border-transparent hover:text-blue-600"}`}
              >
                Planilla
              </button>
              <button
                onClick={() => cambiarTab("precioTrabajos")}
                className={`pb-1 border-b-4 transition-all ${tab === "precioTrabajos" ? "border-blue-600 text-blue-700 font-bold" : "border-transparent hover:text-blue-600"}`}
              >
                Precio Trabajos
              </button>
              <button
                onClick={() => cambiarTab("Liquidez")}
                className={`pb-1 border-b-4 transition-all ${tab === "Liquidez" ? "border-blue-600 text-blue-700 font-bold" : "border-transparent hover:text-blue-600"}`}
              >
                Liquidez
              </button>
              <button
                onClick={handleLogout}
                className="pb-1 border-b-4 border-transparent text-red-600 hover:border-red-600 hover:text-red-700 font-medium"
              >
                Cerrar Sesión
              </button>
            </nav>
          </div>
        )}

        <div className="w-full flex flex-col gap-4">
          {esAdmin && tab === "personal" && (
            <Personal usuario={usuario} />
          )}

          {esAdmin && tab === "verPlanilla" && (
            <VerPlanilla />
          )}

          {esAdmin && tab === "precioTrabajos" && (
            <PrecioTrabajos usuario={usuario} />
          )}

          {esAdmin && tab === "Liquidez" && (
            <Contabilidad usuario={usuario} />
          )}
        </div>
      </div>
    </div>
  );
}