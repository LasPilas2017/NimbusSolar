import React from "react";

// Overlay de animación solar a pantalla completa.
// Se muestra mientras visible sea true; el padre controla cuándo ocultarlo.
export default function AnimacionGuardadoSolar({ visible }) {
  if (!visible) return null;

  return (
    <>
      <div className="overlay-solar" aria-live="polite" aria-label="Guardando datos">
        <div className="escena-full" role="status">
          <div className="cielo" />
          <div className="sol animando" />
          <div className="paneles">
            {[0, 1, 2].map((idx) => (
              <div className="panel-wrapper" key={idx}>
                <div className="panel">
                  <div className="brillo" />
                </div>
                <div className="estructura">
                  <div className="riel" />
                  <div className="pata" />
                  <div className="pata" />
                  <div className="pata" />
                </div>
              </div>
            ))}
          </div>
          <div className="sombra-panel" />
          <div className="texto-estado">Guardando datos...</div>
        </div>
      </div>

      <style>{`
        .overlay-solar {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), rgba(0,0,0,0.75));
          backdrop-filter: blur(10px);
        }
        .escena-full {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: linear-gradient(180deg, #0b1f3b 0%, #123f7a 60%, #0f1a2e 100%);
        }
        .cielo {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at top, rgba(255,255,255,0.08), transparent 50%);
          pointer-events: none;
        }
        .sol {
          position: absolute;
          top: 50%;
          left: -80px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle, #fff8c1 0%, #ffd54f 50%, #ff9d00 85%);
          box-shadow: 0 0 35px rgba(255, 217, 95, 0.9), 0 0 80px rgba(255, 193, 7, 0.9);
        }
        .sol.animando {
          animation: recorridoSol 4s linear infinite;
        }
        @keyframes recorridoSol {
          0% { transform: translate(-60px, 80px); }
          50% { transform: translate(400px, -120px); }
          100% { transform: translate(900px, 80px); }
        }
        .paneles {
          position: absolute;
          bottom: 18%;
          left: 12%;
          display: flex;
          gap: 12px;
          transform: skewX(-10deg);
          transform-origin: bottom;
          z-index: 2;
        }
        .panel-wrapper {
          position: relative;
          width: 140px;
          height: 105px;
        }
        .panel {
          position: relative;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #061528, #0c3b6c);
          border-radius: 10px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.8);
          overflow: hidden;
        }
        .panel::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(to right, rgba(255, 255, 255, 0.16) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.16) 1px, transparent 1px);
          background-size: 18px 18px, 18px 18px;
          opacity: 0.8;
        }
        .brillo {
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(255, 255, 255, 0) 15%, rgba(255, 255, 255, 0.45) 50%, rgba(255, 255, 255, 0) 85%);
          mix-blend-mode: screen;
          transform: translateX(-130%);
          animation: barridoLuz 3s linear infinite;
        }
        @keyframes barridoLuz {
          0% { transform: translateX(-130%); }
          60% { transform: translateX(15%); }
          100% { transform: translateX(130%); }
        }
        .estructura {
          position: absolute;
          bottom: -18px;
          left: 6px;
          right: 6px;
          height: 22px;
        }
        .riel {
          position: absolute;
          bottom: 10px;
          left: 0;
          right: 0;
          height: 5px;
          border-radius: 999px;
          background: linear-gradient(to right, #dde3ea, #a4a9b1);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.5);
        }
        .pata {
          position: absolute;
          bottom: 0;
          width: 11px;
          height: 11px;
          border-radius: 3px;
          background: linear-gradient(to top, #4c4f55, #81858c);
          box-shadow: 0 3px 4px rgba(0, 0, 0, 0.6);
        }
        .pata:nth-child(2) { left: 4px; }
        .pata:nth-child(3) { left: 50%; transform: translateX(-50%); }
        .pata:nth-child(4) { right: 4px; }
        .sombra-panel {
          position: absolute;
          bottom: 16%;
          left: 12%;
          width: 420px;
          height: 40px;
          background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.6), transparent 70%);
          opacity: 0.6;
          filter: blur(4px);
          transform: skewX(-10deg);
          z-index: 1;
        }
        .texto-estado {
          position: absolute;
          bottom: 8%;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 20px;
          color: #ffffff;
          font-weight: 600;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
          z-index: 3;
        }
      `}</style>
    </>
  );
}
