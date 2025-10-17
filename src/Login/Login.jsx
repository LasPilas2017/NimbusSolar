// src/components/Login.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import supabase from '../supabase';
import { guardarLog } from '../utils';
import './Login.css';

// Imágenes (si querés mantenerlas; el fondo principal ahora lo dibuja el CSS)
import fondo from '../assets/images/fondo.png';
import logo from '../assets/images/logo.png';

export default function Login({ onLogin }) {
  // Estado UI
  const [pantallaNegra, setPantallaNegra] = useState(true);
  const [expandirTarjeta, setExpandirTarjeta] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loginExitoso, setLoginExitoso] = useState(false);
  const [vibrar, setVibrar] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Form
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [recordar, setRecordar] = useState(true);
  const [error, setError] = useState('');

  // Intro de escena (pantalla negra -> sol y campo -> tarjeta)
  useEffect(() => {
    const sesionGuardada = localStorage.getItem('sesionUsuario');
    if (sesionGuardada) {
      const datos = JSON.parse(sesionGuardada);
      onLogin(datos);
      return;
    }
    const t1 = setTimeout(() => setPantallaNegra(false), 900);
    const t2 = setTimeout(() => setExpandirTarjeta(true), 1800);
    const t3 = setTimeout(() => setMostrarFormulario(true), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onLogin]);

  // Enter para enviar
  const onKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !loginExitoso && !cargando) handleLogin();
  }, [loginExitoso, cargando, usuario, contrasena]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  const sacudir = () => {
    setVibrar(true);
    setTimeout(() => setVibrar(false), 500);
  };

  const handleLogin = async () => {
    setError('');
    if (!usuario || !contrasena) {
      setError('Ingresá usuario y contraseña');
      sacudir();
      return;
    }
    setCargando(true);
    try {
      // === Opción actual: tabla "usuarios" (como lo tenés)
      const { data, error: errTabla } = await supabase
        .from('usuarios')
        .select('id, usuario, contrasena, rol')
        .eq('usuario', usuario)
        .eq('contrasena', contrasena)
        .single();

      if (errTabla || !data) {
        setError('Usuario o contraseña incorrectos');
        sacudir();
        setCargando(false);
        return;
      }

      setLoginExitoso(true);

      if (recordar) {
        localStorage.setItem('sesionUsuario', JSON.stringify({
          id: data.id, usuario: data.usuario, rol: data.rol
        }));
      }

      await guardarLog(data, 'Inicio de sesión', 'El usuario ingresó al sistema');

      // Dejo respirar la animación (sol → flare + contracción)
      setTimeout(() => onLogin(data), 1400);

      // === Opción recomendada a futuro (Supabase Auth):
      // const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      //   email: usuario, password: contrasena
      // });
      // if (authErr) { setError('Credenciales inválidas'); sacudir(); setCargando(false); return; }
      // setLoginExitoso(true);
      // if (recordar) localStorage.setItem('sesionUsuario', JSON.stringify({ uid: authData.user.id, email: authData.user.email }));
      // await guardarLog({ id: authData.user.id, usuario: authData.user.email }, 'Inicio de sesión', 'El usuario ingresó al sistema');
      // setTimeout(() => onLogin({ id: authData.user.id, usuario: authData.user.email, rol: 'usuario' }), 1400);

    } catch (e) {
      console.error(e);
      setError('Ocurrió un error inesperado. Probá de nuevo.');
      sacudir();
      setCargando(false);
    }
  };

  return (
    <div className="solar-scene min-h-screen">
      {/* Cielo y Sol */}
      <div className="sky-gradient" />
      <motion.div
        className="sun"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: pantallaNegra ? 0.8 : 1, opacity: pantallaNegra ? 0 : 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <div className={`sun-core ${loginExitoso ? 'sun-flare' : ''}`} />
        <div className="sun-rays" />
      </motion.div>

      {/* Nubes suaves (parallax) */}
      <div className="cloud cloud-1" />
      <div className="cloud cloud-2" />
      <div className="cloud cloud-3" />

      {/* Campo de paneles */}
      <div className="solar-field">
        {Array.from({ length: 36 }).map((_, i) => (
          <div key={i} className="panel">
            <span className="panel-glint" />
            <span className="cell-grid" />
          </div>
        ))}
      </div>

      {/* Oscurecimiento de entrada */}
      <AnimatePresence>
        {pantallaNegra && (
          <motion.div
            className="intro-black"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6 }}
          />
        )}
      </AnimatePresence>

      {/* Contenedor del login */}
      <div
        className="login-bg flex items-center justify-center relative"
        style={{
          // Si querés mantener tu imagen de fondo, la dejo como capa sutil
          backgroundImage: `url(${fondo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: 'rgba(0,0,0,0.15)',
          backgroundBlendMode: 'darken',
        }}
      >
        {/* Tarjeta */}
        <motion.div
          className={`login-card ${vibrar ? 'vibrar' : ''} ${error ? 'error-shadow' : ''} ${loginExitoso ? 'success-mode' : ''}`}
          initial={{ height: 240, opacity: 0.98 }}
          animate={{
            height: loginExitoso ? 132 : (expandirTarjeta ? 520 : 240),
            width: loginExitoso ? 180 : 'min(95vw, 410px)',
            borderRadius: loginExitoso ? '1.25rem' : '1.5rem',
            opacity: 1,
            scale: loginExitoso ? 0.92 : 1
          }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        >
          {/* Logo (respetando tu preferencia de tamaño fijo) */}
          <img
            src={logo}
            alt="Logo"
            className={`login-logo ${loginExitoso ? 'logo-centro' : ''}`}
          />

          {/* Formulario */}
          <AnimatePresence>
            {mostrarFormulario && !loginExitoso && (
              <motion.div
                className="form-contenedor"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {/* Usuario */}
                <div className="relative w-full">
                  <FiMail className="login-icon" />
                  <input
                    id="usuario"
                    type="text"
                    placeholder="Usuario"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    className={`login-input ${error ? 'error' : ''}`}
                    autoComplete="username"
                    aria-invalid={!!error}
                  />
                </div>

                {/* Contraseña */}
                <div className="relative w-full">
                  <FiLock className="login-icon" />
                  <input
                    id="contrasena"
                    type={mostrarPass ? 'text' : 'password'}
                    placeholder="Contraseña"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    className={`login-input ${error ? 'error' : ''}`}
                    autoComplete="current-password"
                    aria-invalid={!!error}
                  />
                  <button
                    type="button"
                    className="ver-pass-btn"
                    aria-label={mostrarPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    onClick={() => setMostrarPass((s) => !s)}
                  >
                    {mostrarPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                {/* Recordar */}
                <div className="login-remember">
                  <input
                    id="recordar"
                    type="checkbox"
                    checked={recordar}
                    onChange={() => setRecordar(!recordar)}
                  />
                  <label htmlFor="recordar">Recordar sesión</label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botón */}
          {(mostrarFormulario || loginExitoso) && (
            <motion.button
              whileHover={!loginExitoso && !cargando ? { scale: 1.04 } : {}}
              whileTap={!loginExitoso && !cargando ? { scale: 0.97 } : {}}
              type="button"
              onClick={handleLogin}
              disabled={loginExitoso || cargando}
              className={`login-btn ${cargando ? 'loading' : ''}`}
            >
              {loginExitoso ? 'Ingresando…' : (cargando ? 'Verificando…' : 'Iniciar Sesión')}
            </motion.button>
          )}

          {/* Error */}
          {error && !loginExitoso && (
            <p className="login-error" role="alert">{error}</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
