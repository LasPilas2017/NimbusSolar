import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiDollarSign, FiFolder, FiTool,
  FiRepeat, FiBox, FiLogOut, FiChevronsLeft,
  FiChevronsRight
} from 'react-icons/fi';

import Login from './Login/Login';
import Personal from './componentes/personal/Personal';
import Contabilidad from './componentes/contabilidad/Contabilidad';
import VistaMovimientos from './componentes/VistaMovimientos';
import Servicios from './componentes/Servicios/Servicios';
import Vehiculos from './componentes/Servicios/vehiculos';
import Maquinaria from './componentes/Servicios/maquinaria';
import CajaChica from './componentes/contabilidad/CajaChica';
import ReportarAsistencia from './componentes/personal/ReportarAsistencia';
import { guardarLog } from './utils';
import TotalIngresos from "./componentes/contabilidad/TotalIngresos";
import TotalEgresos from "./componentes/contabilidad/TotalEgresos";
import Proyectos from './componentes/Proyectos/Proyectos';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [tab, setTab] = useState("");
  const [vistaServicio, setVistaServicio] = useState("principal");
  const [cerrando, setCerrando] = useState(false);
  const [mostrarBarra, setMostrarBarra] = useState(true);
  const [mostrarTransacciones, setMostrarTransacciones] = useState(false);
  const [tipoTransaccion, setTipoTransaccion] = useState("");
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile && tab !== "") {
      setMostrarBarra(false);
    }
  }, [isMobile, tab]);

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
    setVistaServicio("principal");
    if (isMobile) setMostrarBarra(false);
    await guardarLog(usuario, "Cambio de pestaña", `Se cambió a la pestaña: ${nuevoTab}`);
  };

  const handleLogout = async () => {
    setCerrando(true);
    await guardarLog(usuario, "Cierre de sesión", "El usuario salió del sistema");
    setTimeout(() => setUsuario(null), 2000);
  };

  const handleSelectServicio = (seleccion) => setVistaServicio(seleccion);

  const tabs = [
    { id: "VistaMovimientos", label: "Movimientos", icon: <FiRepeat size={24} /> },
    { id: "papeleria", label: "Papelería", icon: <FiFolder size={24} /> },
    { id: "personal", label: "R.R.H.H.", icon: <FiUsers size={24} /> },
    { id: "servicios", label: "Servicios", icon: <FiTool size={24} /> },
    { id: "existencias", label: "Existencias", icon: <FiBox size={24} /> },
    { id: "ventas", label: "Ventas", icon: <FiDollarSign size={24} /> },
    { id: "proyectos", label: "Proyectos", icon: <FiFolder size={24} /> },
    { id: "Liquidez", label: "Finanzas", icon: <FiDollarSign size={24} /> },
  ];

  const colores = ["text-orange-500", "text-cyan-500", "text-emerald-500", "text-pink-500"];

  return (
    <>
      <div className="relative min-h-screen flex flex-col bg-gray-50">
        {/* Botones superiores */}
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-40 flex gap-4 mt-0">
          <button
            className="px-6 py-3 rounded-b-xl bg-white/30 backdrop-blur-lg text-gray-800 font-semibold shadow-md hover:bg-white/50 transition-all duration-300"
            onClick={() => setMostrarTransacciones(true)}
          >
            <div className="flex items-center gap-2">
              <FiRepeat size={20} />
              Transacciones
            </div>
          </button>
          <button
            className="px-6 py-3 rounded-b-xl bg-white/30 backdrop-blur-lg text-gray-800 font-semibold shadow-md hover:bg-white/50 transition-all duration-300"
            onClick={() => setTab("cajachica")}
          >
            <div className="flex items-center gap-2">
              <FiDollarSign size={20} />
              Caja chica
            </div>
          </button>
        </div>

        {/* Mensaje de cierre */}
        {cerrando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black text-white flex items-center justify-center text-3xl font-bold"
          >
            ¡Feliz Día!
          </motion.div>
        )}

        {/* Sidebar */}
        <AnimatePresence>
          {mostrarBarra && (
            <>
              {tab !== "" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="fixed inset-0 z-30 backdrop-blur-sm bg-black/10"
                  onClick={() => setMostrarBarra(false)}
                />
              )}
                        <motion.aside
              initial={{ x: -260, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -260, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="h-screen w-60 bg-white fixed top-0 left-0 z-40 shadow-2xl border-r border-gray-200 flex flex-col items-center justify-between"
            >
            <motion.button
                  whileTap={{ scale: 1.2 }}
                  whileHover={{ scale: 1.3 }}
                  onClick={() => setMostrarBarra(false)}
                  className="absolute top-4 -right-12 z-50 h-20 w-12 flex items-center justify-center bg-blue-100 text-blue-800 shadow rounded-r-2xl"
                >
                  <FiChevronsLeft size={28} />
                </motion.button>
                <div className="flex flex-col items-center justify-center gap-3 mt-8 w-full">
                {tabs.map((t, index) => (
                  <motion.button
                    key={t.id}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => cambiarTab(t.id)}
                    className={`w-48 flex items-center gap-3 justify-start py-2 px-4 rounded-xl font-semibold text-sm hover:bg-blue-50 transition ${
                      tab === t.id ? "bg-blue-100 text-blue-900" : "text-gray-700"
                    }`}
                  >
                    <div className={`text-xl ${colores[index % colores.length]}`}>{t.icon}</div>
                    <span className="text-sm font-medium">{t.label}</span>
                  </motion.button>
                ))}
              </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={handleLogout}
                  className="mx-auto mb-6 mt-auto flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold w-40"
                >
                  <FiLogOut />
                  <span>Salir</span>
                </motion.button>

              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Botón abrir sidebar */}
        <AnimatePresence>
          {!mostrarBarra && (
            <motion.button
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -60, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              onClick={() => setMostrarBarra(true)}
              className="fixed top-4 left-0 z-50 h-20 w-12 flex items-center justify-center bg-blue-100 text-blue-800 shadow rounded-r-2xl"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              <FiChevronsRight size={28} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Contenido principal */}
        <main className="flex-1 pt-28 px-4 md:px-6 overflow-y-auto w-full">
          <div className="w-full px-2 sm:px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab + vistaServicio}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col gap-4"
              >
                {esAdmin && tab === "personal" && <Personal usuario={usuario} />}
                {esAdmin && tab === "Liquidez" && <Contabilidad usuario={usuario} />}
                {esAdmin && tab === "VistaMovimientos" && <VistaMovimientos />}
                {esAdmin && tab === "proyectos" && <Proyectos />}
                {esAdmin && tab === "servicios" && (
                  <>
                    {vistaServicio === "principal" && <Servicios onSelect={handleSelectServicio} />}
                    {vistaServicio === "vehiculos" && <Vehiculos />}
                    {vistaServicio === "maquinaria" && <Maquinaria />}
                  </>
                )}
                {esAdmin && tab === "ventas" && (
                  <div className="text-center text-xl font-semibold">Sección de Ventas (Próximamente)</div>
                )}
                {esAdmin && tab === "existencias" && (
                  <div className="text-center text-xl font-semibold">Existencias (Próximamente)</div>
                )}
                {esAdmin && tab === "papeleria" && (
                  <div className="text-center text-xl font-semibold">Papelería (Próximamente)</div>
                )}
                {esAdmin && tab === "cajachica" && (
                  <CajaChica usuario={usuario} onCerrar={() => setTab("")} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Modal Transacciones */}
        {mostrarTransacciones && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          >
            <div className="bg-white rounded-2xl p-6 w-full max-w-5xl shadow-xl relative">
              <button
                onClick={() => {
                  setMostrarTransacciones(false);
                  setTipoTransaccion("");
                }}
                className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
              >
                ✕
              </button>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4 mt-4">
                <button
                  onClick={() => setTipoTransaccion("ingresos")}
                  className={`w-44 flex items-center justify-center gap-2 font-medium py-2 rounded-xl shadow hover:scale-105 transition ${
                    tipoTransaccion === "ingresos"
                      ? "bg-green-200 text-black font-bold"
                      : "bg-white/80 text-black"
                  }`}
                >
                  💰 Ingresos
                </button>

                <button
                  onClick={() => setTipoTransaccion("egresos")}
                  className={`w-44 flex items-center justify-center gap-2 font-medium py-2 rounded-xl shadow hover:scale-105 transition ${
                    tipoTransaccion === "egresos"
                      ? "bg-red-200 text-black font-bold"
                      : "bg-white/80 text-black"
                  }`}
                >
                  📤 Egresos
                </button>
              </div>

              <div className="mt-4">
                {tipoTransaccion === "ingresos" && (
                  <TotalIngresos proyectos={[]} ampliaciones={[]} onCerrar={() => setTipoTransaccion("")} />
                )}
                {tipoTransaccion === "egresos" && (
                  <TotalEgresos gastos={[]} onCerrar={() => setTipoTransaccion("")} />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
