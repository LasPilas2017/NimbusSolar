// src/modules/vendedor/ui/components/AprobacionCoti.jsx
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Muestra un overlay a pantalla completa para revisar y aprobar una cotización.
//
// En este modal el vendedor ve:
//   - Información del cliente (tabla "clientes").
//   - Historial/resumen de consumos (tablas/vistas: "cliente_consumos" y
//     "v_cliente_consumo_actual").
//   - Información del sistema seleccionado (tabla "sistemas_solares").
//   - Los ítems de la cotización (recibidos por props).
//
// IMPORTANTE:
// - Este componente **NO guarda directamente** en la base de datos la cotización.
// - Solo LEE desde Supabase para mostrar la información.
// - Cuando el usuario pulsa:
//      • "Guardar cotización"  → llama a `onSubmit(payload)` con estadoOverride = "borrador"
//      • "Confirmar y enviar..." → llama a `onSubmit(payload)` (el padre puede marcar "pendiente")
// - La lógica real de INSERT/UPDATE en la tabla `cotizaciones_aprobacion` vive
//   en el componente padre (por ejemplo, `FormCotizacionCliente`).
//
// CONEXIONES A BD (SOLO LECTURA):
//   - Supabase (cliente global en src/supabase)
//   - Tablas/Vistas usadas:
//       • "clientes"
//       • "cliente_consumos"
//       • "v_cliente_consumo_actual"
//       • "sistemas_solares"
// -----------------------------------------------------------------------------

import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import supabase from "../../../../supabase";

