import { useState, useMemo } from "react";
import { Pencil, Save, X } from "lucide-react";

export default function TablaFinancieraProyecto({ trabajosProyecto }) {
  const [modoEdicion, setModoEdicion] = useState(null);
  const [precios, setPrecios] = useState(
    trabajosProyecto.map((trabajo) => ({
      id: trabajo.id,
      pagoPorUnidad: trabajo.precioCliente || 0,
    }))
  );

  const manejarCambio = (id, valor) => {
    setPrecios((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, pagoPorUnidad: parseFloat(valor) || 0 } : item
      )
    );
  };

  const cancelarEdicion = () => setModoEdicion(null);
  const guardarEdicion = (id) => {
    setModoEdicion(null);
    // Aquí luego puedes agregar lógica para guardar en Supabase
  };

  const resumen = useMemo(() => {
    return trabajosProyecto.reduce(
      (acc, trabajo) => {
        const datos = precios.find((p) => p.id === trabajo.id) || {};
        const unidades = trabajo.unidades || trabajo.unidades_totales || 0;
        const instaladas = trabajo.instaladas || 0;
        const total = datos.pagoPorUnidad * unidades;
        const cobrado = datos.pagoPorUnidad * instaladas;

        acc.produccion += total;
        acc.cobrado += cobrado;
        acc.utilidad += cobrado; 

        return acc;
      },
      { produccion: 0, cobrado: 0, utilidad: 0 }
    );
  }, [trabajosProyecto, precios]);

  return (
    <div className="overflow-x-auto text-sm space-y-6">
      {/* 🔹 Resumen financiero */}
       <div className="grid grid-cols-4 gap-4 text-center p-4 bg-gray-100 rounded-xl shadow">
            <div>
              <div className="text-sm">💲 Producción</div>
              <div className="text-lg font-bold">Q{resumen.produccion.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm">🔺 Gastado</div>
              <div className="text-lg font-bold">Q{resumen.gastado?.toFixed(2) ?? "0.00"}</div>
            </div>
            <div>
              <div className="text-sm">💚 Utilidad</div>
              <div className="text-lg font-bold text-green-700">Q{resumen.utilidad.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm">💖 Liquidez</div>
              <div className="text-lg font-bold">Q{resumen.utilidad.toFixed(2)}</div>
            </div>
          </div>


      {/* 🔹 Tabla */}
      <div className="overflow-x-auto scrollbar-hide rounded-xl border border-gray-300">
        <table className="min-w-full text-sm bg-gray-50">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="px-3 py-2 sticky left-0 bg-gray-200 border-r border-gray-300 z-10 text-left">Trabajo</th>
              <th className="px-3 py-2 text-center">Pago por unidad (Q)</th>
              <th className="px-3 py-2 text-center">Total por el trabajo</th>
              <th className="px-3 py-2 text-center">Unidades instaladas</th>
              <th className="px-3 py-2 text-center">Cobro ya instalado</th>
              <th className="px-3 py-2 text-center">Utilidad (Q)</th>
              <th className="px-3 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {trabajosProyecto.map((trabajo) => {
              const datos = precios.find((p) => p.id === trabajo.id) || {};
              const unidades = trabajo.unidades || trabajo.unidades_totales || 0;
              const instaladas = trabajo.instaladas || 0;
              const totalTrabajo = datos.pagoPorUnidad * unidades;
              const cobradoInstalado = datos.pagoPorUnidad * instaladas;

              return (
                <tr key={trabajo.id} className="border-b">
                  <td className="px-3 py-2 sticky left-0 bg-white border-r border-gray-200 font-medium">{trabajo.nombre}</td>
                  <td className="px-3 py-2 text-center">
                    {modoEdicion === trabajo.id ? (
                      <input
                        type="number"
                        className="w-24 p-1 border rounded text-center"
                        value={datos.pagoPorUnidad}
                        onChange={(e) => manejarCambio(trabajo.id, e.target.value)}
                      />
                    ) : (
                      `Q${datos.pagoPorUnidad?.toFixed(2) || "0.00"}`
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">Q{totalTrabajo.toFixed(2)}</td>
                  <td className="px-3 py-2 text-center">{instaladas}</td>
                  <td className="px-3 py-2 text-center">Q{cobradoInstalado.toFixed(2)}</td>
                  <td className="px-3 py-2 text-center font-semibold text-green-700">Q{cobradoInstalado.toFixed(2)}</td>
                  <td className="px-3 py-2 text-center">
                    {modoEdicion === trabajo.id ? (
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => guardarEdicion(trabajo.id)} title="Guardar">
                          <Save className="w-5 h-5 text-green-600 hover:text-green-800" />
                        </button>
                        <button onClick={cancelarEdicion} title="Cancelar">
                          <X className="w-5 h-5 text-red-500 hover:text-red-700" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setModoEdicion(trabajo.id)} title="Editar">
                        <Pencil className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
