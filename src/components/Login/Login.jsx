import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import styles from './Login.module.css';

import fondo from '../../assets/images/fondo.png';
import logo from '../../assets/images/logo.png';

// ⚠️ Importa el guard en vez del cliente directo
import { getSupabase } from '../../supabase';
import supabase from '../../supabase';

import { SqlAuthRepository } from '../../modules/auth/infra/SqlAuthRepository';
import { LoginUseCase } from '../../modules/auth/application/LoginUseCase';
import { GetSessionUseCase } from '../../modules/auth/application/GetSessionUseCase';

export default function Login({ onLogin }) {
  // ----- UI
  const [cargando, setCargando] = useState(false);
  const [loginExitoso, setLoginExitoso] = useState(false);
  const [error, setError] = useState('');
  const [mostrarPassVentas, setMostrarPassVentas] = useState(false);
  const [mostrarPassAdmin, setMostrarPassAdmin] = useState(false);
  const [recordar, setRecordar] = useState(true);

  // Vista activa: 'ventas' | 'admin'
  const [vista, setVista] = useState('ventas');

  // ----- Forms
  const [vEmail, setVEmail] = useState('');
  const [vPass, setVPass] = useState('');
  const [aUsuario, setAUsuario] = useState('');
  const [aContrasena, setAContrasena] = useState('');

  // ----- Use cases (admin por tabla usuarios)
  const authRepo = useMemo(() => new SqlAuthRepository(), []);
  const loginUC = useMemo(() => new LoginUseCase(authRepo), [authRepo]);
  const getSessionUC = useMemo(() => new GetSessionUseCase(authRepo), [authRepo]);

  // Auto-login si hay sesión local
  useEffect(() => {
    (async () => {
      try {
        const sesion = await getSessionUC.execute();
        if (sesion) onLogin(sesion);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [getSessionUC, onLogin]);

  // Enter para enviar
  const onKeyDown = useCallback(
    (e) => {
      if (e.key !== 'Enter' || cargando || loginExitoso) return;
      handleLogin();
    },
    [cargando, loginExitoso, vista, vEmail, vPass, aUsuario, aContrasena, recordar]
  );

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  const handleLogin = async () => {
    setError('');
    setCargando(true);

    try {
      if (vista === 'admin') {
        // --- ADMIN (tabla usuarios vía use case)
        if (!aUsuario.trim() || !aContrasena) throw new Error('Ingresá usuario y contraseña');
        const rawUser = await loginUC.execute(aUsuario.trim(), aContrasena, recordar);

        const role = String(rawUser.rol || '').toLowerCase();
        if (role !== 'admin') throw new Error('Usuario no autorizado para Administración');

        const user = {
          ...rawUser,
          rol: 'admin',
          allowedTabs: [
            'VistaMovimientos','papeleria','personal','servicios','inventario','ventas','proyectos','Liquidez'
          ],
          homeTab: 'VistaMovimientos',
        };

        if (recordar) localStorage.setItem('sesionUsuario', JSON.stringify(user));
        setLoginExitoso(true);
        setTimeout(() => onLogin(user), 800);

      } else {
        // --- VENTAS (RPC seguro contra función login_usuario)
        if (!vEmail.trim() || !vPass) throw new Error('Ingresá usuario/correo y contraseña');

        // ⛑️ Guard: si Supabase no está inicializado (p. ej., faltan ENV en Vercel), no reventamos la app.
        let supabase;
        try {
          supabase = getSupabase();
        } catch (e) {
          console.error(e);
          setError('El servidor no tiene configuradas las variables de Supabase.');
          setCargando(false);
          return;
        }

        const { data, error: err } = await supabase.rpc('login_usuario', {
          p_usuario: vEmail.trim(),        // puede ser "admin" o correo, según tu tabla
          p_contrasena: vPass
        });

        if (err) throw err;
        if (!data || data.length === 0) {
          throw new Error('Credenciales inválidas');
        }

        const profile = data[0];
        const user = {
          id: profile.id,
          usuario: profile.usuario,
          rol: String(profile.rol || 'ventas').toLowerCase(),
          allowedTabs: profile.allowed_tabs || ['ventas'],
          homeTab: profile.home_tab || 'ventas',
          nombre: profile.nombre || profile.usuario
        };

        if (recordar) localStorage.setItem('sesionUsuario', JSON.stringify(user));
        setLoginExitoso(true);
        setTimeout(() => onLogin(user), 800);
      }

    } catch (e) {
      console.error(e);
      setError(e.message || 'Ocurrió un error, probá de nuevo.');
      setCargando(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Fondo */}
      <div className={styles.bg} style={{ backgroundImage: `url(${fondo})` }} />
      <div className={styles.overlay} />

      <motion.div
        className={styles.shell}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        {/* Logo */}
        <img src={logo} alt="Nimbus Solar" className={styles.logo} />

        {/* Selector superior */}
        <div className={styles.segment}>
          <button
            className={`${styles.segmentBtn} ${vista === 'ventas' ? styles.active : ''}`}
            onClick={() => setVista('ventas')}
            type="button"
          >
            Ventas
          </button>
          <button
            className={`${styles.segmentBtn} ${vista === 'admin' ? styles.active : ''}`}
            onClick={() => setVista('admin')}
            type="button"
          >
            Administración
          </button>
          <motion.span
            className={styles.segmentSlider}
            layout
            animate={{ left: vista === 'ventas' ? '4px' : 'calc(50% + 4px)' }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          />
        </div>

        {/* Contenedor doble: izquierda Ventas / derecha Admin */}
        <div className={styles.dual}>
          {/* Columna VENTAS */}
          <div className={styles.col}>
            <h3 className={styles.title}>Acceso de Ventas</h3>
            <label className={styles.field}>
              <FiMail className={styles.icon} />
              <input
                className={styles.input}
                type="text"
                placeholder="Usuario o correo"
                value={vEmail}
                onChange={(e) => setVEmail(e.target.value)}
                autoComplete="username"
              />
            </label>
            <label className={styles.field}>
              <FiLock className={styles.icon} />
              <input
                className={styles.input}
                type={mostrarPassVentas ? 'text' : 'password'}
                placeholder="Contraseña"
                value={vPass}
                onChange={(e) => setVPass(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.toggle}
                onClick={() => setMostrarPassVentas((s) => !s)}
              >
                {mostrarPassVentas ? <FiEyeOff /> : <FiEye />}
              </button>
            </label>

            <div className={styles.forgotPasswordContainer}>
              <button
                type="button"
                className={styles.forgotPassword}
                onClick={() => {
                  setError('La recuperación de contraseña se gestiona por el administrador.');
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          {/* Columna ADMIN */}
          <div className={styles.col}>
            <h3 className={styles.title}>Acceso de Administración</h3>
            <label className={styles.field}>
              <FiMail className={styles.icon} />
              <input
                className={styles.input}
                placeholder="Usuario administrador"
                value={aUsuario}
                onChange={(e) => setAUsuario(e.target.value)}
                autoComplete="username"
              />
            </label>
            <label className={styles.field}>
              <FiLock className={styles.icon} />
              <input
                className={styles.input}
                type={mostrarPassAdmin ? 'text' : 'password'}
                placeholder="Contraseña"
                value={aContrasena}
                onChange={(e) => setAContrasena(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.toggle}
                onClick={() => setMostrarPassAdmin((s) => !s)}
              >
                {mostrarPassAdmin ? <FiEyeOff /> : <FiEye />}
              </button>
            </label>
          </div>

          {/* Tarjeta deslizante que TAPA la sección inactiva */}
          <motion.div
            className={styles.cover}
            initial={false}
            animate={{ left: vista === 'ventas' ? '50%' : '0%' }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          >
            <div className={styles.coverContent}>
              <div className={styles.sloganContainer}>
                <h2 className={styles.sloganTitle}>NimbusSolar</h2>
                <p className={styles.sloganSubtitle}>Porque la energia del sol, es gratis</p>
              </div>

              {/* Sol y nubes */}
              <div className={styles.container}>
                <div className={styles.cloudFront}>
                  <span className={styles.leftFront}></span>
                  <span className={styles.rightFront}></span>
                </div>
                <span className={`${styles.sun} ${styles.sunshine}`}></span>
                <span className={styles.sun}></span>
                <div className={styles.cloudBack}>
                  <span className={styles.leftBack}></span>
                  <span className={styles.rightBack}></span>
                </div>
              </div>

              <div className={styles.coverText}>
                {vista === 'ventas'
                  ? <p>Bienvenido al portal de <strong>Ventas</strong></p>
                  : <p>Panel exclusivo de <strong>Administración</strong></p>}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recordar + error + botón */}
        <div className={styles.bottomRow}>
          <label className={styles.remember}>
            <input
              type="checkbox"
              checked={recordar}
              onChange={() => setRecordar(!recordar)}
            />
            <span>Recordar sesión</span>
          </label>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="button"
            className={styles.button}
            onClick={handleLogin}
            disabled={cargando || loginExitoso}
          >
            {loginExitoso ? 'Ingresando…' : cargando ? 'Verificando…' : 'Iniciar Sesión'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
