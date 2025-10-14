import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function FloatingModuleMenu({ items = [], activeKey, onSelect }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const clickOutside = (e) => {
      if (open && ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => open && e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", clickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", clickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const list = {
    hidden: { opacity: 0, y: 10, pointerEvents: "none" },
    visible: { opacity: 1, y: 0, pointerEvents: "auto", transition: { staggerChildren: 0.04 } },
  };
  const item = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <div ref={ref} className="fixed z-50 bottom-5 right-5 sm:bottom-6 sm:right-6 select-none">
      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={list}
            className="mb-3 flex flex-col gap-2 items-end"
          >
            {items.map(({ key, label, icon: Icon }) => {
              const active = key === activeKey;
              return (
                <motion.button
                  key={key}
                  variants={item}
                  onClick={() => {
                    onSelect?.(key);
                    setOpen(false);
                  }}
                  className={[
                    "shadow-lg rounded-2xl px-3 py-2 text-sm flex items-center gap-2",
                    "backdrop-blur-md",
                    active ? "bg-emerald-500 text-white" : "bg-white/95 text-gray-800 hover:bg-white",
                  ].join(" ")}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Abrir menú de módulos"
        className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center
                   bg-emerald-500 text-white hover:bg-emerald-600 transition focus:outline-none"
      >
        {open ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
      </button>
    </div>
  );
}
