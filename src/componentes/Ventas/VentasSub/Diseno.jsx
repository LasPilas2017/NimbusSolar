// Diseno.jsx — Título centrado + tabla full width + barras fijas a su mes
import React, { useMemo, useState, Fragment } from "react";
import { BarChart3 } from "lucide-react"; // ícono del título

export default function Diseno() {
  const [valoresPorMes] = useState(Array(12).fill(null));
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: 7 }, (_, i) => currentYear - 3 + i),
    [currentYear]
  );
  const [year, setYear] = useState(currentYear);

  const total = valoresPorMes
    .filter((v) => typeof v === "number")
    .reduce((a, b) => a + b, 0);

  const money = (n) =>
    `Q ${n.toLocaleString("es-GT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const max = Math.max(
    1,
    ...valoresPorMes.map((v) => (typeof v === "number" ? v : 0))
  );

  const meses = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
  ];

  return (
    <div className="ventas-wrap">
      <style>{`
        :root{
          --col-fixed: clamp(150px, 16vw, 240px);
          --col-total: clamp(120px, 11vw, 180px);
          --col-pct: clamp(80px, 8vw, 120px);
          --fs-base: clamp(12px, 0.95vw, 15px);
          --fs-head: clamp(13px, 1.05vw, 16px);
          --cell-pad-y: clamp(6px, 0.7vw, 10px);
          --cell-pad-x: clamp(6px, 0.8vw, 12px);
          --bar-height: clamp(60px, 12vh, 130px);
          --bar-width: clamp(10px, 0.9vw, 18px);
          --bar-gap-top: clamp(8px, 0.8vw, 12px);
        }

        .ventas-wrap{
          width:100%;
          background:#fff;
          padding:clamp(10px, 2vw, 24px);
          box-sizing:border-box;
        }

        /* === TÍTULO SUPERIOR === */
        .titulo{
          display:flex;
          align-items:center;
          justify-content:center;
          gap:10px;
          margin-bottom:clamp(10px, 2vh, 20px);
          border-bottom:3px solid #d4af37;
          padding-bottom:8px;
        }
        .titulo h1{
          font-size:clamp(20px, 2vw, 28px);
          font-weight:800;
          color:#111;
        }
        .titulo svg{
          color:#2c2c2c;
          background:linear-gradient(180deg,#e2e2e2,#cfcfcf);
          border-radius:8px;
          padding:3px;
        }

        .container{
          width:100%;
          display:flex;
          flex-direction:column;
          gap:clamp(8px, 1.2vw, 16px);
        }

        /* Panel superior */
        .panel-superior{
          display:flex;
          justify-content:flex-end;
          gap:clamp(8px, 1vw, 12px);
          width:100%;
        }
        .panel-box{
          background:#e9e7f6;
          border:1px solid #d7d2ef;
          border-radius:8px;
          padding:clamp(6px, 0.8vw, 10px) clamp(10px, 1vw, 14px);
          font-size:var(--fs-base);
          color:#5b49a6;
          font-weight:800;
          display:flex;
          align-items:center;
          justify-content:space-between;
          min-width: clamp(160px, 16vw, 220px);
        }
        .panel-box.verde{ background:#e6f4e7; border-color:#cfe8d1; color:#2f7b35; }
        .panel-box .val{
          background:rgba(0,0,0,.05);
          padding:2px 8px;
          border-radius:6px;
          font-weight:800;
        }

        /* Selector año */
        .anio{ display:flex; align-items:center; gap:10px; }
        .anio label{ font-size:var(--fs-base); font-weight:700; color:#555; }
        .anio select{
          border:1px solid #cdbfa5; background:#fff6e6; border-radius:8px;
          padding:clamp(6px, 0.8vw, 10px) clamp(8px, 1vw, 12px);
          font-weight:700; font-size:var(--fs-base);
        }

        /* Tabla scroll */
        .tabla-scroll{
          width:100%;
          overflow-x:auto;
          -webkit-overflow-scrolling:touch;
        }
        .tabla-content{
          position:relative;
          width:100%;
          min-width: 980px;
          padding-top: calc(var(--bar-height) + var(--bar-gap-top));
        }

        /* Overlay de barras */
        .barras-overlay{
          position:absolute;
          left:0; top:0;
          height:var(--bar-height);
          width:100%;
          display:grid;
          grid-template-columns: var(--col-fixed) repeat(12, 1fr) var(--col-total) var(--col-pct);
          align-items:end;
          pointer-events:none;
          z-index:3;
        }
        .slot{ display:flex; justify-content:center; align-items:flex-end; }
        .barra{
          width:var(--bar-width);
          border-radius:6px 6px 0 0;
          background:linear-gradient(180deg,#7ad36d 0%, #3fb34a 100%);
          animation:battery 1.6s infinite linear;
        }
        .barra--cero{ height:6px; background:#d5d5d5; border-radius:3px; animation:none; }
        @keyframes battery{
          0%{ filter:brightness(.95); transform:scaleY(.98); }
          50%{ filter:brightness(1.12); transform:scaleY(1); }
          100%{ filter:brightness(.95); transform:scaleY(.98); }
        }

        /* Tabla */
        .grid{
          display:grid;
          grid-template-columns: var(--col-fixed) repeat(12, 1fr) var(--col-total) var(--col-pct);
          border:2px solid #000;
          border-top:none;
          font-size:var(--fs-base);
        }
        .grid > div{
          border-right:1px solid #c9c9c9;
          border-bottom:1px solid #c9c9c9;
          padding:var(--cell-pad-y) var(--cell-pad-x);
        }
        .grid-head{
          font-weight:800; background:#f6efe4; text-align:center;
          font-size:var(--fs-head);
        }
        .head-total, .head-pct{
          background:#2c2c2c; color:#fff; font-weight:800; text-align:center;
          font-size:var(--fs-head);
        }

        .fila-azul > div{ background:#cfd9ea; color:#1b2b45; font-weight:700; text-align:center; }
        .fila-verde > div{ background:#eaf6e7; color:#2c6a33; font-weight:700; text-align:center; }
        .celda{ background:#fff; text-align:center; white-space:nowrap; }
        .celda.primera{ text-align:left; }
        .celda-total{ text-align:right; font-weight:800; }
        .celda-pct{ font-weight:800; }
      `}</style>

      {/* TÍTULO CENTRADO */}
      <div className="titulo">
        <BarChart3 size={28} />
        <h1>Evaluación de Ventas</h1>
      </div>

      <div className="container">
        {/* Panel superior */}
        <div className="panel-superior">
          <div className="panel-box">
            CRECIMIENTO TOTAL <span className="val">0.00%</span>
          </div>
          <div className="panel-box verde">
            INGRESO TOTAL <span className="val">{money(total)}</span>
          </div>
        </div>

        {/* Año */}
        <div className="anio">
          <label htmlFor="anio">Seleccionar Año</label>
          <select id="anio" value={year} onChange={(e)=>setYear(parseInt(e.target.value,10))}>
            {years.map((y)=> <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Tabla */}
        <div className="tabla-scroll">
          <div className="tabla-content">
            {/* Overlay de barras */}
            <div className="barras-overlay">
              <div className="slot" />
              {valoresPorMes.map((v, i) => {
                const h = Math.max(6, Math.round(((typeof v === "number" ? v : 0) / max) * 100));
                return (
                  <div className="slot" key={`bar-${i}`}>
                    <div
                      className={v && v > 0 ? "barra" : "barra barra--cero"}
                      style={v && v > 0 ? { height: `${h}%` } : {}}
                      title={
                        typeof v === "number" ? `${meses[i]}: ${money(v)}` : `${meses[i]}: —`
                      }
                    />
                  </div>
                );
              })}
              <div className="slot" />
              <div className="slot" />
            </div>

            {/* Contenido de la tabla */}
            <div className="grid">
              {/* Encabezados */}
              <div className="grid-head"></div>
              {meses.map((m)=> <div className="grid-head" key={m}>{m}</div>)}
              <div className="head-total">Total</div>
              <div className="head-pct">%</div>

              {/* Filas */}
              <div className="fila-azul celda primera">Crecimiento</div>
              {meses.map((_,i)=><div className="fila-azul celda" key={`c${i}`}>—</div>)}
              <div className="fila-azul celda">0.00%</div>
              <div className="fila-azul celda">100.00%</div>

              <div className="fila-verde celda primera">(+) Ingresos &amp; Ventas</div>
              {valoresPorMes.map((v,i)=>(<div className="fila-verde celda" key={`v${i}`}>{typeof v === "number" ? money(v) : "—"}</div>))}
              <div className="celda celda-total">{money(total)}</div>
              <div className="celda celda-pct">100.00%</div>

              <div className="celda primera"><em>Jorge Mauricio</em></div>
              {meses.map((_,i)=><div className="celda" key={`j${i}`}>------</div>)}
              <div className="celda celda-total">------</div>
              <div className="celda celda-pct">—</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
