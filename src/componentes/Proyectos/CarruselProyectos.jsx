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

  // 🔹 Proyectos de prueba actualizados
  const proyectosPrueba = [
   
    {
      id: "p2",
      nombre: "Granja San Miguel",
      monto_total: 15000,
      utilidad: -700,
      descripcion: "Sistema solar trifásico en granja",
    },
    {
      id: "p3",
      nombre: "Tienda Don Pedro",
      monto_total: 5400,
      utilidad: 450,
      descripcion: "Kit solar con respaldo de batería",
    },
    
    {
      id: "p5",
      nombre: "Bodega Central",
      monto_total: 21000,
      utilidad: 5600,
      descripcion: "Instalación industrial completa",
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
