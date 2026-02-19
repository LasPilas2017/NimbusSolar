// AgregarPersonal.jsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import supabase from "../../supabase";
import { guardarLog } from "../../utils";
export default function AgregarPersonal({ usuario }) {
  const [tipoPersonal, setTipoPersonal] = useState("");
  const [dpiStatus, setDpiStatus] = useState("idle");
  const [modalState, setModalState] = useState({
    open: false,
    title: "",
    message: "",
    tone: "neutral",
  });
  const [datos, setDatos] = useState({
    nombre: "",
    salarioQuincena: "",
    bonificacion: "",
    horaExtra: "",
    viaticos_diarios: "",
    fechaIngreso: "",
    dpi: "",
    telefono: "",
    fotoPapeleria: null,
  });
  const modalRoot = typeof document !== "undefined" ? document.body : null;

  const normalizeDpi = (value) => String(value || "").replace(/\D/g, "");
  const normalizePhone = (value) => String(value || "").replace(/\D/g, "");

  const formatDpi = (value) => {
    const digits = normalizeDpi(value).slice(0, 13);
    const part1 = digits.slice(0, 4);
    const part2 = digits.slice(4, 9);
    const part3 = digits.slice(9, 13);
    return [part1, part2, part3].filter(Boolean).join("-");
  };

  const formatPhone = (value) => {
    const digits = normalizePhone(value).slice(0, 8);
    return digits.replace(/(\d{4})(\d+)/, "$1-$2");
  };

  const openModal = (title, message, tone = "neutral") => {
    setModalState({ open: true, title, message, tone });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    const dpiValue = normalizeDpi(datos.dpi);
    if (!dpiValue) {
      setDpiStatus("idle");
      return undefined;
    }

    setDpiStatus("checking");
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from("registrodepersonal")
        .select("id")
        .eq("dpi", dpiValue)
        .limit(1);

      if (error) {
        setDpiStatus("idle");
        return;
      }

      const exists = Array.isArray(data) && data.length > 0;
      setDpiStatus(exists ? "exists" : "available");
    }, 500);

    return () => clearTimeout(timer);
  }, [datos.dpi]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "dpi") {
      setDatos((prev) => ({ ...prev, [name]: formatDpi(value) }));
      return;
    }
    if (name === "telefono") {
      setDatos((prev) => ({ ...prev, [name]: formatPhone(value) }));
      return;
    }
    setDatos((prev) => ({ ...prev, [name]: value }));
  };

  const handleFoto = (e) => {
    setDatos((prev) => ({ ...prev, fotoPapeleria: e.target.files[0] }));
  };

  const handleGuardar = async () => {
    if (!datos.nombre.trim() || !tipoPersonal) {
      openModal(
        "Faltan datos",
        "Completa el nombre y selecciona el tipo de personal.",
        "error"
      );
      return;
    }
    if (!normalizeDpi(datos.dpi)) {
      openModal(
        "Faltan datos",
        "Por favor, ingresa el DPI del trabajador.",
        "error"
      );
      return;
    }

    let urlPapeleria = null;

    if (datos.fotoPapeleria) {
      const archivo = datos.fotoPapeleria;
      const nombreArchivo = `${Date.now()}_${archivo.name}`;
      const { error: errorUpload } = await supabase.storage
        .from("papeleria")
        .upload(nombreArchivo, archivo);

      if (errorUpload) {
        console.error(errorUpload);
        openModal(
          "Error al subir archivo",
          errorUpload.message || "No se pudo subir la papeleria.",
          "error"
        );
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("papeleria")
        .getPublicUrl(nombreArchivo);

      urlPapeleria = publicUrl;
    }

    const payload = {
      nombrecompleto: datos.nombre.trim(),
      modalidad: tipoPersonal,
      salariopordia:
        tipoPersonal === "temporal"
          ? parseFloat(datos.salarioQuincena || 0)
          : null,
      salarioporquincena:
        tipoPersonal === "fijo" ? parseFloat(datos.salarioQuincena || 0) : null,
      bonificacion:
        tipoPersonal === "fijo" ? parseFloat(datos.bonificacion || 0) : null,
      pagoporhoraextra: parseFloat(datos.horaExtra || 0),
      viaticos_diarios:
        tipoPersonal === "fijo" ? parseFloat(datos.viaticos_diarios || 0) : null,
      fechadeingreso: datos.fechaIngreso || new Date().toISOString().slice(0, 10),
      dpi: normalizeDpi(datos.dpi),
      telefono: normalizePhone(datos.telefono),
      ...(urlPapeleria ? { urlpapeleria: urlPapeleria } : {}),
    };

    const { data: existing, error: lookupError } = await supabase
      .from("registrodepersonal")
      .select("id")
      .eq("dpi", payload.dpi)
      .limit(1);

    if (lookupError) {
      console.error(lookupError);
      openModal(
        "Error al validar DPI",
        lookupError.message || "Ocurrio un error al validar el DPI.",
        "error"
      );
      return;
    }

    const hasExisting = Array.isArray(existing) && existing.length > 0;

    if (hasExisting) {
      openModal(
        "DPI ya registrado",
        "Ese DPI ya existe. No se puede registrar otra persona con el mismo DPI.",
        "error"
      );
      return;
    }

    const { error } = await supabase
      .from("registrodepersonal")
      .insert([payload]);

    if (!error) {
      openModal(
        "Personal agregado",
        "El personal fue agregado correctamente.",
        "success"
      );
      await guardarLog(
        usuario,
        "Registro de nuevo personal",
        `Se agregó al trabajador: ${datos.nombre}`
      );

      setDatos({
        nombre: "",
        salarioQuincena: "",
        bonificacion: "",
        horaExtra: "",
        viaticos_diarios: "",
        fechaIngreso: "",
        dpi: "",
        telefono: "",
        fotoPapeleria: null,
      });
      setTipoPersonal("");
    } else {
      console.error(error);
      openModal(
        "Error al guardar",
        error.message || "Ocurrio un error al guardar el personal.",
        "error"
      );
    }
  };

  return (
    <div className="bg-white/60 p-6 rounded-xl shadow-md max-w-3xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-2 text-center text-gray-800">📝 Registro de Personal</h2>

      {!tipoPersonal ? (
        <div className="text-center">
          <p className="text-gray-700 font-medium mb-4">¿Qué tipo de personal deseas registrar?</p>
          <div className="flex justify-center gap-6">
            <button
              onClick={() => setTipoPersonal("fijo")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Personal Fijo
            </button>
            <button
              onClick={() => setTipoPersonal("temporal")}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Personal Temporal
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <input
            type="text"
            placeholder="Nombre completo"
            name="nombre"
            value={datos.nombre}
            onChange={handleChange}
            autoComplete="off"
            className="border p-2 rounded"
          />

          <div className="relative">
            <input
              type="text"
              placeholder="No. DPI"
              name="dpi"
              value={datos.dpi}
              onChange={handleChange}
              autoComplete="off"
              className={`border p-2 pr-10 rounded w-full ${
                dpiStatus === "available"
                  ? "border-green-500"
                  : dpiStatus === "exists"
                  ? "border-red-500"
                  : ""
              }`}
            />
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs">
              {dpiStatus === "checking" && (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
              )}
              {dpiStatus === "available" && (
                <>
                  <span className="text-green-600">DPI disponible</span>
                  <span className="text-green-600">✓</span>
                </>
              )}
              {dpiStatus === "exists" && (
                <>
                  <span className="text-red-600">DPI ya registrado</span>
                  <span className="text-red-600">✕</span>
                </>
              )}
            </div>
          </div>

          <input
            type="number"
            placeholder={tipoPersonal === "fijo" ? "Salario por quincena" : "Salario por día"}
            name="salarioQuincena"
            value={datos.salarioQuincena}
            onChange={handleChange}
            autoComplete="off"
            className="border p-2 rounded"
          />

          {tipoPersonal === "fijo" && (
            <>
              <input
                type="number"
                placeholder="Bono por día trabajado"
                name="bonificacion"
                value={datos.bonificacion}
                onChange={handleChange}
                autoComplete="off"
                className="border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Viáticos"
                name="viaticos_diarios"
                value={datos.viaticos_diarios}
                onChange={handleChange}
                autoComplete="off"
                className="border p-2 rounded"
              />
            </>
          )}

          <input
            type="number"
            placeholder="Pago por hora extra"
            name="horaExtra"
            value={datos.horaExtra}
            onChange={handleChange}
            autoComplete="off"
            className="border p-2 rounded"
          />
          <input
            type="date"
            name="fechaIngreso"
            value={datos.fechaIngreso}
            onChange={handleChange}
            autoComplete="off"
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Teléfono"
            name="telefono"
            value={datos.telefono}
            onChange={handleChange}
            autoComplete="off"
            className="border p-2 rounded"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Papelería</label>
            <input
              type="file"
              onChange={handleFoto}
              autoComplete="off"
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="flex justify-between mt-6 col-span-full">
            <button
              onClick={() => setTipoPersonal("")}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
            >
              Volver
            </button>
            <button
              onClick={handleGuardar}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Guardar personal
            </button>
          </div>
        </div>
      )}

      {modalState.open &&
        modalRoot &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {modalState.title}
                  </h3>
                  <p
                    className={`mt-2 text-sm ${
                      modalState.tone === "success"
                        ? "text-emerald-600"
                        : modalState.tone === "error"
                        ? "text-red-600"
                        : "text-slate-600"
                    }`}
                  >
                    {modalState.message}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-slate-500 hover:text-slate-700"
                  onClick={closeModal}
                >
                  Cerrar
                </button>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                  onClick={closeModal}
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>,
          modalRoot
        )}
    </div>
  );
}

