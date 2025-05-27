import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { Plus, Pencil, FileText } from "lucide-react";

export default function AgregarReporte({ trabajador, usuario, onGuardar }) {
  const [presento, setPresento] = useState("Sí");
  const [meta, setMeta] = useState("");
  const [comentario, setComentario] = useState("");
  const [numerogrupo, setNumeroGrupo] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargarUltimoGrupo = async () => {
      const { data, error } = await supabase
        .from("reportesdiarios")
        .select("numerogrupo, fechareporte")
        .eq("nombretrabajador", trabajador.nombrecompleto)
        .order("fechareporte", { ascending: false })
        .limit(1);

      if (!error && data.length > 0) {
        setNumeroGrupo(data[0].numerogrupo || "");
      }
    };

    if (trabajador?.nombrecompleto) {
      cargarUltimoGrupo();
    }
  }, [trabajador]);
  
  const handleGuardar = async () => {
  if (!trabajador?.nombrecompleto) {
    alert("Error: trabajador no definido");
    return;
  }

  const fechaHoy = new Date().toISOString().slice(0, 10);
  const cantidad = presento === "Sí" ? parseInt(meta) : 0;

  if (presento === "Sí" && isNaN(cantidad)) {
    alert("Debes ingresar una meta válida.");
    return;
  }

  const registro = {
    fechareporte: fechaHoy,
    nombretrabajador: trabajador.nombrecompleto,
    cantidad,
    viaticos_diarios: presento === "Sí" ? parseFloat(trabajador.viaticos_diarios|| 0) : 0,
    comentario: comentario || "--",
    reportadopor: usuario?.usuario || "Desconocido",
    sepresentoatrabajar: presento,
    numerogrupo: numerogrupo || null,
    salariopordia: trabajador.salariopordia ?? 0,
    metaestablecida: trabajador.metaestablecida ?? 0,
    bonificacion: trabajador.bonificacion ?? 0,
    modalidad: trabajador.modalidad || "día",
    precioporcantidad: trabajador.precioporcantidad ?? 0,
    proyecto: trabajador.proyecto || ""
  };

  console.log("Registro a guardar:", registro); // 👀 VERIFICACIÓN

  setGuardando(true);
  const { error } = await supabase.from("reportesdiarios").insert([registro]);
  setGuardando(false);

  if (error) {
    console.error("Error Supabase:", error);
    alert("Error al guardar el reporte");
  } else {
    alert("Reporte guardado con éxito");
    setMeta("");
    setComentario("");
    setNumeroGrupo("");
    if (onGuardar) onGuardar();
  }
};



  return (
    <div className="mt-4 bg-gray-100 p-4 rounded shadow">
      <h4 className="font-semibold mb-2">📋 Agregar reporte diario</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold">Se presentó a trabajar:</label>
          <select
            value={presento}
            onChange={(e) => setPresento(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="Sí">Sí</option>
            <option value="No">No</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold">No. de grupo:</label>
          <input
            type="text"
            placeholder="Ej: 1, 2, 3..."
            value={numerogrupo}
            onChange={(e) => setNumeroGrupo(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        {presento === "Sí" && (
          <div>
            <label className="text-sm font-semibold">Meta diaria alcanzada:</label>
            <input
              type="number"
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
              className="border p-2 rounded w-full"
              placeholder="Ej: 120"
            />
          </div>
        )}
            
        <div className="md:col-span-2">
          <label className="text-sm font-semibold">Comentario:</label>
          <input
            type="text"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="Observaciones (opcional)"
          />
        </div>

        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="bg-blue-600 text-white py-2 rounded mt-2 md:col-span-2 hover:bg-blue-700"
        >
          {guardando ? "Guardando..." : "Guardar reporte"}
        </button>
        </div>
    </div>
  );
}
