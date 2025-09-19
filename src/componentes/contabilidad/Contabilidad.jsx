// Archivo: Contabilidad.jsx
import { useState, useEffect } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiBarChart2,
  FiSettings,
  FiTrendingUp,
  FiDollarSign,
  FiRepeat,
  FiFileText,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// Componentes importados
import TotalIngresos from "./TotalIngresos";
import TotalEgresos from "./TotalEgresos";
import GestionCategorias from "./Categorias";
import AsignacionDeCajaChica from "./AsignacionDeCajaChica";
import Facturas from "./Facturas";

export default function Contabilidad() {
  // Estados principales para mostrar vistas y secciones
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [mostrarTransacciones, setMostrarTransacciones] = useState(false);
  const [vistaActual, setVistaActual] = useState("");
  const [mostrarCategorias, setMostrarCategorias] = useState(false);

  // 🔹 Estado para sub-vista de Facturas
  const [vistaFacturas, setVistaFacturas] = useState(""); // "porCobrar" | "cobradas" | ""

  // Oculta categorías al cambiar de vista
  useEffect(() => {
    setMostrarCategorias(false);
    // Al salir de "facturas" resetea su subvista
    if (vistaActual !== "facturas") setVistaFacturas("");
  }, [vistaActual]);

  // Datos para resumen de utilidades
  const datos = [
    {
      titulo: "Utilidad Bruta",
      valor: 35000,
      porcentaje: 70,
      icono: <FiBarChart2 size={20} className="text-green-600" />,
    },
    {
      titulo: "Utilidad Operativa",
      valor: 20000,
      porcentaje: 50,
      icono: <FiSettings size={20} className="text-green-600" />,
    },
    {
      titulo: "Utilidad Neta",
      valor: 15000,
      porcentaje: 35,
      icono: <FiTrendingUp size={20} className="text-green-600" />,
    },
  ];

  // Información del dinero líquido
  const dineroLiquido = {
    titulo: "Dinero Líquido",
    valor: 12000,
    porcentaje: 80,
    icono: <FiDollarSign size={24} className="text-green-700 mx-auto mb-1" />,
  };

  return (
    <div className="relative w-full px-4 py-8">
      <div className="relative max-w-6xl mx-auto bg-white/50 backdrop-blur-md shadow-xl rounded-b-3xl pt-2">
        {/* Botón toggle resumen */}
        <div className="flex justify-center -translate-y-6">
          <button
            onClick={() => setMostrarResumen(!mostrarResumen)}
            className="w-14 h-14 bg-neutral-800 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition"
          >
            {mostrarResumen ? <FiChevronUp size={28} /> : <FiChevronDown size={28} />}
          </button>
        </div>

        {/* Resumen financiero animado */}
        <AnimatePresence>
          {mostrarResumen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col lg:flex-row justify-center items-center gap-6 p-6"
            >
              <div className="flex flex-col gap-4 w-full lg:w-2/3">
                {datos.map((dato, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white shadow-md"
                  >
                    <div className="w-6">{dato.icono}</div>
                    <span className="w-40 font-semibold text-gray-700">{dato.titulo}</span>
                    <span className="w-28 font-bold text-green-700">
                      Q. {dato.valor.toLocaleString()}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full"
                        style={{ width: `${dato.porcentaje}%` }}
                      ></div>
                    </div>
                    <span className="w-12 text-sm font-semibold text-gray-700 text-right">
                      {dato.porcentaje}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Dinero líquido */}
              <div className="w-full lg:w-1/3 flex justify-center items-center">
                <div className="w-full max-w-xs bg-green-100 border border-green-600 rounded-2xl shadow-md p-4 text-center">
                  <div>{dineroLiquido.icono}</div>
                  <h3 className="font-semibold text-green-800 mb-1">{dineroLiquido.titulo}</h3>
                  <p className="text-2xl font-bold text-green-700 mb-4">
                    Q. {dineroLiquido.valor.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full"
                        style={{ width: `${dineroLiquido.porcentaje}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {dineroLiquido.porcentaje}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navegación principal */}
      <div className="max-w-6xl mx-auto mt-6 px-4">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={() => {
              setMostrarTransacciones(true);
              setVistaActual("");
              setMostrarCategorias(false);
            }}
            className={`w-44 flex items-center justify-center gap-2 py-2 rounded-xl shadow hover:scale-105 transition ${
              mostrarTransacciones ? "bg-white border border-black font-semibold" : "bg-white/70"
            }`}
          >
            <FiRepeat size={18} />
            Transacciones
          </button>

          <button
            onClick={() => setVistaActual("caja")} // 🔹 Cambia la vista al componente de Caja chica
            className="w-44 flex items-center justify-center gap-2 bg-white/70 text-black font-medium py-2 rounded-xl shadow hover:scale-105 transition"
          >
            <FiDollarSign size={18} />
            Caja chica
          </button>

          {/* 🔹 Botón Facturas: abre submenú (por cobrar / cobradas) */}
          <button
            onClick={() => {
              setVistaActual("facturas");
              setVistaFacturas(""); // reinicia la subvista
              setMostrarTransacciones(false);
              setMostrarCategorias(false);
            }}
            className="w-44 flex items-center justify-center gap-2 bg-white/70 text-black font-medium py-2 rounded-xl shadow hover:scale-105 transition"
          >
            <FiFileText size={18} />
            Facturas
          </button>
        </div>

        {/* Submenú Ingresos y Egresos */}
        {mostrarTransacciones && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4">
            <button
              onClick={() => setVistaActual("ingresos")}
              className={`w-44 flex items-center justify-center gap-2 font-medium py-2 rounded-b-xl shadow hover:scale-105 transition ${
                vistaActual === "ingresos" ? "bg-white text-black font-bold" : "bg-white/80 text-black"
              }`}
            >
              <FiDollarSign size={18} />
              Ingresos
            </button>

            <button
              onClick={() => setVistaActual("egresos")}
              className={`w-44 flex items-center justify-center gap-2 font-medium py-2 rounded-b-xl shadow hover:scale-105 transition ${
                vistaActual === "egresos" ? "bg-white text-black font-bold" : "bg-white/80 text-black"
              }`}
            >
              <FiFileText size={18} />
              Egresos
            </button>
          </div>
        )}

        {/* 🔹 Submenú de Facturas: Cuentas por Cobrar / Cuentas Cobradas */}
        {vistaActual === "facturas" && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4">
            <button
              onClick={() => setVistaFacturas("porCobrar")}
              className={`w-44 flex items-center justify-center gap-2 font-medium py-2 rounded-b-xl shadow hover:scale-105 transition ${
                vistaFacturas === "porCobrar" ? "bg-white text-black font-bold" : "bg-white/80 text-black"
              }`}
            >
              <FiFileText size={18} />
              Cuentas por Cobrar
            </button>
            <button
              onClick={() => setVistaFacturas("cobradas")}
              className={`w-44 flex items-center justify-center gap-2 font-medium py-2 rounded-b-xl shadow hover:scale-105 transition ${
                vistaFacturas === "cobradas" ? "bg-white text-black font-bold" : "bg-white/80 text-black"
              }`}
            >
              <FiTrendingUp size={18} />
              Cuentas Cobradas
            </button>
          </div>
        )}

        {/* Botón Categorías estilizado con animación (oculto en Facturas) */}
        <AnimatePresence>
          {vistaActual && vistaActual !== "facturas" && (
            <motion.div
              key="boton-categorias"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="flex justify-center mt-2 mb-4"
            >
              <button
                onClick={() => setMostrarCategorias(!mostrarCategorias)}
                className="w-40 h-10 bg-neutral-800 text-white rounded-md shadow hover:scale-105 transition font-semibold"
              >
                Categorías
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vistas principales */}
        {vistaActual === "caja" && <AsignacionDeCajaChica />}

        {/* Vista de ingresos */}
        {vistaActual === "ingresos" && (
          <>
            {mostrarCategorias && (
              <div className="mt-4">
                <GestionCategorias tipo="ingreso" />
              </div>
            )}
            <TotalIngresos onCerrar={() => setVistaActual("")} />
          </>
        )}

        {/* Vista de egresos */}
        {vistaActual === "egresos" && (
          <>
            {mostrarCategorias && (
              <div className="mt-4">
                <GestionCategorias tipo="egreso" />
              </div>
            )}
            <TotalEgresos onCerrar={() => setVistaActual("")} />
          </>
        )}

        {/* 🔹 Render de sub-vistas de Facturas */}
        {vistaActual === "facturas" && (
          <div className="mt-4">
            {vistaFacturas === "porCobrar" && <Facturas />}
            {vistaFacturas === "cobradas" && (
              <div className="mt-4 p-6 bg-white shadow rounded-md text-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Aquí irán las Cuentas Cobradas
                </h2>
                <p className="text-gray-600 mt-2">
                  (Puedes crear un componente <strong>FacturasCobradas.jsx</strong> y renderizarlo aquí cuando esté listo.)
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
