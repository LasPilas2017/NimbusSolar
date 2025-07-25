export default function ResumenGeneralProyecto({
  resumen,
  subcategoriasGastos,
  mostrarSubcategorias,
  setMostrarSubcategorias,
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 mb-8">
      <div className="space-y-4">
        {resumen.map((item, idx) => {
          let barraColor = "bg-gray-400";
          if (item.nombre === "Utilidad") barraColor = "bg-green-400";
          else if (item.nombre === "Producción") barraColor = "bg-blue-500";
          else if (item.nombre === "Gastos") barraColor = "bg-red-400";

          return (
            <div key={idx}>
              <div
                onClick={() =>
                  item.nombre === "Gastos" &&
                  setMostrarSubcategorias(!mostrarSubcategorias)
                }
                className="bg-gray-50 px-4 py-3 rounded-xl shadow-inner flex items-center gap-4 flex-wrap sm:flex-nowrap cursor-pointer hover:bg-gray-100 transition"
              >
                <span className="font-medium text-gray-700 w-24 min-w-[80px]">
                  {item.nombre}
                </span>

                <span className="font-bold text-gray-900 w-28 min-w-[100px]">
                  Q{Number(item.monto || 0).toLocaleString()}
                </span>

                <span className="text-sm text-gray-600 w-16 min-w-[60px] text-right">
                  {item.porcentaje || 0}%
                </span>

                {/* 🔹 Barra con estilo cuadrado */}
                <div className="relative flex-1 bg-gray-200 rounded-none h-4">
                  <div
                    className={`h-4 rounded-none transition-all ${barraColor}`}
                    style={{ width: `${item.porcentaje || 0}%` }}
                  ></div>
                </div>
              </div>

              {item.nombre === "Gastos" && mostrarSubcategorias && (
                <SubcategoriasGastos subcategorias={subcategoriasGastos} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
