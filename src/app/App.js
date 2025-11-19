// src/app/App.jsx
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Este es el **componente raíz principal del sistema Nimbus Solar**.
// Controla toda la aplicación después del login, incluyendo:
//   - Manejo de sesión de usuario (login, logout, restauración, permisos).
//   - Navegación entre pestañas (tabs) del sistema de Administración.
//   - Control de layout (sidebar, contenido principal, vistas móviles).
//   - Cierre de sesión y efectos visuales.
//
// Si no hay sesión activa, muestra la pantalla <Login /> o <PrimerIngreso />.
// Si hay usuario autenticado:
//   - Si su **rol/sistema** corresponde al VENDEDOR → muestra VendedorLayout (azul).
//   - En otro caso → muestra el sistema de Administración (AppLayout + AppRouter).
// -----------------------------------------------------------------------------

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import Login from "../presentation/pages/Login/Login";
import AppLayout from "./AppLayout";
import AppRouter from "./AppRouter";

import { useIsMobile } from "../hooks/useIsMobile";
import { ALL_TABS } from "../config/tabs";
import { ALLOWED_BY_ROLE } from "../config/roles";

import { SqlAuthRepository } from "../modules/auth/infra/SqlAuthRepository";
import { GetSessionUseCase } from "../modules/auth/application/GetSessionUseCase";
import { LogoutUseCase } from "../modules/auth/application/LogoutUseCase";
import { guardarLog } from "../utils";

// Pantalla de primer ingreso
import PrimerIngreso from "../modules/usuarios/ui/pages/PrimerIngreso.jsx";

// SISTEMA DEL VENDEDOR (layout azul, independiente del admin)
import VendedorLayout from "../modules/vendedor/ui/layout/VendedorLayout.jsx";

// main.jsx o index.jsx
import generarCotizacionPDF from "../utils/pdf/generarCotizacionPDF";

// ⚠️ SOLO PARA PRUEBAS DE PDF
window.testPDF = () => {
  const cotizacionDummy = {
    codigo: "CTZ-TEST-001",
    fecha: new Date().toISOString(),

    // ===== DATOS CLIENTE =====
    cliente_nombre: "Cliente de Prueba",
    cliente_correo: "cliente@prueba.com",
    cliente_telefono: "5555-5555",
    cliente_direccion: "Zona 10, Ciudad de Guatemala",
    cliente_departamento: "Guatemala",
    cliente_municipio: "Guatemala",

    // ===== CONSUMO =====
    consumo_kwh_dia: 18.5,
    consumo_kwh_mes: 555,

    // ===== SISTEMA =====
    nombre_sistema: "Sistema Solar 5 kW",
    tipo_sistema: "Residencial Interconectado",
    descripcion_sistema:
      "Sistema compuesto por paneles LONGI 550W e inversor Growatt 5 kW, diseñado para cubrir el 80-90% del consumo mensual del cliente.",

    // ===== ÍTEMS =====
    items: [
      {
        tipo: "panel",
        articulo: "Panel LONGI 550W",
        detalle: "Módulo monocristalino de alto rendimiento",
        cantidad: 10,
        precio: 1800,
      },
      {
        tipo: "inversor",
        articulo: "Inversor Growatt 5 kW",
        detalle: "Inversor conectado a red, monofásico",
        cantidad: 1,
        precio: 8500,
      },
      {
        tipo: "estructura",
        articulo: "Estructura coplanar",
        detalle: "Estructura para lámina troquelada",
        cantidad: 10,
        precio: 250,
      },
    ],

    // ===== RESUMEN (puedes jugar con estos valores) =====
    subtotal_items: 10 * 1800 + 1 * 8500 + 10 * 250, // solo para que se vea real
    porc_ganancia: 35,
    ganancia_q: 5000,
    porc_iva: 12,
    iva_q: 2200,
    porc_tarjeta: 19.29,
    tarjeta_q: 1500,
    monto: 32000, // total final aprox
  };

  generarCotizacionPDF(cotizacionDummy);
};


