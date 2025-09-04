// src/VistaDetalleProyecto/Planilla/PlanillaPorDias.jsx
import React from 'react';
import { FiCheck } from 'react-icons/fi';
import "./EstiloExcelPlanilla.css"; // 👈 usar el mismo estilo que Planilla

const diasQuincena = [
  '01/07/25', '02/07/25', '03/07/25', '04/07/25', '05/07/25',
  '06/07/25', '07/07/25', '08/07/25', '09/07/25', '10/07/25',
  '11/07/25', '12/07/25', '13/07/25', '14/07/25', '15/07/25',
];

// 🔢 15 personas (id: 1..15) con el mismo patrón diario (solo visual)
const datosPorPersona = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  dias: diasQuincena.map(() => ({ ba: true, bp: 25, h: 2 })),
}));

export default function PlanillaPorDias() {
  // Calcular totales por día
  const totales = diasQuincena.map((_, index) => {
    const totalBP = datosPorPersona.reduce((acc, persona) => acc + (persona.dias[index]?.bp || 0), 0);
    const totalH  = datosPorPersona.reduce((acc, persona) => acc + (persona.dias[index]?.h  || 0), 0);
    return { bp: totalBP, h: totalH };
  });

  return (
    <div className="table-planilla w-full">
      <div className="scroll-x">
        <table>
          <thead>
            {/* fila principal con fechas */}
            <tr>
              {diasQuincena.map((dia, index) => (
                <th key={index} colSpan={3} className="col-dia">
                  {dia}
                </th>
              ))}
            </tr>

            {/* fila de totales */}
            <tr className="row-total">
              {totales.map((total, i) => (
                <React.Fragment key={i}>
                  <th className="td-center">Totales</th>
                  <th className="td-center">{total.bp}</th>
                  <th className="td-center">{total.h}</th>
                </React.Fragment>
              ))}
            </tr>

            {/* sub-encabezados */}
            <tr>
              {diasQuincena.map((_, i) => (
                <React.Fragment key={i}>
                  <th className="col-cant">B.A.</th>
                  <th className="col-total">B.P.</th>
                  <th className="col-total">H</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>

          <tbody>
            {datosPorPersona.map((persona) => (
              <tr key={persona.id}>
                {persona.dias.map((dia, j) => (
                  <React.Fragment key={j}>
                    <td className="td-center">
                      {dia.ba && <FiCheck className="text-green-600 mx-auto" />}
                    </td>
                    <td className="td-center">{dia.bp}</td>
                    <td className="td-center">{dia.h}</td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
