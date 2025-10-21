// Archivo: ventas/presentation/routes/ventas.routes.jsx
import VentasHome from "../../ui/pages/VentasHome.jsx";
import ProspectosPage from "../../ui/pages/ProspectosPage.jsx"; // ⬅️ AÑADIR
// import
import ResultadosPage from "../ui/pages/ResultadosPage";

// dentro de tus <Routes> …
<Route path="resultados" element={<ResultadosPage user={usuario} />} />

export const ventasRoutes = [
    
  { path: "/ventas", element: <VentasHome /> },
  { path: "/ventas/prospectos", element: <ProspectosPage /> }, // ⬅️ AÑADIR
];
