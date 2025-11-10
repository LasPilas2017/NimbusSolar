import { useEffect, useMemo, useState } from "react";
import { LocalProspectosRepository } from "../../../ventas/infra/http/LocalProspectosRepository";
import { ListProspectosUseCase } from "../../../ventas/application/use-cases/ListProspectosUseCase";
import { GetKpisUseCase } from "../../../ventas/application/use-cases/GetKpisUseCase";
import { AddContactoUseCase } from "../../../ventas/application/use-cases/AddContactoUseCase";
import { GetRowMetaUseCase } from "../../../ventas/application/use-cases/GetRowMetaUseCase";
import { SaveRowMetaUseCase } from "../../../ventas/application/use-cases/SaveRowMetaUseCase";

export function useCrm() {
  const repo = useMemo(() => new LocalProspectosRepository(), []);
  const listUC = useMemo(() => new ListProspectosUseCase(repo), [repo]);
  const kpisUC = useMemo(() => new GetKpisUseCase(repo), [repo]);
  const addUC  = useMemo(() => new AddContactoUseCase(repo), [repo]);
  const getMetaUC  = useMemo(() => new GetRowMetaUseCase(repo), [repo]);
  const saveMetaUC = useMemo(() => new SaveRowMetaUseCase(repo), [repo]);

  const [rows, setRows] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [rowMeta, setRowMeta] = useState({});     // { [id]: {estatus,venta} }
  const [dirtyIds, setDirtyIds] = useState(new Set());

  useEffect(() => {
    (async () => {
      setRows(await listUC.execute());
      setKpis(await kpisUC.execute());
    })();
  }, [listUC, kpisUC]);

  // cargar meta por fila
  useEffect(() => {
    (async () => {
      const next = {};
      for (const r of rows) {
        const saved = await getMetaUC.execute(r.id);
        next[r.id] = saved ?? {
          estatus: r.estatus ?? "Por Iniciar",
          venta: r.venta ? "Sí" : "No",
        };
      }
      setRowMeta(next);
      setDirtyIds(new Set());
    })();
  }, [rows, getMetaUC]);

  const updateRowMeta = (id, patch, baselineRow) => {
    setRowMeta(prev => {
      const next = { ...prev, [id]: { ...(prev[id]||{}), ...patch } };
      // marcar sucio si difiere del baseline guardado
      const base = prev[id] ?? { estatus: baselineRow?.estatus ?? "Por Iniciar", venta: baselineRow?.venta ? "Sí" : "No" };
      const isSame = (next[id].estatus === base.estatus) && (next[id].venta === base.venta);
      setDirtyIds(s => {
        const ns = new Set(s);
        if (isSame) ns.delete(id); else ns.add(id);
        return ns;
      });
      return next;
    });
  };

  const bulkSaveMeta = async () => {
    const ids = Array.from(dirtyIds);
    for (const id of ids) await saveMetaUC.execute(id, rowMeta[id]);
    setDirtyIds(new Set());
  };

  const bulkRevertMeta = () => {
    // recargamos desde repositorio (más simple)
    (async () => {
      const next = {};
      for (const r of rows) {
        const saved = await getMetaUC.execute(r.id);
        next[r.id] = saved ?? {
          estatus: r.estatus ?? "Por Iniciar",
          venta: r.venta ? "Sí" : "No",
        };
      }
      setRowMeta(next);
      setDirtyIds(new Set());
    })();
  };

  // historial (form)
  const readHistorial = async (id) => await repo.getHistorial(id);
  const addContacto = async (id, contacto) => { await addUC.execute(id, contacto); };

  return {
    rows, kpis,
    rowMeta, updateRowMeta,
    dirtyIds, bulkSaveMeta, bulkRevertMeta,
    readHistorial, addContacto
  };
}