export default function App() {
  // ===== Global UI state
  const [usuario, setUsuario] = useState(null);
  const [tab, setTab] = useState("");
  const [vistaServicio, setVistaServicio] = useState("principal");
  const [mostrarBarra, setMostrarBarra] = useState(true);
  const [cerrando, setCerrando] = useState(false);

  // (opcional) modal de transacciones
  const [mostrarTransacciones, setMostrarTransacciones] = useState(false);
  const [tipoTransaccion, setTipoTransaccion] = useState("");

  // qué pantalla de autenticación mostramos: 'login' | 'primer-ingreso'
  const [pantallaAuth, setPantallaAuth] = useState("login");

  // ===== Environment & use cases
  const isMobile = useIsMobile();
  const authRepo = useMemo(() => new SqlAuthRepository(), []);
  const getSessionUC = useMemo(() => new GetSessionUseCase(authRepo), [authRepo]);
  const logoutUC = useMemo(() => new LogoutUseCase(authRepo), [authRepo]);

  // ===== Permissions by user (solo para sistema ADMIN)
  const allowedIds = useMemo(() => {
    if (!usuario) return [];

    const role = String(usuario.rol || "").toLowerCase();

    const base = ALLOWED_BY_ROLE[role] || [];
    const extra = Array.isArray(usuario.allowedTabs) ? usuario.allowedTabs : [];

    // 🔹 Unimos permisos por rol + los que traiga el usuario, sin duplicados
    const merged = Array.from(new Set([...base, ...extra]));
    return merged;
  }, [usuario]);

  const tabs = useMemo(
    () => ALL_TABS.filter((t) => allowedIds.includes(t.id)),
    [allowedIds]
  );

  // ===== Auto-hide sidebar on mobile after selecting a tab (solo admin)
  useEffect(() => {
    if (isMobile && tab) setMostrarBarra(false);
  }, [isMobile, tab]);

  // ===== Session restore on load (solo afecta sistema ADMIN)
  useEffect(() => {
    (async () => {
      try {
        const sessionUser = await getSessionUC.execute();
        if (!sessionUser) return;

        const role = String(sessionUser.rol || "").toLowerCase();

        const defaultAllowed = ALLOWED_BY_ROLE[role] || [];
        const fromDb = Array.isArray(sessionUser.allowedTabs)
          ? sessionUser.allowedTabs
          : [];

        const allowed = Array.from(new Set([...defaultAllowed, ...fromDb]));

        // ⭐ Lógica de pestaña inicial SOLO para el sistema ADMIN
        let start;
        if (sessionUser.homeTab && allowed.includes(sessionUser.homeTab)) {
          start = sessionUser.homeTab;
        } else if (role === "admin" && allowed.includes("VistaMovimientos")) {
          start = "VistaMovimientos";
        } else if (allowed.includes("ventas")) {
          start = "ventas";
        } else {
          start = allowed[0] || "";
        }

        setUsuario({
          ...sessionUser,
          rol: role,
          allowedTabs: allowed,
          homeTab: start,
        });
        setTab(start);
        if (isMobile) setMostrarBarra(false);
      } catch (err) {
        console.error("Error al recuperar sesión:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Guards (solo admin)
  const canAccess = (tabId) => allowedIds.includes(tabId);

  // ===== Actions
  const onLogin = async (user) => {
    console.log("Usuario autenticado:", user);
    await guardarLog(user, "Inicio de sesión", "El usuario ingresó al sistema");

    const role = String(user.rol || "").toLowerCase();

    const defaultAllowed = ALLOWED_BY_ROLE[role] || [];
    const fromDb = Array.isArray(user.allowedTabs) ? user.allowedTabs : [];

    const allowed = Array.from(new Set([...defaultAllowed, ...fromDb]));

    // ⭐ homeTab SOLO aplica al sistema admin (sistema vendedor no usa tabs)
    let home;
    if (user.homeTab && allowed.includes(user.homeTab)) {
      home = user.homeTab;
    } else if (role === "admin" && allowed.includes("VistaMovimientos")) {
      home = "VistaMovimientos";
    } else if (allowed.includes("ventas")) {
      home = "ventas";
    } else {
      home = allowed[0] || "";
    }

    const normalized = {
      ...user,
      rol: role,
      allowedTabs: allowed,
      homeTab: home,
    };

    setUsuario(normalized);
    setTab(home);
    if (isMobile) setMostrarBarra(false);
  };

  const cambiarTab = async (nuevoTab) => {
    if (!canAccess(nuevoTab)) return;
    setTab(nuevoTab);
    setVistaServicio("principal");
    if (isMobile) setMostrarBarra(false);
    await guardarLog(
      usuario,
      "Cambio de pestaña",
      `Se cambió a la pestaña: ${nuevoTab}`
    );
  };

  const handleLogout = async () => {
    setCerrando(true);
    await guardarLog(
      usuario,
      "Cierre de sesión",
      "El usuario salió del sistema"
    );
    try {
      // Si usas Supabase Auth para usuarios por email:
      try {
        const { default: supabase } = await import("../supabase");
        await supabase.auth.signOut().catch(() => {});
      } catch {}
      await logoutUC.execute();
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      setTimeout(() => {
        setUsuario(null);
        setTab("");
        setVistaServicio("principal");
        setMostrarBarra(true);
        setCerrando(false);
        setPantallaAuth("login");
      }, 1000);
    }
  };

  // ===== Pantallas de autenticación (si NO hay usuario)
  if (!usuario) {
    if (pantallaAuth === "primer-ingreso") {
      return (
        <PrimerIngreso onVolverAlLogin={() => setPantallaAuth("login")} />
      );
    }

    return (
      <Login
        onLogin={onLogin}
        onIrAPrimerIngreso={() => setPantallaAuth("primer-ingreso")}
      />
    );
  }

  // =========================================================
  // DECISIÓN: ¿SISTEMA DEL VENDEDOR o SISTEMA ADMINISTRATIVO?
  // =========================================================

  // Normalizamos rol y sistema asignado del usuario autenticado
  const role = String(usuario.rol || "").toLowerCase();
  const sistema = String(
    usuario.sistema || usuario.sistema_asignado || ""
  ).toLowerCase();

  // Entra al sistema AZUL si:
  // - es vendedor (ventas)
  // - es supervisor de ventas
  // - o su sistema asignado es "vendedor"
  const usaSistemaVendedor =
    role === "ventas" || role === "supervisor_ventas" || sistema === "vendedor";

  // 👉 Sistema del VENDEDOR (AZUL)
  if (usaSistemaVendedor) {
    return (
      <div className="relative min-h-screen h-screen bg-[#020617] overflow-hidden flex flex-col">
        <VendedorLayout user={usuario} rolUsuario={role} onLogout={handleLogout} />
      </div>
    );
  }

  // 👉 Sistema de ADMINISTRACIÓN (BLANCO) con pestañas
  return (
    <div className="relative min-h-screen h-screen bg-gray-50 overflow-hidden flex flex-col">
      {/* Overlay de cierre */}
      {cerrando && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black text-white flex items-center justify-center text-3xl font-bold"
        >
          ¡Feliz Día!
        </motion.div>
      )}

      <AppLayout
        mostrarBarra={mostrarBarra}
        tabs={tabs}
        activeTab={tab}
        onSelectTab={cambiarTab}
        onToggleSidebar={setMostrarBarra}
        onLogout={handleLogout}
        mostrarTransacciones={mostrarTransacciones}
        tipoTransaccion={tipoTransaccion}
        setTipoTransaccion={setTipoTransaccion}
      >
        <AppRouter
          tab={tab}
          canAccess={canAccess}
          usuario={usuario}
          vistaServicio={vistaServicio}
          setVistaServicio={setVistaServicio}
          onGoTab={cambiarTab}
        />
      </AppLayout>
    </div>
  );
}
