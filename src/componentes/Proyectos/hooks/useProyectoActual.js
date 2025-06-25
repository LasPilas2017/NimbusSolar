import { useState } from "react";
import { supabase } from "../../../supabase";

export function useProyectoActual() {
  const [trabajos, setTrabajos] = useState([{ nombre: "", unidades: "" }]);
  const [trabajosProyecto, setTrabajosProyecto] = useState([]);
  const [personalDisponible, setPersonalDisponible] = useState([]);
  const [personalAsignado, setPersonalAsignado] = useState([]);
  const [gastosProyecto, setGastosProyecto] = useState([]);
  const [supervisoresPorProyecto, setSupervisoresPorProyecto] = useState([]);
  const [proyectos, setProyectos] = useState([]);

  // 🔄 Obtener todos los proyectos con su categoría contable
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

  // 🔍 Obtener supervisores por proyecto
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

  // 👥 Obtener personal disponible para asignar
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

  // 📦 Cargar los datos de un proyecto seleccionado
  const cargarDatosProyecto = async (idProyecto) => {
    if (!idProyecto) return null;

    const { data: proyecto, error } = await supabase
      .from("proyectos")
      .select("*, categorias_contables (id, nombre)")
      .eq("id", idProyecto)
      .single();

    if (error) {
      console.error("Error al obtener el proyecto:", error);
      return null;
    }

    const { data: trabajosCargados, error: errorTrabajos } = await supabase
      .from("proyectos_trabajos")
      .select("nombre_trabajo, unidades_totales")
      .eq("proyecto_id", idProyecto);

    if (errorTrabajos) {
      console.error("Error al cargar trabajos:", errorTrabajos);
    }

    setTrabajos(
      trabajosCargados?.length
        ? trabajosCargados.map((t) => ({
            nombre: t.nombre_trabajo,
            unidades: t.unidades_totales
          }))
        : [{ nombre: "", unidades: "" }]
    );

    // Supervisores y trabajadores asignados
    const { data: sup } = await supabase
      .from("proyectos_personal")
      .select("trabajador_id")
      .eq("proyecto_id", idProyecto)
      .eq("rol", "supervisor");

    const { data: trab } = await supabase
      .from("proyectos_personal")
      .select("trabajador_id")
      .eq("proyecto_id", idProyecto)
      .eq("rol", "trabajador");

    const { data: personal } = await supabase
      .from("registrodepersonal")
      .select("id, salariopordia")
      .in("id", [...(sup?.map((s) => s.trabajador_id) || []), ...(trab?.map((t) => t.trabajador_id) || [])]);

    setPersonalAsignado(personal || []);

    const { data: egresos, error: errorEgresos } = await supabase
      .from("contabilidad")
      .select("monto")
      .eq("proyecto_id", idProyecto);

    if (errorEgresos) {
      console.error("Error al obtener egresos:", errorEgresos);
    }

    setGastosProyecto(egresos || []);

    const { data: reportes, error: errorReportes } = await supabase
      .from("reportesdiarios")
      .select("cantidad, trabajorealizado")
      .eq("proyecto", idProyecto);

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

    await obtenerPersonal(proyecto); // ✅ Actualizar personal permitido

    return proyecto;
  };

  // 🗑️ Eliminar un proyecto
  const eliminarProyecto = async (id) => {
    if (!confirm("¿Eliminar este proyecto?")) return;
    const { error } = await supabase.from("proyectos").delete().eq("id", id);
    if (!error) obtenerProyectos();
  };

  return {
    proyectos,
    trabajos,
    setTrabajos,
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
