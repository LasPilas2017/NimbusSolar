// AgregarPersonal.jsx
import { useState } from "react";
import supabase from "../../supabase";
import { guardarLog } from "../../utils";
export default function AgregarPersonal({ usuario }) {
  const [tipoPersonal, setTipoPersonal] = useState("");
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos((prev) => ({ ...prev, [name]: value }));
  };

  const handleFoto = (e) => {
    setDatos((prev) => ({ ...prev, fotoPapeleria: e.target.files[0] }));
  };

  const handleGuardar = async () => {
    if (!datos.nombre.trim() || !tipoPersonal) {
      alert("Por favor, completa el nombre y selecciona el tipo de personal.");
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
        alert("Error al subir la papelería.");
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("papeleria")
        .getPublicUrl(nombreArchivo);

      urlPapeleria = publicUrl;
    }

    const nuevoPersonal = {
      nombrecompleto: datos.nombre.trim(),
      modalidad: tipoPersonal,
      salariopordia: tipoPersonal === "temporal" ? parseFloat(datos.salarioQuincena || 0) : null,
      salarioporquincena: tipoPersonal === "fijo" ? parseFloat(datos.salarioQuincena || 0) : null,
      bonificacion: tipoPersonal === "fijo" ? parseFloat(datos.bonificacion || 0) : null,
      pagoporhoraextra: parseFloat(datos.horaExtra || 0),
      viaticos_diarios: tipoPersonal === "fijo" ? parseFloat(datos.viaticos_diarios || 0) : null,
      fechadeingreso: datos.fechaIngreso || new Date().toISOString().slice(0, 10),
      dpi: datos.dpi || "",
      telefono: datos.telefono || "",
      urlpapeleria: urlPapeleria,
    };

    const { error } = await supabase.from("registrodepersonal").insert([nuevoPersonal]);

    if (!error) {
      alert("¡Personal agregado correctamente!");
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
      alert("Ocurrió un error al guardar el personal.");
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
            className="border p-2 rounded"
          />

          <input
            type="number"
            placeholder={tipoPersonal === "fijo" ? "Salario por quincena" : "Salario por día"}
            name="salarioQuincena"
            value={datos.salarioQuincena}
            onChange={handleChange}
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
                className="border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Viáticos"
                name="viaticos_diarios"
                value={datos.viaticos_diarios}
                onChange={handleChange}
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
            className="border p-2 rounded"
          />
          <input
            type="date"
            name="fechaIngreso"
            value={datos.fechaIngreso}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="No. DPI"
            name="dpi"
            value={datos.dpi}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Teléfono"
            name="telefono"
            value={datos.telefono}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Papelería</label>
            <input
              type="file"
              onChange={handleFoto}
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
    </div>
  );
}
