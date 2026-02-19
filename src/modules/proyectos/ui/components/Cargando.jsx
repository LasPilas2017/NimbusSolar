// src/componentes/Proyectos/Cargando.jsx

export default function Cargando() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex flex-col items-center justify-center text-gray-800 text-lg font-semibold">
      <div className="w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mb-3"></div>
      Cargando proyecto...
    </div>
  );
}
