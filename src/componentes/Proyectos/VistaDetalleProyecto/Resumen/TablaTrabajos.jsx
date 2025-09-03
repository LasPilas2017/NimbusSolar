import React from "react";

export default function TablaTrabajos({
  filas = [
    { trabajo: "Instalación de paneles", cantidad: 56, precioUnitario: 120 },
    { trabajo: "Tendido de cable", cantidad: 120, precioUnitario: 35 },
    { trabajo: "Limpieza de maleza", cantidad: 80, precioUnitario: 25 },
  ],
}) {
  const fmtQ = (n) => `Q${Number(n || 0).toLocaleString("es-GT")}`;
  const calcTotal = (f) => Number(f.cantidad || 0) * Number(f.precioUnitario || 0);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 bg-slate-100 text-slate-700">
          <tr>
            <th className="text-left font-semibold px-4 py-2 rounded-l-xl">Trabajo</th>
            <th className="text-right font-semibold px-4 py-2">Cantidad</th>
            <th className="text-right font-semibold px-4 py-2">Precio unitario</th>
            <th className="text-right font-semibold px-4 py-2 rounded-r-xl">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {filas.map((f, idx) => (
            <tr key={idx} className="bg-white hover:bg-slate-50">
              <td className="px-4 py-2">{f.trabajo}</td>
              <td className="px-4 py-2 text-right">{Number(f.cantidad || 0)}</td>
              <td className="px-4 py-2 text-right">{fmtQ(f.precioUnitario)}</td>
              <td className="px-4 py-2 text-right font-semibold">{fmtQ(calcTotal(f))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
