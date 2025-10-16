import React from "react";
import CRMPanelGeneral from "./CRMPanelGeneral";
import CRMPanelEtapas from "./CRMPanelEtapas";
import CRMPanelConversion from "./CRMPanelConversion";
import CRMTablaProspectos from "./CRMTablaProspectos";

export default function CRMPrincipal({ user, rolUsuario }) {
  // Mock data
  const baseTotal = 320, enProceso = 0, finalizados = 3;
  const frio = 0, tibio = 0, caliente = 0;

  const etapasValores = [0, 0, 0, 0, 0, 0];
  const etapasPct     = [100, 100, 100, 100, 100, 100];

  const rows = Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    prospecto: `Prospecto ${i + 1}`,
    condicion: i % 2 ? "Nuevo" : "Recurrente",
    agente: ["Ana", "Luis", "Karla"][i % 3],
    canal: ["Facebook", "Llamada", "Email"][i % 3],
    fecha1: "", fecha2: "", fecha3: "", fecha4: "", fecha5: "",
    dias: "", avance: "", estatus: "Abierto", venta: i % 7 === 0,
    notas: i % 3 === 0 ? "Pendiente de llamada de seguimiento." : "",
  }));

    return (
      <div className="space-y-3 max-w-full h-screen overflow-y-auto no-scrollbar">

      {/* FILA SUPERIOR (responsiva, con respiro lateral) */}
      <div
        className="
          grid grid-cols-1 gap-4 px-[4px] items-stretch max-w-full
          sm:grid-cols-6
          md:grid-cols-8
          lg:grid-cols-12
          scale-y-[0.9]      // 🔹 Reduce toda la fila a 90% de su altura
          origin-top          // 🔹 Aplasta desde arriba hacia abajo
        "
      >
        {/* IZQUIERDA */}
        <div className="min-w-0 w-full sm:col-span-6 md:col-span-3 lg:col-span-3">
          <CRMPanelGeneral
            className="h-full w-full"
            baseTotal={baseTotal}
            enProceso={enProceso}
            finalizados={finalizados}
            frio={frio}
            tibio={tibio}
            caliente={caliente}
          />
        </div>

        {/* CENTRO */}
        <div className="min-w-0 w-full sm:col-span-3 md:col-span-3 lg:col-span-5">
          <CRMPanelEtapas
            className="h-full w-full pt-1 pb-0"
            valores={etapasValores}
            porcentajes={etapasPct}
          />
        </div>

        {/* DERECHA */}
        <div className="min-w-0 w-full sm:col-span-3 md:col-span-2 lg:col-span-4">
          <CRMPanelConversion
            className="h-full w-full"
            compact
            ventasCount={3}
            ventasMonto={12000}
            perdidasCount={0}
            conversionPct={100}
            cicloVenta={3.0}
            perdidosPct={0}
            embudoPct={0}
            ventaPct={100}
          />
        </div>
      </div>

      {/* TABLA DE PROSPECTOS */}
      <CRMTablaProspectos
        rows={rows}
        onRowClick={(r) => console.log("fila:", r)}
      />
    </div>
  );
}
