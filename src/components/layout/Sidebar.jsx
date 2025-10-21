import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

const COLORS = ["text-orange-500", "text-cyan-500", "text-emerald-500", "text-pink-500"];

export function Sidebar({ open, tabs, activeId, onSelect, onClose, onOpen, onLogout }) {
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="blur-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            onClick={onClose}
            className="fixed inset-0 z-20 bg-black/20 backdrop-blur-md"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open ? (
          <motion.aside
            initial={{ x: -260, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -260, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="h-screen w-60 bg-white fixed top-0 left-0 z-40 shadow-2xl border-r border-gray-200 flex flex-col items-center justify-between"
          >
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}
              className="absolute top-5 -right-11 z-50 w-11 h-11 bg-white/80 backdrop-blur-sm border border-gray-300 shadow-md rounded-r-xl hover:bg-white hover:shadow-lg transition-all"
            >
              <FiChevronsLeft className="text-gray-700 text-xl" />
            </motion.button>

            <div className="flex flex-col items-center justify-center gap-3 mt-8 w-full">
              {tabs.map((t, index) => (
                <motion.button
                  key={t.id} whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
                  onClick={() => onSelect(t.id)}
                  className={`w-48 flex items-center gap-3 justify-start py-2 px-4 rounded-xl font-semibold text-sm hover:bg-blue-50 transition ${
                    activeId === t.id ? "bg-blue-100 text-blue-900" : "text-gray-700"
                  }`}
                >
                  <div className={`text-xl ${COLORS[index % COLORS.length]}`}>{t.icon}</div>
                  <span>{t.label}</span>
                </motion.button>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}
              onClick={onLogout}
              className="mx-auto mb-6 mt-auto flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold w-40"
            >
              <span>Salir</span>
            </motion.button>
          </motion.aside>
        ) : (
          <motion.button
            initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={onOpen}
            className="fixed top-5 left-0 z-50 w-11 h-11 bg-white/80 backdrop-blur-sm border-r border-gray-300 shadow-md rounded-r-xl hover:bg-white hover:shadow-lg transition-all"
          >
            <FiChevronsRight className="text-gray-700 text-xl" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
