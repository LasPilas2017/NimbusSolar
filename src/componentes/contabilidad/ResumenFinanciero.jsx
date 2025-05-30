// ResumenFinanciero.jsx
import React from "react";
import { DollarSign, ArrowUpCircle, Heart, HeartHandshake } from "lucide-react";

export default function ResumenFinanciero({ produccion, gastado, utilidad, liquidez }) {
  return (
    <div className="grid grid-cols-4 gap-4 p-4 rounded-xl shadow bg-white text-gray-700 w-full max-w-2xl mx-auto">
      {/* Producción */}
      <div className="flex flex-col items-center">
        <DollarSign className="text-green-500 w-6 h-6" />
        <span className="font-medium text-sm">Producción</span>
        <span className="text-base font-semibold">Q{(produccion ?? 0).toFixed(2)}</span>
      </div>

      {/* Gastado */}
      <div className="flex flex-col items-center">
        <ArrowUpCircle className="text-red-500 w-6 h-6" />
        <span className="font-medium text-sm">Gastado</span>
        <span className="text-base font-semibold">Q{(gastado ?? 0).toFixed(2)}</span>
      </div>

      {/* Utilidad */}
      <div className="flex flex-col items-center">
        <Heart className="text-green-500 w-6 h-6" />
        <span className="font-medium text-sm">Utilidad</span>
        <span className="text-base font-semibold">Q{(utilidad ?? 0).toFixed(2)}</span>
      </div>

      {/* Liquidez */}
      <div className="flex flex-col items-center">
        <HeartHandshake className="text-green-500 w-6 h-6" />
        <span className="font-medium text-sm">Liquidez</span>
        <span className="text-base font-semibold">Q{(liquidez ?? 0).toFixed(2)}</span>
      </div>
    </div>

    
  );
}
