// src/modules/vendedor/ui/pages/MisClientes.jsx
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Pantalla "Mis Clientes" del sistema del vendedor.
//
// - CAPA: UI (React)
// - BASE DE DATOS INDIRECTA: Supabase
// - TABLA: "clientes"
//   * El acceso directo a Supabase está en
//     modules/vendedor/infra/supabase/ClientesSupabaseRepository.js
// - Este componente solo llama al caso de uso `getMisClientes` y muestra
//   los datos en una tabla con filtros y un formulario embebido.
// -----------------------------------------------------------------------------

import React, { useMemo, useState, useEffect } from "react";

// Formulario de clientes (por ahora asumimos que lo moverás a:
// src/modules/vendedor/ui/components/FormMisClientes.jsx )
import FormMisClientes from "../components/FormMisClientes.jsx";

import { supabase } from "../../../../infra/supabase/supabaseClient";
import { ClientesSupabaseRepository } from "../../../vendedor/infra/supabase/ClientesSupabaseRepository.js";
import { createGetMisClientes } from "../../../vendedor/application/use-cases/getMisClientes.js";
import { createDeleteCliente } from "../../../vendedor/application/use-cases/deleteCliente.js";
import { calcularCategoriaCliente } from "../../../vendedor/domain/services/calcularCategoriaCliente.js";

// -----------------------------------------------------------------------------
// COMPOSICIÓN: repositorio + caso de uso
// -----------------------------------------------------------------------------
const clientesRepository = new ClientesSupabaseRepository(supabase);
const getMisClientes = createGetMisClientes({ clientesRepository });
const deleteCliente = createDeleteCliente({ clientesRepository });

