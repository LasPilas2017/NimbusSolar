import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu as MenuIcon, X } from "lucide-react";

export default function FloatingModuleMenu({
  items = [],
  activeKey,
  onSelect,
  menuOpen,
  setMenuOpen,
  className = "",
}) {
  const [openU, setOpenU] = React.useState(false);
  const controlled = typeof menuOpen === "boolean" && typeof setMenuOpen === "function";
  const open = controlled ? menuOpen : openU;
  const setOpen = controlled ? setMenuOpen : setOpenU;

  const ref = React.useRef(null);

  // Cerrar al hacer click fuera
  React.useEffect(() => {
    const handle = (e) => {
      if (open && ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, setOpen]);

  // Animaciones suaves
  const list = {
    hidden: { transition: { staggerChildren: 0, when: "afterChildren" } },
    visible:{ transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
  };
  const item = {
    hidden:  { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div ref={ref} className={`relative inline-block select-none ${className}`}>
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.38, ease: "easeOut" }}
            className="absolute bottom-[calc(100%+12px)] right-0
                       w-[240px] max-h-[60vh] overflow-auto
                       bg-white/95 backdrop-blur-md border border-gray-200
                       shadow-2xl rounded-2xl p-2 z-10"
            style={{ transformOrigin: "bottom right" }}
          >
            <motion.div variants={list} initial="hidden" animate="visible">
              {items.map(({ key, label, icon: Icon }) => {
                const active = key === activeKey;
                return (
                  <motion.button
                    key={key}
                    variants={item}
                    onClick={() => { onSelect?.(key); setOpen(false); }}
                    className={[
                      "w-full px-3 py-2 rounded-lg flex items-center gap-2 text-[15px] leading-5 transition-all duration-200",
                      active
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-gray-800 hover:bg-gray-200 hover:text-gray-900 hover:shadow-sm"
                    ].join(" ")}
                  >
                    {Icon ? (
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                          active ? "text-white" : "text-gray-600 group-hover:text-gray-900"
                        }`}
                      />
                    ) : null}
                    <span className="font-medium truncate">{label ?? key}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón cuadrado */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-label="Abrir menú de módulos"
        className="w-12 h-12 rounded-lg
                   bg-white/80 backdrop-blur-sm border border-gray-300
                   shadow-md flex items-center justify-center
                   hover:bg-gray-200 hover:shadow-lg hover:scale-[1.05]
                   transition-all duration-300"
      >
        {open ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <MenuIcon className="w-6 h-6 text-gray-700" />
        )}
      </button>
    </div>
  );
}
