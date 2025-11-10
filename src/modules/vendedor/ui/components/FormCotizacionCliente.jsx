// src/modules/vendedor/ui/components/FormCotizacionCliente.jsx
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Formulario principal de cotización por cliente dentro del sistema del vendedor.
//
// En esta pantalla el vendedor:
//   - Ajusta parámetros de cálculo (PSH, derating, DC/AC).
//   - Ve la recomendación de potencia instalada y de inversor.
//   - Agrega ítems a la cotización desde:
//       • Paneles solares      → tabla: paneles
//       • Inversores y artículos del sistema → tabla: componentes_sistema
//   - Revisa / edita el carrito de ítems de la cotización (sin precios).
//   - Abre el overlay de “Aprobación de Cotización” (AprobacionCoti) para
//     guardar/actualizar en la tabla: cotizaciones_aprobacion.
//   - Después de guardar/enviar la cotización, redirige a la pantalla
//     de listado de cotizaciones (ruta /vendedor/cotizaciones).
//
// También lee la información del cliente desde:
//   - tabla: clientes
//
// NOTA: Se eliminó la sección de “Material Eléctrico (Inventario)”, por lo que
// este componente ya no consulta la tabla de inventario.
// -----------------------------------------------------------------------------

/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import supabase from "../../../../supabase.js";
import AprobacionCoti from "./AprobacionCoti.jsx";

/**
 * Props:
 *  - kwDia?: number (kWh/día)
 *  - sistemaId?: string
 *  - clienteId?: string
 *  - clienteData?: object
 *  - onQuoteChange?: (items)=>void
 *  - onAprobationModeChange?: (bool)=>void
 *  - modo?: "crear" | "editar"
 *  - cotizacionId?: string (cuando se está editando una ya guardada)
 */