export default function MisClientes() {
  const [mounted, setMounted] = useState(false);
  const [abrirForm, setAbrirForm] = useState(false);
  const [clientesData, setClientesData] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [clienteParaEditar, setClienteParaEditar] = useState(null);
  const [menuAbiertoId, setMenuAbiertoId] = useState(null);

  // UI categorías
  const [categoria, setCategoria] = useState("todos");
  const [dropdownAbierto, setDropdownAbierto] = useState(false);

  // Pequeña animación de entrada
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  // ---------------------------------------------------------------------------
  // Cargar clientes usando el caso de uso (ya no hablamos directo con Supabase)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        setCargando(true);
        const normalizados = await getMisClientes();
        setClientesData(normalizados);
      } catch (err) {
        console.error("Error cargando clientes:", err);
        setClientesData([]);
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const infoCategoria = {
    todos: { titulo: "Todos los clientes", desc: "Listado completo." },
    frecuentes: { titulo: "Clientes frecuentes", desc: "Compras en 1–3 meses." },
    recientes: { titulo: "Clientes recientes", desc: "Últimos 30 días." },
    retirados: { titulo: "Clientes retirados", desc: "Más de 3 meses." },
  };

  const clientesFiltrados = useMemo(() => {
    const base =
      categoria === "todos"
        ? clientesData
        : clientesData.filter((c) => c.categoria === categoria);

    if (!busqueda.trim()) return base;
    const q = busqueda.toLowerCase();
    return base.filter(
      (c) =>
        c.nombre_completo.toLowerCase().includes(q) ||
        (c.empresa || "").toLowerCase().includes(q) ||
        (c.correo || "").toLowerCase().includes(q) ||
        (c.telefono || "").toLowerCase().includes(q) ||
        (c.celular || "").toLowerCase().includes(q)
    );
  }, [categoria, busqueda, clientesData]);

  // Cuando el formulario crea un nuevo cliente, lo agregamos a la lista
  const handleSuccessForm = (nuevo, modo) => {
    const normalizado = {
      id: nuevo.id,
      nombre_completo: nuevo.nombre_completo || "---",
      empresa: nuevo.empresa || "---",
      correo: nuevo.correo || "---",
      telefono: nuevo.telefono || "",
      celular: nuevo.celular || "",
      departamento: nuevo.departamento || "---",
      direccion: nuevo.direccion || "---",
      pais: nuevo.pais || "---",
      categoria: calcularCategoriaCliente(nuevo.fecha_creacion), // derivado
    };

    setClientesData((prev) => {
      if (modo === "editar") {
        return prev.map((c) => (c.id === normalizado.id ? normalizado : c));
      }
      return [normalizado, ...prev];
    });

    setAbrirForm(false);
    setClienteParaEditar(null);
  };

  const handleEditar = (cliente) => {
    setClienteParaEditar(cliente);
    setAbrirForm(true);
  };

  const handleEliminar = async (cliente) => {
    const nombre = cliente?.nombre_completo || cliente?.nombre || "este cliente";
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar ${nombre}? Esta accion no se puede deshacer.`
    );
    if (!confirmar) return;

    try {
      setCargando(true);
      await deleteCliente(cliente.id);
      setClientesData((prev) => prev.filter((c) => c.id !== cliente.id));
    } catch (err) {
      console.error("Error eliminando cliente:", err);
      alert("No se pudo eliminar el cliente. Intenta de nuevo.");
    } finally {
      setCargando(false);
      setMenuAbiertoId(null);
    }
  };

  const seleccionarCategoria = (cat) => {
    setCategoria(cat);
    setDropdownAbierto(false);
  };

  return (
    <div className="absolute inset-0 w-full h-full p-4 sm:p-6 md:p-8 bg-gradient-to-b from-[#0b1320]/80 to-[#0b1320]/90">
      {abrirForm ? (
        <FormMisClientes
          onCancel={() => {
            setAbrirForm(false);
            setClienteParaEditar(null);
          }}
          onSuccess={handleSuccessForm}
          modo={clienteParaEditar ? "editar" : "crear"}
          cliente={clienteParaEditar}
        />
      ) : (
        <div
          className={`w-full h-full rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] transition-all duration-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-5 sm:p-6 border-b border-white/10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                Mis Clientes
              </h1>
              <p className="text-sm text-white/70">
                {infoCategoria[categoria].titulo} ·{" "}
                {infoCategoria[categoria].desc}
              </p>
            </div>

            <div className="flex w-full md:w-auto items-center gap-2">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder={cargando ? "Cargando..." : "Buscar cliente..."}
                className="w-full md:w-72 rounded-xl border border-white/10 bg-white/10
                           px-4 py-2.5 text-sm text-white placeholder-white/60
                           focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
              />

              {/* Dropdown Categorías */}
              <div className="relative">
                <button
                  onClick={() => setDropdownAbierto((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium
                             text-white shadow-md border border-white/10
                             bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400"
                >
                  Categorías
                  <svg
                    className={`h-4 w-4 transition-transform ${
                      dropdownAbierto ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
                  </svg>
                </button>

                {dropdownAbierto && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10
                               bg-[#0b1320]/95 backdrop-blur-md shadow-2xl z-20"
                    onMouseLeave={() => setDropdownAbierto(false)}
                  >
                    <div className="py-1 text-sm text-white/90">
                      <button
                        onClick={() => seleccionarCategoria("frecuentes")}
                        className="w-full text-left px-4 py-2 hover:bg-white/10"
                      >
                        Clientes frecuentes
                      </button>
                      <button
                        onClick={() => seleccionarCategoria("recientes")}
                        className="w-full text-left px-4 py-2 hover:bg-white/10"
                      >
                        Clientes recientes
                      </button>
                      <button
                        onClick={() => seleccionarCategoria("retirados")}
                        className="w-full text-left px-4 py-2 hover:bg-white/10"
                      >
                        Clientes retirados
                      </button>
                      <div className="my-1 border-t border-white/10" />
                      <button
                        onClick={() => seleccionarCategoria("todos")}
                        className="w-full text-left px-4 py-2 text-white/70 hover:bg-white/10"
                      >
                        Ver todos
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setClienteParaEditar(null);
                  setAbrirForm(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium
                           text-white shadow-md border border-white/10
                           bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 5a.75.75 0 01.75.75V9.25h3.5a.75.75 0 010 1.5h-3.5v3.5a.75.75 0 01-1.5 0v-3.5H5.25a.75.75 0 010-1.5h3.5V5.75A.75.75 0 0110 5z" />
                </svg>
                Ingresar cliente
              </button>
            </div>
          </div>

          {/* Tabla */}
          <div className="p-4 sm:p-6 h-[calc(100%-110px)] overflow-auto">
            <table className="min-w-full text-sm border-collapse border border-white/10">
              <thead className="bg-white/5 text-white/80 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left border-b border-white/10">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left border-b border-white/10">
                    Empresa
                  </th>
                  <th className="px-4 py-3 text-left border-b border-white/10">
                    Correo
                  </th>
                  <th className="px-4 py-3 text-left border-b border-white/10">
                    Teléfono
                  </th>
                  <th className="px-4 py-3 text-left border-b border-white/10">
                    Celular
                  </th>
                  <th className="px-4 py-3 text-left border-b border-white/10">
                    Departamento
                  </th>
                  <th className="px-4 py-3 text-left border-b border-white/10">
                    Dirección
                  </th>
                  <th className="px-4 py-3 text-left border-b border-white/10">
                    País
                  </th>
              <th className="px-4 py-3 text-left border-b border-white/10">
                Estado
              </th>
              <th className="px-4 py-3 text-left border-b border-white/10">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {!cargando &&
              clientesFiltrados.map((c, i) => (
                    <tr
                      key={c.id}
                      className={`${
                        i % 2 === 0 ? "bg-white/0" : "bg-white/5"
                      } hover:bg-cyan-400/10 transition-colors`}
                    >
                      <td className="px-4 py-3 text-white">
                        {c.nombre_completo || "---"}
                      </td>
                      <td className="px-4 py-3 text-white/90">
                        {c.empresa || "---"}
                      </td>
                      <td className="px-4 py-3 text-white/90">
                        {c.correo || "---"}
                      </td>
                      <td className="px-4 py-3 text-white/90">
                        {c.telefono?.trim() || "---"}
                      </td>
                      <td className="px-4 py-3 text-white/90">
                        {c.celular?.trim() || "---"}
                      </td>
                      <td className="px-4 py-3 text-white/90">
                        {c.departamento || "---"}
                      </td>
                      <td className="px-4 py-3 text-white/90">
                        {c.direccion || "---"}
                      </td>
                      <td className="px-4 py-3 text-white/90">
                        {c.pais || "---"}
                      </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "px-2 py-1 rounded-full text-[11px] font-medium border " +
                        (c.categoria === "frecuentes"
                          ? "bg-emerald-400/15 text-emerald-200 border-emerald-300/30"
                          : c.categoria === "recientes"
                          ? "bg-amber-400/15 text-amber-200 border-amber-300/30"
                          : "bg-white/10 text-white/80 border-white/20")
                      }
                    >
                      {c.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3 relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuAbiertoId((prev) => (prev === c.id ? null : c.id));
                      }}
                      className="px-2 py-1 rounded-lg border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                      aria-haspopup="true"
                      aria-expanded={menuAbiertoId === c.id}
                    >
                      ☰
                    </button>
                    {menuAbiertoId === c.id && (
                      <div className="absolute right-0 mt-2 w-36 rounded-lg border border-white/15 bg-[#0b1320] text-sm text-white/80 shadow-xl z-10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuAbiertoId(null);
                            handleEditar(c);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-white/10"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEliminar(c);
                          }}
                          className="w-full text-left px-3 py-2 text-rose-200 hover:bg-rose-500/10"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

                {cargando && (
                  <tr>
                    <td
                      colSpan="10"
                      className="text-center text-white/60 py-8 italic"
                    >
                      Cargando clientes…
                    </td>
                  </tr>
                )}

                {!cargando && clientesFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan="10"
                      className="text-center text-white/60 py-8 italic"
                    >
                      No hay clientes registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
