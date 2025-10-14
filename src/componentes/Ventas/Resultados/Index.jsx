// src/componentes/Ventas/Resultados/Index.jsx
import React from "react";
import Diseno from "./Diseno";

// Este archivo actúa como "puente" entre el sistema principal y tu diseño real.
// Aquí NO se define el contenido visual, solo se llama a Diseno.jsx.
export default function Index({ user, rolUsuario }) {
  return <Diseno user={user} rolUsuario={rolUsuario} />;
}
