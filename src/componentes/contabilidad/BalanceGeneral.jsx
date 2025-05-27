import React, { useState, useEffect } from "react";

export default function BalanceGeneral({ ampliaciones, gastos }) {
  const [transacciones, setTransacciones] = useState([]);

  useEffect(() => {
    // Combinar ingresos (ampliaciones) y egresos (gastos)
    const ingresos = ampliaciones.map((a) => ({
      fecha: a.fecha,
      nombre: a.cliente || "Cliente desconocido",
      documento: a.documento || "Sin documento",
      medio: a.medio || "N/A",
      monto: Number(a.monto),
      tipo: "ingreso",
    }));

    const egresos = gastos.map((g) => ({
      fecha: g.fecha,
      nombre: g.proveedor || "Proveedor desconocido",
      documento: g.factura || "Sin factura",
      medio: "",
      monto: Number(g.monto),
      tipo: "egreso",
    }));

    // Unificar y ordenar por fecha
    const todasTransacciones = [...ingresos, ...egresos].sort(
      (a, b) => new Date(a.fecha) - new Date(b.fecha)
    );

    // Calcular saldo acumulado
    let saldo = 0;
    const transaccionesConSaldo = todasTransacciones.map((t) => {
      saldo += t.tipo === "ingreso" ? t.monto : -t.monto;
      return { ...t, saldo };
    });

    setTransacciones(transaccionesConSaldo);
  }, [ampliaciones, gastos]);

  return (
    <div className="bg-white mt-6 p-4 rounded-2xl shadow">
      <h3 className="text-lg font-bold mb-4">📊 Balance General</h3>
      <table className="min-w-full text-sm border border-gray-200 rounded-xl">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="py-2 px-4 text-left">Fecha</th>
            <th className="py-2 px-4 text-left">Proveedor / Cliente</th>
            <th className="py-2 px-4 text-left">No. Factura / Documento</th>
            <th className="py-2 px-4 text-left">Medio de Pago</th>
            <th className="py-2 px-4 text-left">Ingreso (Q)</th>
            <th className="py-2 px-4 text-left">Egreso (Q)</th>
            <th className="py-2 px-4 text-left">Saldo Acumulado (Q)</th>
          </tr>
        </thead>
        <tbody>
          {transacciones.map((t, index) => (
            <tr key={index} className="border-t">
              <td className="py-2 px-4">{t.fecha}</td>
              <td className="py-2 px-4">{t.nombre}</td>
              <td className="py-2 px-4">{t.documento}</td>
              <td className="py-2 px-4">{t.medio}</td>
              <td className="py-2 px-4">
                {t.tipo === "ingreso" ? `Q${t.monto.toFixed(2)}` : ""}
              </td>
              <td className="py-2 px-4">
                {t.tipo === "egreso" ? `Q${t.monto.toFixed(2)}` : ""}
              </td>
              <td className="py-2 px-4">Q{t.saldo.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
