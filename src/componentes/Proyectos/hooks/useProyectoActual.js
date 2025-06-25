/**
 * Este custom hook encapsula toda la lógica de carga, obtención y eliminación
 * de proyectos desde Supabase. Se usa dentro de Proyectos.jsx para mantener el
 * archivo limpio y organizado.
 */
import { useState } from "react";
import { supabase } from "../../../supabase";

export function useProyectoActual() {
  // Estados para controlar los diferentes datos del proyecto
  const [trabajos, setTrabajos] = useState([{ nombre: "", unidades: "" }]);
  const [trabajosProyecto, setTrabajosProyecto] = useState([]);
  const [personalDisponible, setPersonalDisponible] = useState([]);
  const [personalAsignado, setPersonalAsignado] = useState([]);
  const [gastosProyecto, setGastosProyecto] = useState([]);
  const [supervisoresPorProyecto, setSupervisoresPorProyecto] = useState([]);
  const [proyectos, setProyectos] = useState([]);

  // Obtiene todos los proyectos con su categoría asociada
  const obtenerProyectos = async () => {
    const { data, error } = await supabase
      .from("proyectos")
      .select(`
        *,
        categorias_contables (
          nombre,
          tipo
        )
      `);

    if (error) {
      console.error("Error al cargar proyectos:", error);
      return;
    }

    setProyectos(data);
  };

  // Obtiene el nombre del supervisor por proyecto
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

  // Filtra personal disponible que no esté asignado a otros proyectos
  const obtenerPersonal = async (proyectoParam) => {
    const { data: asignados } = await supabase
      .from("proyectos_personal")
      .select("trabajador_id, proyecto_id");

    const idsOcupados = asignados?.map((t) => t.trabajador_id) || [];

    let idsPermitidos = [];
    if (proyectoParam) {
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

  // Carga trabajos, personal asignado y egresos del proyecto
  const cargarDatosProyecto = async (proyecto) => {
    if (!proyecto || !proyecto.id) return;

    const { data: trabajosCargados, error: errorTrabajos } = await supabase
      .from("proyectos_trabajos")
      .select("nombre_trabajo, unidades_totales")
      .eq("proyecto_id", proyecto.id);

    if (errorTrabajos) {
      console.error("Error al cargar trabajos:", errorTrabajos);
    }

    setTrabajos(
      (trabajosCargados && trabajosCargados.length > 0)
        ? trabajosCargados.map((t) => ({
            nombre: t.nombre_trabajo,
            unidades: t.unidades_totales
          }))
        : [{ nombre: "", unidades: "" }]
    );

    // Supervisores y trabajadores del proyecto
    const { data: sup } = await supabase
      .from("proyectos_personal")
      .select("trabajador_id")
      .eq("proyecto_id", proyecto.id)
      .eq("rol", "supervisor");

    const { data: trab } = await supabase
      .from("proyectos_personal")
      .select("trabajador_id")
      .eq("proyecto_id", proyecto.id)
      .eq("rol", "trabajador");

    // Sueldos del personal
    const { data: personal } = await supabase
      .from("registrodepersonal")
      .select("id, salariopordia")
      .in("id", [...(sup?.map((s) => s.trabajador_id) || []), ...(trab?.map((t) => t.trabajador_id) || [])]);

    setPersonalAsignado(personal || []);

    // Carga egresos del proyecto
    const { data: egresos, error: errorEgresos } = await supabase
      .from("contabilidad")
      .select("monto")
      .eq("proyecto_id", proyecto.id);

    if (errorEgresos) {
      console.error("Error al obtener egresos:", errorEgresos);
    }

    setGastosProyecto(egresos || []);

    // Carga reportes para calcular unidades instaladas
    const { data: reportes, error: errorReportes } = await supabase
      .from("reportesdiarios")
      .select("cantidad, trabajorealizado")
      .eq("proyecto", proyecto.id);

    if (errorReportes) {
      console.error("Error obteniendo reportes:", errorReportes);
    }

    const sumasPorTrabajo = {};
    reportes?.forEach((r) => {
      const trabajo = r.trabajorealizado;
      if (!sumasPorTrabajo[trabajo]) {
        sumasPorTrabajo[trabajo] = 0;
      }
      sumasPorTrabajo[trabajo] += r.cantidad || 0;
    });

    const trabajosActualizados = (trabajosCargados || []).map((t) => ({
      nombre: t.nombre_trabajo,
      unidades: t.unidades_totales,
      instaladas: sumasPorTrabajo[t.nombre_trabajo] || 0
    }));

    setTrabajosProyecto(trabajosActualizados);
    await obtenerPersonal(proyecto); // Actualiza personal disponible con permisos para editar
  };

  // Elimina un proyecto por ID
  const eliminarProyecto = async (id) => {
    if (!confirm("¿Eliminar este proyecto?")) return;
    const { error } = await supabase.from("proyectos").delete().eq("id", id);
    if (!error) obtenerProyectos();
  };

  // Retorna los estados y funciones para ser utilizados por el componente principal
  return {
    proyectos,
    trabajos,
    setTrabajos, // permite actualizar trabajos desde componentes externos
    trabajosProyecto,
    personalDisponible,
    setPersonalDisponible,
    personalAsignado,
    gastosProyecto,
    supervisoresPorProyecto,
    obtenerProyectos,
    obtenerSupervisores,
    obtenerPersonal,
    cargarDatosProyecto,
    eliminarProyecto
  };
}
