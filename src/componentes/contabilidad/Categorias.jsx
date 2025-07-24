import React, { useEffect, useState } from "react";
import supabase from "../../supabase";

export default function Categorias({ onCerrar, tipo = "ingreso" }) {
  // Estados para almacenar categorías y subcategorías
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);

  // Estados para filtrar por fecha
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Otros estados para controlar formularios, edición y visibilidad
  const [formularioVisible, setFormularioVisible] = useState(null);
  const [subCategoria, setSubCategoria] = useState("");
  const [mostrarSubcategorias, setMostrarSubcategorias] = useState({});
  const [editandoSub, setEditandoSub] = useState(null);
  const [nuevoNombreSub, setNuevoNombreSub] = useState("");
  const [filtradas, setFiltradas] = useState([]);

  // Estado para mostrar formulario flotante de categoría
  const [mostrarFormCategoria, setMostrarFormCategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState("");

  // Cargar categorías y subcategorías al iniciar
  useEffect(() => {
    obtenerCategorias();
    obtenerSubcategorias();
  }, [tipo]);

  // Filtrar categorías por fecha seleccionada
  useEffect(() => {
    const filtradas = categorias.filter((cat) => {
      const fecha = new Date(cat.fecha);
      const inicio = fechaInicio ? new Date(fechaInicio) : null;
      const fin = fechaFin ? new Date(fechaFin) : null;
      if (inicio && fecha < inicio) return false;
      if (fin && fecha > fin) return false;
      return true;
    });
    setFiltradas(filtradas);
  }, [fechaInicio, fechaFin, categorias]);

  // Obtener las categorías desde Supabase
  const obtenerCategorias = async () => {
    const { data, error } = await supabase
      .from("categorias_contables")
      .select("*")
      .eq("tipo", tipo)
      .order("fecha", { ascending: false });

    if (!error) setCategorias(data);
  };

  // Obtener las subcategorías y calcular sus totales
 const obtenerSubcategorias = async () => {
  const { data: ingresos } = await supabase.from("ingresos").select("monto, proyecto_id");
  const { data: egresos } = await supabase.from("egresos").select("monto, proyecto_id");

  const { data: proyectos, error } = await supabase
    .from("proyectos")
    .select("id, nombre, categoria_id");

  if (error) return;

  // Agrupar ingresos/egresos por proyecto
  const subcategoriasConTotales = proyectos.map((proy) => {
    const totalIngresos = ingresos
      ?.filter((i) => i.proyecto_id === proy.id)
      .reduce((sum, i) => sum + Number(i.monto), 0) || 0;

    const totalEgresos = egresos
      ?.filter((e) => e.proyecto_id === proy.id)
      .reduce((sum, e) => sum + Number(e.monto), 0) || 0;

    return {
      id: proy.id,
      nombre: proy.nombre,
      id_categoria: proy.categoria_id,
      total: totalIngresos + totalEgresos,
    };
  });

  setSubcategorias(subcategoriasConTotales);
};


  // Agregar una nueva subcategoría a una categoría
  const agregarSubcategoria = async (id_categoria) => {
    if (!subCategoria.trim()) return;
    const yaExiste = subcategorias.some(
      (sub) => sub.id_categoria === id_categoria && sub.nombre === subCategoria.trim()
    );
    if (yaExiste) {
      alert("Ya existe una subcategoría con ese nombre en esta categoría.");
      return;
    }
    const { error } = await supabase.from("subcategorias_contables").insert([
      {
        nombre: subCategoria,
        id_categoria,
        fecha: new Date().toISOString(),
      },
    ]);
    if (!error) {
      setSubCategoria("");
      setFormularioVisible(null);
      obtenerSubcategorias();
    }
  };

  // Eliminar subcategoría
  const eliminarSubcategoria = async (id) => {
    const confirm = window.confirm("¿Estás seguro que deseas eliminar esta subcategoría?");
    if (!confirm) return;
    const { error } = await supabase.from("subcategorias_contables").delete().eq("id", id);
    if (!error) obtenerSubcategorias();
  };

  // Actualizar nombre de subcategoría
  const actualizarSubcategoria = async (id) => {
    if (!nuevoNombreSub.trim()) return;
    const { error } = await supabase
      .from("subcategorias_contables")
      .update({ nombre: nuevoNombreSub })
      .eq("id", id);
    if (!error) {
      setEditandoSub(null);
      setNuevoNombreSub("");
      obtenerSubcategorias();
    }
  };

  // Mostrar/ocultar subcategorías de una categoría
  const toggleSubcategorias = (idCategoria) => {
    setMostrarSubcategorias((prev) => ({
      ...prev,
      [idCategoria]: !prev[idCategoria],
    }));
  };

  // Agregar nueva categoría usando formulario flotante
  const agregarCategoria = async () => {
    if (!nuevaCategoria.trim()) return;

    const { error } = await supabase
      .from("categorias_contables")
      .insert([{ nombre: nuevaCategoria.trim(), tipo }]);

    if (!error) {
      obtenerCategorias();
      setNuevaCategoria("");
      setMostrarFormCategoria(false);
      alert("Categoría agregada correctamente.");
    } else {
      console.error("Error al agregar categoría:", error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h3 className="text-lg font-bold mb-4">📁 Gestión de Categorías ({tipo})</h3>

      {/* Filtros por fecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm font-semibold">Fecha inicio:</label>
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="text-sm font-semibold">Fecha fin:</label>
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full p-2 border rounded" />
        </div>
      </div>

      {/* Tabla de categorías */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full text-sm border border-gray-200 rounded-xl">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-2 px-3 text-left">Nombre</th>
              <th className="py-2 px-3 text-right">Total</th>
              <th className="py-2 px-3 text-center">Subcategorías</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((cat) => {
              const totalCategoria = subcategorias
                .filter((sub) => sub.id_categoria === cat.id)
                .reduce((sum, sub) => sum + (sub.total || 0), 0);

              return (
                <React.Fragment key={cat.id}>
                  <tr className="border-t hover:bg-gray-50 cursor-pointer">
                    <td className="py-2 px-3" onClick={() => toggleSubcategorias(cat.id)}>{cat.nombre}</td>
                    <td className="py-2 px-3 text-right">Q {totalCategoria.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => setFormularioVisible(formularioVisible === cat.id ? null : cat.id)}
                        className="text-purple-600 text-lg"
                      >
                        ➕
                      </button>
                    </td>
                  </tr>

                  {formularioVisible === cat.id && (
                    <tr>
                      <td colSpan="3" className="py-2 px-3 bg-gray-50">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            agregarSubcategoria(cat.id);
                          }}
                          className="flex gap-2"
                        >
                          <input
                            type="text"
                            placeholder="Nombre subcategoría"
                            value={subCategoria}
                            onChange={(e) => setSubCategoria(e.target.value)}
                            className="flex-1 border rounded p-2"
                            required
                          />
                          <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded"
                          >
                            Agregar
                          </button>
                        </form>
                      </td>
                    </tr>
                  )}

                  {mostrarSubcategorias[cat.id] && (
                    <>
                      <tr><td colSpan="3" className="h-4"></td></tr>
                      {subcategorias
                        .filter((sub) => sub.id_categoria === cat.id)
                        .map((sub) => (
                          <tr key={sub.id} className="border-t bg-gray-100">
                            <td className="py-1 px-5 text-sm text-gray-700">
                              {editandoSub === sub.id ? (
                                <input
                                  value={nuevoNombreSub}
                                  onChange={(e) => setNuevoNombreSub(e.target.value)}
                                  className="border p-1 rounded"
                                />
                              ) : (
                                <>↳ {sub.nombre}</>
                              )}
                            </td>
                            <td className="py-1 px-3 text-sm text-right text-gray-700">
                              Q {sub.total?.toFixed(2) || "0.00"}
                            </td>
                            <td className="text-right pr-2">
                              {editandoSub === sub.id ? (
                                <button
                                  onClick={() => actualizarSubcategoria(sub.id)}
                                  className="text-green-600 text-sm mr-2"
                                >Guardar</button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditandoSub(sub.id);
                                    setNuevoNombreSub(sub.nombre);
                                  }}
                                  className="text-blue-600 text-sm mr-2"
                                >Editar</button>
                              )}
                              <button
                                onClick={() => eliminarSubcategoria(sub.id)}
                                className="text-red-600 text-sm"
                              >Eliminar</button>
                            </td>
                          </tr>
                        ))}
                    </>
                  )}
                </React.Fragment>
              );
            })}

            {filtradas.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-4">
                  No hay categorías en el rango seleccionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Botón y formulario flotante solo si tipo es ingreso */}
      {tipo === "ingreso" && (
        <div className="text-right mb-4">
          {!mostrarFormCategoria ? (
            <button
              onClick={() => setMostrarFormCategoria(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-4 rounded"
            >
              ➕ Agregar nueva categoría
            </button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                agregarCategoria();
              }}
              className="flex gap-2 justify-end items-center mt-2"
            >
              <input
                type="text"
                placeholder="Nombre categoría"
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                className="border rounded p-2"
                required
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 rounded"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setMostrarFormCategoria(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 rounded"
              >
                Cancelar
              </button>
            </form>
          )}
        </div>
      )}

      {/* Botón para cerrar */}
      <button
        onClick={onCerrar}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-4 rounded"
      >
        Cerrar
      </button>
    </div>
  );
}