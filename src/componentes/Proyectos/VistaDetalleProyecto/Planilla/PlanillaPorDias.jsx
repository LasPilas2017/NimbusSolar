import React from 'react';
import { FiCheck } from 'react-icons/fi';

const diasQuincena = [
  '01/07/25', '02/07/25', '03/07/25', '04/07/25', '05/07/25',
  '06/07/25', '07/07/25', '08/07/25', '09/07/25', '10/07/25',
  '11/07/25', '12/07/25', '13/07/25', '14/07/25', '15/07/25',
];

const datosPorPersona = [
  {
    id: 1,
    dias: diasQuincena.map(() => ({ ba: true, bp: 25, h: 2 }))  
  },
  {
    id: 2,
    dias: diasQuincena.map(() => ({ ba: true, bp: 25, h: 2 }))
  }
];

export default function PlanillaPorDias() {
  // Calcular totales por día
  const totales = diasQuincena.map((_, index) => {
    const totalBP = datosPorPersona.reduce((acc, persona) => acc + persona.dias[index].bp, 0);
    const totalH = datosPorPersona.reduce((acc, persona) => acc + persona.dias[index].h, 0);
    return { bp: totalBP, h: totalH };
  });

  return (
    <div className="overflow-x-auto border border-black w-full">
      <table className="text-xs text-center border-collapse border border-black min-w-max">
        <thead>
          <tr>
            {diasQuincena.map((dia, index) => (
              <th key={index} colSpan={3} className="border border-black px-1 py-1 min-w-[90px]">
                {dia}
              </th>
            ))}
          </tr>

          {/* Nueva fila con totales */}
          <tr>
            {totales.map((total, i) => (
              <React.Fragment key={i}>
                <th className="border border-black px-1 py-1 bg-gray-200">Totales</th>
                <th className="border border-black px-1 py-1 bg-gray-200">{total.bp}</th>
                <th className="border border-black px-1 py-1 bg-gray-200">{total.h}</th>
              </React.Fragment>
            ))}
          </tr>

          <tr>
            {diasQuincena.map((_, i) => (
              <React.Fragment key={i}>
                <th className="border border-black px-1 py-1">B.A.</th>
                <th className="border border-black px-1 py-1">B.P.</th>
                <th className="border border-black px-1 py-1">H</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>

        <tbody>
          {datosPorPersona.map((persona, i) => (
            <tr key={i}>
              {persona.dias.map((dia, j) => (
                <React.Fragment key={j}>
                  <td className="border border-black px-1 py-1">
                    {dia.ba && <FiCheck className="text-green-600 mx-auto" />}
                  </td>
                  <td className="border border-black px-1 py-1">{dia.bp}</td>
                  <td className="border border-black px-1 py-1">{dia.h}</td>
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
