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
    const walk = (x - startX) * 1.5;
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
          className={`h-10 px-4 text-sm sm:text-base shadow transition rounded-none border flex items-center whitespace-nowrap
            ${
              quincenaActiva === q
                ? "bg-blue-900 text-white border-blue-900"
                : "bg-gray-200 text-gray-800 border-gray-400 hover:bg-gray-300"
            }`}
        >
          {q}
        </button>
      ))}

      <button
        onClick={agregarQuincena}
        className="h-10 px-4 flex items-center justify-center bg-green-600 text-white border border-green-700 hover:bg-green-700 transition rounded-none shadow"
        title="Agregar nueva quincena"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
