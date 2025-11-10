// src/presentation/pages/Login/Login.jsx
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// - Es la pantalla principal de inicio de sesión de NimbusSolar.
// - Maneja DOS accesos distintos en la misma UI (con un deslizador visual):
//     1) Acceso de USUARIOS
//     2) Acceso de ADMINISTRACIÓN
// - Muestra un layout animado con selector "Usuarios / Administración"
//   y dos formularios, uno para cada lado.
// - AHORA también permite a un usuario hacer su **primer ingreso** usando
//   alias + código de activación (pantalla PrimerIngreso).
//
// -----------------------------------------------------------------------------
// DE DÓNDE TRAE LA INFORMACIÓN / A QUÉ SE CONECTA
// -----------------------------------------------------------------------------
// 1) ADMINISTRACIÓN
//    - Usa Clean Architecture con módulos de "auth":
//      * SqlAuthRepository          (infra: modules/auth/infra/SqlAuthRepository)
//      * LoginUseCase               (application: modules/auth/application/LoginUseCase)
//      * GetSessionUseCase          (application: modules/auth/application/GetSessionUseCase)
//    - Estos casos de uso se conectan a tu base de datos (vía Supabase/SQL) para
//      validar el usuario administrador en la tabla de usuarios que tengas.
//    - Si el login es correcto y el rol es admin, construye un objeto `user` con
//      las pestañas permitidas y lo guarda en localStorage como "sesionUsuario".
//
// 2) USUARIOS
//    - Usa directamente el cliente de Supabase:
//        import supabase from '../../../supabase';
//    - Llama a una función RPC llamada `login_usuario` con:
//        p_usuario    -> usuario o correo
//        p_contrasena -> contraseña
//    - Esa función vive en la BD de Supabase y valida credenciales
//      contra tu tabla de usuarios de ventas/usuarios.
//    - Con la respuesta arma un objeto `user` y lo guarda en localStorage.
//
// 3) PRIMER INGRESO
//    - Importa: PrimerIngreso (modules/usuarios/ui/pages/PrimerIngreso.jsx)
//    - Se muestra cuando el usuario pulsa "Primer ingreso / Tengo código de activación".
//    - Usa el caso de uso ActivarUsuarioPrimerIngresoUseCase para:
//        * verificar alias + código,
//        * guardar nueva contraseña,
//        * activar el usuario.
//    - Al terminar, vuelve a este Login y prellena el alias.
// -----------------------------------------------------------------------------

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import styles from './Login.module.css';

import fondo from '../../../assets/images/fondo.png';
import logo from '../../../assets/images/logo.png';

import supabase from '../../../supabase';

import { SqlAuthRepository } from '../../../modules/auth/infra/SqlAuthRepository';
// 👇 Ajustamos imports a application/ (sin /usecases/)
import { LoginUseCase } from '../../../modules/auth/application/LoginUseCase';
import { GetSessionUseCase } from '../../../modules/auth/application/GetSessionUseCase';

// 🔗 Pantalla de primer ingreso (nuevo módulo usuarios)
import PrimerIngreso from '../../../modules/usuarios/ui/pages/PrimerIngreso.jsx';

