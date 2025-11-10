import React from "react";

// ✅ Hook del módulo CRM (no de ventas)
import { useCrm } from "../../presentation/adapters/useCrmLocalMock.js";

// ✅ Componentes UI del propio módulo CRM
import CRMPanelGeneral from "./CRMPanelGeneral.jsx";
import CRMPanelEtapas from "./CRMPanelEtapas.jsx";
import CRMPanelConversion from "./CRMPanelConversion.jsx";
import CRMTablaProspectos from "./CRMTablaProspectos.jsx";
import "../styles/CRMESTILOS.css";

export default function CRMPage() {
  const {
    rows,
    kpis,
    rowMeta,
    updateRowMeta,
    dirtyIds,
    bulkSaveMeta,
    bulkRevertMeta,
    readHistorial,
    addContacto,
  } = useCrm();

  if (!kpis) return <div className="p-4 text-gray-500">Cargando CRM…</div>;

  return (
    <div className="space-y-3 max-w-full h-screen overflow-y-auto no-scrollbar">
      {/* Fila de KPIs */}
      <div className="grid grid-cols-1 gap-4 px-[4px] items-stretch max-w-full
                      sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 scale-y-[0.9] origin-top">
        {/* General */}
        <div className="min-w-0 w-full sm:col-span-6 md:col-span-3 lg:col-span-3">
          <CRMPanelGeneral
            className="h-full w-full"
            baseTotal={kpis.baseTotal}
            enProceso={kpis.enProceso}
            finalizados={kpis.finalizados}
            frio={kpis.frio}
            tibio={kpis.tibio}
            caliente={kpis.caliente}
          />
        </div>

        {/* Etapas */}
        <div className="min-w-0 w-full sm:col-span-3 md:col-span-3 lg:col-span-5">
          <CRMPanelEtapas
            className="h-full w-full pt-1 pb-0"
            valores={kpis.etapasValores}
            porcentajes={kpis.etapasPct}
          />
        </div>

        {/* Conversión */}
        <div className="min-w-0 w-full sm:col-span-3 md:col-span-2 lg:col-span-4">
          <CRMPanelConversion
            className="h-full w-full"
            ventasCount={kpis.conversion.ventasCount}
            ventasMonto={kpis.conversion.ventasMonto}
            perdidasCount={kpis.conversion.perdidasCount}
            perdidasMonto={kpis.conversion.perdidasMonto}
            conversionPct={kpis.conversion.conversionPct}
            cicloVenta={kpis.conversion.cicloVenta}
            perdidosPct={kpis.conversion.perdidosPct}
            embudoPct={kpis.conversion.embudoPct}
            ventaPct={kpis.conversion.ventaPct}
          />
        </div>
      </div>

      {/* Tabla de prospectos */}
      <CRMTablaProspectos
        rows={rows}
        rowMeta={rowMeta}
        onRowMetaChange={updateRowMeta}
        dirtyIds={dirtyIds}
        onBulkSave={bulkSaveMeta}
        onBulkRevert={bulkRevertMeta}
        readStored={readHistorial}
        writeStored={async (id, arr) => {
          for (const c of arr) await addContacto(id, c);
        }}
      />
    </div>
  );
}
