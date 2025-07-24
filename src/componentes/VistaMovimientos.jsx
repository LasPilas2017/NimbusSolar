// src/componentes/VistaMovimientos.jsx (¡o como lo tengas!)
import { useEffect, useState } from "react";
import supabase from "../supabase"

export default function VistaMovimientos() {  // 👈 sin la "s"
  const [logs, setLogs] = useState([]);
console.log("¿Qué es supabase?", supabase);

  useEffect(() => {
    const obtenerLogs = async () => {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Error al obtener logs:", error.message);
      } else {
        setLogs(data);
      }
    };

    obtenerLogs();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">📋 Vista de Movimiento</h1>
      <div className="overflow-x-auto">
        {logs.length === 0 ? (
          <p className="text-gray-600">No hay registros aún.</p>
        ) : (
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Usuario</th>
                <th className="p-2">Acción</th>
                <th className="p-2">Descripción</th>
                <th className="p-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b">
                  <td className="p-2">{log.usuario}</td>
                  <td className="p-2">{log.accion}</td>
                  <td className="p-2">{log.descripcion || "-"}</td>
                  <td className="p-2">
                    {log.fecha
                      ? new Date(log.fecha).toLocaleString()
                      : "Sin fecha"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
