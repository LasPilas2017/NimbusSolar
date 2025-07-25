export default function TarjetaProyecto({ proyecto, abrirDetalle }) {
  const montoTotal = proyecto.monto_total || 0;
  const utilidad = proyecto.utilidad || 0;
  const porcentajeUtilidad =
    montoTotal > 0 ? Math.min((utilidad / montoTotal) * 100, 100) : 0;

  const colorCirculo =
  utilidad < 0
    ? "#dc2626" // rojo fuerte si pérdida
    : porcentajeUtilidad < 10
    ? "#facc15" // amarillo si ganancia muy baja
    : "#10b981"; // verde si ganancia decente


  const colorTextoUtilidad = utilidad > 0 ? "text-green-700" : "text-red-600";

  return (
    <div
      className="w-60 h-72 bg-gray-100/80 backdrop-blur-md border border-gray-300 rounded-none shadow-md p-4 flex flex-col justify-between cursor-pointer hover:bg-gray-200 transition-colors duration-300 flex-shrink-0"
      onClick={() => abrirDetalle(proyecto.id)}
    >
      {/* 🔹 Nombre del Proyecto */}
      <h2 className="text-center text-base font-bold text-gray-800 mb-1">
        {proyecto.nombre}
      </h2>

      {/* 💰 Monto y Utilidad */}
      <div className="flex justify-between text-xs text-gray-700 mb-2">
        <div className="text-center">
          <p className="text-gray-500">Monto</p>
          <p className="font-semibold text-green-700">Q{montoTotal}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Utilidad</p>
          <p className={`font-semibold ${colorTextoUtilidad}`}>Q{utilidad}</p>
        </div>
      </div>

      {/* 🔵 Círculo de Progreso */}
      <div className="flex justify-center mb-1">
        <svg className="w-24 h-24" viewBox="0 0 36 36">
          <path
            className="text-gray-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            fill="none"
            stroke={colorCirculo}
            strokeWidth="4"
            strokeDasharray={`${porcentajeUtilidad}, 100`}
            strokeLinecap="round"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
      </div>

      {/* 📊 Porcentaje utilidad */}
      <p className="text-center text-sm text-gray-700 font-medium mb-1">
        {porcentajeUtilidad.toFixed(1)}% de Utilidad
      </p>

      {/* 📝 Descripción */}
      {proyecto.descripcion && (
        <p className="text-[11px] text-center text-gray-600 px-2">
          {proyecto.descripcion}
        </p>
      )}
    </div>
  );
}
