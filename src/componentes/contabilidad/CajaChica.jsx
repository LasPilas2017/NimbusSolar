import { useState } from "react";

export default function CajaChica({ onCerrar }) {
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [monto, setMonto] = useState("");
  const [factura, setFactura] = useState("no");
  const [noFactura, setNoFactura] = useState("");
  const [fotoFactura, setFotoFactura] = useState(null);
  const [cajaChicaRestante, setCajaChicaRestante] = useState(1000); // Valor de ejemplo

  const handleGuardarCajaChica = () => {
    console.log({
      proyectoSeleccionado,
      descripcion,
      fecha,
      monto,
      factura,
      noFactura: factura === "si" ? noFactura : null,
      fotoFactura: factura === "si" ? fotoFactura : null,
    });

    // Aquí podrías enviar los datos a la base de datos

    // Reiniciar campos
    setProyectoSeleccionado("");
    setDescripcion("");
    setFecha("");
    setMonto("");
    setFactura("no");
    setNoFactura("");
    setFotoFactura(null);

    alert("¡Caja Chica registrada exitosamente!");
  };

  return (
    <div className="bg-white/90 p-6 rounded-2xl shadow-xl max-w-md mx-auto mt-4 relative">
      <h2 className="text-xl font-bold text-gray-800 mb-4">💰 Registro de Caja Chica</h2>

      {/* Caja chica restante */}
      <div className="absolute top-2 right-4 text-xs bg-green-100 text-green-800 font-semibold rounded px-2 py-1">
        Q{cajaChicaRestante} restante
      </div>

      <div className="grid grid-cols-1 gap-4">
        <select
          value={proyectoSeleccionado}
          onChange={(e) => setProyectoSeleccionado(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Selecciona un proyecto</option>
          <option value="Proyecto A">Proyecto A</option>
          <option value="Proyecto B">Proyecto B</option>
          {/* Agrega más proyectos si lo deseas */}
        </select>

        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Monto"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className="border p-2 rounded"
        />

        <div className="flex items-center gap-4">
          <span className="font-semibold">Factura contable:</span>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="factura"
              value="si"
              checked={factura === "si"}
              onChange={() => setFactura("si")}
            />
            Sí
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="factura"
              value="no"
              checked={factura === "no"}
              onChange={() => setFactura("no")}
            />
            No
          </label>
        </div>

        {factura === "si" && (
          <>
            <input
              type="text"
              placeholder="No. Factura"
              value={noFactura}
              onChange={(e) => setNoFactura(e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="file"
              onChange={(e) => setFotoFactura(e.target.files[0])}
              className="border p-2 rounded"
            />
          </>
        )}

        <button
          onClick={handleGuardarCajaChica}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Guardar
        </button>

        {/* Botón de Cerrar */}
        <button
          onClick={onCerrar}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
