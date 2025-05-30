import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { guardarLog } from "../../utils"; // 👈 Importar el log

export default function CalculosFinancieros({ usuario, proyectoId }) {
  const [produccion, setProduccion] = useState(0);
  const [gastado, setGastado] = useState(0);
  const [ingresos, setIngresos] = useState(0);

  // Calcular Producción
  useEffect(() => {
    const calcularProduccion = async () => {
      const { data: trabajos } = await supabase
        .from("proyectos_trabajos")
        .select("*")
        .eq("proyecto_id", proyectoId);

      let total = 0;
      trabajos?.forEach((trabajo) => {
        const unidadesInstaladas = trabajo.unidades_instaladas ?? 0;
        const precioUnitario = trabajo.precio_unitario ?? 0;
        total += unidadesInstaladas * precioUnitario;
      });

      setProduccion(total);
    };

    if (proyectoId) {
      calcularProduccion();
    }
  }, [proyectoId]);

  // Calcular Gastado
  useEffect(() => {
    const calcularGastado = async () => {
      const { data: gastos } = await supabase
        .from("gastos_proyectos")
        .select("monto")
        .eq("proyecto_id", proyectoId);

      const total = gastos
        ? gastos.reduce((sum, gasto) => sum + (gasto.monto ?? 0), 0)
        : 0;

      setGastado(total);
    };

    if (proyectoId) {
      calcularGastado();
    }
  }, [proyectoId]);

  // Calcular Ingresos
  useEffect(() => {
    const calcularIngresos = async () => {
      const { data: ampliacionesData } = await supabase
        .from("ampliaciones_proyectos")
        .select("monto, medio")
        .eq("proyecto_id", proyectoId);

      const total = ampliacionesData
        ? ampliacionesData
            .filter((a) => {
              const medio = a.medio ? a.medio.toLowerCase() : "";
              return medio === "transferencia" || medio === "deposito";
            })
            .reduce((sum, a) => sum + (a.monto ?? 0), 0)
        : 0;

      setIngresos(total);
    };

    if (proyectoId) {
      calcularIngresos();
    }
  }, [proyectoId]);

  // 👉 Registrar log cuando se consulta este resumen financiero
  useEffect(() => {
    if (usuario && proyectoId) {
      guardarLog(
        usuario,
        "Consulta resumen financiero",
        `El usuario consultó el resumen financiero del proyecto ID: ${proyectoId}`
      );
    }
  }, [usuario, proyectoId]);

  const utilidad = produccion - gastado;
  const liquidez = ingresos - gastado;

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-4">
      <h3 className="text-xl font-bold text-purple-700 text-center mb-4">
        Resumen Financiero
      </h3>

      <div className="flex flex-wrap justify-between gap-6 mt-2">
        <div className="flex flex-col items-center flex-1 min-w-[100px]">
          <p className="text-sm font-semibold text-gray-700">💵 Producción</p>
          <p className="text-lg font-bold text-green-700">
            Q{produccion.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="flex flex-col items-center flex-1 min-w-[100px]">
          <p className="text-sm font-semibold text-gray-700">📤 Gastado</p>
          <p className="text-lg font-bold text-red-700">
            Q{gastado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="flex flex-col items-center flex-1 min-w-[100px]">
          <p className="text-sm font-semibold text-gray-700">💰 Ingresos</p>
          <p className="text-lg font-bold text-blue-700">
            Q{ingresos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="flex flex-col items-center flex-1 min-w-[100px]">
          <p className="text-sm font-semibold text-gray-700">💚 Utilidad</p>
          <p className="text-lg font-bold text-green-700">
            Q{utilidad.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="flex flex-col items-center flex-1 min-w-[100px]">
          <p className="text-sm font-semibold text-gray-700">💚 Liquidez</p>
          <p className="text-lg font-bold text-green-700">
            Q{liquidez.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}
