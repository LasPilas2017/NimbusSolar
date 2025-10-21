// src/app/App.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import Login from '../components/Login/Login';
import AppLayout from './AppLayout';
import AppRouter from './AppRouter';

import { useIsMobile } from '../hooks/useIsMobile';
import { ALL_TABS } from '../config/tabs';
import { ALLOWED_BY_ROLE } from '../config/roles';

import { SqlAuthRepository } from '../modules/auth/infra/SqlAuthRepository';
import { GetSessionUseCase } from '../modules/auth/application/GetSessionUseCase';
import { LogoutUseCase } from '../modules/auth/application/LogoutUseCase';
import { guardarLog } from '../utils';

export default function App() {
  // ===== Global UI state
  const [usuario, setUsuario] = useState(null);
  const [tab, setTab] = useState('');
  const [vistaServicio, setVistaServicio] = useState('principal');
  const [mostrarBarra, setMostrarBarra] = useState(true);
  const [cerrando, setCerrando] = useState(false);

  // (opcional) modal de transacciones
  const [mostrarTransacciones, setMostrarTransacciones] = useState(false);
  const [tipoTransaccion, setTipoTransaccion] = useState('');

  // ===== Environment & use cases
  const isMobile = useIsMobile();
  const authRepo = useMemo(() => new SqlAuthRepository(), []);
  const getSessionUC = useMemo(() => new GetSessionUseCase(authRepo), [authRepo]);
  const logoutUC = useMemo(() => new LogoutUseCase(authRepo), [authRepo]);

  // ===== Permissions by user
const allowedIds = useMemo(() => {
  if (!usuario) return [];
  
  const role = String(usuario.rol || '').toLowerCase();

  // Si el usuario es admin, ignorar allowedTabs y darle acceso completo
  if (role === 'admin') return ALLOWED_BY_ROLE.admin;

  // Si es otro rol, usar allowedTabs solo si tiene contenido
  if (Array.isArray(usuario.allowedTabs) && usuario.allowedTabs.length)
    return usuario.allowedTabs;

  // Si no tiene allowedTabs, usar la lista por defecto del rol
  return ALLOWED_BY_ROLE[role] || [];
}, [usuario]);


  const tabs = useMemo(
    () => ALL_TABS.filter(t => allowedIds.includes(t.id)),
    [allowedIds]
  );

  // ===== Auto-hide sidebar on mobile after selecting a tab
  useEffect(() => {
    if (isMobile && tab) setMostrarBarra(false);
  }, [isMobile, tab]);

  // ===== Session restore on load
  useEffect(() => {
    (async () => {
      try {
        const sessionUser = await getSessionUC.execute();
        if (!sessionUser) return;

        const role = String(sessionUser.rol || '').toLowerCase();
        const allowed = Array.isArray(sessionUser.allowedTabs) && sessionUser.allowedTabs.length
          ? sessionUser.allowedTabs
          : (role === 'admin' ? ALLOWED_BY_ROLE.admin : ALLOWED_BY_ROLE.ventas);

        const start = (sessionUser.homeTab && allowed.includes(sessionUser.homeTab))
          ? sessionUser.homeTab
          : (role === 'admin' ? 'VistaMovimientos' : 'ventas');

        setUsuario({ ...sessionUser, rol: role, allowedTabs: allowed, homeTab: start });
        setTab(start);
        if (isMobile) setMostrarBarra(false);
      } catch (err) {
        console.error('Error al recuperar sesión:', err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Guards
  const canAccess = (tabId) => allowedIds.includes(tabId);

  // ===== Actions
  const onLogin = async (user) => {
    console.log("Usuario autenticado:", user);
    await guardarLog(user, 'Inicio de sesión', 'El usuario ingresó al sistema');

    const role = String(user.rol || '').toLowerCase();
    const allowed = Array.isArray(user.allowedTabs) && user.allowedTabs.length
      ? user.allowedTabs
      : (role === 'admin' ? ALLOWED_BY_ROLE.admin : ALLOWED_BY_ROLE.ventas);

    const home = (user.homeTab && allowed.includes(user.homeTab))
      ? user.homeTab
      : (role === 'admin' ? 'VistaMovimientos' : 'ventas');

    const normalized = {
      ...user,
      rol: role === 'admin' ? 'admin' : 'ventas',
      allowedTabs: allowed,
      homeTab: home
    };

    setUsuario(normalized);
    setTab(home);
    if (isMobile) setMostrarBarra(false);
  };

  const cambiarTab = async (nuevoTab) => {
    if (!canAccess(nuevoTab)) return;
    setTab(nuevoTab);
    setVistaServicio('principal');
    if (isMobile) setMostrarBarra(false);
    await guardarLog(usuario, 'Cambio de pestaña', `Se cambió a la pestaña: ${nuevoTab}`);
  };

  const handleLogout = async () => {
    setCerrando(true);
    await guardarLog(usuario, 'Cierre de sesión', 'El usuario salió del sistema');
    try {
      // Si usas Supabase Auth para usuarios por email:
      try {
        const { default: supabase } = await import('../supabase');
        await supabase.auth.signOut().catch(() => {});
      } catch {}
      await logoutUC.execute();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setTimeout(() => {
        setUsuario(null);
        setTab('');
        setVistaServicio('principal');
        setMostrarBarra(true);
        setCerrando(false);
      }, 1000);
    }
  };

  // ===== Login screen (si no hay usuario)
  
  if (!usuario) {
    return <Login onLogin={onLogin} />;
    
  }

  // ===== App layout + router
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
