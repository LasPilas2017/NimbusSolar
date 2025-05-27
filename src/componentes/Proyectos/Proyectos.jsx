import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { Pencil, Trash, Save, X, XCircle } from "lucide-react";

export default function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [personalDisponible, setPersonalDisponible] = useState([]);
  const [supervisoresPorProyecto, setSupervisoresPorProyecto] = useState({});
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoLectura, setModoLectura] = useState(true);
  const [nuevoProyecto, setNuevoProyecto] = useState({ nombre: "", descripcion: "" });
  const [supervisoresSeleccionados, setSupervisoresSeleccionados] = useState([]);
  const [trabajadoresSeleccionados, setTrabajadoresSeleccionados] = useState([]);
  const [trabajos, setTrabajos] = useState([{ nombre: "", unidades: "" }]); 
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [mostrarFormularioEdicion, setMostrarFormularioEdicion] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [trabajosProyecto, setTrabajosProyecto] = useState([]);
  const [personalAsignado, setPersonalAsignado] = useState([]);
  const [gastosProyecto, setGastosProyecto] = useState([]);


const cargarDatosProyecto = async (proyecto) => {
  setProyectoSeleccionado(proyecto);
  setModoEdicion(false);

  const { data: trabajosCargados, error: errorTrabajos } = await supabase
    .from("proyectos_trabajos")
    .select("nombre_trabajo, unidades_totales, costo_unitario")
    .eq("proyecto_id", proyecto.id);

  if (errorTrabajos) {
    console.error("Error al cargar trabajos:", errorTrabajos);
  }

  const trabajosConFormato = (trabajosCargados || []).map((t) => ({
    nombre: t.nombre_trabajo,
    unidades: t.unidades_totales,
    costo_unitario: t.costo_unitario || 0,
    instaladas: 0,
  }));
  setTrabajosProyecto(trabajosConFormato);

  const { data: sup } = await supabase
    .from("proyectos_personal")
    .select("trabajador_id")
    .eq("proyecto_id", proyecto.id)
    .eq("rol", "supervisor");
  setSupervisoresSeleccionados(sup?.map((s) => s.trabajador_id) || []);

  const { data: trab } = await supabase
    .from("proyectos_personal")
    .select("trabajador_id")
    .eq("proyecto_id", proyecto.id)
    .eq("rol", "trabajador");
  setTrabajadoresSeleccionados(trab?.map((t) => t.trabajador_id) || []);

  const { data: personal } = await supabase
    .from("registrodepersonal")
    .select("id, salariopordia")
    .in(
      "id",
      [
        ...(sup?.map((s) => s.trabajador_id) || []),
        ...(trab?.map((t) => t.trabajador_id) || []),
      ]
    );
  setPersonalAsignado(personal || []);

  const { data: egresos } = await supabase
    .from("contabilidad")
    .select("monto")
    .eq("proyecto", proyecto.nombre);
  setGastosProyecto(egresos || []);

  // 👇 Aquí corregido: le paso el proyecto actual a la función para evitar el error
  await obtenerPersonal(proyecto);
};


  useEffect(() => {
    obtenerProyectos();
    obtenerPersonal();
  }, []);


  const obtenerProyectos = async () => {
    const { data, error } = await supabase.from("proyectos").select("*").order("id");
    if (!error) {
      setProyectos(data);
      obtenerSupervisores(data);
    }
  };

