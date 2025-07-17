import React, { useRef, useEffect, useState } from "react";
import { Plus } from "lucide-react";

export default function SelectorQuincenas({
  quincenas,
  quincenaActiva,
  setQuincenaActiva,
  agregarQuincena,
}) {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // 🔁 Scroll con la rueda del mouse (scroll horizontal)
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const onWheel = (e) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, []);

  // 🖱️ Scroll arrastrando con el mouse (click + mover)
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // sensibilidad
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2 px-1 cursor-grab active:cursor-grabbing select-none"
    >
      {quincenas.map((q, idx) => (
        <button
          key={idx}
          onClick={() => setQuincenaActiva(q)}
          className={`h-10 px-4 rounded-full border text-sm sm:text-base shadow transition flex items-center whitespace-nowrap ${
            quincenaActiva === q
              ? "bg-blue-100 text-blue-800 border-blue-400 font-semibold"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
        >
          {q}
        </button>
      ))}

      <button
        onClick={agregarQuincena}
        className="h-10 w-10 flex items-center justify-center bg-green-200 text-green-800 rounded-full shadow hover:scale-110 transition"
        title="Agregar nueva quincena"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
