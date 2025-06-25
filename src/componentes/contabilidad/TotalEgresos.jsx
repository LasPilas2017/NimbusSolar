import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase"; // ajusta ruta si es necesario

export default function TotalEgresos({ onCerrar }) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [gastos, setGastos] = useState([]);
  const [gastosFiltrados, setGastosFiltrados] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [subcategorias, setSubcategorias] = useState([]);

  useEffect(() => {
    obtenerEgresos();
    obtenerSubcategorias();
  }, []);

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

  const obtenerEgresos = async () => {
    const { data, error } = await supabase
      .from("egresos")
      .select("*")
      .order("fecha", { ascending: false });

    if (error) {
      console.error("Error al obtener egresos:", error);
    } else {
      setGastos(data);
    }
  };

  const obtenerSubcategorias = async () => {
    const { data, error } = await supabase.from("subcategorias_contables").select("*");
    if (!error) setSubcategorias(data);
  };

  const agregarGasto = async (nuevoGasto) => {
    const { error } = await supabase.from("egresos").insert([nuevoGasto]);

    if (error) {
      console.error("Error al guardar egreso:", error);
    } else {
      obtenerEgresos();
      setMostrarFormulario(false);
    }
  };

  const totalFiltrado = gastosFiltrados.reduce(
    (total, g) => total + Number(g.monto),
    0
  );

  return (
    <div className="relative bg-white rounded-xl shadow-md p-4">
      <h3 className="text-lg font-bold mb-4">💸 Detalle de Egresos</h3>

      {/* Filtro de fechas */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold">Fecha inicio:</label>
          <input
            type="date"
            className="border rounded w-full p-2"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold">Fecha fin:</label>
          <input
            type="date"
            className="border rounded w-full p-2"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de resultados */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-200 rounded-xl">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-2 px-3">No.</th>
              <th className="py-2 px-3">Boleta</th>
              <th className="py-2 px-3">Fecha</th>
              <th className="py-2 px-3">Monto</th>
              <th className="py-2 px-3">Concepto</th>
              <th className="py-2 px-3">Categoría</th>
              <th className="py-2 px-3">Comentario</th>
            </tr>
          </thead>
          <tbody>
            {gastosFiltrados.map((g, i) => (
              <tr key={g.id || i} className="border-t">
                <td className="py-2 px-3">{i + 1}</td>
                <td className="py-2 px-3">{g.autorizacion}</td>
                <td className="py-2 px-3">{g.fecha}</td>
                <td className="py-2 px-3 text-red-600 font-semibold">
                  Q{Number(g.monto).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="py-2 px-3">{g.concepto}</td>
                <td className="py-2 px-3">{g.categoria}</td>
                <td className="py-2 px-3">{g.comentario}</td>
              </tr>
            ))}
            <tr className="border-t bg-gray-50 font-bold">
              <td colSpan="3" className="py-2 px-3 text-right">
                Total:
              </td>
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

      {/* Botones */}
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

      {/* Formulario nuevo egreso */}
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
              <input name="autorizacion" className="border rounded p-2" placeholder="No. de Boleta" required />
              <input name="fecha" type="date" className="border rounded p-2" required />
              <input name="monto" type="number" step="0.01" className="border rounded p-2" placeholder="Monto" required />
              <input name="concepto" className="border rounded p-2" placeholder="Concepto" required />
              <select name="categoria" className="border rounded p-2" required>
                <option value="">Selecciona subcategoría</option>
                {subcategorias.map((sub) => (
                  <option key={sub.id} value={sub.nombre}>{sub.nombre}</option>
                ))}
              </select>
              <input name="comentario" className="border rounded p-2" placeholder="Comentario" />
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
