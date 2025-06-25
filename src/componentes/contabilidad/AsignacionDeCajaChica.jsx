import React, { useState, useEffect } from "react";
import { FiFileText, FiPaperclip } from "react-icons/fi";

export default function AsignacionDeCajaChica() {
  const [personal, setPersonal] = useState([]);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
  const [vista, setVista] = useState("");
  const [montoNuevo, setMontoNuevo] = useState("");
  const [noTransferencia, setNoTransferencia] = useState("");
  const [fotoComprobante, setFotoComprobante] = useState(null);
  const [gastos, setGastos] = useState([]);
  const [mostrarFormularioAsignar, setMostrarFormularioAsignar] = useState(false);
  const [nuevaAsignacion, setNuevaAsignacion] = useState({
    persona: "",
    monto: "",
    fecha: new Date().toISOString().slice(0, 10),
    documento: null,
  });

  useEffect(() => {
    setPersonal([
      { id: "1", nombre: "Luis Pérez", entregado: 1000, gastado: 400, finalizado: false },
      { id: "2", nombre: "Ana Gómez", entregado: 1500, gastado: 700, finalizado: false },
      { id: "3", nombre: "Carlos Ruiz", entregado: 800, gastado: 800, finalizado: true },
      { id: "4", nombre: "Julia Martínez", entregado: 0, gastado: 0, finalizado: false },
    ]);
  }, []);

  useEffect(() => {
    if (personaSeleccionada) {
      setGastos([
        {
          fecha: "2025-06-20",
          descripcion: "Compra herramienta",
          monto: 150,
          factura: "F-23421",
          soporte: true,
        },
        {
          fecha: "2025-06-22",
          descripcion: "Combustible",
          monto: 100,
          factura: "F-23425",
          soporte: false,
        },
      ]);
    } else {
      setGastos([]);
    }
  }, [personaSeleccionada]);

  const efectivoDisponible = (entregado, gastado) =>
    (parseFloat(entregado) - parseFloat(gastado)).toFixed(2);

  const totalProyectado = () => {
    const actual = parseFloat(personaSeleccionada?.entregado || 0);
    const nuevo = parseFloat(montoNuevo || 0);
    return (actual + nuevo).toFixed(2);
  };

  const handleGuardarAsignacion = () => {
    if (!nuevaAsignacion.persona || !nuevaAsignacion.monto) {
      alert("Faltan datos");
      return;
    }

    alert(`Asignado Q${nuevaAsignacion.monto} a ${nuevaAsignacion.persona}`);
    setMostrarFormularioAsignar(false);
    setNuevaAsignacion({
      persona: "",
      monto: "",
      fecha: new Date().toISOString().slice(0, 10),
      documento: null,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mt-6 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl">

      {/* Lado Izquierdo */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-green-800">Personal con Caja Chica</h3>
          <button
            onClick={() => setMostrarFormularioAsignar(!mostrarFormularioAsignar)}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
          >
            Asignar nueva caja chica
          </button>
        </div>

        {/* Formulario para nueva asignación */}
        {mostrarFormularioAsignar && (
          <div className="mb-4 bg-white p-4 rounded shadow space-y-3">
            <select
              value={nuevaAsignacion.persona}
              onChange={(e) => setNuevaAsignacion({ ...nuevaAsignacion, persona: e.target.value })}
              className="w-full border p-2 rounded text-center"
            >
              <option value="">Selecciona persona</option>
              {personal
                .filter((p) => p.entregado === 0 && !p.finalizado)
                .map((p) => (
                  <option key={p.id} value={p.nombre}>
                    {p.nombre}
                  </option>
                ))}
            </select>

            <input
              type="number"
              placeholder="Monto a asignar"
              value={nuevaAsignacion.monto}
              onChange={(e) => setNuevaAsignacion({ ...nuevaAsignacion, monto: e.target.value })}
              className="w-full border p-2 rounded text-center"
            />

            <div className="text-sm text-gray-600">
              Fecha:{" "}
              <span className="font-semibold text-black">{nuevaAsignacion.fecha}</span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
              <FiPaperclip />
              <span>Subir documento</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) =>
                  setNuevaAsignacion({ ...nuevaAsignacion, documento: e.target.files[0] })
                }
              />
            </label>

            <button
              onClick={handleGuardarAsignacion}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
              Guardar asignación
            </button>
          </div>
        )}

        {/* Lista de personas */}
        <ul className="space-y-2">
          {personal
            .sort((a, b) => (a.finalizado === b.finalizado ? 0 : a.finalizado ? 1 : -1))
            .map((p) => (
              <li
                key={p.id}
                onClick={() => {
                  setPersonaSeleccionada(p);
                  setVista("");
                  setMontoNuevo("");
                  setNoTransferencia("");
                  setFotoComprobante(null);
                }}
                className={`cursor-pointer border p-3 rounded-xl transition flex justify-between items-center ${
                  p.finalizado
                    ? "bg-gray-200 text-gray-500"
                    : "hover:bg-green-100"
                }`}
              >
                <span>{p.nombre}</span>
                <span className="font-bold text-green-700">
                  Q{efectivoDisponible(p.entregado, p.gastado)}
                </span>
              </li>
            ))}
        </ul>
      </div>

      {/* Lado Derecho */}
      <div>
        {personaSeleccionada ? (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-center text-gray-800">
              {personaSeleccionada.nombre}
            </h3>

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-2 text-sm text-center text-gray-700">
              <div className="bg-green-100 rounded p-2">
                <div className="font-semibold">Disponible</div>
                <div className="text-green-800 font-bold">
                  Q{efectivoDisponible(personaSeleccionada.entregado, personaSeleccionada.gastado)}
                </div>
              </div>
              <div className="bg-yellow-100 rounded p-2">
                <div className="font-semibold">Entregado</div>
                <div className="text-yellow-800 font-bold">Q{personaSeleccionada.entregado}</div>
              </div>
              <div className="bg-red-100 rounded p-2">
                <div className="font-semibold">Gastado</div>
                <div className="text-red-800 font-bold">Q{personaSeleccionada.gastado}</div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-center gap-4">
              {!personaSeleccionada.finalizado && (
                <>
                  <button
                    onClick={() => setVista("ingreso")}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    Ingresar Caja Chica
                  </button>
                  <button
                    onClick={() => setVista("gastos")}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Ver Gastos
                  </button>
                  <button
                    onClick={() => alert("Caja chica finalizada")}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                  >
                    Finalizar Caja Chica
                  </button>
                </>
              )}
            </div>

            {/* Formulario Ingreso */}
            {vista === "ingreso" && !personaSeleccionada.finalizado && (
              <div className="border p-4 rounded-xl bg-white shadow space-y-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">No. de Transferencia o Depósito</label>
                  <input
                    type="text"
                    value={noTransferencia}
                    onChange={(e) => setNoTransferencia(e.target.value)}
                    className="w-full border rounded p-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Monto a ingresar</label>
                  <input
                    type="number"
                    value={montoNuevo}
                    onChange={(e) => setMontoNuevo(e.target.value)}
                    className="w-full border rounded p-2 text-center"
                    placeholder="Q0.00"
                  />
                </div>

                <div className="text-sm text-gray-600">
                  Restante actual:{" "}
                  <span className="font-bold text-green-700">
                    Q{efectivoDisponible(personaSeleccionada.entregado, personaSeleccionada.gastado)}
                  </span>
                  <br />
                  Total con ingreso:{" "}
                  <span className="font-bold text-blue-700">Q{totalProyectado()}</span>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Documento</label>
                  <input type="file" onChange={(e) => setFotoComprobante(e.target.files[0])} />
                </div>

                <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
                  Confirmar Ingreso
                </button>
              </div>
            )}

            {/* Tabla de Gastos */}
            {vista === "gastos" && (
              <div className="border p-4 rounded-xl shadow bg-white max-h-64 overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700 font-semibold">
                    <tr>
                      <th className="p-2">Fecha</th>
                      <th className="p-2">Descripción</th>
                      <th className="p-2">Monto</th>
                      <th className="p-2">Factura</th>
                      <th className="p-2">Doc.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gastos.map((g, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">{g.fecha}</td>
                        <td className="p-2">{g.descripcion}</td>
                        <td className="p-2">Q{g.monto}</td>
                        <td className="p-2">{g.factura}</td>
                        <td className="p-2 text-center">
                          {g.soporte && <FiFileText className="inline text-blue-600" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 italic text-center mt-10">
            Selecciona a una persona para ver detalles
          </p>
        )}
      </div>
    </div>
  );
}
