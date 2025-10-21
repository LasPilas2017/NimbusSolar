import MenuPrincipal from "../componentes/Ventas/ui/layouts/Menuprincipal.jsx";
import { Link } from "react-router-dom";

export default function VentasHome() {
  return (
    <MenuPrincipal>
      <h1 className="text-2xl mb-4">Ventas</h1>
      <ul className="list-disc pl-6 space-y-2">
        <li><Link to="/ventas/prospectos" className="underline">Prospectos</Link></li>
        <li><Link to="/ventas/crm" className="underline">CRM</Link></li>
        <li><Link to="/ventas/agentes" className="underline">Agentes</Link></li>
        <li><Link to="/ventas/listados" className="underline">Listados</Link></li>
        <li><Link to="/ventas/resultados" className="underline">Resultados</Link></li>
        <li><Link to="/ventas/sub" className="underline">Ventas Sub</Link></li>
        <li><Link to="/ventas/global" className="underline">Global</Link></li>
      </ul>
    </MenuPrincipal>
  );
}
