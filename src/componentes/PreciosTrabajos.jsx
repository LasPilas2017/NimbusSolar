import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { v4 as uuidv4 } from "uuid";

export default function Trabajos() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [trabajos, setTrabajos] = useState([]);
  const [nombresUnicos, setNombresUnicos] = useState([]);
  const [nuevoTrabajo, setNuevoTrabajo] = useState({
    nombre: "",
    precio_unidad: "",
    bonificacion: "",
    meta: "",
    id: null
  });

            useEffect(() => {
            const obtenerTrabajos = async () => {
                const { data, error } = await supabase
                .from("trabajos")
                .select("*")
                .order("created_at", { ascending: false });

                if (!error) {
                setTrabajos(data);
                const nombres = [...new Set(data.map(t => t.nombre))];
                setNombresUnicos(nombres);
                }
            };

            obtenerTrabajos();
            }, []);


  const agregarTrabajo = async () => {
    if (!nuevoTrabajo.nombre || !nuevoTrabajo.precio_unidad) return;

    let trabajoConId = {
      ...nuevoTrabajo,
      id: nuevoTrabajo.id || uuidv4(),
      precio_unidad: parseFloat(nuevoTrabajo.precio_unidad),
      bonificacion: parseFloat(nuevoTrabajo.bonificacion),
      meta: parseFloat(nuevoTrabajo.meta)
    };

    if (!nuevoTrabajo.id) {
      const { error } = await supabase.from("trabajos").insert([trabajoConId]);
      if (error) {
        alert("❌ Error al guardar trabajo");
        console.error(error);
        return;
      }
      setTrabajos([...trabajos, trabajoConId]);
    } else {
      const { error } = await supabase
        .from("trabajos")
        .update(trabajoConId)
        .eq("id", trabajoConId.id);
      if (error) {
        alert("❌ Error al actualizar trabajo");
        console.error(error);
        return;
      }
      setTrabajos(trabajos.map(t => (t.id === trabajoConId.id ? trabajoConId : t)));
    }

    setNuevoTrabajo({ nombre: "", precio_unidad: "", bonificacion: "", meta: "", id: null });
    setMostrarFormulario(false);
  };

  const eliminarTrabajo = async (id) => {
    const { error } = await supabase.from("trabajos").delete().eq("id", id);
    if (error) {
      alert("❌ Error al eliminar trabajo");
      console.error(error);
      return;
    }
    setTrabajos(trabajos.filter(t => t.id !== id));
  };

  const editarTrabajo = (trabajo) => {
    setNuevoTrabajo(trabajo);
    setMostrarFormulario(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-center mb-6">
        <div
          className="bg-white rounded-2xl p-6 shadow-md w-72 text-center cursor-pointer hover:shadow-lg"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          <p className="text-2xl text-purple-700 font-bold">➕ Agregar Trabajo</p>
          <p className="text-sm text-gray-600">Formulario para ingresar nuevos trabajos</p>
        </div>
      </div>

      {mostrarFormulario && (
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-4 text-purple-800">🛠️ Nuevo Trabajo</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
                type="text"
                list="lista-trabajos"
                placeholder="Trabajo"
                className="p-2 border rounded-xl"
                value={nuevoTrabajo.nombre}
                onChange={(e) => setNuevoTrabajo({ ...nuevoTrabajo, nombre: e.target.value })}
                />

                <datalist id="lista-trabajos">
                {nombresUnicos.map((nombre, i) => (
                    <option key={i} value={nombre} />
                ))}
                </datalist>
            <input
              type="number"
              placeholder="Precio por Unidad"
              className="p-2 border rounded-xl"
              value={nuevoTrabajo.precio_unidad}
              onChange={(e) => setNuevoTrabajo({ ...nuevoTrabajo, precio_unidad: e.target.value })}
            />
            <input
              type="number"
              placeholder="Bonificación"
              className="p-2 border rounded-xl"
              value={nuevoTrabajo.bonificacion}
              onChange={(e) => setNuevoTrabajo({ ...nuevoTrabajo, bonificacion: e.target.value })}
            />
            <input
              type="number"
              placeholder="Meta asignada"
              className="p-2 border rounded-xl"
              value={nuevoTrabajo.meta}
              onChange={(e) => setNuevoTrabajo({ ...nuevoTrabajo, meta: e.target.value })}
            />
          </div>

          <button
            onClick={agregarTrabajo}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Guardar Trabajo
          </button>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-2xl p-6 max-w-6xl mx-auto">
        <h3 className="text-lg font-bold mb-4 text-gray-800">📑 Lista de Trabajos</h3>
        <table className="min-w-full border text-sm text-center">
          <thead className="bg-purple-100">
            <tr>
              <th className="p-2 border">Trabajo</th>
              <th className="p-2 border">Precio/U</th>
              <th className="p-2 border">Bonificación</th>
              <th className="p-2 border">Meta</th>
              <th className="p-2 border">⚙️</th>
            </tr>
          </thead>
          <tbody>
            {trabajos.map((t) => (
              <tr key={t.id} className="hover:bg-gray-100">
                <td className="p-2 border">{t.nombre}</td>
                <td className="p-2 border">Q{t.precio_unidad}</td>
                <td className="p-2 border">Q{t.bonificacion}</td>
                <td className="p-2 border">{t.meta}</td>
                <td className="p-2 border flex justify-center gap-2">
                  <button
                    onClick={() => editarTrabajo(t)}
                    className="text-blue-600 hover:text-blue-800 text-lg"
                    title="Editar"
                  >✏️</button>
                  <button
                    onClick={() => eliminarTrabajo(t.id)}
                    className="text-red-600 hover:text-red-800 text-lg"
                    title="Eliminar"
                  >🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}