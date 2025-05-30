// ModificarTrabajos.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { guardarLog } from "../../utils";

export default function ModificarTrabajos({ usuario, persona, onCerrar, onRecargar }) {
  const [datosFormulario, setDatosFormulario] = useState({
    salarioBase: "",
    bonoAsistencia: "",
    viaticos: "",
    pagoHoraExtra: "",
    salarioDia: "",
  });

  useEffect(() => {
    if (persona.modalidad === "fijo") {
      setDatosFormulario({
        salarioBase: persona.salarioporquincena || "",
        bonoAsistencia: persona.bonificacion || "",
        viaticos: persona.viaticos_diarios || "",
        pagoHoraExtra: persona.pagoporhoraextra || "",
      });
    } else if (persona.modalidad === "temporal") {
      setDatosFormulario({
        salarioDia: persona.salariopordia || "",
        pagoHoraExtra: persona.pagoporhoraextra || "",
      });
    }
  }, [persona]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDatosFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGuardarCambios = async () => {
    let updateData = {};

    if (persona.modalidad === "fijo") {
      updateData = {
        salarioporquincena: datosFormulario.salarioBase || null,
        bonificacion: datosFormulario.bonoAsistencia || null,
        viaticos_diarios: datosFormulario.viaticos || null,
        horas_extras: datosFormulario.pagoHoraExtra || null,
      };
    } else if (persona.modalidad === "temporal") {
      updateData = {
        salariopordia: datosFormulario.salarioDia || null,
        horas_extras: datosFormulario.pagoHoraExtra || null,
      };
    }

    const { error } = await supabase
      .from("registrodepersonal")
      .update(updateData)
      .eq("id", persona.id);

    if (error) {
      console.error("Error al actualizar:", error);
      alert("Ocurrió un error al actualizar los datos.");
    } else {
      alert("Datos actualizados correctamente.");

      await guardarLog(
        usuario,
        "Modificación de datos de trabajo",
        `El usuario modificó datos de: ${persona.nombrecompleto}`
      );
      
      if (onRecargar) {
        onRecargar();
      }
      onCerrar();
    }
  };

  return (
    <div className="p-4 rounded-xl shadow bg-white">
      <h3 className="font-semibold text-lg mb-4">⚙️ Modificar Datos de Trabajo</h3>

      {persona.modalidad === "fijo" && (
        <>
          <div className="mb-4">
            <label className="block font-medium mb-1">Salario por quincena (Q)</label>
            <input
              type="number"
              name="salarioBase"
              value={datosFormulario.salarioBase}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">Bono por día trabajado (Q)</label>
            <input
              type="number"
              name="bonoAsistencia"
              value={datosFormulario.bonoAsistencia}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">Viáticos diarios (Q)</label>
            <input
              type="number"
              name="viaticos"
              value={datosFormulario.viaticos}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">Pago por hora extra (Q)</label>
            <input
              type="number"
              name="pagoHoraExtra"
              value={datosFormulario.pagoHoraExtra}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
            />
          </div>
        </>
      )}

      {persona.modalidad === "temporal" && (
        <>
          <div className="mb-4">
            <label className="block font-medium mb-1">Salario por día (Q)</label>
            <input
              type="number"
              name="salarioDia"
              value={datosFormulario.salarioDia}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">Pago por hora extra (Q)</label>
            <input
              type="number"
              name="pagoHoraExtra"
              value={datosFormulario.pagoHoraExtra}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
            />
          </div>
        </>
      )}

      <div className="flex gap-4 justify-center mt-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
          onClick={handleGuardarCambios}
        >
          Guardar
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"
          onClick={onCerrar}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
