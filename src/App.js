// App.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiDollarSign, FiFolder, FiTool,
  FiRepeat, FiBox, FiLogOut, FiChevronsLeft,
  FiChevronsRight
} from 'react-icons/fi';

import Login from './Login';
import Personal from './componentes/personal/Personal';
import Contabilidad from './componentes/contabilidad/Contabilidad';
import VistaMovimientos from './componentes/VistaMovimientos';
import Servicios from './componentes/Servicios/Servicios';
import Proyectos from './componentes/Proyectos/Proyectos';
import Vehiculos from './componentes/Servicios/vehiculos';
import Maquinaria from './componentes/Servicios/maquinaria';
import CajaChica from './componentes/contabilidad/CajaChica';
import ReportarAsistencia from './componentes/personal/ReportarAsistencia';
import { guardarLog } from './utils';
import TotalIngresos from "./componentes/contabilidad/TotalIngresos";
import TotalEgresos from "./componentes/contabilidad/TotalEgresos";
import Categorias from "./componentes/contabilidad/Categorias"; // ajustá la ruta si es distinta

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
  const isMobile = useIsMobile();
  const [mostrarTransacciones, setMostrarTransacciones] = useState(false);
  const [tipoTransaccion, setTipoTransaccion] = useState(""); // "ingresos" | "egresos"

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
    { id: "VistaMovimientos", label: "Movimientos", icon: <FiRepeat size={40} /> },
    { id: "papeleria", label: "Papelería", icon: <FiFolder size={40} /> },
    { id: "personal", label: "R.R.H.H.", icon: <FiUsers size={40} /> },
    { id: "servicios", label: "Servicios", icon: <FiTool size={40} /> },
    { id: "existencias", label: "Existencias", icon: <FiBox size={40} /> },
    { id: "ventas", label: "Ventas", icon: <FiDollarSign size={40} /> },
    { id: "proyectos", label: "Proyectos", icon: <FiFolder size={40} /> },
    { id: "Liquidez", label: "Finanzas", icon: <FiDollarSign size={40} /> },
  ];

  return (
    <>
      {/* Fondo fijo que no se distorsiona */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/fondo.png')" }}
      />

      <div className="relative min-h-screen flex flex-col">
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

        {cerrando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black text-white flex items-center justify-center text-3xl font-bold"
          >
            ¡Feliz Día!
          </motion.div>
        )}

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
                className="h-screen bg-white/30 backdrop-blur-xl shadow-xl fixed top-0 left-0 z-40 flex flex-col w-60"
              >
                <motion.button
                  whileTap={{ scale: 1.5 }}
                  whileHover={{ scale: 1.9 }}
                  onClick={() => setMostrarBarra(false)}
                  className="absolute top-4 -right-12 z-50 h-20 w-12 flex items-center justify-center bg-white/30 backdrop-blur-xl shadow-xl rounded-l-none rounded-r-2xl text-gray-700 hover:bg-white/40 transition-transform duration-300"
                >
                  <FiChevronsLeft size={40} />
                </motion.button>

                <div className="flex items-center justify-between p-4 pb-2">
                  <span className="text-lg font-semibold text-gray-700">Menú</span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={handleLogout}
                  className="mx-4 mb-4 w-[85%] flex items-center gap-2 py-2 px-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold justify-center"
                >
                  <FiLogOut className="text-lg" />
                  <span>Cerrar Sesión</span>
                </motion.button>

                <div className="flex-1 flex flex-col items-start justify-center gap-3 px-4">
                  {tabs.map((t) => (
                    <motion.button
                      key={t.id}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.03 }}
                      onClick={() => cambiarTab(t.id)}
                      className={`flex items-center gap-2 py-2 px-3 rounded-xl text-sm md:text-base whitespace-nowrap w-full ${
                        tab === t.id ? "bg-gray-900 text-white font-bold" : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                      }`}
                    >
                      {t.icon}
                      <span className="text-lg md:text-xl font-semibold">{t.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!mostrarBarra && (
            <motion.button
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -60, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              onClick={() => setMostrarBarra(true)}
              className="fixed top-4 left-0 z-50 h-20 w-12 flex items-center justify-center bg-white/30 backdrop-blur-xl shadow-xl rounded-l-none rounded-r-2xl text-gray-700 hover:bg-white/40 transition-transform duration-300"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              <FiChevronsRight size={40} />
            </motion.button>
          )}
        </AnimatePresence>

        <main className="flex-1 pt-28 px-4 md:px-6 overflow-y-auto transition-all duration-500">
          <div className={`${tab !== "" ? "bg-white/40 backdrop-blur-lg shadow-2xl" : ""} rounded-2xl p-6 max-w-6xl mx-auto`}>
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
                {esAdmin && tab === "transacciones" && (
                  <div className="text-center text-xl font-semibold">
                    Sección de Transacciones (Próximamente)
                    <span className="text-sm block mt-2 text-gray-600">
                      Aquí se mostrarán todos los movimientos y se podrá ingresar un egreso o ingreso.
                    </span>
                  </div>
                )}
                {esAdmin && tab === "cajachica" && (
                  <CajaChica usuario={usuario} onCerrar={() => setTab("")} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        {/* MODAL DE TRANSACCIONES */}
            {mostrarTransacciones && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center px-4"
              >
                <div className="bg-white rounded-2xl p-6 w-full max-w-5xl shadow-xl relative">
                  {/* Botón de cerrar */}
                  <button
                    onClick={() => {
                      setMostrarTransacciones(false);
                      setTipoTransaccion("");
                    }}
                    className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
                  >
                    ✕
                  </button>

                  {/* Botones de Ingresos y Egresos */}
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

                  {/* Contenido del formulario */}
                  <div className="mt-4">
                    {tipoTransaccion === "ingresos" && (
                      <TotalIngresos
                        ampliaciones={[
                          {
                            id: 1,
                            proyecto_id: 1,
                            documento: "DOC-001",
                            medio: "transferencia",
                            fecha: "2025-06-10",
                            monto: 4500,
                          },
                        ]}
                        proyectos={[{ id: 1, nombre: "Proyecto Solar A" }]}
                        onCerrar={() => setTipoTransaccion("")}
                      />
                    )}
                    {tipoTransaccion === "egresos" && (
                      <TotalEgresos
                        gastos={[
                          {
                            id: 1,
                            fecha: "2025-06-12",
                            monto: 3800,
                            concepto: "Compra de materiales",
                            categoria: "Materiales",
                            autorizacion: "AUT-045",
                          },
                        ]}
                        onCerrar={() => setTipoTransaccion("")}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
      </div>
    </>
  );
}
