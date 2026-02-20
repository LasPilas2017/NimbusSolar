// src/componentes/FormMisCotizaciones.jsx
// Búsqueda Supabase por nombre/empresa + Calculadora + Guía de paneles + Selector de sistema.
// Abre CalculadoraProm con el último consumo del cliente.
// AHORA: Soporta modo "editar" con prefill y UPDATE a cotizaciones_aprobacion.

import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import supabase from "../../../../supabase.js";
import CalculadoraProm from "./CalculadoraProm";
import FormCotizacionCliente from "./FormCotizacionCliente";

/* =================== Constantes =================== */
const TABLE_BASE = "cotizaciones_aprobacion";

/* ========== Sub-componentes UI compactos ========== */
function InputCalcCompact({ value, suffix, placeholder = "", disabled = false, className = "" }) {
  const hasSuffix = Boolean(suffix);
  return (
    <div
      className={[
        "relative rounded-xl border border-white/10 bg-white/10 text-white focus-within:ring-2 focus-within:ring-cyan-400/60",
        disabled ? "cursor-not-allowed" : "",
        className,
      ].join(" ")}
    >
      <input
        readOnly
        disabled={disabled}
        value={value}
        placeholder={placeholder}
        className={[
          "w-full bg-transparent px-4 text-xs placeholder-white/60 focus:outline-none text-center",
          "h-10",
          hasSuffix ? "pr-14" : "",
        ].join(" ")}
      />
      {hasSuffix && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] px-2.5 py-0.5 rounded-lg border border-white/10 bg-white/10 text-white/80">
          {suffix}
        </span>
      )}
    </div>
  );
}

