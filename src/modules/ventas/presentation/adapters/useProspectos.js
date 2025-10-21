import { useEffect, useMemo, useState } from "react";
import { GetProspectos } from "../../application/use-cases/GetProspectos.js";
import { CreateProspecto } from "../../application/use-cases/CreateProspecto.js";
import { UpdateProspecto } from "../../application/use-cases/UpdateProspecto.js";   // +
import { DeleteProspecto } from "../../application/use-cases/DeleteProspecto.js";   // +
import { SupabaseProspectosRepository } from "../../infra/http/SupabaseProspectosRepository.js";

const repo = new SupabaseProspectosRepository({
  url: process.env.REACT_APP_SUPABASE_URL,
  key: process.env.REACT_APP_SUPABASE_KEY,
});

export function useProspectos() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [rows, setRows]       = useState([]);
  const [editing, setEditing] = useState(null); // {id, nombre, ...}

  const getUC    = useMemo(() => GetProspectos({ repo }), []);
  const createUC = useMemo(() => CreateProspecto({ repo }), []);
  const updateUC = useMemo(() => UpdateProspecto({ repo }), []);  // +
  const deleteUC = useMemo(() => DeleteProspecto({ repo }), []);  // +

  const reload = async () => {
    setLoading(true); setError(null);
    try { setRows(await getUC.exec()); }
    catch (e) { setError(e.message ?? "Error"); }
    finally { setLoading(false); }
  };

  const crear = async (payload) => {
    setLoading(true); setError(null);
    try { await createUC.exec(payload); await reload(); }
    catch (e) { setError(e.message ?? "No se pudo crear"); }
    finally { setLoading(false); }
  };

  const actualizar = async (id, partial) => {                 // +
    setLoading(true); setError(null);
    try { await updateUC.exec(id, partial); await reload(); setEditing(null); }
    catch (e) { setError(e.message ?? "No se pudo actualizar"); }
    finally { setLoading(false); }
  };

  const eliminar = async (id) => {                             // +
    setLoading(true); setError(null);
    try { await deleteUC.exec(id); await reload(); }
    catch (e) { setError(e.message ?? "No se pudo eliminar"); }
    finally { setLoading(false); }
  };

  useEffect(() => { reload(); }, []);

  return { loading, error, rows, crear, actualizar, eliminar, editing, setEditing };
}
