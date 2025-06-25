import ResumenFinanciero from "../contabilidad/ResumenFinanciero";
import TablaFinancieraProyecto from "./TablaFinancieraProyecto";

export default function TrabajosPorRealizar({
  modoEdicion,
  mostrarFormulario,
  trabajos,
  setTrabajos,
  trabajosProyecto,
  personalAsignado,
  gastosProyecto
}) {
  const listaTrabajos = (modoEdicion || mostrarFormulario) ? trabajos : trabajosProyecto;

  return (
    <div className="mt-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Trabajos por realizar</label>

      <div className="grid grid-cols-[1fr_1fr_80px_80px_auto] gap-4 font-semibold text-sm text-gray-600 mb-1 px-1">
        <div>Nombre</div>
        <div>Unidades</div>
        <div>Instalado</div>
        <div>Faltan</div>
        <div></div>
      </div>

      {listaTrabajos.map((trabajo, index) => {
        const nombre = trabajo.nombre ?? trabajo.nombre_trabajo ?? "";
        const unidades = parseInt(trabajo.unidades ?? trabajo.unidades_totales ?? 0, 10);
        const instaladas = parseInt(trabajo.instaladas ?? 0, 10);
        const faltan = Number.isFinite(unidades - instaladas) ? unidades - instaladas : 0;

        return (
          <div key={index} className="grid grid-cols-[1fr_1fr_80px_80px_auto] gap-4 mb-2 items-center">
            {(modoEdicion || mostrarFormulario) ? (
              <>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => {
                    const nuevos = [...trabajos];
                    nuevos[index].nombre = e.target.value;
                    setTrabajos(nuevos);
                  }}
                  className="p-2 border rounded-xl"
                />
                <input
                  type="number"
                  value={Number.isNaN(unidades) ? "" : unidades}
                  onChange={(e) => {
                    const nuevos = [...trabajos];
                    const valor = parseInt(e.target.value, 10);
                    nuevos[index].unidades = Number.isNaN(valor) ? 0 : valor;
                    setTrabajos(nuevos);
                  }}
                  className="p-2 border rounded-xl"
                />
              </>
            ) : (
              <>
                <div className="p-2 bg-gray-100 rounded-xl text-center">{nombre}</div>
                <div className="p-2 bg-gray-100 rounded-xl text-center">{unidades}</div>
              </>
            )}

            <div className="p-2 bg-gray-100 rounded-xl text-center">{instaladas}</div>
            <div className="p-2 bg-gray-100 rounded-xl text-center">{faltan}</div>

            {(modoEdicion || mostrarFormulario) ? (
              <div className="text-center">
                <button
                  onClick={() => {
                    const nuevos = trabajos.filter((_, i) => i !== index);
                    setTrabajos(nuevos);
                  }}
                  className="text-red-600 hover:text-red-800 font-bold text-lg"
                >
                  ❌
                </button>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        );
      })}

      {(modoEdicion || mostrarFormulario) && (
        <button
          onClick={() =>
            setTrabajos([...trabajos, { nombre: "", unidades: "", instaladas: 0 }])
          }
          className="text-blue-700 text-sm hover:underline mt-1"
        >
          ➕ Añadir otro trabajo
        </button>
      )}

      
      {/* Tabla Financiera Detallada */}
      {!modoEdicion && !mostrarFormulario && (
        <div className="mt-6">
          <h3 className="text-center font-bold text-lg mb-2">📊 Detalle Financiero por Trabajo</h3>
          <TablaFinancieraProyecto trabajosProyecto={trabajosProyecto} />
        </div>
      )}
    </div>
  );
}
