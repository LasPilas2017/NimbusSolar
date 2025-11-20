import React, { useEffect, useMemo, useState } from "react";

/**
 * Overlay de animación solar para indicar guardado.
 * Props:
 * - visible: boolean para mostrar/ocultar.
 * - onFinish: callback al terminar la animación y ocultarse.
 */
export default function AnimacionGuardadoSolar({ visible, onFinish }) {
  const [active, setActive] = useState(false);
  const [texto, setTexto] = useState("Guardando datos...");
  const [animando, setAnimando] = useState(false);

  const shouldRender = useMemo(() => active || visible, [active, visible]);

  useEffect(() => {
    if (!visible) return;

    setActive(true);
    setTexto("Guardando datos...");
    setAnimando(false);

    const raf = requestAnimationFrame(() => setAnimando(true));

    const textoTimer = setTimeout(() => {
      setTexto("Cambios guardados");
    }, 3000);

    const hideTimer = setTimeout(() => {
      setActive(false);
      setAnimando(false);
      if (typeof onFinish === "function") {
        onFinish();
      }
    }, 4500);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(textoTimer);
      clearTimeout(hideTimer);
    };
  }, [visible, onFinish]);

  if (!shouldRender) return null;

  return (
    <>
      <div
        className={`overlay ${active ? "visible" : "oculto"}`}
        aria-live="polite"
        aria-label="Guardando datos"
      >
        <div className="escena" role="status">
          <div
            className={`sol ${animando ? "animando" : "sin-animacion"}`}
            id="sol-animado"
          />

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

          <div
            className={`texto-estado ${
              texto === "Cambios guardados" ? "texto-ok" : ""
            }`}
            id="texto-animacion"
          >
            {texto}
          </div>
        </div>
      </div>

      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          background: radial-gradient(
              circle at top,
              rgba(255, 255, 255, 0.08),
              rgba(0, 0, 0, 0.92)
            );
          backdrop-filter: blur(6px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.35s ease;
        }
        .overlay.visible {
          opacity: 1;
          pointer-events: auto;
        }
        .overlay.oculto {
          opacity: 0;
          pointer-events: none;
        }
        .escena {
          position: relative;
          width: 520px;
          height: 240px;
          border-radius: 24px;
          background: linear-gradient(
            to top,
            #1b3a52 0%,
            #87ceeb 65%,
            #ffffff 100%
          );
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.6);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .escena::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 34%;
          background: linear-gradient(to top, #264522, #3d6b34);
        }
        .sol {
          position: absolute;
          top: 90px;
          left: -70px;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            #fff8c1 0%,
            #ffd54f 50%,
            #ff9d00 85%
          );
          box-shadow: 0 0 25px rgba(255, 217, 95, 0.9),
            0 0 60px rgba(255, 193, 7, 0.9);
        }
        .sol.sin-animacion {
          animation: none;
        }
        .sol.animando {
          animation: recorridoSol 3s linear forwards;
        }
        @keyframes recorridoSol {
          0% {
            transform: translate(-60px, 40px);
          }
          50% {
            transform: translate(200px, -40px);
          }
          100% {
            transform: translate(460px, 40px);
          }
        }
        .paneles {
          position: absolute;
          bottom: 55px;
          left: 70px;
          display: flex;
          gap: 12px;
          transform: skewX(-10deg);
          transform-origin: bottom;
          z-index: 2;
        }
        .panel-wrapper {
          position: relative;
          width: 95px;
          height: 80px;
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
          background-image: linear-gradient(
              to right,
              rgba(255, 255, 255, 0.16) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.16) 1px,
              transparent 1px
            );
          background-size: 18px 18px, 18px 18px;
          opacity: 0.8;
        }
        .brillo {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0) 15%,
            rgba(255, 255, 255, 0.45) 50%,
            rgba(255, 255, 255, 0) 85%
          );
          mix-blend-mode: screen;
          transform: translateX(-130%);
          animation: barridoLuz 3s linear infinite;
        }
        @keyframes barridoLuz {
          0% {
            transform: translateX(-130%);
          }
          60% {
            transform: translateX(15%);
          }
          100% {
            transform: translateX(130%);
          }
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
        .pata:nth-child(2) {
          left: 4px;
        }
        .pata:nth-child(3) {
          left: 50%;
          transform: translateX(-50%);
        }
        .pata:nth-child(4) {
          right: 4px;
        }
        .sombra-panel {
          position: absolute;
          bottom: 48px;
          left: 72px;
          width: 260px;
          height: 26px;
          background: radial-gradient(
            ellipse at center,
            rgba(0, 0, 0, 0.6),
            transparent 70%
          );
          opacity: 0.6;
          filter: blur(3px);
          transform: skewX(-10deg);
          z-index: 1;
        }
        .texto-estado {
          position: absolute;
          bottom: 18px;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 18px;
          color: #ffffff;
          font-weight: 600;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
          z-index: 3;
        }
        .texto-ok {
          color: #aefad4;
        }
        .texto-ok::before {
          content: "✓ ";
          color: #00e676;
          text-shadow: 0 0 12px rgba(0, 255, 138, 0.9);
        }
      `}</style>
    </>
  );
}
