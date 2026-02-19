// src/modules/papeleria/ui/PapeleriaPage.jsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Plus } from "lucide-react";
import { supabase } from "../../../infra/supabase/supabaseClient";

const PapeleriaPage = () => {
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffError, setStaffError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    dpi: "",
    numeroCuenta: "",
    tipoCuenta: "",
    banco: "",
    archivoDpi: null,
  });
  const modalRoot = typeof document !== "undefined" ? document.body : null;

  const fetchStaff = async (isMounted) => {
    setStaffLoading(true);
    setStaffError("");

    const { data, error: queryError } = await supabase
      .from("registrodepersonal")
      .select("*")
      .order("nombrecompleto", { ascending: true });

    if (isMounted && !isMounted.current) return;

    if (queryError) {
      setStaffError(
        "No se pudo cargar la papeleria del personal. Intenta nuevamente."
      );
      setStaff([]);
    } else {
      setStaff(Array.isArray(data) ? data : []);
    }

    setStaffLoading(false);
  };

  useEffect(() => {
    const isMounted = { current: true };

    fetchStaff(isMounted);

    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!showForm) return undefined;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const shell = document.querySelector("main");
    const originalShellOverflow = shell ? shell.style.overflow : "";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    if (shell) shell.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      if (shell) shell.style.overflow = originalShellOverflow;
    };
  }, [showForm]);

  const resetForm = () => {
    setForm({
      dpi: "",
      numeroCuenta: "",
      tipoCuenta: "",
      banco: "",
      archivoDpi: null,
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleArchivoDpi = (event) => {
    setForm((prev) => ({ ...prev, archivoDpi: event.target.files[0] }));
  };

  const handleGuardar = async () => {
    if (!String(form.dpi || "").trim()) {
      alert("Por favor, ingresa el DPI del personal.");
      return;
    }

    setSaving(true);
    setStaffError("");

    let urlPapeleria = null;

    if (form.archivoDpi) {
      const archivo = form.archivoDpi;
      const nombreArchivo = `${Date.now()}_${archivo.name}`;
      const { error: errorUpload } = await supabase.storage
        .from("papeleria")
        .upload(nombreArchivo, archivo);

      if (errorUpload) {
        alert("Error al subir la papeleria.");
        setSaving(false);
        return;
      }

      const { data } = supabase.storage
        .from("papeleria")
        .getPublicUrl(nombreArchivo);

      urlPapeleria = data?.publicUrl || null;
    }

    const dpiValue = String(form.dpi || "").trim();
    const payload = {
      numero_cuenta: form.numeroCuenta || "",
      tipo_cuenta: form.tipoCuenta || "",
      banco: form.banco || "",
      ...(urlPapeleria ? { urlpapeleria: urlPapeleria } : {}),
    };

    const { data: existing, error: lookupError } = await supabase
      .from("registrodepersonal")
      .select("id")
      .eq("dpi", dpiValue)
      .limit(1);

    if (lookupError) {
      alert("Ocurrio un error al validar el DPI.");
      setSaving(false);
      return;
    }

    if (!existing || existing.length === 0) {
      alert("Ese DPI no existe en planilla. Primero debes registrarlo.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("registrodepersonal")
      .update(payload)
      .eq("id", existing[0].id);

    if (error) {
      alert("Ocurrio un error al guardar la papeleria.");
      setSaving(false);
      return;
    }

    resetForm();
    setShowForm(false);
    await fetchStaff({ current: true });
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Papeleria</h1>
            <p className="mt-1 text-sm text-slate-500">
              Documentos del personal en PDF
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4" />
            Agregar personal
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Papeleria del personal
              </h2>
              <p className="text-sm text-slate-500">
                Documentos en PDF por trabajador
              </p>
            </div>
          </div>

          {staffError && (
            <div className="border-t border-slate-200 px-6 py-4 text-sm text-red-600">
              {staffError}
            </div>
          )}

          <div className="overflow-x-auto border-t border-slate-200">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">
                    Nombre de la persona
                  </th>
                  <th className="px-6 py-3 text-left font-medium">DPI</th>
                  <th className="px-6 py-3 text-left font-medium">
                    Telefono
                  </th>
                  <th className="px-6 py-3 text-left font-medium">
                    DPI en digital
                  </th>
                  <th className="px-6 py-3 text-left font-medium">
                    No. de cuenta
                  </th>
                  <th className="px-6 py-3 text-left font-medium">
                    Tipo de cuenta
                  </th>
                  <th className="px-6 py-3 text-left font-medium">Banco</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {staffLoading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-6 text-center text-slate-500"
                    >
                      Cargando papeleria...
                    </td>
                  </tr>
                )}

                {!staffLoading &&
                  staff.map((person) => {
                    const accountNumber = person.numero_cuenta || "";
                    const accountType = person.tipo_cuenta || "";
                    const bank = person.banco || "";
                    const hasDpiDigital = Boolean(person.urlpapeleria);

                    return (
                      <tr key={person.id || person.nombrecompleto}>
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {person.nombrecompleto || "Sin nombre"}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {person.dpi || "-"}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {person.telefono || "-"}
                        </td>
                        <td className="px-6 py-4">
                          {hasDpiDigital ? (
                            <span className="inline-flex items-center gap-2 text-emerald-600">
                              <CheckCircle2 className="h-4 w-4" />
                              Escaneado
                            </span>
                          ) : (
                            <span className="text-slate-400">Pendiente</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {accountNumber || "-"}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {accountType || "-"}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {bank || "-"}
                        </td>
                      </tr>
                    );
                  })}

                {!staffLoading && staff.length === 0 && !staffError && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-6 text-center text-slate-500"
                    >
                      No hay personal registrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm &&
        modalRoot &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
            <div className="w-full max-w-3xl">
              <div className="max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      Agregar personal
                    </h3>
                    <p className="text-sm text-slate-500">
                      Completa los datos del trabajador y su papeleria.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-medium text-slate-500 hover:text-slate-700"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                  >
                    Cerrar
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      DPI
                    </label>
                    <input
                      type="number"
                      name="dpi"
                      value={form.dpi}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                      placeholder="No. DPI"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      No. de cuenta
                    </label>
                    <input
                      type="text"
                      name="numeroCuenta"
                      value={form.numeroCuenta}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                      placeholder="Numero de cuenta"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Tipo de cuenta
                    </label>
                    <select
                      name="tipoCuenta"
                      value={form.tipoCuenta}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">Selecciona</option>
                      <option value="Ahorro">Ahorro</option>
                      <option value="Monetaria">Monetaria</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-slate-600">
                      Banco
                    </label>
                    <select
                      name="banco"
                      value={form.banco}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">Selecciona un banco</option>
                      <option value="Banco Industrial">Banco Industrial</option>
                      <option value="Banco de Desarrollo Rural (Banrural)">
                        Banco de Desarrollo Rural (Banrural)
                      </option>
                      <option value="Banco G&T Continental">
                        Banco G&amp;T Continental
                      </option>
                      <option value="Banco Agromercantil (BAM)">
                        Banco Agromercantil (BAM)
                      </option>
                      <option value="Banco Promerica">Banco Promerica</option>
                      <option value="Banco de América Central (BAC)">
                        Banco de America Central (BAC)
                      </option>
                      <option value="Banco Ficohsa Guatemala">
                        Banco Ficohsa Guatemala
                      </option>
                      <option value="Banco Azteca Guatemala">
                        Banco Azteca Guatemala
                      </option>
                      <option value="Banco INV">Banco INV</option>
                      <option value="Banco Internacional">
                        Banco Internacional
                      </option>
                      <option value="Banco Inmobiliario">
                        Banco Inmobiliario
                      </option>
                      <option value="Banco de Antigua">Banco de Antigua</option>
                      <option value="Banco de Crédito">Banco de Credito</option>
                      <option value="Vivibanco">Vivibanco</option>
                      <option value="Banco de los Trabajadores">
                        Banco de los Trabajadores
                      </option>
                      <option value="Crédito Hipotecario Nacional">
                        Credito Hipotecario Nacional
                      </option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-slate-600">
                      DPI en digital (foto o PDF)
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleArchivoDpi}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                    onClick={handleGuardar}
                    disabled={saving}
                  >
                    {saving ? "Guardando..." : "Guardar personal"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          modalRoot
        )}
    </div>
  );
};

export default PapeleriaPage;
