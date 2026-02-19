export default function AsignacionPersonal({
  modoEdicion,
  mostrarFormulario,
  personalDisponible,
  supervisoresSeleccionados,
  setSupervisoresSeleccionados,
  trabajadoresSeleccionados,
  setTrabajadoresSeleccionados
}) {
  const editable = modoEdicion || mostrarFormulario;

  // Filtrado: personas aún no asignadas
  const idsAsignados = [...supervisoresSeleccionados, ...trabajadoresSeleccionados];
  const disponiblesParaAsignar = personalDisponible.filter(p => !idsAsignados.includes(p.id));

  const supervisores = personalDisponible.filter(p =>
    supervisoresSeleccionados.includes(p.id)
  );

  const trabajadores = personalDisponible.filter(p =>
    trabajadoresSeleccionados.includes(p.id)
  );

  return (
    <div className="space-y-6">
      {/* 🔷 Supervisores */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Supervisores asignados</label>
        <div className="flex flex-wrap gap-2 items-center">
          {supervisores.map(persona => (
            <span
              key={persona.id}
              className="px-3 py-1 rounded-full bg-purple-600 text-white text-sm flex items-center gap-1"
            >
              {persona.nombrecompleto}
              {editable && (
                <button
                  onClick={() =>
                    setSupervisoresSeleccionados(
                      supervisoresSeleccionados.filter(id => id !== persona.id)
                    )
                  }
                  className="text-white hover:text-red-300 ml-1"
                >
                  ✕
                </button>
              )}
            </span>
          ))}

          {/* Botón asignar */}
          {editable && disponiblesParaAsignar.length > 0 && (
            disponiblesParaAsignar.map((persona) => (
              <button
                key={persona.id}
                onClick={() =>
                  setSupervisoresSeleccionados([...supervisoresSeleccionados, persona.id])
                }
                className="px-3 py-1 rounded-full border border-purple-500 text-purple-700 text-sm hover:bg-purple-100 transition"
              >
                ➕ {persona.nombrecompleto}
              </button>
            ))
          )}
        </div>
      </div>

      {/* 🟢 Trabajadores */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Trabajadores asignados</label>
        <div className="flex flex-wrap gap-2 items-center">
          {trabajadores.map(persona => (
            <span
              key={persona.id}
              className="px-3 py-1 rounded-full bg-green-600 text-white text-sm flex items-center gap-1"
            >
              {persona.nombrecompleto}
              {editable && (
                <button
                  onClick={() =>
                    setTrabajadoresSeleccionados(
                      trabajadoresSeleccionados.filter(id => id !== persona.id)
                    )
                  }
                  className="text-white hover:text-red-300 ml-1"
                >
                  ✕
                </button>
              )}
            </span>
          ))}

          {/* Botón asignar */}
          {editable && disponiblesParaAsignar.length > 0 && (
            disponiblesParaAsignar.map((persona) => (
              <button
                key={persona.id}
                onClick={() =>
                  setTrabajadoresSeleccionados([...trabajadoresSeleccionados, persona.id])
                }
                className="px-3 py-1 rounded-full border border-green-500 text-green-700 text-sm hover:bg-green-100 transition"
              >
                ➕ {persona.nombrecompleto}
              </button>
            ))
          )}
        </div>
        </div>
    </div>
  );
}