const obtenerPersonal = async (proyectoParam) => {
  const { data: asignados } = await supabase.from("proyectos_personal").select("trabajador_id, proyecto_id");
  const idsOcupados = asignados?.map((t) => t.trabajador_id) || [];

  let idsPermitidos = [];
  if (proyectoParam) { // Usamos el proyecto recibido
    const { data: asignadosActualProyecto } = await supabase
      .from("proyectos_personal")
      .select("trabajador_id")
      .eq("proyecto_id", proyectoParam.id);

    idsPermitidos = asignadosActualProyecto?.map((t) => t.trabajador_id) || [];
  }

  const { data, error } = await supabase
    .from("registrodepersonal")
    .select("id, nombrecompleto");

  if (error) {
    console.error("Error al obtener personal:", error);
    return;
  }

  const personalFiltrado = data.filter(
    (p) => !idsOcupados.includes(p.id) || idsPermitidos.includes(p.id)
  );

  setPersonalDisponible(personalFiltrado);
};


 const obtenerSupervisores = async () => {
  const { data, error } = await supabase
    .from("proyectos_personal")
    .select("proyecto_id, rol, trabajador_id, trabajador:registrodepersonal (nombrecompleto)")
    .eq("rol", "supervisor");

  if (!error) {
    const mapa = {};
    data.forEach((entry) => {
      mapa[entry.proyecto_id] = entry.trabajador?.nombrecompleto || "Sin supervisor";
    });
    setSupervisoresPorProyecto(mapa);
  } else {
    console.error("Error obteniendo supervisores:", error);
  }
};
// 🔹 Obtiene todos los IDs de trabajadores ya asignados a cualquier proyecto
const obtenerTrabajadoresYaAsignados = async () => {
  const { data, error } = await supabase
    .from("proyectos_personal")
    .select("trabajador_id");

  if (error) {
    console.error("Error al obtener trabajadores ya asignados:", error);
    return [];
  }

  // Devolver solo los IDs en un array
  return data.map((registro) => registro.trabajador_id);
};
  const agregarProyecto = async () => {
    if (!nuevoProyecto.nombre.trim()) return alert("El nombre es obligatorio.");

// Verificá lo que estás enviando a Supabase
console.log("Enviando a Supabase:", nuevoProyecto);

const { data, error } = await supabase
  .from("proyectos")
  .insert([
    {
      nombre: nuevoProyecto.nombre,
      descripcion: nuevoProyecto.descripcion || null,
    }
  ])
  .select();

console.log("Respuesta de Supabase:", { data, error });

if (error || !data?.length) {
  console.error("Error al guardar el proyecto:", error);
  return alert("Error al guardar el proyecto");
}


    const nuevoId = data[0].id;

    await supabase.from("proyectos_personal").insert(
      supervisoresSeleccionados.map((id) => ({
        proyecto_id: nuevoId,
        trabajador_id: id,
        rol: "supervisor"
      }))
    );

    await supabase.from("proyectos_personal").insert(
      trabajadoresSeleccionados.map((id) => ({
        proyecto_id: nuevoId,
        trabajador_id: id,
        rol: "trabajador"
      }))
    );

    console.log("Trabajos a insertar:", trabajos);

    await supabase.from("proyectos_trabajos").insert(
  trabajos
    .filter(t => t.nombre.trim() !== "" && parseInt(t.unidades))
    .map((t) => ({
      proyecto_id: nuevoId,
      nombre_trabajo: t.nombre.trim(),
      unidades_totales: parseInt(t.unidades, 10)
    }))
);


    setNuevoProyecto({ nombre: "", descripcion: "" });
    setSupervisoresSeleccionados([]);
    setTrabajadoresSeleccionados([]);
    setTrabajos([{ nombre: "", unidades: "" }]);
    setMostrarFormulario(false);
    obtenerProyectos();
  };

  const eliminarProyecto = async (id) => {
    if (!confirm("¿Eliminar este proyecto?")) return;
    const { error } = await supabase.from("proyectos").delete().eq("id", id);
    if (!error) obtenerProyectos();
  };

  
  return (
    <div className="p-6 bg-white/10 backdrop-blur-xl min-h-screen rounded-2xl">
      {/* Botón para crear un nuevo proyecto */}
      <div className="flex justify-center mb-6">
        <div
          onClick={() => {
              setMostrarFormulario(!mostrarFormulario);
              obtenerPersonal(); // 🔥 Esto recargará la lista filtrada
            }}
          className="bg-white/30 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition cursor-pointer w-full max-w-md text-center"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-2">➕ Nuevo proyecto</h3>
          <p className="text-sm text-gray-600">Crea un nuevo proyecto y asígnale un supervisor.</p>
        </div>
      </div>

      {/* Formulario de creación */}
      {mostrarFormulario && (
        <div className="bg-white/30 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20 max-w-3xl mx-auto mb-10 space-y-4">
          <h2 className="text-xl font-bold text-purple-900">🛠 Crear nuevo proyecto</h2>

          {/* Nombre */}
          <input
              type="text"
              placeholder="Ej: Proyecto Las Pilas"
              value={nuevoProyecto.nombre ?? ""}
              onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, nombre: e.target.value })}
              className="w-full p-3 border rounded-xl"
            />

          {/* Descripción */}
         <textarea
              placeholder="Ej: Instalación de sistema solar..."
              value={nuevoProyecto.descripcion ?? ""}
              onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, descripcion: e.target.value })}
              className="w-full p-3 border rounded-xl"
            />


          {/* Supervisores */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Supervisores</label>
  <div className="flex flex-wrap gap-2">
    {personalDisponible.map((persona) => {
      const estaEnTrabajadores = trabajadoresSeleccionados.includes(persona.id);
      const seleccionado = supervisoresSeleccionados.includes(persona.id);
      return (
        <button
          key={persona.id}
          type="button"
          disabled={estaEnTrabajadores}
          onClick={() => {
            if (seleccionado) {
              setSupervisoresSeleccionados(supervisoresSeleccionados.filter(id => id !== persona.id));
            } else {
              setSupervisoresSeleccionados([...supervisoresSeleccionados, persona.id]);
              setTrabajadoresSeleccionados(trabajadoresSeleccionados.filter(id => id !== persona.id));
            }
          }}
          className={`px-3 py-1 rounded-full border text-sm flex items-center gap-1 transition-all duration-150 ${
            seleccionado
              ? 'bg-purple-600 text-white border-purple-700'
              : estaEnTrabajadores
              ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-100'
          }`}
        >
          {persona.nombrecompleto}
          {seleccionado && <span className="ml-1">✅</span>}
        </button>
      );
    })}
  </div>
  <p className="text-xs text-gray-500 mt-1">Puedes seleccionar uno o varios supervisores.</p>
</div>
          {/* Trabajadores */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Trabajadores asignados</label>
  <div className="flex flex-wrap gap-2">
    {personalDisponible.map((persona) => {
      const estaEnSupervisores = supervisoresSeleccionados.includes(persona.id);
      const seleccionado = trabajadoresSeleccionados.includes(persona.id);
      return (
        <button
          key={persona.id}
          type="button"
          disabled={estaEnSupervisores}
          onClick={() => {
            if (seleccionado) {
              setTrabajadoresSeleccionados(trabajadoresSeleccionados.filter(id => id !== persona.id));
            } else {
              setTrabajadoresSeleccionados([...trabajadoresSeleccionados, persona.id]);
              setSupervisoresSeleccionados(supervisoresSeleccionados.filter(id => id !== persona.id));
            }
          }}
          className={`px-3 py-1 rounded-full border text-sm flex items-center gap-1 transition-all duration-150 ${
            seleccionado
              ? 'bg-green-600 text-white border-green-700'
              : estaEnSupervisores
              ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-green-100'
          }`}
        >
          {persona.nombrecompleto}
          {seleccionado && <span className="ml-1">✅</span>}
        </button>
      );
    })}
  </div>
  <p className="text-xs text-gray-500 mt-1">Puedes asignar varios trabajadores.</p>
</div>


          
         {/* Trabajos asignados */}
<div>
  <div className="grid grid-cols-[1fr_1fr_80px_80px_auto] gap-4 font-semibold text-sm text-gray-600 mb-1 px-1">
    <div>Nombre</div>
    <div>Unidades</div>
    <div>Instalado</div>
    <div>Faltan</div>
    <div></div>
  </div>

  {(() => {
    const listaTrabajos = (modoEdicion || mostrarFormulario) ? trabajos : trabajosProyecto;
    return listaTrabajos.map((trabajo, index) => {
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
  value={nombre ?? ""}
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
            <div className="flex justify-center">
              <button
                onClick={() => {
                  const nuevos = trabajos.filter((_, i) => i !== index);
                  setTrabajos(nuevos);
                }}
                className="text-red-500 hover:text-red-700"
                title="Eliminar trabajo"
              >
                <XCircle size={20} />
              </button>
            </div>
          ) : (
            <div></div>
          )}
        </div>
      );
    });
  })()}

 
