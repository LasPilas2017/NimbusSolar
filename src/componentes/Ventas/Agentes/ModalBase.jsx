import React from "react";

import THEME from "./theme";

const ModalBase = ({ open, title, children, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay con blur suave */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden ring-1"
        style={{ background: THEME.surface }}
      >
        <div
          className="px-6 py-4"
          style={{
            background: `linear-gradient(180deg, ${THEME.headerDark}, ${THEME.header})`,
            color: THEME.headerText,
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-md px-2.5 py-1.5 text-sm shadow hover:opacity-90 transition"
              style={{ background: THEME.headerLight, color: THEME.headerText }}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default ModalBase;
