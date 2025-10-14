export default function Diseno() {
  // ==== DATOS (Enero..Diciembre) ====
  const valoresPorMes = [0,0,0,0,0,0,0,0,4000,8000,0,0];

  const meses = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];

  const max = Math.max(...valoresPorMes, 1);
  const total = valoresPorMes.reduce((a,b)=>a+b,0);

  // crecimiento total (simple: (total año / total año) = 0% si no hay base)
  // para mostrar 0.00% como en la imagen
  const crecimientoTotal = 0;

  // helper formato
  const money = n => `$${n.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  return (
    <div className="ventas-wrap">
      <style>{`
        .ventas-wrap{
          width:100%;
          background:#ffffff;
          padding:8px 12px 16px;
          box-sizing:border-box;
          border-radius:8px;
          border:1px solid #e6e6e6;
        }

        /* ====== BARRAS SUPERIORES ====== */
        .barras{
          position:relative;
          height:130px;            /* alto de la franja como en el excel */
          display:grid;
          grid-template-columns: repeat(12, 1fr);
          align-items:flex-end;
          gap:18px;
          margin:0 270px 4px 200px; /* para que calce visualmente con los márgenes laterales de la tabla */
        }
        .barra{
          width:16px;
          margin:0 auto;
          background: linear-gradient(to bottom, #76c36a, #6ab85f);
          border-radius:4px 4px 0 0;
          transition:height .3s ease;
        }
        .barra--cero{
          height:6px;
          background:#d5d5d5;
          border-radius:2px;
        }

        /* ====== LAYOUT TABLA + PANEL DERECHA ====== */
        .grid{
          display:grid;
          grid-template-columns: 200px repeat(12, 1fr) 140px 90px; /* primera columna fija + 12 meses + total + % */
          column-gap:0;
          border-top:1px solid #000; /* línea negra abajo como en la captura */
        }

        /* Encabezados de meses (fondo beige y borde sutil) */
        .mes-head{
          background:#f6efe4;           /* beige suave */
          color:#333;
          font-weight:600;
          text-align:center;
          padding:8px 0;
          border-left:1px solid #e8e3d7;
          border-right:1px solid #e8e3d7;
          border-top:1px solid #e8e3d7;
          font-size:13px;
        }

        /* Encabezado fijo de la primera columna */
        .col-fija-head{
          background:#ffffff;
          color:#222;
          font-weight:600;
          text-align:left;
          padding:8px 10px;
          border-top:1px solid transparent;
        }

        /* Fila azul (Crecimiento) */
        .fila-azul > div{
          background:#cfd9ea; /* azul grisáceo suave como en imagen */
          color:#1b2b45;
          font-weight:600;
          text-align:center;
          padding:6px 8px;
          border-left:1px solid #c2ccde;
          border-right:1px solid #c2ccde;
          font-size:13px;
        }
        .fila-azul .primera{
          text-align:left;
          padding-left:12px;
        }

        /* Fila verde (Ingresos & Ventas) */
        .fila-verde > div{
          background:#dff0d7;
          color:#266a2e;
          font-weight:600;
          text-align:center;
          padding:6px 8px;
          border-left:1px solid #d3e7ca;
          border-right:1px solid #d3e7ca;
          font-size:13px;
        }
        .fila-verde .primera{
          text-align:left;
          padding-left:12px;
          color:#2b7b33;
        }

        /* Celdas beige con signo $ */
        .celda{
          background:#fbf6ee;
          color:#3b3b3b;
          text-align:center;
          padding:6px 8px;
          border-left:1px solid #eee4d2;
          border-right:1px solid #eee4d2;
          font-size:13px;
        }
        .celda.primera{
          text-align:left;
          background:#fff;
          color:#4b4b4b;
          padding-left:16px;
          border-right:none;
        }
        .fila{
          display:contents; /* para usar grid con filas semánticas */
        }

        /* Columna TOTAL (cabezal oscuro) */
        .head-total{
          background:#2c2c2c;
          color:#fff;
          font-weight:700;
          text-align:center;
          padding:8px 0;
          border-left:2px solid #000;
          border-right:1px solid #454545;
        }
        .head-pct{
          background:#2c2c2c;
          color:#fff;
          font-weight:700;
          text-align:center;
          padding:8px 0;
          border-left:1px solid #454545;
        }
        .celda-total{
          background:#ffffff;
          text-align:right;
          padding:6px 10px;
          border-left:2px solid #000;
          font-weight:700;
        }
        .celda-pct{
          background:#ffffff;
          text-align:center;
          padding:6px 10px;
          font-weight:700;
        }

        /* Panel lateral derecho (morado/verde) */
        .panel-right{
          position:absolute;
          right:12px;
          top:10px;
          width:240px;
          display:flex;
          flex-direction:column;
          gap:8px;
        }
        .panel-box{
          background:#e9e7f6; /* barra morada clara */
          border:1px solid #d7d2ef;
          border-radius:4px;
          padding:4px 10px;
          font-size:12px;
          color:#5b49a6;
          font-weight:800;
          text-align:right;
        }
        .panel-box .val{
          background:#dcdbee;
          display:inline-block;
          padding:2px 8px;
          border-radius:3px;
          margin-left:8px;
          color:#3b3388;
          font-weight:700;
        }
        .panel-box.verde{
          background:#e6f4e7;
          border-color:#cfe8d1;
          color:#2f7b35;
        }
        .panel-box.verde .val{
          background:#d7edd9;
          color:#2a6e2f;
        }

        /* bloque "Seleccionar Año" */
        .anio{
          position:absolute;
          left:18px;
          top:66px;
          width:180px;
        }
        .anio .lbl{
          font-size:12px;
          color:#666;
          font-weight:700;
          margin-bottom:6px;
        }
        .anio .box{
          border:1px solid #e0d7c7;
          background:#fff6e6;
          color:#333;
          border-radius:3px;
          padding:6px 0;
          text-align:center;
          font-weight:700;
        }
        .anio .sub{
          color:#7c6fc0;
          margin-top:6px;
          font-weight:700;
          font-size:12px;
        }
      `}</style>

      {/* ======= PANEL DERECHO (crecimiento / ingreso total) ======= */}
      <div className="panel-right">
        <div className="panel-box">
          CRECIMIENTO TOTAL
          <span className="val">{crecimientoTotal.toFixed(2)}%</span>
        </div>
        <div className="panel-box verde">
          INGRESO TOTAL
          <span className="val">{money(total)}</span>
        </div>
      </div>

      {/* ======= BLOQUE SELECCIONAR AÑO (izquierda) ======= */}
      <div className="anio">
        <div className="lbl">Seleccionar Año</div>
        <div className="box">2025</div>
        <div className="sub">Crecimiento</div>
      </div>

      {/* ======= BARRAS SUPERIORES ======= */}
      <div className="barras">
        {valoresPorMes.map((v, i) => {
          const h = Math.max(6, Math.round((v / max) * 100)); // min 6px
          return (
            <div
              key={i}
              className={v > 0 ? "barra" : "barra barra--cero"}
              style={v > 0 ? { height: h + "%" } : {}}
              title={`${meses[i]}: ${v ? money(v) : "-"}`}
            />
          );
        })}
      </div>

      {/* ======= TABLA (encabezados y filas) ======= */}
      <div className="grid">
        {/* Primera columna (vacía para alinear con "Seleccionar Año") */}
        <div className="col-fija-head"></div>
        {meses.map((m, i) => (
          <div className="mes-head" key={i}>{m}</div>
        ))}
        <div className="head-total">Total</div>
        <div className="head-pct">%</div>

        {/* Fila azul: "Crecimiento" */}
        <div className="fila fila-azul">
          <div className="primera">Crecimiento</div>
          {meses.map((_, i) => (
            <div key={i} style={{color: i===10 ? "#b50000" : undefined}}>
              {/* Ejemplo visual: Octubre 100.00%, Noviembre -100.00% como en tu imagen */}
              {i===9 ? "100.00%" : i===10 ? "-100.00%" : "-"}
            </div>
          ))}
          <div>0.00%</div>
          <div>100.00%</div>
        </div>

        {/* Fila verde: "(+) Ingresos & Ventas" con montos por mes */}
        <div className="fila fila-verde">
          <div className="primera">(+) Ingresos & Ventas</div>
          {valoresPorMes.map((v, i) => (
            <div key={i} style={{textAlign:"right", paddingRight:"10px"}}>
              {v ? money(v) : "$ -"}
            </div>
          ))}
          <div className="celda-total">{money(total)}</div>
          <div className="celda-pct">100.00%</div>
        </div>

        {/* Ejemplo de una fila de detalle (agente) como en tu imagen */}
        <div className="fila">
          <div className="celda primera"><em>Jorge Mauricio</em></div>
          {meses.map((_, i) => (
            <div className="celda" key={i}>$</div>
          ))}
          <div className="celda celda-total" style={{fontWeight:600}}>12,000.00</div>
          <div className="celda celda-pct" style={{fontWeight:600}}>100.00%</div>
        </div>

        {/* Filas de relleno para simular la planilla (todas con $ -) */}
        {Array.from({length:8}).map((_, r) => (
          <div className="fila" key={`f${r}`}>
            <div className="celda primera">$</div>
            {meses.map((_, i) => (
              <div className="celda" key={i}>$</div>
            ))}
            <div className="celda celda-total">$</div>
            <div className="celda celda-pct">0.00%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
