import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";

export default function AsignacionDeCajaChica() {
  const [personal, setPersonal] = useState([]); // Lista de personas con caja chica
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null); // Persona activa
  const [montoIngreso, setMontoIngreso] = useState(0); // Monto a ingresar
  const [gastos, setGastos] = useState([]); // Lista de gastos
  const [mostrarFormularioIngreso, setMostrarFormularioIngreso] = useState(false);
  const [mostrarGastos, setMostrarGastos] = useState(false);

  // Cargar personal con caja chica al iniciar
  useEffect(() => {
    const cargarPersonal = async () => {
      const { data, error } = await supabase
        .from("registrodepersonal")
        .select("id, nombrecompleto, cajachica_asignada")
        .gt("cajachica_asignada", 0);

      if (!error) setPersonal(data);
    };
    cargarPersonal();
  }, []);

  // Cargar gastos de la persona seleccionada
  useEffect(() => {
    const cargarGastos = async () => {
      if (!personaSeleccionada) return;

      const { data, error } = await supabase
        .from("gastos_cajachica")
        .select("id, monto, descripcion, fecha")
        .eq("id_personal", personaSeleccionada.id)
        .order("fecha", { ascending: false });

      if (!error) setGastos(data);
    };

    cargarGastos();
  }, [personaSeleccionada]);

  // Calcular total usado y restante
  const totalUsado = gastos.reduce((sum, g) => sum + Number(g.monto), 0);
  const restante = (personaSeleccionada?.cajachica_asignada || 0) - totalUsado;

  // Guardar nuevo ingreso de caja chica
  const registrarIngreso = async (e) => {
    e.preventDefault();
    if (!personaSeleccionada || montoIngreso <= 0) return;

    const nuevoMonto = personaSeleccionada.cajachica_asignada + montoIngreso;

    const { error } = await supabase
      .from("registrodepersonal")
      .update({ cajachica_asignada: nuevoMonto })
      .eq("id", personaSeleccionada.id);

    if (!error) {
      setMontoIngreso(0);
      setMostrarFormularioIngreso(false);
      const actualizado = { ...personaSeleccionada, cajachica_asignada: nuevoMonto };
      setPersonaSeleccionada(actualizado);
      setPersonal((prev) =>
        prev.map((p) => (p.id === actualizado.id ? actualizado : p))
      );
      alert("Ingreso registrado correctamente.");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {/* Columna izquierda: listado de personal */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold mb-4">👤 Personal con Caja Chica</h2>
        {personal.map((p) => (
          <div
            key={p.id}
            onClick={() => {
              setPersonaSeleccionada(p);
              setMostrarFormularioIngreso(false);
              setMostrarGastos(false);
            }}
            className={`cursor-pointer p-2 mb-2 rounded border hover:bg-blue-50 ${personaSeleccionada?.id === p.id ? "bg-blue-100" : ""}`}
          >
            <div className="font-semibold">{p.nombrecompleto}</div>
            <div className="text-sm text-gray-600">Asignado: Q {p.cajachica_asignada.toFixed(2)}</div>
          </div>
        ))}
      </div>

      {/* Columna derecha: detalles y formularios */}
      <div className="bg-white p-4 rounded shadow">
        {personaSeleccionada ? (
          <>
            <h2 className="text-lg font-bold mb-2">📋 Caja Chica de {personaSeleccionada.nombrecompleto}</h2>
            <p><strong>Asignada:</strong> Q {personaSeleccionada.cajachica_asignada.toFixed(2)}</p>
            <p><strong>Usada:</strong> Q {totalUsado.toFixed(2)}</p>
            <p><strong>Restante:</strong> Q {restante.toFixed(2)}</p>

            <div className="flex gap-4 mt-4">
              <button
                onClick={() => {
                  setMostrarFormularioIngreso(true);
                  setMostrarGastos(false);
                }}
                className="bg-green-600 text-white px-4 py-1 rounded"
              >
                ➕ Ingreso
              </button>

              <button
                onClick={() => {
                  setMostrarGastos(true);
                  setMostrarFormularioIngreso(false);
                }}
                className="bg-purple-600 text-white px-4 py-1 rounded"
              >
                📄 Gastos
              </button>
            </div>

            {/* Formulario para ingreso */}
            {mostrarFormularioIngreso && (
              <form onSubmit={registrarIngreso} className="mt-4 space-y-2">
                <label className="block text-sm font-semibold">Monto a ingresar</label>
                <input
                  type="number"
                  value={montoIngreso}
                  onChange={(e) => setMontoIngreso(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-1 rounded mt-2"
                >
                  Guardar ingreso
                </button>
              </form>
            )}

            {/* Lista de gastos */}
            {mostrarGastos && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">📋 Gastos reportados</h3>
                {gastos.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay gastos registrados.</p>
                ) : (
                  <ul className="text-sm space-y-1">
                    {gastos.map((g) => (
                      <li key={g.id} className="border p-2 rounded">
                        <strong>Q {g.monto.toFixed(2)}</strong> - {g.descripcion} <br />
                        <span className="text-gray-500 text-xs">{new Date(g.fecha).toLocaleDateString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500">Selecciona una persona para ver detalles.</p>
        )}
      </div>
    </div>
  );
}