export default function AprobacionCoti({
  clienteId = "",
  sistemaId = "",
  items = [],
  kwDia,
  onClose,
  clienteData, // puede venir completo desde el padre
  onSubmit, // el padre se encarga de guardar en BD
  modo = "crear", // "crear" | "editar"
  cotizacionId = null, // id real en cotizaciones_aprobacion (opcional, solo referencia)
  extraStats = null, // psh, derating, dcac, etc (opcional)

  // 🔹 NUEVOS: datos del vendedor que vienen desde el padre
  vendedorId = null,
  vendedorNombre = "",
}) {
  // ----------------- States principales -----------------
  const [cliente, setCliente] = useState(null);
  const [consumos, setConsumos] = useState([]); // [{mes, anio?, kwh}]
  const [sistema, setSistema] = useState(null);

  const [loadingCli, setLoadingCli] = useState(false);
  const [loadingCon, setLoadingCon] = useState(false);
  const [loadingSis, setLoadingSis] = useState(false);

  const [errCli, setErrCli] = useState("");
  const [errCon, setErrCon] = useState("");
  const [errSis, setErrSis] = useState("");

  // id de la cotización (si estamos en edición); aquí solo se guarda para referencia local
  const [aprobId, setAprobId] = useState(cotizacionId || null);

  // Cliente efectivo a mostrar: mezcla lo que viene del padre + lo que trae Supabase
  const clienteView = useMemo(
    () => ({
      ...(clienteData || {}), // lo que venga del padre
      ...(cliente || {}), // lo que cargamos de la tabla clientes
    }),
    [clienteData, cliente]
  );

  // Flags UI para impedir doble clic
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  // Stats directos (tabla resumen o vista)
  const [consumoStatsOverride, setConsumoStatsOverride] = useState(null);

  // Normaliza kwDia (puede venir como string)
  const kwDiaNum = useMemo(() => toNum(kwDia), [kwDia]);

  // Sincronizar aprobId si cambia cotizacionId desde el padre
  useEffect(() => {
    if (cotizacionId) {
      setAprobId(cotizacionId);
    }
  }, [cotizacionId]);

  // Bloquear scroll del fondo mientras está abierto el overlay
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ================== CÁLCULOS ==================
  const consumoStats = useMemo(() => {
    if (consumoStatsOverride) return consumoStatsOverride;
    if (!consumos || consumos.length === 0) {
      return { meses: 0, promedioMensual: 0, promedioDiario: 0 };
    }
    const kwh = consumos.map((c) => toNum(c.kwh));
    const meses = kwh.length;
    const sum = kwh.reduce((a, b) => a + b, 0);
    const promedioMensual = sum / meses;
    const promedioDiario = promedioMensual / 30;
    return { meses, promedioMensual, promedioDiario };
  }, [consumos, consumoStatsOverride]);

  console.log("AprobacionCoti :: clienteId / clienteData =>", {
    clienteId,
    clienteData,
  });
  console.log("AprobacionCoti :: vendedorId / vendedorNombre =>", {
    vendedorId,
    vendedorNombre,
  });

  // ================== HANDLERS (GUARDAR / ENVIAR) ==================

  // Construimos el payload común que se envía al padre
  const buildPayload = () => ({
    cotizacionId: aprobId || cotizacionId || null,
    clienteId,
    sistemaId,
    kwDia: kwDiaNum,
    items,
    consumos,
    consumo_stats: consumoStats,
    stats: {
      promedioDiario: consumoStats.promedioDiario,
      promedioMensual: consumoStats.promedioMensual,
    },
    extraStats: extraStats || null,
    modo,

    // 🔹 Estos viajan hacia el padre
    vendedor_id: vendedorId ?? null,
    vendedor_nombre: vendedorNombre || "",
  });

  async function handleGuardarBorrador() {
    if (!clienteId) return alert("Falta seleccionar un cliente.");
    if (!sistemaId) return alert("Falta seleccionar un sistema.");
    if (!items?.length) return alert("Agrega al menos un ítem a la cotización.");

    if (saving) return;
    setSaving(true);
    try {
      const payload = {
        ...buildPayload(),
        estadoOverride: "borrador", // el padre lo usa para guardar como BORRADOR
      };

      if (onSubmit) {
        const resultado = await onSubmit(payload);
        if (resultado && resultado.id) {
          setAprobId(resultado.id);
        }
      } else {
        console.warn("⚠️ onSubmit no definido, no se guardó en BD.");
      }

      alert("Cotización guardada como BORRADOR ✅");
    } catch (e) {
      console.error("Error guardando borrador:", e);
      alert("No se pudo guardar la cotización.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEnviarAprobacion() {
    if (!clienteId) return alert("Falta seleccionar un cliente.");
    if (!sistemaId) return alert("Falta seleccionar un sistema.");
    if (!items?.length) return alert("Agrega al menos un ítem a la cotización.");

    if (sending) return;
    setSending(true);
    try {
      const payload = {
        ...buildPayload(),
        // opcional: podrías incluir aquí estadoOverride: "pendiente"
      };

      if (onSubmit) {
        const resultado = await onSubmit(payload);
        if (resultado && resultado.id) {
          setAprobId(resultado.id);
        }
      } else {
        console.warn("⚠️ onSubmit no definido, usando flujo antiguo.");
        alert("No hay manejador de envío definido.");
      }
    } catch (e) {
      console.error("Error en handleEnviarAprobacion:", e);
      alert("Ocurrió un error al actualizar la cotización.");
    } finally {
      setSending(false);
    }
  }

  // ================== CARGAS DESDE SUPABASE ==================

  // Cliente
  useEffect(() => {
    let cancel = false;

    // ¿El padre nos mandó un cliente "completo"?
    const hasRichClienteData =
      !!clienteData &&
      (clienteData.correo ||
        clienteData.telefono ||
        clienteData.celular ||
        clienteData.departamento ||
        clienteData.municipio ||
        clienteData.pais ||
        clienteData.direccion);

    (async () => {
      try {
        setLoadingCli(true);
        setErrCli("");

        // 1) Si viene completo desde el padre, úsalo y no llames a la BD
        if (hasRichClienteData) {
          if (!cancel) setCliente(clienteData);
          return;
        }

        // 2) Si NO viene completo, intentamos consultar por ID
        const idToUse = clienteId || clienteData?.id;
        if (!idToUse) {
          if (!cancel) setCliente(null);
          return;
        }

        const { data, error } = await supabase
          .from("clientes")
          .select(
            `
            id,
            created_at,
            nombre_completo,
            empresa,
            correo,
            telefono,
            celular,
            departamento,
            municipio,
            direccion,
            pais,
            hsp,
            fecha_creacion
          `
          )
          .eq("id", idToUse)
          .maybeSingle();

        if (error) throw error;
        if (!cancel) setCliente(data || null);
      } catch (e) {
        if (!cancel) {
          setErrCli("No se pudo cargar la información del cliente.");
          console.error("clientes.get (modal):", e);
          setCliente(null);
        }
      } finally {
        if (!cancel) setLoadingCli(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [clienteId, clienteData]);

  // Consumos
  useEffect(() => {
    let cancel = false;
    if (!clienteId) {
      setConsumos([]);
      setConsumoStatsOverride(null);
      return;
    }

    (async () => {
      try {
        setLoadingCon(true);
        setErrCon("");

        // --- 1) Tabla resumen (si existe)
        let stats = null;
        try {
          const { data: row, error: errTabla } = await supabase
            .from("cliente_consumos")
            .select("*")
            .eq("cliente_id", clienteId)
            .maybeSingle();

          if (errTabla) console.warn("cliente_consumos.get:", errTabla);

          if (row) {
            const n_meses = toInt(row.n_meses ?? row.nmeses ?? row.n ?? 0);
            const promedioMensual = toNum(
              row.promedio_me ??
                row.promedio_mensual_kwh ??
                row.prom_mensual ??
                0
            );
            const promedioDiario = toNum(
              row.promedio_dia ??
                row.promedio_diario_kwh ??
                row.prom_diario ??
                0
            );
            stats = { meses: n_meses, promedioMensual, promedioDiario };
          }
        } catch (e) {
          console.warn("cliente_consumos.catch:", e);
        }

        // --- 2) Vista con JSON/lista de meses (siempre la consultamos para mostrar la grilla)
        let lista = [];
        try {
          const { data: vrow, error: errView } = await supabase
            .from("v_cliente_consumo_actual")
            .select(
              "cliente_id, n_meses, promedio_mensual_kwh, promedio_diario_kwh, meses, mes_inicio"
            )
            .eq("cliente_id", clienteId)
            .maybeSingle();

          if (errView) console.warn("v_cliente_consumo_actual.get:", errView);

          if (vrow && vrow.meses) {
            let arr = Array.isArray(vrow.meses)
              ? vrow.meses
              : typeof vrow.meses === "string"
              ? tryParseJSON(vrow.meses, [])
              : [];

            if (arr.length > 0 && isPrimitive(arr[0])) {
              const m0 = toInt(vrow.mes_inicio ?? 0);
              lista = arr.map((valor, i) => {
                const mesNum = ((m0 + i) % 12) + 1; // 1..12
                return { mes: mesNum, anio: 0, kwh: toNum(valor) };
              });
            } else {
              lista = arr
                .map((o) => {
                  const kwh = pickFirstNumber([
                    o.kwh,
                    o.kwh_mes,
                    o.consumo_kwh,
                    o.total_kwh,
                    o.valor,
                  ]);
                  let mes = toInt(
                    o.mes ??
                      o.month ??
                      (o.periodo ? String(o.periodo).split("-")[1] : null)
                  );
                  let anio = toInt(
                    o.anio ??
                      o.year ??
                      (o.periodo ? String(o.periodo).split("-")[0] : null)
                  );
                  if ((!mes || !anio) && o.fecha) {
                    const { mF, yF } = monthYearFromDate(o.fecha);
                    mes = mes || mF;
                    anio = anio || yF;
                  }
                  return { mes: mes || 0, anio: anio || 0, kwh };
                })
                .filter((x) => x.kwh > 0);
            }

            if (!stats) {
              stats = {
                meses: toInt(vrow.n_meses ?? lista.length ?? 0),
                promedioMensual: toNum(vrow.promedio_mensual_kwh ?? 0),
                promedioDiario: toNum(vrow.promedio_diario_kwh ?? 0),
              };
            }
          }
        } catch (e) {
          console.warn("v_cliente_consumo_actual.catch:", e);
        }

        if (!cancel) {
          setConsumos(lista);
          setConsumoStatsOverride(
            stats ?? { meses: 0, promedioMensual: 0, promedioDiario: 0 }
          );
        }
      } catch (e) {
        console.error("consumos.get:", e);
        if (!cancel) {
          setErrCon("No se pudieron cargar los consumos del cliente.");
          setConsumos([]);
          setConsumoStatsOverride(null);
        }
      } finally {
        if (!cancel) setLoadingCon(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [clienteId]);

  // Sistema
  useEffect(() => {
    let cancel = false;
    if (!sistemaId) {
      setSistema(null);
      return;
    }
    (async () => {
      try {
        setLoadingSis(true);
        setErrSis("");
        const { data, error } = await supabase
          .from("sistemas_solares")
          .select("*")
          .eq("id", sistemaId)
          .maybeSingle();
        if (error) throw error;
        if (!cancel) setSistema(data || null);
      } catch (e) {
        if (!cancel) {
          setErrSis("No se pudo cargar el tipo de instalación.");
          console.error(e);
        }
      } finally {
        if (!cancel) setLoadingSis(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [sistemaId]);

  // ================== RENDER ==================
  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 h-full flex items-stretch justify-center p-1 sm:p-2">
        <div className="w-full max-w-[min(98vw,1400px)]">
          <div className="h-[calc(100vh-12px)] sm:h-[calc(100vh-24px)] overflow-y-auto no-scrollbar rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]">
            {/* Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10 bg-white/10 backdrop-blur-md">
              {/* IZQUIERDA: título + vendedor */}
              <div className="flex flex-col gap-1">
                <h3 className="text-white text-lg font-semibold">
                  Aprobación de Cotización
                </h3>

                <div className="flex items-baseline gap-2 text-xs sm:text-sm">
                  <span className="uppercase tracking-[0.25em] text-emerald-200/80">
                    VENDEDOR
                  </span>
                  <span className="text-emerald-100 font-semibold">
                    {vendedorNombre || "—"}
                  </span>
                </div>
              </div>

              {/* DERECHA: botones */}
              <div className="flex gap-2">
                <button
                  className="rounded-lg px-3 py-1.5 text-sm border border-sky-300/30 bg-sky-400/10 text-sky-100 hover:bg-sky-400/20 transition"
                  onClick={handleGuardarBorrador}
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar cotización"}
                </button>
                {onClose && (
                  <button
                    className="rounded-lg px-3 py-1.5 text-sm border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition"
                    onClick={onClose}
                  >
                    Volver
                  </button>
                )}
                <button
                  className="rounded-lg px-4 py-2 text-sm border border-emerald-300/30 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20 transition"
                  onClick={handleEnviarAprobacion}
                  disabled={sending}
                >
                  {sending ? "Enviando..." : "Confirmar y enviar a aprobación"}
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-4 sm:p-5 space-y-4">
              {/* ======= Cliente ======= */}
              <Section title="Información del cliente">
                {loadingCli && !clienteData ? (
                  <p className="text-sm text-white/60">Cargando cliente…</p>
                ) : errCli && !clienteData ? (
                  <p className="text-sm text-amber-300/90">{errCli}</p>
                ) : !clienteView ? (
                  <p className="text-sm text-white/60">
                    No hay datos del cliente.
                  </p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <KV
                      label="Nombre"
                      value={
                        str(clienteView.nombre_completo) ||
                        str(clienteView.nombre) ||
                        str(clienteView.empresa) ||
                        "—"
                      }
                    />

                    {/* Mostrar el vendedor también aquí */}
                    <KV
                      label="Vendedor"
                      value={vendedorNombre || "—"}
                    />

                    <KV
                      label="Correo"
                      value={
                        str(clienteView.correo) ||
                        str(clienteView.email) ||
                        "—"
                      }
                    />

                    <KV
                      label="Teléfono"
                      value={
                        str(clienteView.telefono) ||
                        str(clienteView.celular) ||
                        str(clienteView.telefono1) ||
                        "—"
                      }
                    />

                    <KV
                      label="País"
                      value={
                        str(clienteView.pais) ||
                        str(clienteView.country) ||
                        "—"
                      }
                    />

                    <KV
                      label="Departamento"
                      value={
                        str(clienteView.departamento) ||
                        str(clienteView.region) ||
                        "—"
                      }
                    />

                    <KV
                      label="Municipio"
                      value={str(clienteView.municipio) || "—"}
                    />

                    <KV
                      label="Dirección"
                      value={
                        str(clienteView.direccion) ||
                        str(clienteView.direccion1) ||
                        str(clienteView.address) ||
                        "—"
                      }
                      full
                    />

                    <KV
                      label="HSP"
                      value={
                        clienteView.hsp === null ||
                        clienteView.hsp === undefined
                          ? "—"
                          : String(clienteView.hsp)
                      }
                    />

                    <KV
                      label="Fecha creación"
                      value={
                        str(clienteView.fecha_creacion) ||
                        str(clienteView.created_at) ||
                        str(clienteView.fecha_registro) ||
                        "—"
                      }
                    />
                  </div>
                )}
              </Section>

              {/* ======= Consumos ======= */}
              <Section title="Histórico de consumos">
                {loadingCon ? (
                  <p className="text-sm text-white/60">Cargando consumos…</p>
                ) : errCon ? (
                  <p className="text-sm text-amber-300/90">{errCon}</p>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      <BadgeStat
                        label="Prom. mensual"
                        value={`${fmt(consumoStats.promedioMensual)} kWh`}
                      />
                      <BadgeStat
                        label="Prom. diario"
                        value={`${fmt(consumoStats.promedioDiario)} kWh/d`}
                      />
                    </div>

                    {consumos.length > 0 && (
                      <div className="mt-3">
                        <div className="text-white/70 text-[12px] mb-2">
                          Meses
                        </div>
                        <MesesGrid consumos={consumos} />
                      </div>
                    )}
                  </>
                )}
              </Section>

              {/* ======= Sistema ======= */}
              <Section title="Tipo de instalación">
                {loadingSis ? (
                  <p className="text-sm text-white/60">Cargando sistema…</p>
                ) : errSis ? (
                  <p className="text-sm text-amber-300/90">{errSis}</p>
                ) : !sistema ? (
                  <p className="text-sm text-white/60">
                    No hay sistema seleccionado.
                  </p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <KV
                      label="Nombre del sistema"
                      value={str(sistema.nombre) || "—"}
                    />
                    <div className="sm:col-span-2">
                      <div className="text-white/60 text-[12px] leading-tight">
                        Descripción
                      </div>
                      <div className="text-white/90">
                        {str(sistema.descripcion) || "—"}
                      </div>
                    </div>
                  </div>
                )}
              </Section>

              {/* ======= Ítems ======= */}
              <Section title={`Ítems de la cotización (${items.length})`}>
                {items.length === 0 ? (
                  <p className="text-sm text-white/60">
                    No hay productos agregados.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-white/60">
                          <th className="text-left py-2 pr-2 w-[120px]">
                            Tipo
                          </th>
                          <th className="text-left py-2 pr-2">Artículo</th>
                          <th className="text-left py-2 pr-2">Detalle</th>
                          <th className="text-right py-2 pl-2 w-[80px]">
                            Cantidad
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((it) => (
                          <tr
                            key={it.key}
                            className="border-t border-white/10"
                          >
                            <td className="py-2 pr-2 text-white/60 uppercase text-[11px]">
                              {it.tipo}
                            </td>
                            <td className="py-2 pr-2 text-white/90">
                              {it.titulo}
                            </td>
                            <td className="py-2 pr-2 text-white/60">
                              {it.detalle || "—"}
                            </td>
                            <td className="py-2 pl-2 text-right text-white/90">
                              {toInt(it.qty) || 1}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================== Subcomponentes UI ================== */
function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-3 space-y-2">
      <div className="text-white/90 font-semibold text-sm">{title}</div>
      {children}
    </div>
  );
}
Section.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

function KV({ label, value, full = false }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <div className="text-white/60 text-[12px] leading-tight">{label}</div>
      <div className="text-white/90">{value || "—"}</div>
    </div>
  );
}
KV.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  full: PropTypes.bool,
};

function BadgeStat({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-white/60 text-[12px] leading-tight">{label}</div>
      <div className="text-white/90 font-medium">{value}</div>
    </div>
  );
}
BadgeStat.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

// Grilla de meses (Mes arriba, kWh abajo)
function MesesGrid({ consumos }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      {consumos.map((c, i) => (
        <div
          key={`${c.anio ?? 0}-${c.mes}-${i}`}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center"
        >
          <div className="text-white/80 text-xs">{mesCorto(c.mes)}</div>
          <div className="text-white/90 font-semibold text-sm">
            {fmt(c.kwh)} kWh
          </div>
        </div>
      ))}
    </div>
  );
}
MesesGrid.propTypes = {
  consumos: PropTypes.arrayOf(
    PropTypes.shape({
      mes: PropTypes.number,
      anio: PropTypes.number,
      kwh: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
};

/* ================== PropTypes del componente ================== */
AprobacionCoti.propTypes = {
  clienteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sistemaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      titulo: PropTypes.string,
      detalle: PropTypes.string,
      qty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      tipo: PropTypes.string,
    })
  ),
  kwDia: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClose: PropTypes.func,
  onSubmit: PropTypes.func, // el padre guarda en BD
  clienteData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    created_at: PropTypes.string,
    nombre_completo: PropTypes.string,
    empresa: PropTypes.string,
    correo: PropTypes.string,
    telefono: PropTypes.string,
    celular: PropTypes.string,
    departamento: PropTypes.string,
    municipio: PropTypes.string,
    direccion: PropTypes.string,
    pais: PropTypes.string,
    hsp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fecha_creacion: PropTypes.string,
  }),
  modo: PropTypes.string, // "crear" | "editar"
  cotizacionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  extraStats: PropTypes.object,

  // Nuevos
  vendedorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  vendedorNombre: PropTypes.string,
};

/* ================== Utils ================== */
function str(v) {
  return (v ?? "").toString().trim();
}
function toNum(v) {
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}
function toInt(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
}
function fmt(n) {
  const v = Number(n);
  return Number.isFinite(v) ? v.toFixed(2) : "0.00";
}
function pickFirstNumber(arr) {
  for (const v of arr || []) {
    const n = toNum(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}
function monthYearFromDate(d) {
  try {
    if (!d) return { mF: null, yF: null };
    const dt = new Date(d);
    if (String(dt) === "Invalid Date") return { mF: null, yF: null };
    return { mF: dt.getMonth() + 1, yF: dt.getFullYear() };
  } catch {
    return { mF: null, yF: null };
  }
}
function mesCorto(m) {
  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  const i = Math.min(Math.max(1, toInt(m)), 12) - 1;
  return meses[i];
}
function tryParseJSON(txt, fallback) {
  try {
    const p = JSON.parse(txt);
    return p;
  } catch {
    return fallback;
  }
}
function isPrimitive(x) {
  const t = typeof x;
  return x == null || t === "number" || t === "string" || t === "boolean";
}
