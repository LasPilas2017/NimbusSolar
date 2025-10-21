import { useEffect, useMemo, useState, useCallback } from "react";
import { ProspectosMemoryRepository } from "../../infra/memory/ProspectosMemoryRepository";
import { ListProspectosUseCase } from "../../application/use-cases/ListProspectos";
import { AddContactoProspectoUseCase } from "../../application/use-cases/AddContactoProspecto";
import { UpdateProspectoMetaUseCase } from "../../application/use-cases/UpdateProspectoMeta";

export function useProspectosCatalog() {
  // repo en memoria (luego cámbialo por HTTP repo)
  const repo = useMemo(() => new ProspectosMemoryRepository(), []);

  const listUC = useMemo(() => ListProspectosUseCase(repo), [repo]);
  const addContactoUC = useMemo(() => AddContactoProspectoUseCase(repo), [repo]);
  const updateMetaUC = useMemo(() => UpdateProspectoMetaUseCase(repo), [repo]);

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const reload = useCallback(async () => {
    setLoading(true);
    const res = await listUC({ page: 1, pageSize: 200 });
    setRows(res.rows);
    setTotal(res.total);
    setLoading(false);
  }, [listUC]);

  useEffect(() => { reload(); }, [reload]);

  const addContacto = useCallback(async (id, contacto) => {
    await addContactoUC(id, contacto);
    await reload();
  }, [addContactoUC, reload]);

  const updateMeta = useCallback(async (id, meta) => {
    await updateMetaUC(id, meta);
    await reload();
  }, [updateMetaUC, reload]);

  return { loading, rows, total, addContacto, updateMeta };
}