function SelectSistema({
  opciones = [],
  value,
  onChange,
  placeholder = "Seleccionar…",
  disabled,
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  // cerrar el dropdown al hacer click fuera
  React.useEffect(() => {
    function handleOutside(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const selected = React.useMemo(() => {
    const found = opciones.find((o) => String(o.id) === String(value));
    return found?.nombre || "";
  }, [opciones, value]);

  function onKeyDown(e) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((v) => !v);
    }
    if (e.key === "Escape") setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        className={[
          "w-full h-11 rounded-xl border px-3 pr-9 text-left text-sm",
          "bg-white/10 border-white/10 text-white",
          "focus:outline-none focus:ring-2 focus:ring-emerald-400/60",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        ].join(" ")}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? "text-white" : "text-white/60"}>
          {selected || placeholder}
        </span>
        <svg
          className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 transition ${
            open ? "rotate-180 text-emerald-200" : "text-white/70"
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute z-30 mt-2 w-full max-h-60 overflow-auto rounded-xl
                     border border-white/10 bg-[#0b1320]/95 backdrop-blur shadow-2xl"
        >
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-white/60 hover:bg-white/10"
          >
            {placeholder}
          </button>

          {opciones.map((op) => {
            const active = String(op.id) === String(value);
            return (
              <button
                key={op.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(op.id);
                  setOpen(false);
                }}
                className={[
                  "w-full text-left px-3 py-2 text-sm transition",
                  active
                    ? "bg-emerald-400/15 text-emerald-200"
                    : "text-white/90 hover:bg-white/10",
                ].join(" ")}
              >
                {op.nombre}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ========== Componente principal ========== */
export default function FormMisCotizaciones({
  onCancel,
  onSuccess,
  modo = "nuevo", // "nuevo" | "editar"
  cotizacionId = null, // uuid cuando modo="editar"
  prefill = null, // objeto con datos pre-cargados
  user, // 👈 usuario logueado (vendedor)
}) {
  // ================== DATOS DEL VENDEDOR DESDE user ==================
  // Se calculan una sola vez y se usan en todo el componente
  const vendedorId =
    user?.id != null ? String(user.id) : null;

  const vendedorNombre =
    user?.nombreCompleto ??
    user?.nombre ??
    user?.usuario ??
    null;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 15);
    return () => clearTimeout(t);
  }, []);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const estadoFijo = "solicitadas";

  // ===== búsqueda cliente =====
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [clienteSel, setClienteSel] = useState(null); // {id, nombre}
  const [sugerencias, setSugerencias] = useState([]);
  const [cargandoSug, setCargandoSug] = useState(false);
  const [readyCotizacion, setReadyCotizacion] = useState(false);
  const [readyMsg, setReadyMsg] = useState("");

  // ===== sistemas =====
  const [sistemas, setSistemas] = useState([]);
  const [sistemaSel, setSistemaSel] = useState("");
  const [cargandoSistemas, setCargandoSistemas] = useState(true);

  // ===== cálculos y consumo =====
  const [calc, setCalc] = useState({
    kwDia: "",
    precioKWh: "",
    promedioKW: "",
  });
  const [consumoInit, setConsumoInit] = useState({
    mes_inicio: null,
    n_meses: 0,
    meses: [],
    precioKWh: "",
  });
  const [cargandoConsumo, setCargandoConsumo] = useState(false);

  // ===== calculadora =====
  const [openCalc, setOpenCalc] = useState(false);
  const [savingProm, setSavingProm] = useState(false);
  const [, setSavedMessage] = useState(false);

  // ===== código de cotización (solo para modo editar) =====
  const [codigoCot, setCodigoCot] = useState("");

  /* ======== MONTAJE INICIAL DE PREFILL (modo editar) ======== */
  useEffect(() => {
    let cancel = false;

    async function fetchIfNeeded() {
      if (modo !== "editar") return;

      // si no viene prefill desde el padre, leo el registro directo de Supabase
      if (!prefill && cotizacionId) {
        const { data, error } = await supabase
          .from(TABLE_BASE)
          .select(
            `
            id, codigo, estado, created_at, updated_at,
            cliente_id, sistema_id, kw_dia, kwh_dia, kwh_mes, q_kwh
          `
          )
          .eq("id", cotizacionId)
          .maybeSingle();

        if (error) {
          console.error("prefill.fetch", error);
        } else if (!cancel && data) {
          aplicarPrefill(normalizarPrefill(data));
        }
      } else if (prefill) {
        // si el padre ya manda un prefill armado (HistorialCotCliente) lo uso directo
        aplicarPrefill(normalizarPrefill(prefill));
      }
    }

    fetchIfNeeded();
    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo, cotizacionId, prefill]);

  // normaliza el objeto que viene directo de Supabase/prefill
  function normalizarPrefill(d) {
    const cliName =
      d?.cliente?.nombre ||
      d?.clientes?.nombre_completo ||
      d?.clientes?.empresa ||
      "";
    return {
      id: d?.id,
      codigo: d?.codigo || "",
      estado: (d?.estado || "").toLowerCase(),
      cliente:
        d?.cliente ||
        (d?.clientes ? { id: d.clientes.id, nombre: cliName } : null),
      cliente_id: d?.cliente_id || d?.cliente?.id || d?.clientes?.id || null,
      sistema_id:
        d?.sistema_id || d?.sistema?.id || d?.sistemas_solares?.id || "",
      sistema:
        d?.sistema ||
        (d?.sistemas_solares
          ? { id: d.sistemas_solares.id, nombre: d.sistemas_solares.nombre }
          : null),
      // kw_dia en tu tabla es numérico; kwh_dia/kwh_mes/q_kwh por compatibilidad vieja
      kwh_dia: d?.kw_dia ?? d?.kwh_dia ?? "",
      kwh_mes: d?.kwh_mes ?? "",
      q_kwh: d?.q_kwh ?? "",
    };
  }

  // aplica el prefill a los estados locales del formulario
  function aplicarPrefill(p) {
    if (!p) return;

    const nombre = p.cliente?.nombre || "";
    const clienteObj = p.cliente_id
      ? { id: p.cliente_id, nombre }
      : p.cliente
      ? { id: p.cliente.id, nombre }
      : null;

    setClienteSel(clienteObj);
    setQ(nombre || "");
    setSistemaSel(p.sistema_id || "");
    setCalc({
      kwDia: p.kwh_dia ?? "",
      promedioKW: p.kwh_mes ?? "",
      precioKWh: p.q_kwh ?? "",
    });
    setCodigoCot(p.codigo || ""); // guardamos el código de esa cotización
  }

  // Debounce de búsqueda del cliente
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  // Buscar clientes según texto ingresado
  useEffect(() => {
    let cancelado = false;

    async function fetchSugerencias() {
      setCargandoSug(true);
      try {
        // si no hay texto, traigo un listado corto general
        if (!qDebounced.trim()) {
          const { data, error } = await supabase
            .from("clientes")
            .select("id, nombre_completo, empresa")
            .order("nombre_completo", { ascending: true })
            .limit(8);
          if (error) throw error;
          if (!cancelado) setSugerencias(data || []);
          return;
        }

        const safe = qDebounced.trim().replace(/[,()]/g, " ");
        const orFilter = `nombre_completo.ilike.*${safe}*,empresa.ilike.*${safe}*`;
        const { data, error } = await supabase
          .from("clientes")
          .select("id, nombre_completo, empresa")
          .or(orFilter)
          .order("nombre_completo", { ascending: true })
          .limit(12);
        if (error) throw error;
        if (!cancelado) setSugerencias(data || []);
      } catch (err) {
        console.error("Busqueda clientes:", err?.message || err);
        if (!cancelado) setSugerencias([]);
      } finally {
        if (!cancelado) setCargandoSug(false);
      }
    }

    fetchSugerencias();
    return () => {
      cancelado = true;
    };
  }, [qDebounced]);

  const displayName = (r) =>
    (r?.nombre_completo?.trim() || r?.empresa?.trim() || "").trim();

  const verificarListoCotizacion = async (clienteId) => {
    setReadyCotizacion(false);
    setReadyMsg("");
    if (!clienteId) return;
    try {
      const { data, error } = await supabase
        .from("llamadas")
        .select("tipo_gestion")
        .eq("cliente_id", clienteId)
        .order("fecha_hora", { ascending: false })
        .limit(1);
      if (error) throw error;
      const ultima = data?.[0]?.tipo_gestion || "";
      const ok = ultima.toLowerCase() === "cotización";
      setReadyCotizacion(ok);
      setReadyMsg(
        ok
          ? "Cliente listo para cotización (última gestión: Cotización)."
          : "El cliente no está listo para cotización (asigna gestión 'Cotización' en Llamadas)."
      );
    } catch (e) {
      console.error("verificar listo cotizacion:", e);
      setReadyMsg("No se pudo verificar el estado del cliente para cotizar.");
      setReadyCotizacion(false);
    }
  };

  const seleccionarCliente = (r) => {
    const nombre = displayName(r);
    setClienteSel({ id: r.id, nombre });
    setQ(nombre);
    verificarListoCotizacion(r.id);
  };

  // código generado tipo "CLI-001" (solo para nuevas)
  const codigoCliente = useMemo(() => {
    if (!clienteSel) return "";
    const idStr = String(clienteSel.id || "");
    const num = Number(idStr);
    if (Number.isFinite(num)) return `CLI-${String(num).padStart(3, "0")}`;
    return `CLI-${idStr.slice(0, 6).toUpperCase()}`;
  }, [clienteSel]);

  /* ===== cargar sistemas ===== */
  useEffect(() => {
    (async () => {
      try {
        setCargandoSistemas(true);
        const { data, error } = await supabase
          .from("sistemas_solares")
          .select("id, nombre")
          .order("nombre", { ascending: true });
        if (error) throw error;
        setSistemas(data || []);
      } catch (err) {
        console.error("Error cargando sistemas:", err.message);
      } finally {
        setCargandoSistemas(false);
      }
    })();
  }, []);

  /* ===== Cargar consumo actual del cliente para AUTOCOMPLETAR ===== */
  useEffect(() => {
    let cancelado = false;

    function safeJSON(x, fallback) {
      if (Array.isArray(x)) return x;
      if (typeof x === "string") {
        try {
          const p = JSON.parse(x);
          return Array.isArray(p) ? p : fallback;
        } catch {
          return fallback;
        }
      }
      return fallback;
    }

    async function fetchConsumoActual(clienteId) {
      setCargandoConsumo(true);
      try {
        const { data, error } = await supabase
          .from("v_cliente_consumo_actual")
          .select(`
            id,
            cliente_id,
            mes_inicio,
            meses,
            n_meses,
            precio_kwh,
            promedio_mensual_kwh,
            promedio_diario_kwh,
            created_at
          `)
          .eq("cliente_id", clienteId)
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (!cancelado && data) {
          // solo rellenamos si el campo está vacío, respetando lo que venga en prefill
          setCalc((prev) => ({
            kwDia:
              prev.kwDia !== "" ? prev.kwDia : data.promedio_diario_kwh ?? "",
            promedioKW:
              prev.promedioKW !== ""
                ? prev.promedioKW
                : data.promedio_mensual_kwh ?? "",
            precioKWh:
              prev.precioKWh !== ""
                ? prev.precioKWh
                : data.precio_kwh ?? "",
          }));

          setConsumoInit({
            mes_inicio: data.mes_inicio ?? null,
            n_meses: data.n_meses ?? 0,
            meses: safeJSON(data.meses, []),
            precioKWh: data.precio_kwh ?? "",
          });
        }
      } catch (err) {
        console.error("Consumo actual:", err?.message || err);
      } finally {
        if (!cancelado) setCargandoConsumo(false);
      }
    }

    if (clienteSel?.id) {
      fetchConsumoActual(clienteSel.id);
    }

    return () => {
      cancelado = true;
    };
  }, [clienteSel?.id]);

  // Guardar promedios desde Calculadora
  const handleApplyCalc = async (vals) => {
    setCalc({
      kwDia: vals.kwDia,
      precioKWh: vals.precioKWh,
      promedioKW: vals.promedioKW,
    });
    setConsumoInit((prev) => ({
      mes_inicio: vals.mes_inicio ?? prev.mes_inicio,
      n_meses: vals.n_meses ?? prev.n_meses,
      meses: Array.isArray(vals.meses) ? vals.meses : prev.meses,
      precioKWh: vals.precioKWh ?? prev.precioKWh,
    }));

    if (!clienteSel?.id) {
      alert("Selecciona un cliente antes de guardar promedios.");
      return;
    }

    const precio = Number(String(vals.precioKWh).replace(",", ".")) || 0;
    const promMensual =
      Number(String(vals.promedioKW).replace(",", ".")) || 0;
    const promDiario = Number(String(vals.kwDia).replace(",", ".")) || 0;

    const mesesNumeric = (Array.isArray(vals.meses) ? vals.meses : []).map(
      (x) => (x === "" ? 0 : Number(String(x).replace(",", ".")) || 0)
    );

    try {
      setSavingProm(true);
      const payload = {
        cliente_id: clienteSel.id,
        mes_inicio: vals.mes_inicio,
        meses: mesesNumeric,
        n_meses: vals.n_meses,
        precio_kwh: precio,
        promedio_mensual_kwh: promMensual,
        promedio_diario_kwh: promDiario,
      };

      const { error } = await supabase
        .from("cliente_consumos")
        .upsert(payload, { onConflict: "cliente_id" });

      if (error) throw error;

      setOpenCalc(false);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000); // vuelve a "Guardar" después de 3 segundos
    } catch (e) {
      console.error("Error guardando promedios:", e);
      alert("No se pudieron guardar los promedios. Revisa la consola.");
    } finally {
      setSavingProm(false);
    }
  };

  // Conversión segura de kwDia a número
  const kwDiaNum = useMemo(() => {
    const n = Number(String(calc.kwDia).replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }, [calc.kwDia]);

  // Submit: crear o actualizar cotización
  const [, setSavingMain] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!clienteSel) return;
    if (modo === "nuevo" && !readyCotizacion) {
      alert("El cliente no está listo para cotización (asigna gestión 'Cotización' en Llamadas).");
      return;
    }

    // ===== MODO EDITAR: UPDATE directo en Supabase =====
    if (modo === "editar" && cotizacionId) {
      try {
        setSavingMain(true);
        const { error } = await supabase
          .from(TABLE_BASE)
          .update({
            cliente_id: clienteSel.id, // por si cambió
            sistema_id: sistemaSel || null,
            kw_dia:
              calc.kwDia !== ""
                ? Number(String(calc.kwDia).replace(",", "."))
                : null,
            kwh_mes:
              calc.promedioKW !== ""
                ? Number(String(calc.promedioKW).replace(",", "."))
                : null,
            q_kwh:
              calc.precioKWh !== ""
                ? Number(String(calc.precioKWh).replace(",", "."))
                : null,
            estado: "enviadas", // la reenviamos
            updated_at: new Date().toISOString(),
          })
          .eq("id", cotizacionId);

        if (error) throw error;

        onSuccess?.({ updatedId: cotizacionId });
      } catch (err) {
        console.error("Actualizar cotización:", err);
        alert("No se pudo actualizar la cotización.");
      } finally {
        setSavingMain(false);
      }
      return;
    }

    // ===== MODO NUEVO: devolvemos datos al padre para que cree el registro =====
    console.log("Form submit -> onSuccess payload:", {
      clienteId: clienteSel.id,
      cliente: clienteSel.nombre,
      codigoCliente,
      sistemaId: sistemaSel,
      fecha: today,
      estado: estadoFijo,

      // 👇 NUEVO: datos del vendedor usando las constantes calculadas arriba
      vendedor_id: vendedorId,
      vendedor_nombre: vendedorNombre,

      // valores de la calculadora (kwDia, promedioKW, precioKWh)
      ...calc,
    });
  };

  // Título dinámico del modal
  const tituloHeader =
    modo === "editar" && clienteSel
      ? `Editar Cotización de ${clienteSel.nombre}`
      : clienteSel
      ? `Cotización de ${clienteSel.nombre}`
      : "Nueva Cotización";

  // Código a mostrar en el header
  const codigoMostrar =
    modo === "editar"
      ? codigoCot || prefill?.codigo || codigoCliente
      : codigoCliente;

  // Solo bloquea cuando ya hay cliente seleccionado y no está listo
  const formBloqueado = modo === "nuevo" && clienteSel && !readyCotizacion;

  return (
    <div
      className={`pointer-events-auto mx-auto w-full max-w-4xl rounded-3xl border border-white/10
                  bg-white/10 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]
                  transition-all duration-300 ${
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  }`}
      role="dialog"
      aria-modal="true"
    >
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-white/10 flex justify-between items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">
            {tituloHeader}
          </h2>

          {/* Código + Vendedor en una sola línea (responsiva) */}
          <p className="mt-1 text-sm text-white/80 flex flex-wrap gap-x-6 gap-y-1">
            {/* Código de la cotización */}
            <span>
              Código:{" "}
              <span className="font-mono text-emerald-300">
                {codigoMostrar || "—"}
              </span>
            </span>

            {/* Vendedor (tomado de user) */}
            <span>
              Vendedor:{" "}
              <span className="font-semibold text-cyan-200">
                {vendedorNombre || "—"}
              </span>
            </span>
          </p>

          {cargandoConsumo && (
            <div className="mt-1 text-xs text-white/60">Cargando consumo…</div>
          )}
          {savingProm && (
            <div className="mt-1 text-xs text-emerald-200">
              Guardando promedios…
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-white border border-white/10 bg-white/10 hover:bg-white/15"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Formulario principal */}
      <div className="relative">
        {formBloqueado && (
          <div className="absolute inset-0 z-30 bg-black/35 backdrop-blur-sm flex items-center justify-center text-white text-sm px-4 text-center rounded-b-3xl pointer-events-none">
            {readyMsg || "El cliente no está listo para cotización (asigna gestión 'Cotización' en Llamadas)."}
          </div>
        )}
        <form id="form-cot-min" onSubmit={submit} className="p-5 sm:p-6 space-y-5">
        {/* Sistema + Cliente */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Cliente */}
            <div className="min-w-0 relative">
              <label className="block text-[11px] uppercase tracking-wide text-white/60 mb-2 flex items-center gap-2">
                Cliente
                {clienteSel && (
                  <span
                    className={[
                      "inline-flex items-center justify-center w-5 h-5 rounded-full border text-xs font-bold",
                      readyCotizacion
                        ? "border-emerald-400 text-emerald-300 bg-emerald-400/10"
                        : "border-rose-400 text-rose-300 bg-rose-400/10",
                    ].join(" ")}
                    title={
                      readyCotizacion
                        ? "Cliente listo para cotizar"
                        : "El cliente no tiene gestión 'Cotización'"
                    }
                  >
                    ✓
                  </span>
                )}
              </label>
              <div className="relative group focus-within:ring-2 focus-within:ring-cyan-400/60 rounded-xl">
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    // si el usuario escribe a mano, desvinculamos el cliente seleccionado
                    if (e.target.value !== (clienteSel?.nombre || "")) {
                      setClienteSel(null);
                      setReadyCotizacion(false);
                      setReadyMsg("");
                    }
                  }}
                  placeholder={
                    cargandoSug
                      ? "Buscando…"
                      : "Buscar por nombre o empresa…"
                  }
                  className="
                    w-full h-11 rounded-xl
                    bg-white/10 text-white text-sm
                    border border-white/10
                    px-3
                    placeholder-white/60
                    outline-none
                    transition
                    focus:border-cyan-300/40
                    focus:bg-white/10
                  "
                  // permitido para seleccionar otro cliente aunque esté bloqueado
                />
              </div>
              {/* Sugerencias */}
              {q.trim() && !clienteSel && (
                <div className="absolute left-0 right-0 z-20 mt-2 max-h-60 overflow-auto rounded-xl
                                border border-white/10 bg-[#0b1320]/95 backdrop-blur shadow-2xl">
                  {cargandoSug && (
                    <div className="px-3 py-2 text-sm text-white/60">
                      Buscando…
                    </div>
                  )}
                  {!cargandoSug && sugerencias.length === 0 && (
                    <div className="px-3 py-2 text-sm text-white/60">
                      Sin resultados…
                    </div>
                  )}
                  {!cargandoSug &&
                    sugerencias.map((r) => {
                      const nom =
                        (r?.nombre_completo?.trim() ||
                          r?.empresa?.trim() ||
                          "").trim();
                      const sub =
                        r.nombre_completo && r.empresa ? r.empresa : null;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => seleccionarCliente(r)}
                          className="w-full text-left px-3 py-2 text-sm text-white/90 hover:bg-white/10"
                        >
                          <div className="font-medium">{nom || "—"}</div>
                          {sub && (
                            <div className="text-xs text-white/60">{sub}</div>
                          )}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
            {/* Sistema */}
            <div className="min-w-0">
              <label className="block text-[11px] uppercase tracking-wide text-white/60 mb-2">
                Tipo de Sistema Solar
              </label>
              <SelectSistema
                opciones={sistemas}
                value={sistemaSel}
                onChange={setSistemaSel}
                placeholder="Seleccionar sistema..."
                disabled={cargandoSistemas || formBloqueado}
              />
            </div>
          </div>
        </div>

        {/* Resultados calculadora (sin botón Guardar) */}
        <div className="mt-2 flex flex-nowrap items-center gap-3 justify-center overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setOpenCalc(true)}
            disabled={!clienteSel || formBloqueado}
            className="h-10 flex-shrink-0 rounded-lg px-4 text-sm font-semibold text-white border border-white/10 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ minWidth: "120px" }}
          >
            Calc
          </button>
          <InputCalcCompact
            value={calc.kwDia}
            placeholder=""
            suffix="kWh/d"
            className="!w-[140px] text-xs"
            disabled={formBloqueado}
          />
          <InputCalcCompact
            value={calc.promedioKW}
            placeholder=""
            suffix="kWh/mes"
            className="!w-[140px] text-xs"
            disabled={formBloqueado}
          />
          <InputCalcCompact
            value={calc.precioKWh}
            placeholder=""
            suffix="Q/kWh"
            className="!w-[140px] text-xs"
            disabled={formBloqueado}
          />
        </div>

        {/* Guía de paneles + FormCotizacionCliente */}
        {clienteSel && Number(String(calc.kwDia).replace(",", ".")) > 0 ? (
          <FormCotizacionCliente
            // consumo diario que ya calculaste / precargaste
            kwDia={kwDiaNum}
            // sistema: primero lo seleccionado, luego lo que venga del prefill
            sistemaId={sistemaSel || prefill?.sistema_id || ""}
            // cliente: primero el seleccionado, luego el del prefill
            clienteId={clienteSel?.id ?? prefill?.cliente_id ?? ""}
            clienteData={
              clienteSel
                ? { id: clienteSel.id, nombre: clienteSel.nombre }
                : prefill?.cliente
                ? {
                    id: prefill.cliente.id,
                    nombre: prefill.cliente.nombre,
                  }
                : null
            }
            // 👇 CLAVE: decirle que estamos en modo edición y cuál cotización es
            modo={modo === "editar" ? "editar" : "crear"}
            cotizacionId={modo === "editar" ? cotizacionId : null}
            user={user}
          />
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            Selecciona un cliente y calcula los promedios (kW/día) para mostrar
            la guía de paneles.
          </div>
        )}
      </form>
      </div>

      {/* Modal calculadora */}
      <CalculadoraProm
        open={openCalc}
        onClose={() => setOpenCalc(false)}
        onApply={handleApplyCalc}
        initialData={{
          kwDia: calc.kwDia || "",
          promedioKW: calc.promedioKW || "",
          precioKWh: consumoInit.precioKWh || calc.precioKWh || "",
          mes_inicio: consumoInit.mes_inicio,
          n_meses: consumoInit.n_meses,
          meses: consumoInit.meses,
        }}
      />
    </div>
  );
}

/* ========== PropTypes ========== */
FormMisCotizaciones.propTypes = {
  onCancel: PropTypes.func,
  onSuccess: PropTypes.func,
  modo: PropTypes.oneOf(["nuevo", "editar"]),
  cotizacionId: PropTypes.string,
  prefill: PropTypes.object,
  user: PropTypes.object,
};

InputCalcCompact.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  suffix: PropTypes.string,
  placeholder: PropTypes.string,
};

SelectSistema.propTypes = {
  opciones: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      nombre: PropTypes.string.isRequired,
    })
  ),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
};
