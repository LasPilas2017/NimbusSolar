import { useEffect, useMemo, useState } from "react";

/** Claves de storage (temporal mientras no hay BD) */
const META_KEY = (id) => `crm_row_meta:${id}`;
const HIST_KEY = (id) => `crm_historial_contactos:${id}`;

export function useCrm() {
  // ---------- Datos demo ----------
  const kpis = useMemo(() => ({
    baseTotal: 320,
    enProceso: 0,
    finalizados: 3,
    frio: 0, tibio: 0, caliente: 0,
    etapasValores: [0, 0, 0, 0, 0, 0],
    etapasPct:     [100, 100, 100, 100, 100, 100],
    conversion: {
      ventasCount: 3, ventasMonto: 12000,
      perdidasCount: 0, perdidasMonto: 0,
      conversionPct: 100, cicloVenta: 3.0,
      perdidosPct: 0, embudoPct: 0, ventaPct: 100,
    },
  }), []);

  const rows = useMemo(() =>
    Array.from({ length: 12 }).map((_, i) => ({
      id: i + 1,
      prospecto: `Prospecto ${i + 1}`,
      condicion: i % 2 ? "Nuevo" : "Recurrente",
      agente: ["Ana", "Luis", "Karla"][i % 3],
      canal: ["Facebook", "Llamada", "Email"][i % 3],
      fecha1: "", fecha2: "", fecha3: "", fecha4: "", fecha5: "",
      dias: "", avance: "", estatus: "Abierto", venta: i % 7 === 0,
      notas: i % 3 === 0 ? "Pendiente de llamada de seguimiento." : "",
    })), []
  );

  // ---------- Meta por fila (estatus / venta) ----------
  const [rowMeta, setRowMeta] = useState({});
  const [dirtyIds, setDirtyIds] = useState(new Set());

  useEffect(() => {
    const next = {};
    for (const r of rows) {
      try {
        const raw = localStorage.getItem(META_KEY(r.id));
        const saved = raw ? JSON.parse(raw) : null;
        next[r.id] = {
          estatus: saved?.estatus ?? r.estatus ?? "Por Iniciar",
          venta: saved?.venta ?? (r.venta ? "Sí" : "No"),
        };
      } catch {
        next[r.id] = { estatus: "Por Iniciar", venta: "No" };
      }
    }
    setRowMeta(next);
    setDirtyIds(new Set());
  }, [rows]);

  const baselineFor = (row) => {
    try {
      const raw = localStorage.getItem(META_KEY(row.id));
      const saved = raw ? JSON.parse(raw) : null;
      return saved ?? { estatus: row.estatus ?? "Por Iniciar", venta: row.venta ? "Sí" : "No" };
    } catch {
      return { estatus: "Por Iniciar", venta: "No" };
    }
  };
  const eqMeta = (a, b) => (a?.estatus ?? "") === (b?.estatus ?? "") && (a?.venta ?? "") === (b?.venta ?? "");

  const updateRowMeta = (rowId, patch, rowObject) => {
    setRowMeta(prev => {
      const next = { ...prev, [rowId]: { ...(prev[rowId] || {}), ...patch } };
      const base = baselineFor(rowObject ?? rows.find(r => r.id === rowId) ?? { id: rowId });
      setDirtyIds(prevIds => {
        const s = new Set(prevIds);
        if (eqMeta(next[rowId], base)) s.delete(rowId); else s.add(rowId);
        return s;
      });
      return next;
    });
  };

  const bulkSaveMeta = () => {
    const ids = Array.from(dirtyIds);
    for (const id of ids) {
      try { localStorage.setItem(META_KEY(id), JSON.stringify(rowMeta[id])); } catch {}
    }
    setDirtyIds(new Set());
  };

  const bulkRevertMeta = () => {
    const ids = Array.from(dirtyIds);
    const next = { ...rowMeta };
    for (const id of ids) {
      const row = rows.find(r => r.id === id);
      next[id] = baselineFor(row);
    }
    setRowMeta(next);
    setDirtyIds(new Set());
  };

  // ---------- Historial por fila (localStorage) ----------
  const readHistorial = (id) => {
    try {
      const raw = localStorage.getItem(HIST_KEY(id));
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  };

  const addContacto = async (id, contacto) => {
    const prev = readHistorial(id);
    try {
      localStorage.setItem(HIST_KEY(id), JSON.stringify([contacto, ...prev]));
    } catch {}
  };

  return {
    rows, kpis,
    rowMeta,
    updateRowMeta,
    dirtyIds,
    bulkSaveMeta,
    bulkRevertMeta,
    readHistorial,
    addContacto,
  };
}
