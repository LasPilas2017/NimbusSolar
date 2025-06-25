import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import AsignacionPersonal from "./AsignacionPersonal";
import { XCircle } from "lucide-react";

export default function NuevoProyecto({ onGuardar }) {
  const [nuevoProyecto, setNuevoProyecto] = useState({ nombre: "", descripcion: "", categoria_id: "" });
  const [supervisoresSeleccionados, setSupervisoresSeleccionados] = useState([]);
  const [trabajadoresSeleccionados, setTrabajadoresSeleccionados] = useState([]);
  const [trabajos, setTrabajos] = useState([{ nombre: "", unidades: "" }]);
  const [personalDisponible, setPersonalDisponible] = useState([]);
  const [categoriasIngreso, setCategoriasIngreso] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      const { data: asignados } = await supabase.from("proyectos_personal").select("trabajador_id");
      const idsAsignados = asignados?.map((p) => p.trabajador_id) || [];

      const { data: personal } = await supabase.from("registrodepersonal").select("id, nombrecompleto");
      const disponibles = personal?.filter((p) => !idsAsignados.includes(p.id)) || [];
      setPersonalDisponible(disponibles);

      const { data: categorias } = await supabase
        .from("categorias_contables")
        .select("id, nombre")
        .eq("tipo", "ingreso");
      if (categorias) setCategoriasIngreso(categorias);
    };

    cargarDatos();
  }, []);

  const agregarProyecto = async () => {
    if (!nuevoProyecto.nombre.trim()) return alert("El nombre es obligatorio.");

    try {
      const { data, error } = await supabase
        .from("proyectos")
        .insert([
          {
            nombre: nuevoProyecto.nombre,
            descripcion: nuevoProyecto.descripcion || null,
            categoria_id: nuevoProyecto.categoria_id ? parseInt(nuevoProyecto.categoria_id) : null,
          },
        ])
        .select();

      if (error || !data?.length) throw error;
      const nuevoId = data[0].id;

      const personalInsertar = [
        ...supervisoresSeleccionados.map((id) => ({
          proyecto_id: nuevoId,
          trabajador_id: id,
          rol: "supervisor",
        })),
        ...trabajadoresSeleccionados.map((id) => ({
          proyecto_id: nuevoId,
          trabajador_id: id,
          rol: "trabajador",
        })),
      ];
      await supabase.from("proyectos_personal").insert(personalInsertar);

      const trabajosFiltrados = trabajos
        .filter((t) => t.nombre.trim() !== "" && parseInt(t.unidades))
        .map((t) => ({
          proyecto_id: nuevoId,
          nombre_trabajo: t.nombre.trim(),
          unidades_totales: parseInt(t.unidades),
        }));
      if (trabajosFiltrados.length > 0) {
        await supabase.from("proyectos_trabajos").insert(trabajosFiltrados);
      }

      alert("✅ Proyecto guardado correctamente");
      if (onGuardar) onGuardar();

      setNuevoProyecto({ nombre: "", descripcion: "", categoria_id: "" });
      setSupervisoresSeleccionados([]);
      setTrabajadoresSeleccionados([]);
      setTrabajos([{ nombre: "", unidades: "" }]);
    } catch (err) {
      console.error("Error al guardar el proyecto:", err);
      alert("❌ Hubo un error al guardar el proyecto");
    }
  };

  return (
    <div className="bg-white/30 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20 max-w-3xl mx-auto mb-10 space-y-4">
      <h2 className="text-xl font-bold text-purple-900">🛠 Crear nuevo proyecto</h2>

      <input
        type="text"
        placeholder="Ej: Proyecto Las Pilas"
        value={nuevoProyecto.nombre ?? ""}
        onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, nombre: e.target.value })}
        className="w-full p-3 border rounded-xl"
      />

      <textarea
        placeholder="Ej: Instalación de sistema solar..."
        value={nuevoProyecto.descripcion ?? ""}
        onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, descripcion: e.target.value })}
        className="w-full p-3 border rounded-xl"
      />

      <select
        value={nuevoProyecto.categoria_id}
        onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, categoria_id: e.target.value })}
        className="w-full p-3 border rounded-xl"
      >
        <option value="">Selecciona tipo de proyecto</option>
        {categoriasIngreso.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.nombre}
          </option>
        ))}
      </select>

      <AsignacionPersonal
        modoEdicion={false}
        mostrarFormulario={true}
        personalDisponible={personalDisponible}
        supervisoresSeleccionados={supervisoresSeleccionados}
        setSupervisoresSeleccionados={setSupervisoresSeleccionados}
        trabajadoresSeleccionados={trabajadoresSeleccionados}
        setTrabajadoresSeleccionados={setTrabajadoresSeleccionados}
      />

      <div>
        <div className="grid grid-cols-[1fr_1fr_80px_80px_auto] gap-4 font-semibold text-sm text-gray-600 mb-1 px-1">
          <div>Nombre</div>
          <div>Unidades</div>
          <div>Instalado</div>
          <div>Faltan</div>
          <div></div>
        </div>
        {trabajos.map((trabajo, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_80px_80px_auto] gap-4 mb-2 items-center">
            <input
              type="text"
              value={trabajo.nombre ?? ""}
              onChange={(e) => {
                const nuevos = [...trabajos];
                nuevos[index].nombre = e.target.value;
                setTrabajos(nuevos);
              }}
              className="p-2 border rounded-xl"
            />
            <input
              type="number"
              value={trabajo.unidades ?? ""}
              onChange={(e) => {
                const nuevos = [...trabajos];
                nuevos[index].unidades = e.target.value;
                setTrabajos(nuevos);
              }}
              className="p-2 border rounded-xl"
            />
            <div className="p-2 text-center">-</div>
            <div className="p-2 text-center">-</div>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  const nuevos = trabajos.filter((_, i) => i !== index);
                  setTrabajos(nuevos);
                }}
                className="text-red-500 hover:text-red-700"
              >
                <XCircle size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-4 mt-4">
        <button
          onClick={() => {
            setNuevoProyecto({ nombre: "", descripcion: "", categoria_id: "" });
            setSupervisoresSeleccionados([]);
            setTrabajadoresSeleccionados([]);
            setTrabajos([{ nombre: "", unidades: "" }]);
            if (typeof onGuardar === "function") onGuardar();
          }}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-xl shadow-md"
        >
          Cancelar
        </button>
        <button
          onClick={agregarProyecto}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow-md"
        >
          Guardar proyecto
        </button>
      </div>
    </div>
  );
}
