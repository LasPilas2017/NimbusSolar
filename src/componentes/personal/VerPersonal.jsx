// VerPersonal.jsx
import React from "react";

export default function VerPersonal({ personal }) {
  return (
    <div className="overflow-x-auto bg-white/70 backdrop-blur-md p-6 rounded-xl shadow-xl mt-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">👤 Todos los Trabajadores</h3>

      <table className="min-w-full border border-gray-300 text-sm text-center">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            <th className="px-4 py-2 border">Nombre</th>
            <th className="px-4 py-2 border">Modalidad</th>
            <th className="px-4 py-2 border">Salario</th>
            <th className="px-4 py-2 border">Bono por día trabajado</th>
            <th className="px-4 py-2 border">Hora extra</th>
            <th className="px-4 py-2 border">Viáticos</th>
            <th className="px-4 py-2 border">DPI</th>
            <th className="px-4 py-2 border">Teléfono</th>
            <th className="px-4 py-2 border">Ingreso</th>
            <th className="px-4 py-2 border">Papelería</th>
          </tr>
        </thead>
        <tbody>
          {personal.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="px-4 py-2 border">{p.nombrecompleto}</td>
              <td className="px-4 py-2 border capitalize">{p.modalidad}</td>
              <td className="px-4 py-2 border">
                {p.modalidad === "fijo"
                  ? `Q${p.salarioporquincena || 0}`
                  : `Q${p.salariopordia || 0}`}
              </td>
              <td className="px-4 py-2 border">{p.bonificacion || "-"}</td>
              <td className="px-4 py-2 border">{p.pagoporhoraextra || "-"}</td>
              <td className="px-4 py-2 border">{p.viaticos_diarios || "-"}</td>
              <td className="px-4 py-2 border">{p.dpi || "-"}</td>
              <td className="px-4 py-2 border">{p.telefono || "-"}</td>
              <td className="px-4 py-2 border">
                {p.fechadeingreso ? p.fechadeingreso.split("T")[0] : "-"}
              </td>
              <td className="px-4 py-2 border">
                {p.urlpapeleria ? (
                  <button
                    onClick={() => window.open(p.urlpapeleria, "_blank")}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium px-2 py-1 rounded-full text-xs transition"
                  >
                    Ver Papeles
                  </button>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
