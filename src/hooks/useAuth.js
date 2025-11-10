// src/hooks/useAuth.js
export function useAuth() {
  // Cambia el role para probar: "VENDEDOR", "SUPERVISOR", "ADMIN"
  return {
    user: {
      id: "u123",
      name: "Carlos López",
      role: "VENDEDOR", // 🔹 prueba cambiando el rol aquí
    },
  };
}
