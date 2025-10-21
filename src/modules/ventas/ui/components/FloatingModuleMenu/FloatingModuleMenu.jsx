// src/modules/ventas/ui/components/FloatingModuleMenu/FloatingModuleMenu.jsx
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FiMenu, FiX } from "react-icons/fi";

export default function FloatingModuleMenu({ items = [], onSelect }) {
  const [open, setOpen] = useState(false);

  const safeBottom = { bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" };

  const ui = (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] transition-opacity duration-300"
        />
      )}

      {/* Botón flotante (abajo-derecha) */}
      <button
        aria-label="Abrir menú"
        onClick={() => setOpen(v => !v)}
        style={safeBottom}
        className="fixed right-5 md:right-6 z-[100] w-14 h-14 rounded-full
                   bg-blue-600 text-white shadow-xl hover:scale-105 transition-transform
                   flex items-center justify-center"
      >
        {open ? <FiX size={22} /> : <FiMenu size={22} />}
      </button>

      {/* Lista compacta */}
      {open && (
        <div
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)" }}
          className="fixed right-5 md:right-6 z-[100] flex flex-col gap-2"
        >
          {items.map(it => (
            <button
              key={it.id}
              onClick={() => { onSelect?.(it.id); setOpen(false); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 shadow
                         hover:bg-gray-300 hover:text-black transition-colors duration-150
                         text-[15px] font-semibold"
              title={it.label}
            >
              {it.icon ? <span className="text-[18px]">{it.icon}</span> : null}
              <span>{it.label}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );

  return createPortal(ui, document.body);
}
