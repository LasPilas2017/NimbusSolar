import React, {
  useEffect, useMemo, useRef, useState,
} from "react";
import { Loader2, CheckCircle2, FileText } from "lucide-react";
import supabase from "../../../../supabase";

const money = (v) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  }).format(Number(v || 0));

export default function Ventas() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [priceById, setPriceById] = useState({});
  const [mesFiltro, setMesFiltro] = useState("");
  const detailRef = useRef(null);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      setErr("");
      try {
        const { data, error } = await supabase
          .from("v_ventas_facturadas")
          .select("*")
          .order("fecha_emision", { ascending: false });

        if (error) throw error;

        const parsedRows = data || [];
        setRows(parsedRows);
        setSelectedId(parsedRows[0]?.factura_id || null);

        // Construir mapa de precios desde v_catalogo_items usando item_id
        const allItemIds = new Set();
        parsedRows.forEach((r) => {
          let items = r.items;
          if (typeof items === "string") {
            try {
              items = JSON.parse(items);
            } catch {
              items = [];
            }
          }
          if (!Array.isArray(items)) return;
          items.forEach((it) => {
            const refId = it.refid || it.refId || it.item_id || it.itemId;
            if (refId) allItemIds.add(refId);
          });
        });

        if (allItemIds.size > 0) {
          const { data: priceRows, error: priceError } = await supabase
            .from("v_catalogo_items")
            .select("item_id, precio")
            .in("item_id", Array.from(allItemIds));

          if (!priceError && Array.isArray(priceRows)) {
            const map = {};
            priceRows.forEach((p) => {
              map[p.item_id] = Number(p.precio || 0);
            });
            setPriceById(map);
          }
        }
      } catch (e) {
        console.error(e);
        setErr(e.message || "No se pudieron cargar las ventas facturadas.");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  const rowsFiltradas = useMemo(() => {
    if (!mesFiltro) return rows;
    return rows.filter((r) => {
      const fecha = r.fecha_emision || r.fecha || "";
      return typeof fecha === "string" && fecha.startsWith(mesFiltro);
    });
  }, [rows, mesFiltro]);

  const mesesDisponibles = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => {
      const fecha = r.fecha_emision || r.fecha || "";
      if (typeof fecha === "string" && fecha.length >= 7) {
        set.add(fecha.slice(0, 7)); // YYYY-MM
      }
    });
    return Array.from(set).sort().reverse();
  }, [rows]);

  const selected = useMemo(
    () => rowsFiltradas.find((r) => r.factura_id === selectedId) || null,
    [rowsFiltradas, selectedId]
  );

  const totalVentas = useMemo(
    () =>
      rowsFiltradas.reduce(
        (acc, r) =>
          acc + Number(r?.monto ?? r?.subtotal_items ?? 0),
        0
      ),
    [rowsFiltradas]
  );

  const handleSelect = (id) => {
    setSelectedId((prev) => (prev === id ? null : id));
    if (detailRef.current) {
      setTimeout(
        () =>
          detailRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        50
      );
    }
  };

  const renderLista = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full text-white/70 gap-2 text-sm">
          <Loader2 className="animate-spin" /> Cargando ventas facturadas...
        </div>
      );
    }

    if (err) {
      return (
        <div className="m-4 border border-rose-400/30 bg-rose-500/10 text-rose-100 rounded-2xl px-4 py-3 text-sm">
          {err}
        </div>
      );
    }

    if (rowsFiltradas.length === 0) {
      return (
        <div className="m-4 border border-white/15 rounded-2xl bg-[#020617]/40 p-4 text-white/70 text-sm text-center">
          No hay cotizaciones facturadas todavía.
        </div>
      );
    }

    return (
      <table className="min-w-full text-sm text-white/80">
        <thead>
          <tr className="text-left text-white/70 border-b border-white/10">
            <th className="px-3 py-2">No. factura</th>
            <th className="px-3 py-2">Cliente</th>
            <th className="px-3 py-2">Vendedor</th>
            <th className="px-3 py-2 text-right">Monto factura</th>
            <th className="px-3 py-2 text-center">Facturado</th>
          </tr>
        </thead>
        <tbody>
          {rowsFiltradas.map((row) => {
            const sel = selectedId === row.factura_id;
            const montoBase = row?.monto ?? row?.subtotal_items ?? 0;
            const folio = row.numero_dte || row.codigo || "—";
            return (
              <tr
                key={row.factura_id}
                onClick={() => handleSelect(row.factura_id)}
                className={`cursor-pointer hover:bg-white/10 ${
                  sel ? "bg-white/10" : ""
                }`}
              >
                <td className="px-3 py-2">
                  <div className="flex flex-col">
                    <span>{folio}</span>
                    <span className="text-[11px] text-white/50">
                      {row.fecha_emision || "—"}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2">{row.cliente_nombre || "Sin cliente"}</td>
                <td className="px-3 py-2">{row.vendedor_nombre || "—"}</td>
                <td className="px-3 py-2 text-right font-semibold">
                  {money(montoBase)}
                </td>
                <td className="px-3 py-2 text-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 inline-block" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const renderDetalle = () => {
    if (!selected) {
      return (
        <div
          ref={detailRef}
          className="border border-white/15 rounded-2xl bg-[#020617]/30 p-6 text-center text-white/60 text-sm"
        >
          Selecciona una factura para ver el detalle.
        </div>
      );
    }

    const {
      codigo,
      numero_dte,
      cliente_nombre,
      fecha_emision,
      monto,
      subtotal_items,
      subtotal_cotizacion,
      porc_ganancia,
      porc_iva,
      porc_tarjeta,
      ganancia_q,
      iva_q,
      tarjeta_q,
      items,
      pdf_url: pdfFEL,
      pdf_nuevo_url: pdfNuevo,
    } = selected;

    const folio = numero_dte || codigo || "--";
    const montoBase = monto ?? subtotal_items ?? 0;
    const subtotalCotizacion = subtotal_cotizacion ?? subtotal_items ?? 0;
    const itemsLista = (() => {
      if (Array.isArray(items)) return items;
      if (typeof items === "string") {
        try {
          const parsed = JSON.parse(items);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    })();

    const displayItems = itemsLista.map((it) => {
      const cantidad = Number(it.cantidad ?? it.qty ?? it.cant ?? 0);
      const precioUnit = Number(
        it.precio ??
          it.precio_unitario ??
          it.precio_catalogo ??
          it.unitario ??
          priceById[it.refid || it.refId || it.item_id || it.itemId] ??
          0
      );
      const titulo =
        it.descripcion ??
        it.articulo ??
        it.titulo ??
        it.nombre ??
        it.busqueda ??
        "Articulo";
      const detalle = it.detalle ?? it.descripcion_detalle ?? "";
      const descripcion = detalle ? `${titulo} ${detalle}` : titulo;

      return {
        descripcion,
        cantidad,
        precio: precioUnit,
      };
    });

    return (
      <div
        ref={detailRef}
        className="space-y-4 border border-white/15 rounded-2xl bg-[#020617]/30 p-6 text-white"
      >
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs text-white/60">No. de factura</p>
            <p className="text-lg font-semibold">{folio}</p>
            <p className="text-sm text-white/70 mt-1">
              Cliente: {cliente_nombre || "Cliente sin nombre"}
            </p>
            <p className="text-xs text-white/60">{fecha_emision || "--"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60">Total factura</p>
            <p className="text-2xl font-bold text-emerald-300">
              {money(montoBase)}
            </p>
          </div>
        </div>

        {displayItems.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#0b1320]/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Articulos</p>
              <p className="text-xs text-white/60">
                {displayItems.length} en total
              </p>
            </div>
            <div className="overflow-auto">
              <table className="min-w-full text-xs text-white/80">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="px-2 py-2">Descripcion</th>
                    <th className="px-2 py-2 text-right">Cant.</th>
                    <th className="px-2 py-2 text-right">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.map((it, idx) => (
                    <tr key={idx} className="border-b border-white/5">
                      <td className="px-2 py-2">
                        {it.descripcion}
                      </td>
                      <td className="px-2 py-2 text-right">
                        {Number(it.cantidad ?? 0)}
                      </td>
                      <td className="px-2 py-2 text-right">
                        {money(it.precio ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-[#0b1320]/50 p-4 flex items-center justify-between">
          <p className="text-sm text-white/70">Subtotal cotizacion</p>
          <p className="text-xl font-semibold text-white">
            {money(subtotalCotizacion)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-black/30 border border-white/10 p-4 text-center">
            <p className="text-sm font-semibold text-white">
              {money(ganancia_q ?? 0)}
            </p>
            <p className="text-xs text-white/60">% ganancia</p>
            <p className="text-xl font-semibold">
              {porc_ganancia != null ? `${porc_ganancia}%` : "--"}
            </p>
          </div>
          <div className="rounded-xl bg-black/30 border border-white/10 p-4 text-center">
            <p className="text-sm font-semibold text-white">
              {money(iva_q ?? 0)}
            </p>
            <p className="text-xs text-white/60">% IVA</p>
            <p className="text-xl font-semibold">
              {porc_iva != null ? `${porc_iva}%` : "--"}
            </p>
          </div>
          <div className="rounded-xl bg-black/30 border border-white/10 p-4 text-center">
            <p className="text-sm font-semibold text-white">
              {money(tarjeta_q ?? 0)}
            </p>
            <p className="text-xs text-white/60">% tarjeta</p>
            <p className="text-xl font-semibold">
              {porc_tarjeta != null ? `${porc_tarjeta}%` : "--"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-white/60">Descargas</p>
          <div className="flex items-center gap-3 flex-wrap">
            {pdfFEL ? (
              <a
                href={pdfFEL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 text-sm text-white/80 hover:bg-white/10"
              >
                <FileText className="w-4 h-4" />
                FEL SAT
              </a>
            ) : null}
            {pdfNuevo ? (
              <a
                href={pdfNuevo}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 text-sm text-white/80 hover:bg-white/10"
              >
                <FileText className="w-4 h-4" />
                FEL NIMBUS
              </a>
            ) : null}
            {!pdfFEL && !pdfNuevo && (
              <span className="text-xs text-white/60">
                No hay PDF disponible.
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 w-full h-full p-4 sm:p-6 md:p-8 bg-gradient-to-b from-[#0b1320]/80 to-[#0b1320]/90">
      <div className="w-full h-full rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md flex flex-col">
        <div className="px-5 sm:px-6 md:px-8 py-5 border-b border-white/10 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white">
              Ventas facturadas
            </h1>
            <p className="text-sm text-white/70 mt-1">
              Cotizaciones que ya cuentan con factura.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/70">Total de ventas</p>
            <p className="text-4xl font-bold text-emerald-300">
              {money(totalVentas)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={mesFiltro}
              onChange={(e) => setMesFiltro(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            >
              <option value="" style={{ backgroundColor: "#0b1320", color: "#fff" }}>
                Todos los meses
              </option>
              {mesesDisponibles.map((m) => (
                <option
                  key={m}
                  value={m}
                  style={{ backgroundColor: "#0b1320", color: "#fff" }}
                >
                  {(() => {
                    const [y, mo] = m.split("-");
                    const nombres = [
                      "Enero",
                      "Febrero",
                      "Marzo",
                      "Abril",
                      "Mayo",
                      "Junio",
                      "Julio",
                      "Agosto",
                      "Septiembre",
                      "Octubre",
                      "Noviembre",
                      "Diciembre",
                    ];
                    const nombreMes = nombres[Number(mo) - 1] || m;
                    return `${nombreMes} ${y}`;
                  })()}
                </option>
              ))}
            </select>
            {mesFiltro && (
              <button
                type="button"
                onClick={() => setMesFiltro("")}
                className="text-xs px-3 py-2 rounded-lg border border-white/10 bg-white/10 text-white hover:bg-white/15"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row">
          <div className="lg:w-1/2 border-b lg:border-b-0 lg:border-r border-white/10 overflow-auto scrollbar-hide">
            {renderLista()}
          </div>
          <div className="lg:w-1/2 p-5 sm:p-6 overflow-auto scrollbar-hide">
            {renderDetalle()}
          </div>
        </div>
      </div>
    </div>
  );
}
