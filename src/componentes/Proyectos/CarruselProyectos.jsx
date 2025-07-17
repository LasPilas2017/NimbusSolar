import { useRef, useState } from "react";
import TarjetaProyecto from "./TarjetaProyecto";

export default function CarruselProyectos({ categoria, lista, abrirDetalle }) {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // 🔹 Funciones para el arrastre con mouse
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // velocidad de desplazamiento
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 🔹 Proyectos de prueba con distintos porcentajes
  const proyectosPrueba = [
    {
      id: "test1",
      nombre: "Proyecto A",
      monto_total: 1000,
      utilidad: 70,
      descripcion: "Solo limpieza de paneles",
    },
    {
      id: "test2",
      nombre: "Proyecto B",
      monto_total: 1000,
      utilidad: 220,
      descripcion: "Instalación básica",
    },
    {
      id: "test3",
      nombre: "Proyecto C",
      monto_total: 1000,
      utilidad: 560,
      descripcion: "Sistema completo de paneles",
    },
  ];

  const proyectosCombinados = [...proyectosPrueba, ...lista];

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-700 mb-2">{categoria}</h2>

      <div
        ref={scrollRef}
        className="overflow-x-auto flex gap-4 px-2 py-2 scroll-smooth scrollbar-hide cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {proyectosCombinados.map((proyecto) => (
          <TarjetaProyecto
            key={proyecto.id}
            proyecto={proyecto}
            abrirDetalle={abrirDetalle}
          />
        ))}
      </div>
    </div>
  );
}
