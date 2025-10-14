import React from "react";
import CRMPanelGeneral from "./CRMPanelGeneral";
import CRMPanelEtapas from "./CRMPanelEtapas";
import CRMPanelConversion from "./CRMPanelConversion";
import CRMTablaProspectos from "./CRMTablaProspectos";

export default function CRMPrincipal({ user, rolUsuario }) {
  // Mock data
  const baseTotal = 320, enProceso = 0, finalizados = 3;
  const frio = 0, tibio = 0, caliente = 0;
  const etapasValores = [0, 0, 0, 0, 0];
  const etapasPct = [100, 100, 100, 100, 100];

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
    <div className="space-y-3">
      {/* FILA SUPERIOR: 3 paneles (en xl una sola fila) */}
     <div className="grid items-start gap-x-4 gap-y-4 lg:grid-cols-[460px,1fr,260px]">

        {/* 1) General */}
        <div className="grid items-stretch gap-x-4 gap-y-4 lg:grid-cols-[460px,520px,260px]">
  <CRMPanelGeneral
    className="h-full"
    baseTotal={baseTotal}
    enProceso={enProceso}
    finalizados={finalizados}
    frio={frio}
    tibio={tibio}
    caliente={caliente}
  />

  <CRMPanelEtapas
    className="h-full"
    valores={etapasValores}
    porcentajes={etapasPct}
  />

  <CRMPanelConversion
    className="h-full"
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

      {/* TABLA */}
      <CRMTablaProspectos
        rows={rows}
        onRowClick={(r) => console.log("fila:", r)}
      />
    </div>
  );
}