</div>



           

          {/* Botones */}
          <div className="flex justify-end gap-4 mt-4">
            <button
              onClick={() => {
                setMostrarFormulario(false);
                setNuevoProyecto({ nombre: "", descripcion: "" });
                setSupervisoresSeleccionados([]);
                setTrabajadoresSeleccionados([]);
                setTrabajos([{ nombre: "", unidades: "" }]);
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
      )}
{/* Lista de proyectos */}
<div className="grid md:grid-cols-2 gap-4">
  {proyectos.map((p) => (
    <div
      key={p.id}
      className="bg-white/30 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition relative"
    >
      <div
        onClick={async () => {
            await cargarDatosProyecto(p);
            await obtenerPersonal(p);
          }}
        className="cursor-pointer"
      >
        <div className="text-lg font-semibold text-gray-800">{p.nombre}</div>
        <div className="text-sm text-gray-500 mb-2">{p.descripcion || "Sin descripción"}</div>
        <div className="text-sm text-gray-600 mt-2">
          <strong className="text-gray-700">Supervisor:</strong>{" "}
          {supervisoresPorProyecto[p.id] || "Sin asignar"}
        </div>
      </div>

      <div className="flex gap-2 absolute top-2 right-2">
        <button
            onClick={async () => {
              setModoEdicion(true);
              await cargarDatosProyecto(p);
              await obtenerPersonal(p); // 🔥 Cargar personal disponible actualizado
            }}
          className="text-blue-600 hover:text-blue-800"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={() => eliminarProyecto(p.id)}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  ))}
