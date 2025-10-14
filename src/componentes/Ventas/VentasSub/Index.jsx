import React from "react";

export default function Index({ user, rolUsuario }) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-3">Ventas Sub</h2>
      <p className="text-gray-600">
        Rol: <span className="font-medium">{rolUsuario}</span> · Usuario:{" "}
        <span className="font-medium">{user?.email || "Invitado"}</span>
      </p>
      <div className="mt-4 text-gray-500">
        Este módulo mostrará las <strong>subventas o ventas secundarias</strong> por proyecto o área.
      </div>
    </div>
  );
}
