import { useState, useEffect } from "react";
import { FilePlus, PlusCircle, ArrowLeft } from "lucide-react";
import { supabase } from "../../supabase";
import BalanceGeneral from "./BalanceGeneral";
import TotalIngresos from "./TotalIngresos";
import TotalEgresos from "./TotalEgresos";
import CalculosFinancieros from "./CalculosFinancieros";
import PrecioTrabajos from "./PrecioTrabajos";
import { guardarLog } from "../../utils";

export default function Contabilidad({ usuario }) { 
  const [vista, setVista] = useState("general");
  const [formularioActivo, setFormularioActivo] = useState(null);
  const [tipoGastoNuevo, setTipoGastoNuevo] = useState("");
  const [medioAmpliacion, setMedioAmpliacion] = useState("");
  const [categoriasUsadas, setCategoriasUsadas] = useState([
    "Combustible",
    "Transporte",
    "Personal",
  ]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [monto, setMonto] = useState("");
  const [nombre, setNombre] = useState("");
  const [destinado, setDestinado] = useState("");
  const [documento, setDocumento] = useState("");
  const [gastos, setGastos] = useState([]);
  const [ampliaciones, setAmpliaciones] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [vistaDetalle, setVistaDetalle] = useState(null);
  const [mostrarBalance, setMostrarBalance] = useState(false);

  const [totales, setTotales] = useState({
    ingresos: 0,
    egresos: 0,
    cajaChica: 0,
    balance: 0,
  });

  const fetchProyectos = async () => {
    const { data, error } = await supabase.from("proyectos").select("*");
    if (!error) {
      const proyectosConExtras = data.map((p) => ({
        ...p,
        detalleVisible: false,
      }));
      setProyectos(proyectosConExtras);
    } else {
      console.error("Error al cargar proyectos", error);
    }
  };

  const fetchMovimientos = async () => {
    const { data: gastosData } = await supabase.from("gastos_proyectos").select("*");
    const { data: ampliacionesData } = await supabase.from("ampliaciones_proyectos").select("*");

    setGastos(gastosData || []);
    setAmpliaciones(ampliacionesData || []);
  };

  useEffect(() => {
    fetchProyectos();
    fetchMovimientos();
  }, []);

  useEffect(() => {
    const proyectosActivosIds = proyectos
      .filter((p) => p.estado !== "finalizado")
      .map((p) => p.id);

    const ampliacionesActivas = ampliaciones.filter((a) =>
      proyectosActivosIds.includes(a.proyecto_id)
    );
    const gastosActivos = gastos.filter((g) =>
      proyectosActivosIds.includes(g.proyecto_id)
    );

    const totalIngresos = ampliacionesActivas.reduce(
      (sum, a) => sum + (a.monto || 0),
      0
    );
    const totalEgresos = gastosActivos.reduce(
      (sum, g) => sum + (g.monto || 0),
      0
    );

    setTotales({
      ingresos: totalIngresos,
      egresos: totalEgresos,
      cajaChica: 0,
      balance: totalIngresos - totalEgresos,
    });
  }, [gastos, ampliaciones, proyectos]);

  const toggleDetalle = (id) => {
    setProyectos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, detalleVisible: !p.detalleVisible } : p
      )
    );
  };

  const finalizarProyecto = async (id) => {
    const { error } = await supabase
      .from("proyectos")
      .update({ estado: "finalizado" })
      .eq("id", id);

    if (!error) {
      fetchProyectos();
    } else {
      console.error("Error al finalizar proyecto", error);
      alert("Error al finalizar proyecto");
    }
  };

  const guardarGasto = async () => {
    if (!proyectoSeleccionado || !tipoGastoNuevo || !descripcion || !fecha || !monto)
      return;

    const { error } = await supabase.from("gastos_proyectos").insert([
      {
        proyecto_id: proyectoSeleccionado,
        categoria: tipoGastoNuevo,
        descripcion,
        fecha,
        monto: parseFloat(monto),
      },
    ]);

    if (!error) {
       guardarLog(usuario, "Gasto registrado", `Proyecto ID: ${proyectoSeleccionado}, Monto: Q${monto}, Fecha: ${fecha}`);
      fetchProyectos();
      if (!categoriasUsadas.includes(tipoGastoNuevo)) {
        setCategoriasUsadas([...categoriasUsadas, tipoGastoNuevo]);
      }
      setFormularioActivo(null);
      setProyectoSeleccionado(null);
      setTipoGastoNuevo("");
      setDescripcion("");
      setFecha("");
      setMonto("");
    } else {
      alert("Error al guardar gasto");
      console.error(error);
    }
  };

  const guardarAmpliacion = async () => {
    if (!proyectoSeleccionado || !medioAmpliacion || !documento || !fecha || !monto)
      return;

    const { error } = await supabase.from("ampliaciones_proyectos").insert([
      {
        proyecto_id: proyectoSeleccionado,
        medio: medioAmpliacion,
        documento,
        fecha,
        monto: parseFloat(monto),
      },
    ]);

    if (!error) {
        guardarLog(usuario, "Ampliación de presupuesto", `Proyecto ID: ${proyectoSeleccionado}, Monto: Q${monto}, Medio: ${medioAmpliacion}`);
      fetchProyectos();
      setFormularioActivo(null);
      setProyectoSeleccionado(null);
      setMedioAmpliacion("");
      setDocumento("");
      setFecha("");
      setMonto("");
    } else {
      alert("Error al guardar la ampliación");
      console.error(error);
    }
  };

 return (
  <div className="p-6 space-y-6">
    {/* Vista general */}
    {vista === "general" && (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-center items-center text-center">
          <div
            className="bg-green-100 p-4 rounded-2xl shadow cursor-pointer"
            onClick={() => setVistaDetalle("ingresos")}
          >
            <p className="text-sm text-gray-600">Total ingresos</p>
            <h2 className="text-xl font-bold text-green-700">
               Q{totales.ingresos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
          <div
            className="bg-red-100 p-4 rounded-2xl shadow cursor-pointer"
            onClick={() => setVistaDetalle("egresos")}
          >
            <p className="text-sm text-gray-600">Total egresos</p>
            <h2 className="text-xl font-bold text-red-700">
              Q{totales.egresos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
          <div
            className="bg-blue-100 p-4 rounded-2xl shadow cursor-pointer"
            onClick={() => setMostrarBalance(true)}
          >
            <p className="text-sm text-gray-600">Balance general</p>
            <h2 className="text-xl font-bold text-blue-700">
              Q{totales.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        {mostrarBalance && (
          <div className="mt-6">
            <BalanceGeneral ampliaciones={ampliaciones} gastos={gastos} />
            <button
              onClick={() => setMostrarBalance(false)}
              className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-xl shadow"
            >
              Cerrar Balance
            </button>
          </div>
        )}

        {vistaDetalle === "ingresos" && (
            <TotalIngresos
              ampliaciones={ampliaciones}
              proyectos={proyectos} // 👈 Le pasas la prop con todos los proyectos
              onCerrar={() => setVistaDetalle(null)}
            />
          )}



        {vistaDetalle === "egresos" && (
          <TotalEgresos
            gastos={gastos}
            onCerrar={() => setVistaDetalle(null)}
          />
        )}

       <div className="flex justify-center gap-4 mt-8">
  {/* Tarjeta de Proyectos en curso */}
  <div
    onClick={() => setVista("proyectos")}
    className="cursor-pointer bg-white shadow-lg rounded-2xl p-6 text-center max-w-xs hover:shadow-xl"
  >
    <p className="text-xl font-bold text-purple-700">
      📦 Proyectos en curso
    </p>
    <p className="text-sm text-gray-500 mt-2">
      Haz clic para ver el resumen por proyecto.
    </p>
  </div>

  {/* Tarjeta de Precios de Trabajos */}
  <div
    onClick={() => setVista("preciosTrabajos")}
    className="cursor-pointer bg-white shadow-lg rounded-2xl p-6 text-center max-w-xs hover:shadow-xl"
  >
    <p className="text-xl font-bold text-green-700">
      💰 Precios de Trabajos
    </p>
    <p className="text-sm text-gray-500 mt-2">
      Haz clic para ver el detalle de precios de cada trabajo.
    </p>
  </div>
</div>
      </>
    )}
    {/* Aquí renderiza el componente cuando la vista es preciosTrabajos */}
{vista === "preciosTrabajos" && (
  <div className="mt-8">
    <PrecioTrabajos />

    <div className="mt-4 flex justify-center">
      <button
        onClick={() => setVista("general")}
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-xl shadow"
      >
        Cerrar
      </button>
    </div>
  </div>
)}

{vista === "proyectos" && (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
      <div
        onClick={() => setFormularioActivo("gasto")}
        className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold px-6 py-4 rounded-2xl shadow flex items-center justify-center gap-2"
      >
        <FilePlus className="w-5 h-5" /> Ingresar Gasto
      </div>

      <div
        onClick={() => setFormularioActivo("ampliacion")}
        className="cursor-pointer bg-green-100 hover:bg-green-200 text-green-800 font-semibold px-6 py-4 rounded-2xl shadow flex items-center justify-center gap-2"
      >
        <PlusCircle className="w-5 h-5" /> Ampliar Presupuesto
      </div>

      <div
        onClick={() => setVista("general")}
        className="cursor-pointer bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold px-6 py-4 rounded-2xl shadow flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al balance general
      </div>
    </div>

    {formularioActivo === "gasto" && (
      <div className="mt-4 bg-white rounded-xl shadow-lg p-6 max-w-3xl mx-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          🧾 Ingresar Gasto
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <select
            className="p-2 border rounded"
            value={proyectoSeleccionado || ""}
            onChange={(e) => setProyectoSeleccionado(e.target.value)}
          >
            <option value="">Selecciona un proyecto</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          <input
            list="categorias"
            placeholder="Tipo de gasto (ej: Combustible)"
            className="p-2 border rounded"
            value={tipoGastoNuevo}
            onChange={(e) => setTipoGastoNuevo(e.target.value)}
          />
          <datalist id="categorias">
            {categoriasUsadas.map((c, i) => (
              <option key={i} value={c} />
            ))}
          </datalist>
          <input
            type="text"
            placeholder="Descripción"
            className="p-2 border rounded"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
          <input
            type="date"
            className="p-2 border rounded"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
          <input
            type="number"
            placeholder="Monto"
            className="p-2 border rounded"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />
          <input type="file" className="p-2 border rounded col-span-2" />
          <button
            onClick={guardarGasto}
            className="col-span-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl shadow"
          >
            Guardar Gasto
          </button>
          <button
            onClick={() => setFormularioActivo(null)}
            className="col-span-2 mt-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-xl shadow"
          >
            Cancelar
          </button>
        </div>
      </div>
    )}
     {/* Grid de proyectos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 items-start">
        {proyectos
          .sort((a, b) => (a.estado === "finalizado" ? 1 : -1))
          .map((proyecto) => (
            <div
              key={proyecto.id}
              className={`rounded-2xl shadow p-4 text-center transition-all duration-300 ${
                proyecto.estado === "finalizado"
                  ? "bg-gray-100 text-gray-500"
                  : "bg-white text-black"
              }`}
            >
              <p className="text-lg font-bold text-purple-800 mb-4">
                {proyecto.nombre}
              </p>

              {(() => {
                const gastosDelProyecto = gastos.filter(
                  (g) => g.proyecto_id === proyecto.id
                );
                const totalGastos = gastosDelProyecto.reduce(
                  (sum, g) => sum + (g.monto || 0),
                  0
                );
                
                const ampliacionesDelProyecto = ampliaciones.filter(
                  (a) => a.proyecto_id === proyecto.id
                );
                console.log("Ampliaciones del proyecto:", ampliacionesDelProyecto);
                const totalAmpliaciones = ampliacionesDelProyecto.reduce(
                  (sum, a) => sum + (a.monto || 0),
                  0
                );
                const produccionTotal =
                  (proyecto.destinado ? Number(proyecto.destinado) : 0) +
                  totalAmpliaciones;

          const ingresosReales = ampliacionesDelProyecto
  .filter((a) => {
    if (!a.medio) return false; // descarta si no hay medio
    const medio = a.medio.trim().toLowerCase();
    console.log("Verificando medio:", medio); // 👈 Imprime cómo llega el medio
    return medio === "transferencia" || medio === "deposito";
  })
  .reduce((sum, a) => sum + (a.monto || 0), 0);

console.log("Ingresos reales calculados:", ingresosReales);

                const utilidadTotal = produccionTotal - totalGastos;
                const liquidez = ingresosReales - totalGastos;

                return (
                  <>
                    <div className="flex flex-wrap justify-between gap-4 mt-2">
                      {/* ... resto de tu vista de datos ... */}
                    </div>

                    <div className="mt-4">
                      <CalculosFinancieros proyectoId={proyecto.id} />
                    </div>

                    {proyecto.estado !== "finalizado" && (
                      <div className="flex justify-center gap-2 mt-4">
                        <button
                          onClick={() => toggleDetalle(proyecto.id)}
                          className="bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-blue-800"
                        >
                          {proyecto.detalleVisible
                            ? "Ocultar Detalle"
                            : "Ver Detalle"}
                        </button>
                        <button
                          onClick={() => finalizarProyecto(proyecto.id)}
                          className="bg-red-100 hover:bg-red-200 px-3 py-1 rounded text-red-700"
                        >
                          Finalizar
                        </button>
                      </div>
                    )}

                    {proyecto.detalleVisible && proyecto.estado !== "finalizado" && (
                      <>
                        <div className="mt-4 text-left text-sm">
                          <h4 className="font-semibold text-blue-600 mb-2">
                            🧾 Gastos por categoría:
                          </h4>
                          {[...new Set(
                            gastos
                              .filter((g) => g.proyecto_id === proyecto.id)
                              .map((g) => g.categoria)
                          )].map((cat) => (
                            <div key={cat} className="mb-2">
                              <strong>{cat}</strong>
                              <ul className="ml-4 list-disc">
                                {gastos
                                  .filter(
                                    (g) =>
                                      g.proyecto_id === proyecto.id &&
                                      g.categoria === cat
                                  )
                                  .map((gasto, idx) => (
                                    <li key={idx}>
                                      {gasto.fecha} - {gasto.descripcion}: Q
                                     {gasto.monto.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 text-left text-sm">
                          <h4 className="font-semibold text-green-600 mb-2">
                            💹 Ampliaciones de presupuesto:
                          </h4>
                          <ul className="ml-4 list-disc">
                            {ampliaciones
                              .filter((a) => a.proyecto_id === proyecto.id)
                              .map((amp, idx) => (
                                <li key={idx}>
                                  {amp.fecha} - {amp.medio} - Doc: {amp.documento} — Q
                                  {amp.monto.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </li>
                              ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          ))}
      </div>
  </>
  
)}

{formularioActivo === "ampliacion" && (
  <div className="mt-4 bg-white rounded-xl shadow-lg p-6 max-w-3xl mx-auto">
    <h3 className="text-xl font-bold text-gray-800 mb-4">
      💰 Ingreso de Capital
    </h3>
    <div className="grid md:grid-cols-2 gap-4">
      <select
        className="p-2 border rounded"
        value={proyectoSeleccionado || ""}
        onChange={(e) => setProyectoSeleccionado(e.target.value)}
      >
        <option value="">Selecciona un proyecto</option>
        {proyectos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </select>

      <select
        className="p-2 border rounded"
        value={medioAmpliacion}
        onChange={(e) => setMedioAmpliacion(e.target.value)}
      >
        <option value="">Medio de ampliación</option>
        <option value="transferencia">Transferencia</option>
        <option value="deposito">Depósito</option>
        <option value="efectivo">Efectivo</option>
      </select>

      <input
        type="text"
        placeholder="No. de documento"
        className="p-2 border rounded"
        value={documento}
        onChange={(e) => setDocumento(e.target.value)}
      />

      <input
        type="date"
        className="p-2 border rounded"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
      />

      <input
        type="number"
        placeholder="Monto"
        className="p-2 border rounded"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
      />

      <input type="file" className="p-2 border rounded col-span-2" />

      <button
        onClick={guardarAmpliacion}
        className="col-span-2 mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl shadow"
      >
        Guardar Ampliación
      </button>

      <button
        onClick={() => setFormularioActivo(null)}
        className="col-span-2 mt-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-xl shadow"
      >
        Cancelar
      </button>
    </div>
  </div>
)}
{formularioActivo === "ampliacion" && (
  <div className="mt-4 bg-white rounded-xl shadow-lg p-6 max-w-3xl mx-auto">
    <h3 className="text-xl font-bold text-gray-800 mb-4">
      💰 Ingreso de Capital
    </h3>
    <div className="grid md:grid-cols-2 gap-4">
      <select
        className="p-2 border rounded"
        value={proyectoSeleccionado || ""}
        onChange={(e) => setProyectoSeleccionado(e.target.value)}
      >
        <option value="">Selecciona un proyecto</option>
        {proyectos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </select>

      <select
        className="p-2 border rounded"
        value={medioAmpliacion}
        onChange={(e) => setMedioAmpliacion(e.target.value)}
      >
        <option value="">Medio de ampliación</option>
        <option value="transferencia">Transferencia</option>
        <option value="deposito">Depósito</option>
        <option value="efectivo">Efectivo</option>
      </select>

      <input
        type="text"
        placeholder="No. de documento"
        className="p-2 border rounded"
        value={documento}
        onChange={(e) => setDocumento(e.target.value)}
      />

      <input
        type="date"
        className="p-2 border rounded"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
      />

      <input
        type="number"
        placeholder="Monto"
        className="p-2 border rounded"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
      />

      <input type="file" className="p-2 border rounded col-span-2" />

      <button
        onClick={guardarAmpliacion}
        className="col-span-2 mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl shadow"
      >
        Guardar Ampliación
      </button>

      <button
        onClick={() => setFormularioActivo(null)}
        className="col-span-2 mt-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-xl shadow"
      >
        Cancelar
      </button>
    </div>
  </div>
)}





     
    </div>
  );
}