export default function FormCotizacionCliente({
  kwDia: kwDiaProp = 0,
  sistemaId: sistemaIdProp = "",
  clienteId: clienteIdProp = "",
  clienteData,
  onQuoteChange,
  onAprobationModeChange,
  modo = "crear",
  cotizacionId = null,
}) {
  // ========= PARÁMETROS =========
  const [psh, setPsh] = useState(5.0);
  const [derating, setDerating] = useState(0.8);
  const [dcac, setDcac] = useState(1.2);

  // ========= CONTEXTO (modo edición) =========
  const [prefetching, setPrefetching] = useState(false);
  const [prefetchErr, setPrefetchErr] = useState("");

  // Si vienen desde la BD, podemos sobreescribir estos tres (cliente, sistema, kwDia)
  const [sistemaIdFromDb, setSistemaIdFromDb] = useState("");
  const [clienteIdFromDb, setClienteIdFromDb] = useState("");
  const [kwDiaFromDb, setKwDiaFromDb] = useState(null);

  // Sistema/cliente efectivos (prioridad: props > DB > vacío)
  const sistemaId = (sistemaIdProp || sistemaIdFromDb || "").toString();
  const clienteId = (clienteIdProp || clienteIdFromDb || "").toString();

  // ========= DATOS =========
  const [paneles, setPaneles] = useState([]);
  const [inversores, setInversores] = useState([]);
  const [articulos, setArticulos] = useState([]);

  // ========= ESTADOS =========
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState({});
  const [quoteItems, setQuoteItems] = useState([]);

  const [openReco, setOpenReco] = useState(false);
  const [openIP, setOpenIP] = useState(false);

  // ========= APROBACIÓN =========
  const [showAprob, setShowAprob] = useState(false);
  const [savingQuote, setSavingQuote] = useState(false); // ⬅️ se usa en el botón

  // ===== Cliente (solo viene del padre o del prefetch de edición) =====
  const effectiveClienteId = clienteData?.id || clienteId || "";
  const [clienteInfo, setClienteInfo] = useState(clienteData || null);
  const [clienteLoading, setClienteLoading] = useState(false);
  const [clienteErr, setClienteErr] = useState("");

  // ========= PREFETCH DESDE BD CUANDO HAY cotizacionId =========
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!cotizacionId) return;

      try {
        setPrefetching(true);
        setPrefetchErr("");

        const { data, error } = await supabase
          .from("cotizaciones_aprobacion")
          .select(
            `
            id,
            cliente_id,
            sistema_id,
            kw_dia,
            items,
            stats,
            consumo_stats,
            consumos
          `
          )
          .eq("id", cotizacionId)
          .maybeSingle();

        if (error) throw error;
        if (cancel) return;

        if (data) {
          // cliente/sistema para fallback
          if (data.cliente_id) setClienteIdFromDb(data.cliente_id);
          if (data.sistema_id) setSistemaIdFromDb(data.sistema_id);

          // parámetros guardados (si existen)
          const s = ensureObj(data.stats);
          if (isFiniteNum(s.psh)) setPsh(Number(s.psh));
          if (isFiniteNum(s.derating)) setDerating(Number(s.derating));
          if (isFiniteNum(s.dcac)) setDcac(Number(s.dcac));

          // prioridad de kwDia:
          // 1) columna kw_dia
          // 2) stats.promedioDiario
          // 3) consumo_stats.promedioDiario
          const consumoStats = ensureObj(data.consumo_stats);
          const kwDiaBD = toNum(data.kw_dia);
          const promedioStats = toNum(s.promedioDiario);
          const promedioConsumo = toNum(consumoStats.promedioDiario);

          if (kwDiaBD > 0) setKwDiaFromDb(kwDiaBD);
          else if (promedioStats > 0) setKwDiaFromDb(promedioStats);
          else if (promedioConsumo > 0) setKwDiaFromDb(promedioConsumo);

          // Items del carrito (si ya existen)
          const arr = ensureArray(data.items).map(normalizeItem);
          if (arr.length) {
            setQuoteItems(arr);
            onQuoteChange?.(arr);
          }
        }
      } catch (e) {
        if (!cancel) {
          setPrefetchErr(
            "No fue posible cargar la cotización para editarla. Intenta de nuevo."
          );
          console.error("prefetch cotizacion:", e);
        }
      } finally {
        if (!cancel) setPrefetching(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [cotizacionId, onQuoteChange]);

  // 1) Si viene clienteData desde el padre, úsalo
  useEffect(() => {
    if (clienteData?.id) {
      setClienteInfo(clienteData);
      setClienteErr("");
      setClienteLoading(false);
    }
  }, [clienteData]);

  // 2) Si no viene clienteData, cargar por clienteId efectivo
  useEffect(() => {
    let cancel = false;
    if (clienteData?.id) return; // ya tenemos objeto
    if (!effectiveClienteId) {
      setClienteInfo(null);
      return;
    }
    (async () => {
      try {
        setClienteLoading(true);
        setClienteErr("");
        const { data, error } = await supabase
          .from("clientes")
          .select("*")
          .eq("id", effectiveClienteId)
          .maybeSingle();
        if (error) throw error;
        if (!cancel) setClienteInfo(data || null);
      } catch (e) {
        if (!cancel) {
          console.error("clientes.get (por id):", e);
          setClienteErr("No se pudo cargar el cliente.");
          setClienteInfo(null);
        }
      } finally {
        if (!cancel) setClienteLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [effectiveClienteId, clienteData]);

  // Bloquear scroll cuando el modal de aprobación está abierto
  useEffect(() => {
    if (!showAprob) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showAprob]);

  // ---------------------- CARGAS DESDE SUPABASE ----------------------
  // Paneles (universales)
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading((p) => ({ ...p, panels: true }));
        setErr((p) => ({ ...p, panels: "" }));
        const { data, error } = await supabase.from("paneles").select("*");
        if (error) throw error;
        if (!cancel) {
          const mapped = (data || [])
            .map((r) => {
              const w =
                pickFirstNumber([
                  r.potencia_watt,
                  r.potencia_watts,
                  r.potencia,
                  r.watts,
                  r.w,
                ]) || 0;
              const titulo =
                [str(r.marca), str(r.modelo)].filter(Boolean).join(" ") ||
                (w ? `${w} W` : "Panel");
              return { id: r.id, w, titulo };
            })
            .filter((p) => p.w > 0);
          setPaneles(mapped);
        }
      } catch (e) {
        if (!cancel)
          setErr((p) => ({ ...p, panels: "Error cargando paneles" }));
        console.error("paneles.get:", e);
      } finally {
        if (!cancel) setLoading((p) => ({ ...p, panels: false }));
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  // Inversores (por sistema)
  useEffect(() => {
    let cancel = false;
    if (!sistemaId) {
      setInversores([]);
      return;
    }
    (async () => {
      try {
        setLoading((p) => ({ ...p, inversores: true }));
        setErr((p) => ({ ...p, inversores: "" }));
        const { data, error } = await supabase
          .from("componentes_sistema")
          .select("*")
          .eq("sistema_id", sistemaId)
          .ilike("categoria", "%inversor%");
        if (error) throw error;
        if (!cancel) {
          const mapped = (data || [])
            .map((r) => {
              const kw =
                pickFirstNumber([
                  r.potencia_kw,
                  r.kw,
                  wattsToKW(r.potencia_w),
                  wattsToKW(r.watts),
                  wattsToKW(r.w),
                ]) || 0;
              const nombre =
                str(r.nombre_componente) ||
                str(r.nombre) ||
                str(r.modelo) ||
                str(r.descripcion);
              const titulo = nombre || (kw ? `${fmt(kw)} kW` : "Inversor");
              return { id: r.id, kw, titulo };
            })
            .filter((i) => i.kw > 0)
            .sort((a, b) => a.kw - b.kw);
          setInversores(mapped);
        }
      } catch (e) {
        if (!cancel)
          setErr((p) => ({ ...p, inversores: "Error cargando inversores" }));
        console.error("inversores.get:", e);
      } finally {
        if (!cancel) setLoading((p) => ({ ...p, inversores: false }));
      }
    })();
    return () => {
      cancel = true;
    };
  }, [sistemaId]);

  // Artículos del sistema (excluye inversores)
  useEffect(() => {
    let cancel = false;
    if (!sistemaId) {
      setArticulos([]);
      return;
    }
    (async () => {
      try {
        setLoading((p) => ({ ...p, articulos: true }));
        setErr((p) => ({ ...p, articulos: "" }));
        const { data, error } = await supabase
          .from("componentes_sistema")
          .select("*")
          .eq("sistema_id", sistemaId)
          .not("categoria", "ilike", "%inversor%");
        if (error) throw error;
        if (!cancel) {
          const mapped = (data || []).map((r) => {
            const nombre =
              str(r.nombre_componente) ||
              str(r.nombre) ||
              str(r.modelo) ||
              str(r.descripcion) ||
              "Artículo";
            const cat = str(r.categoria);
            const detalle = [
              cat && `Cat: ${cat}`,
              r.potencia_kw && `kW: ${fmt(toNum(r.potencia_kw))}`,
              r.potencia_w && `W: ${fmt(toNum(r.potencia_w))}`,
              r.kw && `kW: ${fmt(toNum(r.kw))}`,
              r.watts && `W: ${fmt(toNum(r.watts))}`,
            ]
              .filter(Boolean)
              .join(" · ");
            const titulo = nombre.trim();
            return {
              id: r.id,
              titulo: titulo || "Artículo",
              categoria: cat || "General",
              detalle,
            };
          });
          setArticulos(mapped);
        }
      } catch (e) {
        if (!cancel)
          setErr((p) => ({
            ...p,
            articulos: "Error cargando artículos del sistema",
          }));
        console.error("articulos.get:", e);
      } finally {
        if (!cancel) setLoading((p) => ({ ...p, articulos: false }));
      }
    })();
    return () => {
      cancel = true;
    };
  }, [sistemaId]);

  // ---------------------- CÁLCULOS / FLAGS ----------------------
  const kwDiaFinal = useMemo(
    () => (kwDiaFromDb != null ? kwDiaFromDb : kwDiaProp),
    [kwDiaFromDb, kwDiaProp]
  );
  const kwDiaNum = useMemo(() => toNum(kwDiaFinal), [kwDiaFinal]);
  const pshNum = useMemo(() => clamp(toNum(psh), 2, 7), [psh]);
  const derNum = useMemo(() => clamp(toNum(derating), 0.5, 0.9), [derating]);
  const dcacNum = useMemo(() => clamp(toNum(dcac), 0.8, 1.6), [dcac]);

  const kWpNecesarios = useMemo(() => {
    const denom = pshNum * derNum;
    return denom > 0 ? kwDiaNum / denom : 0;
  }, [kwDiaNum, pshNum, derNum]);

  const acObjetivoKW = useMemo(
    () => (dcacNum > 0 ? kWpNecesarios / dcacNum : 0),
    [kWpNecesarios, dcacNum]
  );

  const recomendado = useMemo(() => {
    if (inversores.length === 0 || acObjetivoKW <= 0) return null;
    const mayor = inversores.find((inv) => inv.kw >= acObjetivoKW);
    return mayor || inversores[inversores.length - 1] || null;
  }, [inversores, acObjetivoKW]);

  const hasCliente = !!(effectiveClienteId || clienteInfo?.id);
  const hasSistema =
    sistemaId !== undefined &&
    sistemaId !== null &&
    String(sistemaId).trim() !== "";

  // ---------------------- CATÁLOGOS ----------------------
  const [qIP, setQIP] = useState("");

  const catalogoIP = useMemo(() => {
    const itemsPan = paneles.map((p) => ({
      key: `pan-${p.id}`,
      refId: p.id,
      tipo: "panel",
      titulo: p.titulo || `${fmt(p.w)} W`,
      detalle: p.w ? `${fmt(p.w)} W` : "",
      busqueda: [p.titulo, `${p.w}W`].filter(Boolean).join(" ").toLowerCase(),
    }));

    const itemsArt = articulos.map((a) => ({
      key: `art-${a.id}`,
      refId: a.id,
      tipo: "articulo",
      titulo: a.titulo,
      detalle: a.detalle || a.categoria || "",
      busqueda: [a.titulo, a.detalle, a.categoria]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    }));

    const itemsInv = inversores.map((i) => ({
      key: `inv-${i.id}`,
      refId: i.id,
      tipo: "inversor",
      titulo: i.titulo,
      detalle: `${fmt(i.kw)} kW`,
      busqueda: [i.titulo, `${i.kw}kW`].join(" ").toLowerCase(),
    }));

    return hasSistema ? [...itemsArt, ...itemsInv, ...itemsPan] : [...itemsPan];
  }, [articulos, inversores, paneles, hasSistema]);

  const filteredIP = useMemo(() => {
    const term = qIP.trim().toLowerCase();
    if (!term) return catalogoIP;
    return catalogoIP.filter((it) => it.busqueda.includes(term));
  }, [catalogoIP, qIP]);

  // ---------------------- MANEJADORES ----------------------
  const addToQuote = (item) => {
    setQuoteItems((prev) => {
      const existe = prev.find((x) => x.key === item.key);
      if (existe) {
        const actualizado = prev.map((x) =>
          x.key === item.key ? { ...x, qty: x.qty + 1 } : x
        );
        onQuoteChange?.(actualizado);
        return actualizado;
      }
      const nuevo = [...prev, { ...item, qty: 1 }];
      onQuoteChange?.(nuevo);
      return nuevo;
    });
  };

  const incQty = (key) =>
    setQuoteItems((p) => {
      const c = p.map((x) => (x.key === key ? { ...x, qty: x.qty + 1 } : x));
      onQuoteChange?.(c);
      return c;
    });

  const decQty = (key) =>
    setQuoteItems((p) => {
      const c = p.map((x) =>
        x.key === key ? { ...x, qty: Math.max(1, x.qty - 1) } : x
      );
      onQuoteChange?.(c);
      return c;
    });

  const setQty = (key, val) => {
    const n = Math.max(
      1,
      Math.min(9999, parseInt(String(val).replace(/[^\d]/g, ""), 10) || 1)
    );
    setQuoteItems((p) => {
      const c = p.map((x) => (x.key === key ? { ...x, qty: n } : x));
      onQuoteChange?.(c);
      return c;
    });
  };

  const removeItem = (key) =>
    setQuoteItems((p) => {
      const c = p.filter((x) => x.key !== key);
      onQuoteChange?.(c);
      return c;
    });

  const handleOpenAprob = () => {
    setShowAprob(true);
    onAprobationModeChange?.(true);
  };

  const handleCloseAprob = () => {
    setShowAprob(false);
    onAprobationModeChange?.(false);
  };

  // Guarda / actualiza la cotización cuando el modal de aprobación llama a onSubmit
  const handleSubmitAprob = async (payload = {}) => {
    // estado que sugiere el modal: "borrador" ó "pendiente" (por defecto)
    const estadoDb = payload.estadoOverride || "pendiente";

    try {
      setSavingQuote(true);

      const now = new Date();
      const isoNow = now.toISOString();
      const today = isoNow.slice(0, 10); // YYYY-MM-DD

      // Mezcla stats que vienen del modal con los parámetros locales
      const statsToSave = {
        ...(payload.stats || {}),
        ...(payload.extraStats || {}),
        psh,
        derating,
        dcac,
        promedioDiario: kwDiaNum,
      };

      const consumos = payload.consumos ?? null;
      const consumoStats =
        payload.consumo_stats ?? payload.consumoStats ?? null;

      let resultRow = null;

      if (cotizacionId) {
        // -------- MODO EDICIÓN: UPDATE --------
        const { data, error } = await supabase
          .from("cotizaciones_aprobacion")
          .update({
            cliente_id: effectiveClienteId || null,
            sistema_id: sistemaId || null,
            kw_dia: kwDiaNum || null,
            items: quoteItems,
            consumos,
            consumo_stats: consumoStats,
            stats: statsToSave,
            estado: estadoDb,
            updated_at: isoNow,
            fecha: today,
          })
          .eq("id", cotizacionId)
          .select("id")
          .maybeSingle();

        if (error) throw error;
        resultRow = data;
      } else {
        // -------- MODO NUEVO: INSERT --------
        const { data, error } = await supabase
          .from("cotizaciones_aprobacion")
          .insert([
            {
              cliente_id: effectiveClienteId || null,
              sistema_id: sistemaId || null,
              kw_dia: kwDiaNum || null,
              items: quoteItems,
              consumos,
              consumo_stats: consumoStats,
              stats: statsToSave,
              estado: estadoDb,
              created_at: isoNow,
              updated_at: isoNow,
              fecha: today,
            },
          ])
          .select("id")
          .single();

        if (error) throw error;
        resultRow = data;
      }

      // Mensaje según el botón que usaste
      alert(
        estadoDb === "borrador"
          ? "Cotización guardada como BORRADOR ✅"
          : "Cotización enviada a aprobación (PENDIENTE) ✅"
      );

      // 🔹 Cierra el modal de aprobación
      setShowAprob(false);
      onAprobationModeChange?.(false);

      // 🔹 Redirige a la página de listado de cotizaciones
      //    Ajusta la ruta si en tu Router usas otra (por ejemplo "/cotizaciones")
      window.location.href = "/vendedor/cotizaciones";

      // 🔹 Devolvemos el id
      return resultRow || { id: cotizacionId };
    } catch (e) {
      console.error("Error guardando cotización:", e);
      alert("No se pudo guardar la cotización. Revisa la consola.");
    } finally {
      setSavingQuote(false);
    }
  };

  // ---------------------- RENDER ----------------------
  if (showAprob) {
    return createPortal(
      <AprobacionCoti
        clienteId={effectiveClienteId}
        sistemaId={sistemaId}
        items={quoteItems}
        kwDia={kwDiaNum}
        onClose={handleCloseAprob}
        onSubmit={handleSubmitAprob}
        clienteData={clienteInfo}
        // claves para que AprobacionCoti sepa si actualiza o inserta
        modo={modo}
        cotizacionId={cotizacionId || undefined}
        // también enviamos parámetros de cálculo para persistirlos en stats si quieres
        extraStats={{ psh, derating, dcac, promedioDiario: kwDiaNum }}
      />,
      document.body
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5">
      {/* Overlay de prefetch en modo edición */}
      {prefetching && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-black/40 backdrop-blur-sm rounded-2xl">
          <div className="text-white/80 text-sm">Cargando cotización…</div>
        </div>
      )}
      <div className="px-0 pb-0 pr-0 overflow-visible opacity-100">
        {!!prefetchErr && (
          <div className="p-3 text-xs text-rose-300">{prefetchErr}</div>
        )}

        <div className="rounded-xl border border-white/10 bg-white/10 p-3 space-y-3">
          {/* === Cliente viene del padre / prefetch === */}
          {!!clienteErr && (
            <div className="text-xs text-amber-300/90">{clienteErr}</div>
          )}

          {/* === Sección 1: Recomendación === */}
          <SectionHeader
            title="Recomendación de Instalación"
            open={openReco}
            setOpen={setOpenReco}
          />
          <Collapsible open={openReco}>
            <div className="px-2 pb-2 space-y-4">
              {!hasCliente ? (
                <div className="rounded-xl border border-white/10 bg-white/10 p-3 text-sm text-white/60">
                  {clienteLoading
                    ? "Cargando cliente…"
                    : "Selecciona un cliente para continuar."}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-end gap-4 flex-wrap">
                    <ParamInput
                      label="PSH"
                      value={psh}
                      onChange={setPsh}
                      hint="h/día"
                    />
                    <ParamInput
                      label="Derating"
                      value={derating}
                      onChange={setDerating}
                      hint="0.60–0.90"
                    />
                    <ParamInput
                      label="DC/AC"
                      value={dcac}
                      onChange={setDcac}
                      hint="1.10–1.30"
                    />
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/10 p-3 space-y-3">
                    <div className="text-sm text-white/70">
                      Para cubrir{" "}
                      <b className="text-white">{fmt(kwDiaNum)} kWh/d</b>,
                      necesitarías:
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      {loading.panels && (
                        <span className="text-sm text-white/60">
                          Cargando paneles…
                        </span>
                      )}
                      {err.panels && (
                        <span className="text-amber-300/90 text-sm">
                          {err.panels}
                        </span>
                      )}
                      {!loading.panels &&
                        !err.panels &&
                        paneles.length === 0 && (
                          <span className="text-sm text-white/60">
                            (No hay paneles en la tabla <code>paneles</code>)
                          </span>
                        )}
                      {!loading.panels &&
                        !err.panels &&
                        paneles.map((p) => {
                          const kwhPorPanel =
                            (p.w / 1000) * pshNum * derNum;
                          const necesarios =
                            kwhPorPanel > 0
                              ? Math.ceil(kwDiaNum / kwhPorPanel)
                              : 0;
                          return (
                            <span
                              key={p.id}
                              className="text-sm rounded-full px-3 py-1 border border-white/10 bg-white/5 text-white/90"
                              title={`≈ ${fmt(
                                kwhPorPanel
                              )} kWh/d por panel (PSH=${pshNum}, derating=${derNum})`}
                            >
                              {p.titulo} → <b>{necesarios}</b> paneles
                            </span>
                          );
                        })}
                    </div>

                    <div className="h-px bg-white/10"></div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <div className="text-white/80">
                        Sistema requerido ≈{" "}
                        <b>{fmt(kWpNecesarios)} kWp</b>{" "}
                        <span className="text-white/60">
                          (PSH={pshNum}, derating={derNum})
                        </span>
                      </div>
                      <div className="text:white/80">
                        Objetivo AC ≈{" "}
                        <b>{fmt(acObjetivoKW)} kW</b>{" "}
                        <span className="text-white/60">
                          (DC/AC={dcacNum})
                        </span>
                      </div>
                    </div>

                    {hasSistema ? (
                      <>
                        {err.inversores && (
                          <div className="text-sm text-amber-300/90">
                            {err.inversores}
                          </div>
                        )}
                        {!err.inversores &&
                          inversores.length === 0 && (
                            <div className="text-sm text-white/60">
                              No hay inversores para este sistema en{" "}
                              <code>componentes_sistema</code>.
                            </div>
                          )}
                        {!err.inversores &&
                          inversores.length > 0 &&
                          acObjetivoKW <= 0 && (
                            <div className="text-sm text-white/60">
                              Ingresa/calcula kWh/d para sugerir inversor.
                            </div>
                          )}
                        {!err.inversores &&
                          inversores.length > 0 &&
                          acObjetivoKW > 0 && (
                            <>
                              {recomendado && (
                                <div className="rounded-lg border border-emerald-300/30 bg-emerald-400/10 p-2 text-sm flex flex-wrap items-center gap-3">
                                  <span className="font-medium text-emerald-200">
                                    Recomendado:
                                  </span>
                                  <span className="text-white/90">
                                    {recomendado.titulo}{" "}
                                    <b>({fmt(recomendado.kw)} kW)</b>
                                  </span>
                                </div>
                              )}
                              {inversores.filter(
                                (i) =>
                                  !recomendado ||
                                  i.id !== recomendado.id
                              ).length > 0 && (
                                <div className="text-sm text-white/80">
                                  Otros disponibles:
                                  <div className="mt-1 flex flex-wrap gap-2">
                                    {inversores
                                      .filter(
                                        (i) =>
                                          !recomendado ||
                                          i.id !== recomendado.id
                                      )
                                      .map((alt) => (
                                        <span
                                          key={alt.id}
                                          className="rounded-full px-3 py-1 border border-white/10 bg-white/5"
                                          title={`Potencia: ${fmt(
                                            alt.kw
                                          )} kW`}
                                        >
                                          {alt.titulo} ({fmt(alt.kw)} kW)
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                      </>
                    ) : (
                      <div className="text-sm text-white/60">
                        Selecciona un <b>Tipo de Sistema Solar</b> para ver
                        inversores.
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/10 p-3 text-sm">
                    <span className="text-white/80">
                      Cálculo basado en kW/d ={" "}
                      <b>{fmt(kwDiaNum)} kWh/d</b>
                    </span>
                  </div>
                </>
              )}
            </div>
          </Collapsible>

          {/* === Sección 2: Inversores, Paneles y Artículos del Sistema === */}
          <SectionHeader
            title="Inversores, Paneles y Artículos del Sistema"
            open={openIP}
            setOpen={setOpenIP}
          />
          <Collapsible open={openIP}>
            <div className="px-2 pb-2">
              <div className="rounded-xl border border-white/10 bg-white/10 p-3">
                {!hasCliente ? (
                  <div className="text-sm text-white/60">
                    {clienteLoading
                      ? "Cargando cliente…"
                      : "Selecciona primero un cliente para continuar."}
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex-1">
                        <input
                          value={qIP}
                          onChange={(e) => setQIP(e.target.value)}
                          placeholder="Buscar artículos, inversores y paneles…"
                          className="w-full text-sm text-white bg-white/10 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                        />
                      </div>
                      <div className="text-xs text-white/60">
                        {hasSistema
                          ? "Filtrando por sistema seleccionado"
                          : "Sin sistema: solo paneles"}
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-white/60 flex flex-wrap gap-3">
                      {loading.articulos && <span>Cargando artículos…</span>}
                      {loading.inversores && <span>Cargando inversores…</span>}
                      {loading.panels && <span>Cargando paneles…</span>}
                      {err.articulos && (
                        <span className="text-amber-300/90">
                          {err.articulos}
                        </span>
                      )}
                      {err.inversores && (
                        <span className="text-amber-300/90">
                          {err.inversores}
                        </span>
                      )}
                      {err.panels && (
                        <span className="text-amber-300/90">
                          {err.panels}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 max-h-64 overflow-auto no-scrollbar overscroll-auto">
                      {filteredIP.length === 0 ? (
                        <div className="text-sm text-white/60">
                          No hay resultados con el término ingresado.
                        </div>
                      ) : (
                        <ul className="space-y-2">
                          {filteredIP.map((it) => (
                            <li
                              key={it.key}
                              className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                            >
                              <div className="min-w-0">
                                <div className="text-sm text-white/90 truncate">
                                  {it.titulo}
                                </div>
                                {it.detalle && (
                                  <div className="text-xs text-white/60 truncate">
                                    {it.detalle}
                                  </div>
                                )}
                                <div className="text-[10px] text-white/40 mt-[2px] uppercase">
                                  {it.tipo}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => addToQuote(it)}
                                className="shrink-0 rounded-lg px-3 py-1.5 text-sm border border-cyan-300/30 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20 transition"
                              >
                                Añadir
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </Collapsible>
        </div>

        {/* ====== Cotización (carrito) ====== */}
        <div className="mt-1 mb-0 rounded-xl border border-white/10 bg-white/10 p-3">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/90 font-semibold text-sm">
              Cotización {modo === "editar" ? "(edición)" : "(sin precios)"}
            </span>
            <span className="text-xs text-white/60">
              {quoteItems.length} ítems
            </span>
          </div>

          {quoteItems.length === 0 ? (
            <div className="text-sm text-white/60">
              Aún no has agregado productos.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/60">
                    <th className="text-left py-2 pr-2">Artículo</th>
                    <th className="text-left py-2 pr-2">Detalle</th>
                    <th className="text-center py-2 px-2 w-[100px]">
                      Cantidad
                    </th>
                    <th className="text-right py-2 pl-2 w-[60px]">Quitar</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteItems.map((row) => (
                    <tr key={row.key} className="border-t border-white/10">
                      <td className="py-2 pr-2 text-white/90">{row.titulo}</td>
                      <td className="py-2 pr-2 text-white/60">
                        {row.detalle || "—"}
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => decQty(row.key)}
                            className="rounded-md border border-white/10 bg-white/5 px-1.5 py-1 text-sm"
                            aria-label="Disminuir"
                          >
                            –
                          </button>

                          <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={9999}
                            step={1}
                            value={row.qty}
                            onChange={(e) => setQty(row.key, e.target.value)}
                            onBlur={(e) => setQty(row.key, e.target.value)}
                            onKeyDown={(e) => {
                              if (["e", "E", "+", "-"].includes(e.key))
                                e.preventDefault();
                            }}
                            className="w-12 text-center bg-white/5 border border-white/10 rounded-md py-1 text-sm text-white
                                      focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                            aria-label="Cantidad"
                          />

                          <button
                            type="button"
                            onClick={() => incQty(row.key)}
                            className="rounded-md border border-white/10 bg-white/5 px-1.5 py-1 text-sm"
                            aria-label="Aumentar"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="py-2 pl-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(row.key)}
                          className="rounded-md border border-red-300/30 bg-red-400/10 px-2 py-1 text-sm text-red-100 hover:bg-red-400/20 transition"
                          aria-label="Quitar"
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Botón de aprobación: requiere cliente + al menos un ítem */}
              <div className="mt-3 flex items-center justify-end">
                <button
                  type="button"
                  className="rounded-lg px-4 py-2 text-sm border border-emerald-300/30 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    savingQuote
                      ? "Guardando cotización…"
                      : !hasCliente
                      ? "Selecciona primero un cliente."
                      : quoteItems.length === 0
                      ? "Agrega productos para continuar."
                      : "Revisar datos y enviar a aprobación"
                  }
                  onClick={handleOpenAprob}
                  disabled={!hasCliente || quoteItems.length === 0 || savingQuote}
                >
                  {savingQuote
                    ? "Guardando…"
                    : modo === "editar"
                    ? "Revisar y actualizar"
                    : "Pasar a aprobación"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- COMPONENTES AUXILIARES ---------- */
function SectionHeader({ title, open, setOpen }) {
  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white/90 font-semibold text-sm"
    >
      <span>{title}</span>
      <Chevron open={open} />
    </button>
  );
}

function Collapsible({ open, children }) {
  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

function Chevron({ open }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`h-4 w-4 text-white/80 transition-transform ${
        open ? "rotate-180" : ""
      }`}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
    </svg>
  );
}

function ParamInput({ label, value, onChange, hint }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-white/80 text-sm">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(toNum(e.target.value))}
        className="w-20 bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-white text-sm text-center"
      />
      {hint && <span className="text-xs text-white/50">{hint}</span>}
    </div>
  );
}

/* ---------- UTILIDADES ---------- */
function str(v) {
  return (v ?? "").toString().trim();
}
function toNum(v) {
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}
function fmt(n) {
  return Number.isFinite(+n) ? (+n).toFixed(2) : "0.00";
}
function clamp(n, min, max) {
  const v = toNum(n);
  return Math.max(min, Math.min(max, v));
}
function wattsToKW(w) {
  const val = toNum(w);
  return val > 0 ? val / 1000 : 0;
}
function pickFirstNumber(arr) {
  for (const v of arr || []) {
    const n = toNum(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}
function ensureObj(v) {
  if (v && typeof v === "object") return v;
  try {
    const p = JSON.parse(v);
    return p && typeof p === "object" ? p : {};
  } catch {
    return {};
  }
}
function ensureArray(v) {
  if (Array.isArray(v)) return v;
  try {
    const p = JSON.parse(v);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}
function isFiniteNum(v) {
  const n = Number(v);
  return Number.isFinite(n);
}
function normalizeItem(it) {
  // Garantiza forma { key, refId, tipo, titulo, detalle, qty }
  const obj = it || {};
  const key =
    obj.key ||
    [
      obj.tipo || obj.type || "item",
      obj.refId || obj.id || Math.random().toString(36).slice(2, 8),
    ].join("-");
  const qty = isFiniteNum(obj.qty) ? Number(obj.qty) : 1;
  return {
    key,
    refId: obj.refId ?? obj.id ?? null,
    tipo: obj.tipo ?? obj.type ?? "item",
    titulo: obj.titulo ?? obj.title ?? "Artículo",
    detalle: obj.detalle ?? obj.detail ?? "",
    qty: qty > 0 ? qty : 1,
  };
}