</div>



{proyectoSeleccionado && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start z-50 pt-20 px-4">
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-3xl w-full relative">
      <button
        className="absolute top-2 right-3 text-red-600 font-bold text-xl"
        onClick={() => {
          setProyectoSeleccionado(null);
          setModoEdicion(false);
        }}
      >
        ×
      </button>

      <h2 className="text-xl font-bold text-purple-900 mb-4">
        {modoEdicion ? '✏️ Editar proyecto' : proyectoSeleccionado.nombre}
      </h2>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
       <input
  value={(modoEdicion ? nuevoProyecto.nombre : proyectoSeleccionado.nombre) ?? ""}
  disabled={!modoEdicion}
  onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, nombre: e.target.value })}
  className={`w-full p-2 border rounded-xl ${!modoEdicion ? 'bg-gray-100 cursor-not-allowed' : ''}`}
/>
      </div>

      <textarea
  value={(modoEdicion ? nuevoProyecto.descripcion : proyectoSeleccionado.descripcion) ?? ""}
  disabled={!modoEdicion}
  onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, descripcion: e.target.value })}
  className={`w-full p-2 border rounded-xl ${!modoEdicion ? 'bg-gray-100 cursor-not-allowed' : ''}`}
/>


     {/* Supervisores */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Supervisores</label>
  <div className="flex flex-wrap gap-2">
    {personalDisponible.map((persona) => {
      const estaEnTrabajadores = trabajadoresSeleccionados.includes(persona.id);
      const seleccionado = supervisoresSeleccionados.includes(persona.id);
      return (
        <button
          key={persona.id}
          type="button"
          disabled={!modoEdicion || estaEnTrabajadores}
          onClick={() => {
            if (seleccionado) {
              setSupervisoresSeleccionados(supervisoresSeleccionados.filter(id => id !== persona.id));
            } else {
              setSupervisoresSeleccionados([...supervisoresSeleccionados, persona.id]);
              setTrabajadoresSeleccionados(trabajadoresSeleccionados.filter(id => id !== persona.id));
            }
          }}
          className={`px-3 py-1 rounded-full border text-sm flex items-center gap-1 transition-all duration-150 ${
            seleccionado
              ? 'bg-purple-600 text-white border-purple-700'
              : estaEnTrabajadores || !modoEdicion
              ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-100'
          }`}
        >
          {persona.nombrecompleto}
          {seleccionado && <span className="ml-1">✅</span>}
        </button>
      );
    })}
  </div>
  <p className="text-xs text-gray-500 mt-1">Puedes seleccionar uno o varios supervisores.</p>
</div>

{/* Trabajadores */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Trabajadores asignados</label>
  <div className="flex flex-wrap gap-2">
    {personalDisponible.map((persona) => {
      const estaEnSupervisores = supervisoresSeleccionados.includes(persona.id);
      const seleccionado = trabajadoresSeleccionados.includes(persona.id);
      return (
        <button
          key={persona.id}
          type="button"
          disabled={!modoEdicion || estaEnSupervisores}
          onClick={() => {
            if (seleccionado) {
              setTrabajadoresSeleccionados(trabajadoresSeleccionados.filter(id => id !== persona.id));
            } else {
              setTrabajadoresSeleccionados([...trabajadoresSeleccionados, persona.id]);
              setSupervisoresSeleccionados(supervisoresSeleccionados.filter(id => id !== persona.id));
            }
          }}
          className={`px-3 py-1 rounded-full border text-sm flex items-center gap-1 transition-all duration-150 ${
            seleccionado
              ? 'bg-green-600 text-white border-green-700'
              : estaEnSupervisores || !modoEdicion
              ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-green-100'
          }`}
        >
          {persona.nombrecompleto}
          {seleccionado && <span className="ml-1">✅</span>}
        </button>
      );
    })}
  </div>
  <p className="text-xs text-gray-500 mt-1">Puedes asignar varios trabajadores.</p>
</div>

{/* Trabajos asignados */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Trabajos por realizar</label>
  <div className="grid grid-cols-[1fr_1fr_80px_80px_auto] gap-4 font-semibold text-sm text-gray-600 mb-1 px-1">
    <div>Nombre</div>
    <div>Unidades</div>
    <div>Instalado</div>
    <div>Faltan</div>
    <div></div>
  </div>

 
  {(() => {
    const listaTrabajos = modoEdicion || mostrarFormulario ? trabajos : trabajosProyecto;
     console.log("modoEdicion:", modoEdicion, "mostrarFormulario:", mostrarFormulario, "listaTrabajos:", listaTrabajos);
    return listaTrabajos.map((trabajo, index) => {
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
  value={nombre ?? ""}
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
    });
  })()}
   {/* 🔥 Botón para agregar otro trabajo */}
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
</div>


<div className="mt-6">
  <h3 className="text-lg font-bold text-purple-800 mb-3">🧾 Resumen financiero del proyecto</h3>
  <div className="bg-white shadow rounded-xl p-4 space-y-2 text-sm text-gray-800">
    <div className="flex justify-between border-b pb-1">
      <span>Costo por trabajos asignados</span>
      <span className="font-semibold">
        Q{trabajosProyecto.reduce((acc, t) => acc + (t.unidades || 0) * (t.costo_unitario || 0), 0).toFixed(2)}
      </span>
    </div>
    <div className="flex justify-between border-b pb-1">
      <span>Costo de planilla (personal)</span>
      <span className="font-semibold">
        Q{personalAsignado.reduce((acc, p) => acc + (p.salariopordia || 0), 0).toFixed(2)}
      </span>
    </div>
    <div className="flex justify-between border-b pb-1">
      <span>Costo de liquidaciones / caja chica</span>
      <span className="font-semibold">
        Q{gastosProyecto.reduce((acc, g) => acc + (g.monto || 0), 0).toFixed(2)}
      </span>
    </div>
    <div className="flex justify-between pt-2 border-t text-lg text-purple-900 font-bold">
      <span>
  Q{isNaN(
      trabajosProyecto.reduce((acc, t) => acc + (t.unidades || 0) * (t.costo_unitario || 0), 0) +
      personalAsignado.reduce((acc, p) => acc + (p.salariopordia || 0), 0) +
      gastosProyecto.reduce((acc, g) => acc + (g.monto || 0), 0)
    )
    ? "0.00"
    : (
      trabajosProyecto.reduce((acc, t) => acc + (t.unidades || 0) * (t.costo_unitario || 0), 0) +
      personalAsignado.reduce((acc, p) => acc + (p.salariopordia || 0), 0) +
      gastosProyecto.reduce((acc, g) => acc + (g.monto || 0), 0)
    ).toFixed(2)
  }
</span>

    </div>
  </div>
</div>




      <div className="flex justify-end mt-4 gap-2">
  {modoEdicion ? (
    <>
      <button
        onClick={() => {
          setModoEdicion(false);
        }}
        className="bg-gray-300 px-4 py-2 rounded-xl"
      >
        Cancelar
      </button>
      <button
        onClick={async () => {
          // 🔹 Actualizar proyecto (nombre y descripción)
          const { error } = await supabase
            .from("proyectos")
            .update({
              nombre: nuevoProyecto.nombre,
              descripcion: nuevoProyecto.descripcion
            })
            .eq("id", proyectoSeleccionado.id);

          if (error) {
            console.error("Error al actualizar proyecto:", error);
            alert("Error al guardar cambios");
            return;
          }

          // 🔹 Limpiar supervisores y trabajadores actuales
          await supabase
            .from("proyectos_personal")
            .delete()
            .eq("proyecto_id", proyectoSeleccionado.id);

          // 🔹 Insertar supervisores
          await supabase
            .from("proyectos_personal")
            .insert(
              supervisoresSeleccionados.map((id) => ({
                proyecto_id: proyectoSeleccionado.id,
                trabajador_id: id,
                rol: "supervisor"
              }))
            );

          // 🔹 Insertar trabajadores
          await supabase
            .from("proyectos_personal")
            .insert(
              trabajadoresSeleccionados.map((id) => ({
                proyecto_id: proyectoSeleccionado.id,
                trabajador_id: id,
                rol: "trabajador"
              }))
            );

          // 🔹 Limpiar trabajos actuales
          await supabase
            .from("proyectos_trabajos")
            .delete()
            .eq("proyecto_id", proyectoSeleccionado.id);

          // 🔹 Insertar trabajos nuevos
          await supabase
            .from("proyectos_trabajos")
            .insert(
              trabajos
                .filter(t => t.nombre.trim() !== "" && parseInt(t.unidades))
                .map((t) => ({
                  proyecto_id: proyectoSeleccionado.id,
                  nombre_trabajo: t.nombre.trim(),
                  unidades_totales: parseInt(t.unidades, 10)
                }))
            );

          alert("Cambios guardados correctamente");
          setModoEdicion(false);
          obtenerProyectos(); // Para refrescar la lista
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl"
      >
        Guardar cambios
      </button>


          </>
        ) : (
          <button
            
  onClick={async () => {
  setNuevoProyecto({
    nombre: proyectoSeleccionado.nombre,
    descripcion: proyectoSeleccionado.descripcion
  });
  setModoEdicion(true);

  const { data: sup } = await supabase
    .from("proyectos_personal")
    .select("trabajador_id")
    .eq("proyecto_id", proyectoSeleccionado.id)
    .eq("rol", "supervisor");

  setSupervisoresSeleccionados(sup?.map((s) => s.trabajador_id) || []);

  const { data: trab } = await supabase
    .from("proyectos_personal")
    .select("trabajador_id")
    .eq("proyecto_id", proyectoSeleccionado.id)
    .eq("rol", "trabajador");

  setTrabajadoresSeleccionados(trab?.map((t) => t.trabajador_id) || []);

  const { data: trabs, error: errorTrabs } = await supabase
    .from("proyectos_trabajos")
    .select("nombre_trabajo, unidades_totales")
    .eq("proyecto_id", proyectoSeleccionado.id);

  if (errorTrabs) {
    console.error("Error cargando trabajos del proyecto:", errorTrabs);
    return;
  }

  setTrabajos(
    trabs.map((t) => ({
      nombre: t.nombre_trabajo,
      unidades: t.unidades_totales
    }))
  );

  await obtenerPersonal(p); // Recarga la lista filtrada de personal

}}


  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-md"
>
  ✏️ Editar
</button>

        )}
      </div>
    </div>
  </div>
)}


    </div>
  );
}
