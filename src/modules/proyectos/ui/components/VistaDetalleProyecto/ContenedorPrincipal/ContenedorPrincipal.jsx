// src/componentes/Proyectos/VistaDetalleProyecto/ContenedorPrincipal/ContenedorPrincipal.jsx
import React, { useMemo, useState } from "react";
import Resumen from "../Resumen/Resumen";
import Produccion from "../Produccion/Produccion";
import Planilla from "../Planilla/Planilla";
import CajaChica from "../CajaChica/CajaChica";
import EncabezadoProyecto from "./EncabezadoProyecto";
import SelectorQuincenas from "./SelectorQuincenas";
import ResumenGeneral from "../ResumenGeneral/ResumenGeneral";

const TABS = ["Resumen", "Producción", "Planilla", "Caja Chica"];

export default function ContenedorPrincipal({
  proyecto = {},
  trabajos = [],
  onVolver = () => {}
}) {
  const [tabActiva, setTabActiva] = useState("Resumen");
  const [quincenas, setQuincenas] = useState([]);
  const [fechasQuincenas, setFechasQuincenas] = useState([]);
  const [quincenaActivaIdx, setQuincenaActivaIdx] = useState(null);

  const [mostrarInicio, setMostrarInicio] = useState(false);
  const [mesInicio, setMesInicio] = useState("");
  const [mitad, setMitad] = useState("primera");

  const fmtDMY = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };
  const formatearRango = (r) => (r?.inicio && r?.fin ? `${fmtDMY(r.inicio)} al ${fmtDMY(r.fin)}` : null);

  const rangoSeleccionado = useMemo(
    () => (quincenaActivaIdx === null ? null : fechasQuincenas[quincenaActivaIdx] || null),
    [quincenaActivaIdx, fechasQuincenas]
  );

  const cambiarQuincenaIdx = (idxOrNull) => {
    setQuincenaActivaIdx(idxOrNull);
    if (idxOrNull !== null) setTabActiva("Resumen");
  };

  const agregarQuincena = () => setMostrarInicio(true);

  const confirmarInicioQuincena = () => {
    if (!mesInicio) { alert("Selecciona el mes."); return; }
    const [anio, mes] = mesInicio.split("-").map(Number);
    const mm = String(mes).padStart(2, "0");

    const inicio = mitad === "primera" ? `${anio}-${mm}-01` : `${anio}-${mm}-16`;
    const fin    = mitad === "primera" ? `${anio}-${mm}-15` : `${anio}-${mm}-${new Date(anio, mes, 0).getDate()}`;

    const yaPrimera = fechasQuincenas.some((q) => q.inicio === `${anio}-${mm}-01`);
    const yaSegunda = fechasQuincenas.some((q) => q.inicio === `${anio}-${mm}-16`);
    if ((mitad === "primera" && yaPrimera) || (mitad === "segunda" && yaSegunda)) {
      alert("Ya existe esa quincena para ese mes.");
      return;
    }

    const nombre = mitad === "primera" ? "1ra. Quincena" : "2da. Quincena";
    const newIndex = quincenas.length;

    setQuincenas((prev) => [...prev, nombre]);
    setFechasQuincenas((prev) => [...prev, { inicio, fin }]);

    setMostrarInicio(false);
    setMesInicio(""); setMitad("primera");

    setQuincenaActivaIdx(newIndex);
    setTabActiva("Resumen");
  };

  return (
    // ⬇️ Full width: sin max-w, sin card, paddings ligeros y responsivos
    <div className="w-full max-w-none mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-10">
      {/* Modal crear quincena */}
      {mostrarInicio && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-5 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Iniciar quincena</h3>

            <label className="block text-sm text-slate-700 mb-1">Mes</label>
            <input
              type="month"
              className="w-full border rounded-md px-3 py-2 mb-3"
              value={mesInicio}
              onChange={(e) => setMesInicio(e.target.value)}
            />

            <div className="flex items-center gap-6 mb-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="mitad" value="primera" checked={mitad === "primera"} onChange={(e) => setMitad(e.target.value)} />
                1ra (1–15)
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="mitad" value="segunda" checked={mitad === "segunda"} onChange={(e) => setMitad(e.target.value)} />
                2da (16–fin)
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button className="px-3 py-1.5 rounded-md bg-slate-200 text-slate-800 hover:bg-slate-300 font-semibold" onClick={() => setMostrarInicio(false)}>
                Cancelar
              </button>
              <button className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-semibold" onClick={confirmarInicioQuincena}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Encabezado del proyecto */}
      <EncabezadoProyecto
        proyecto={proyecto}
        fechas={fechasQuincenas}
        quincenaActiva={quincenaActivaIdx !== null ? quincenas[quincenaActivaIdx] : null}
        quincenas={quincenas}
      />

      {/* Botones superiores */}
      <div className="flex justify-center items-center gap-3 mb-4">
        <button
          onClick={() => { setTabActiva("Resumen"); cambiarQuincenaIdx(null); }}
          className={`h-10 px-4 py-2 text-sm font-medium shadow transition flex items-center rounded-none ${
            quincenaActivaIdx === null
              ? "bg-white text-blue-900 border border-blue-900"
              : "border border-blue-900 text-blue-900 hover:bg-blue-100"
          }`}
        >
          Resumen General
        </button>

        {quincenas.length > 0 ? (
          <SelectorQuincenas
            quincenas={quincenas}
            activeIndex={quincenaActivaIdx}
            onSelectIndex={cambiarQuincenaIdx}
            agregarQuincena={agregarQuincena}
          />
        ) : (
          <button
            onClick={agregarQuincena}
            aria-label="Agregar quincena"
            className="h-10 w-10 rounded-none bg-green-600 text-white hover:bg-green-700 shadow flex items-center justify-center text-xl"
          >
            +
          </button>
        )}
      </div>

      {/* Tabs */}
      {quincenaActivaIdx !== null && (
        <div className="flex justify-center gap-2 my-4 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setTabActiva(tab)}
              className={`px-4 py-2 text-sm font-semibold transition shadow rounded-none ${
                tabActiva === tab ? "bg-blue-900 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Contenido (full-bleed, sin card que limite) */}
      <div className="pb-4">
        {quincenaActivaIdx === null ? (
          <ResumenGeneral trabajos={trabajos} />
        ) : (
          <>
            {tabActiva === "Resumen" && <Resumen quincena={formatearRango(rangoSeleccionado)} />}
            {tabActiva === "Producción" && (
              <Produccion rango={quincenaActivaIdx !== null ? fechasQuincenas[quincenaActivaIdx] : null} />
            )}
            {tabActiva === "Planilla" && (
              <Planilla
                quincenaSeleccionada={quincenaActivaIdx !== null ? quincenas[quincenaActivaIdx] : null}
                onCambiarQuincena={(q) => {
                  const idx = quincenas.findIndex((x) => x === q);
                  cambiarQuincenaIdx(idx >= 0 ? idx : null);
                }}
              />
            )}
            {tabActiva === "Caja Chica" && (
              <CajaChica quincenaSeleccionada={quincenaActivaIdx !== null ? quincenas[quincenaActivaIdx] : null} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
