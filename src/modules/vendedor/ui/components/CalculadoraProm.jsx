// src/componentes/CalculadoraProm.jsx
// Modal compacto de cálculo de promedios (kWh/mes) con PRELLENADO desde initialData.

import React, { useEffect, useMemo, useState } from "react";

export default function CalculadoraProm({ open, onApply, onClose, initialData = {} }) {
  const MESES_NOMBRES = useMemo(
    () => [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ],
    []
  );

  const MESES_ABRV = useMemo(
    () => ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    []
  );

  // --- Estado ---
  const [mesInicio, setMesInicio] = useState(0);
  const [meses, setMeses] = useState(["", "", "", "", "", ""]);
  const [precioKWh, setPrecioKWh] = useState("");
  const [preview, setPreview] = useState({ mensual: 0, diario: 0 });

  /* ========= PRELLENADO desde initialData ========= */
  useEffect(() => {
    if (!open) return;

    // 1) mes_inicio puede venir como índice (0–11) o nombre ("Enero")
    let mi = 0;
    const miRaw = initialData.mes_inicio;
    if (typeof miRaw === "number" && miRaw >= 0 && miRaw <= 11) {
      mi = miRaw;
    } else if (typeof miRaw === "string" && miRaw.trim()) {
      const idx = MESES_NOMBRES.findIndex(
        (n) => n.toLowerCase() === miRaw.trim().toLowerCase()
      );
      mi = idx >= 0 ? idx : 0;
    }
    setMesInicio(mi);

    // 2) meses: puede venir array numérico/string; limitamos a 12
    let mesesArr = Array.isArray(initialData.meses) ? [...initialData.meses] : [];
    mesesArr = mesesArr
      .slice(0, 12)
      .map((v) => (v === null || v === undefined ? "" : String(v)));

    // Si no hay array pero hay n_meses, creamos placeholders
    const n = Number(initialData.n_meses) || mesesArr.length || 6;
    if (mesesArr.length < n) {
      mesesArr = [...mesesArr, ...Array(n - mesesArr.length).fill("")];
    }
    if (mesesArr.length === 0) mesesArr = ["", "", "", "", "", ""];

    setMeses(mesesArr);

    // 3) precio kWh
    if (initialData.precioKWh || initialData.precio_kwh) {
      setPrecioKWh(String(initialData.precioKWh ?? initialData.precio_kwh));
    }
  }, [open, initialData, MESES_NOMBRES]);

  // Helpers UI
  const abrvMesPorIndice = (i) => MESES_ABRV[(mesInicio + i) % 12];
  const actualizarMes = (idx, val) =>
    setMeses((prev) => prev.map((m, i) => (i === idx ? val : m)));
  const agregarMes = () => {
    if (meses.length < 12) setMeses((prev) => [...prev, ""]);
  };

  // Recalcular promedios
  useEffect(() => {
    const n = Math.max(1, meses.length);
    const valores = meses.map((m) => Number(String(m).replace(",", ".")) || 0);
    const suma = valores.reduce((a, b) => a + b, 0);
    const promedioMensual = suma / n;
    const promedioDiario = promedioMensual / 30;
    setPreview({ mensual: promedioMensual, diario: promedioDiario });
  }, [meses, precioKWh, mesInicio]);

  // Devolver resultados al padre
  const aplicar = () => {
    const { diario, mensual } = preview;
    const p = Number(String(precioKWh).replace(",", ".")) || 0;
    onApply?.({
      kwDia: diario ? diario.toFixed(2) : "",
      precioKWh: p ? p.toFixed(2) : "",
      promedioKW: mensual ? mensual.toFixed(2) : "",
      // devolvemos también el bloque para futuras aperturas
      mes_inicio: mesInicio,
      n_meses: meses.length,
      meses: meses,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-[61] w-[95%] max-w-md rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl p-4 shadow-2xl text-white max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-white/10 pb-2">
          <h3 className="text-base font-semibold">Promedios de consumo</h3>
          <p className="text-xs text-white/70">
            Ingresa los <strong>kWh/mes</strong> y el <strong>precio por kWh</strong>.
          </p>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 overflow-y-auto hide-scrollbar pt-3">
          {/* Mes de inicio */}
          <div className="mb-2">
            <label className="block text-[11px] text-white/80 mb-1">Mes de inicio</label>
            <div className="rounded-lg border border-white/10 bg-white/10">
              <select
                value={mesInicio}
                onChange={(e) => setMesInicio(Number(e.target.value))}
                className="w-full bg-transparent px-2 py-1 text-sm focus:outline-none"
              >
                {MESES_NOMBRES.map((m, i) => (
                  <option key={m} value={i} className="bg-[#0b1320]">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Inputs de meses compactos */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 mt-2">
            {meses.map((v, i) => (
              <div key={i}>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={v}
                  onChange={(e) => actualizarMes(i, e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-md text-center text-[11px] h-6 placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-cyan-400/70"
                  placeholder={abrvMesPorIndice(i)}
                  aria-label={abrvMesPorIndice(i)}
                />
              </div>
            ))}
          </div>

          {/* Botones */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={agregarMes}
              disabled={meses.length >= 12}
              className="rounded-md px-2 py-1 text-[11px] border border-white/10 bg-white/10 hover:bg-white/15 disabled:opacity-50"
            >
              + Mes ({meses.length}/12)
            </button>
            <span className="text-[10px] text-white/60">Recalcula automáticamente</span>
          </div>

          {/* Precio por kWh */}
          <div className="mt-3">
            <label className="block text-[11px] text-white/80 mb-1">Precio por kWh (Q)</label>
            <div className="relative rounded-lg border border-white/10 bg-white/10">
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={precioKWh}
                onChange={(e) => setPrecioKWh(e.target.value)}
                className="w-full bg-transparent px-3 py-1.5 text-sm placeholder-white/60 focus:outline-none pr-10"
                placeholder="1.65"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded border border-white/10 bg-white/10">
                Q/kWh
              </span>
            </div>
          </div>

          {/* Preview compacto */}
          <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-2 text-[12px] space-y-1">
            <div className="flex justify-between">
              <span className="text-white/70">Promedio mensual</span>
              <span>{preview.mensual.toFixed(2)} kWh/mes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Promedio diario</span>
              <span>{preview.diario.toFixed(2)} kWh/día</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex justify-end gap-2 mt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm border border-white/10 bg-white/10 hover:bg-white/15"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={aplicar}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-white border border-white/10 bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400"
          >
            Usar promedios
          </button>
        </div>
      </div>
    </div>
  );
}