// 🔹 Ahora acepta la prop onIrAPrimerIngreso
export default function Login({ onLogin, onIrAPrimerIngreso }) {
  // ----- UI
  const [cargando, setCargando] = useState(false);
  const [loginExitoso, setLoginExitoso] = useState(false);
  const [error, setError] = useState('');
  const [mostrarPassUsuarios, setMostrarPassUsuarios] = useState(false);
  const [mostrarPassAdmin, setMostrarPassAdmin] = useState(false);
  const [recordar, setRecordar] = useState(true);

  // Vista activa: 'usuarios' | 'admin'
  const [vista, setVista] = useState('usuarios');

  // Mostrar pantalla de primer ingreso
  const [mostrarPrimerIngreso, setMostrarPrimerIngreso] = useState(false);

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
        // --- ADMINISTRACIÓN (tabla usuarios vía use case)
        if (!aUsuario.trim() || !aContrasena)
          throw new Error('Ingresá usuario y contraseña');
        const rawUser = await loginUC.execute(aUsuario.trim(), aContrasena, recordar);

        const role = String(rawUser.rol || '').toLowerCase();
        if (role !== 'admin')
          throw new Error('Usuario no autorizado para Administración');

        const user = {
          ...rawUser,
          rol: 'admin',
          allowedTabs: [
            'VistaMovimientos',
            'papeleria',
            'personal',
            'servicios',
            'inventario',
            'ventas',
            'proyectos',
            'Liquidez',
          ],
          homeTab: 'VistaMovimientos',
        };

        if (recordar) localStorage.setItem('sesionUsuario', JSON.stringify(user));
        setLoginExitoso(true);
        setTimeout(() => onLogin(user), 800);
      } else {
        // --- USUARIOS (antes "Ventas") - RPC contra función login_usuario en Supabase
        if (!vEmail.trim() || !vPass)
          throw new Error('Ingresá usuario/correo y contraseña');

        if (!supabase) {
          setError('El servidor no tiene configuradas las variables de Supabase.');
          setCargando(false);
          return;
        }

        const { data, error: err } = await supabase.rpc('login_usuario', {
          p_usuario: vEmail.trim(),
          p_contrasena: vPass,
        });

        if (err) throw err;
        if (!data || data.length === 0) {
          throw new Error('Credenciales inválidas');
        }

        const profile = data[0];
        const user = {
          id: profile.id,
          usuario: profile.usuario,
          rol: String(profile.rol || 'usuario').toLowerCase(),
          allowedTabs: profile.allowed_tabs || ['ventas'],
          homeTab: profile.home_tab || 'ventas',
          nombre: profile.nombre || profile.usuario,
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

  // 🔁 Si está activa la pantalla de primer ingreso, mostramos SOLO esa vista
  if (mostrarPrimerIngreso) {
    return (
      <PrimerIngreso
        onActivated={(usuarioActivado) => {
          setMostrarPrimerIngreso(false);

          if (usuarioActivado?.alias) {
            setVista('usuarios');
            setVEmail(usuarioActivado.alias);
          }

          setError(
            'Contraseña creada correctamente. Ingresá con tu alias y nueva contraseña.'
          );
        }}
      />
    );
  }

  // ----- Vista normal de login -----
  return (
    <div className={styles.page}>
      <div className={styles.bg} style={{ backgroundImage: `url(${fondo})` }} />
      <div className={styles.overlay} />

      <motion.div
        className={styles.shell}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <img src={logo} alt="Nimbus Solar" className={styles.logo} />

        {/* Selector superior */}
        <div className={styles.segment}>
          <button
            className={`${styles.segmentBtn} ${vista === 'usuarios' ? styles.active : ''}`}
            onClick={() => setVista('usuarios')}
            type="button"
          >
            Usuarios
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
            animate={{ left: vista === 'usuarios' ? '4px' : 'calc(50% + 4px)' }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          />
        </div>

        {/* Formulario doble */}
        <div className={styles.dual}>
          {/* Columna USUARIOS */}
          <div className={styles.col}>
            <h3 className={styles.title}>Acceso de Usuarios</h3>
            <label className={styles.field}>
              <FiMail className={styles.icon} />
              <input
                className={styles.input}
                type="text"
                placeholder="Usuario o correo"
                value={vEmail}
                onChange={(e) => setVEmail(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <FiLock className={styles.icon} />
              <input
                className={styles.input}
                type={mostrarPassUsuarios ? 'text' : 'password'}
                placeholder="Contraseña"
                value={vPass}
                onChange={(e) => setVPass(e.target.value)}
              />
              <button
                type="button"
                className={styles.toggle}
                onClick={() => setMostrarPassUsuarios((s) => !s)}
              >
                {mostrarPassUsuarios ? <FiEyeOff /> : <FiEye />}
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

            {/* Botón para Primer Ingreso */}
            <div className={styles.forgotPasswordContainer}>
              <button
                type="button"
                className={styles.linkButton}
                onClick={onIrAPrimerIngreso}
              >
                ¿Primer ingreso o contraseña reiniciada?
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

          {/* Tarjeta deslizante */}
          <motion.div
            className={styles.cover}
            initial={false}
            animate={{ left: vista === 'usuarios' ? '50%' : '0%' }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          >
            <div className={styles.coverContent}>
              <div className={styles.sloganContainer}>
                <h2 className={styles.sloganTitle}>NimbusSolar</h2>
                <p className={styles.sloganSubtitle}>Porque la energía del sol, es gratis</p>
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
            {loginExitoso
              ? 'Ingresando…'
              : cargando
              ? 'Verificando…'
              : 'Iniciar Sesión'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
