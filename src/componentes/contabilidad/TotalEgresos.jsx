import React, { useState, useEffect } from "react";

export default function TotalEgresos({ onCerrar }) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [gastos, setGastos] = useState([
    {
      autorizacion: "A-001",
      fecha: "2025-06-01",
      monto: 450,
      concepto: "Compra de herramientas",
      categoria: "Herramientas",
      comentario: "Para el taller de mantenimiento"
    },
    {
      autorizacion: "A-002",
      fecha: "2025-06-03",
      monto: 300,
      concepto: "Pago de transporte",
      categoria: "Logística",
      comentario: "Transporte de paneles solares"
    },
    {
      autorizacion: "A-003",
      fecha: "2025-06-06",
      monto: 620.5,
      concepto: "Material eléctrico",
      categoria: "Materiales",
      comentario: "Cableado para nueva instalación"
    },
    {
      autorizacion: "A-004",
      fecha: "2025-06-10",
      monto: 150,
      concepto: "Reparación de equipo",
      categoria: "Mantenimiento",
      comentario: "Reparación de inversor dañado"
    },
  ]);

  const [gastosFiltrados, setGastosFiltrados] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    const filtrados = gastos.filter((g) => {
      const fecha = new Date(g.fecha);
      const inicio = fechaInicio ? new Date(fechaInicio) : null;
      const fin = fechaFin ? new Date(fechaFin) : null;

      if (inicio && fecha < inicio) return false;
      if (fin && fecha > fin) return false;

      return true;
    });

    setGastosFiltrados(filtrados);
  }, [fechaInicio, fechaFin, gastos]);

  const totalFiltrado = gastosFiltrados.reduce(
  (total, g) => total + Number(g.monto),
  0
);


  const agregarGasto = (nuevoGasto) => {
    setGastos([nuevoGasto, ...gastos]);
    setMostrarFormulario(false);
  };

  return (
    <div className="relative bg-white rounded-xl shadow-md p-4">
      <h3 className="text-lg font-bold mb-4">💸 Detalle de Egresos</h3>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1">
            Fecha inicio:
          </label>
          <input
            type="date"
            className="border rounded w-full p-2"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1">
            Fecha fin:
          </label>
          <input
            type="date"
            className="border rounded w-full p-2"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-200 rounded-xl">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-2 px-3 text-left">No.</th>
              <th className="py-2 px-3 text-left">Autorización</th>
              <th className="py-2 px-3 text-left">Fecha</th>
              <th className="py-2 px-3 text-left">Monto</th>
              <th className="py-2 px-3 text-left">Concepto</th>
              <th className="py-2 px-3 text-left">Categoría</th>
              <th className="py-2 px-3 text-left">Comentario</th>
            </tr>
          </thead>
          <tbody>
            {gastosFiltrados.map((gasto, index) => (
              <tr key={index} className="border-t">
                <td className="py-2 px-3">{index + 1}</td>
                <td className="py-2 px-3">{gasto.autorizacion}</td>
                <td className="py-2 px-3">{gasto.fecha}</td>
                <td className="py-2 px-3 text-red-600 font-semibold">
                  Q{Number(gasto.monto).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="py-2 px-3">{gasto.concepto}</td>
                <td className="py-2 px-3">{gasto.categoria}</td>
                <td className="py-2 px-3">{gasto.comentario}</td>
              </tr>
            ))}
            <tr className="border-t bg-gray-50 font-bold">
              <td colSpan="3" className="py-2 px-3 text-right">Total:</td>
              <td className="py-2 px-3 text-red-700">
                Q{totalFiltrado.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td colSpan="3"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between">
        <button
          onClick={onCerrar}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded"
        >
          Cerrar
        </button>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-4 rounded"
        >
          📄 Ingresar egreso
        </button>
      </div>

      {mostrarFormulario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-xl relative">
            <button
              onClick={() => setMostrarFormulario(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-4">Nuevo Egreso</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const nuevo = {
                  autorizacion: e.target.autorizacion.value,
                  fecha: e.target.fecha.value,
                  monto: parseFloat(e.target.monto.value),
                  concepto: e.target.concepto.value,
                  categoria: e.target.categoria.value,
                  comentario: e.target.comentario.value,
                };
                agregarGasto(nuevo);
              }}
              className="grid grid-cols-1 gap-3"
            >
              <input name="autorizacion" className="border rounded p-2" placeholder="No. de Autorización" required />
              <input name="fecha" type="date" className="border rounded p-2" required />
              <input name="monto" type="number" step="0.01" className="border rounded p-2" placeholder="Monto" required />
              <input name="concepto" className="border rounded p-2" placeholder="Concepto" required />
              <input name="categoria" className="border rounded p-2" placeholder="Categoría" required />
              <textarea name="comentario" className="border rounded p-2" placeholder="Comentario" />
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded">
                Guardar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
