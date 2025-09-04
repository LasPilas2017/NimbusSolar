import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock } from 'react-icons/fi';
import supabase from '../supabase';
import { guardarLog } from '../utils';
import './Login.css'; // estilos separados

// Imágenes desde src/assets/images
import fondo from '../assets/images/fondo.png';
import logo from '../assets/images/logo.png';

export default function Login({ onLogin }) {
  const [pantallaNegra, setPantallaNegra] = useState(true);
  const [expandirTarjeta, setExpandirTarjeta] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loginExitoso, setLoginExitoso] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [vibrar, setVibrar] = useState(false);
  const [recordar, setRecordar] = useState(true);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('sesionUsuario');
    if (usuarioGuardado) {
      const datos = JSON.parse(usuarioGuardado);
      onLogin(datos);
    }

    const t1 = setTimeout(() => setPantallaNegra(false), 1000);
    const t2 = setTimeout(() => setExpandirTarjeta(true), 2000);
    const t3 = setTimeout(() => setMostrarFormulario(true), 3700);
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
    };
  }, [onLogin]);

  const handleLogin = async () => {
    setError('');
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, usuario, contrasena, rol')
      .eq('usuario', usuario)
      .eq('contrasena', contrasena)
      .single();

    if (error || !data) {
      setError('Usuario o contraseña incorrectos');
      setVibrar(true);
      setTimeout(() => setVibrar(false), 500);
    } else {
      setLoginExitoso(true);
      if (recordar) localStorage.setItem('sesionUsuario', JSON.stringify(data));
      await guardarLog(data, 'Inicio de sesión', 'El usuario ingresó al sistema');
      setTimeout(() => onLogin(data), 2000);
    }
  };

  return (
    <div
      className="login-bg min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: `url(${fondo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        backgroundBlendMode: 'darken',
      }}
    >
      {/* Pantalla negra de inicio */}
      <AnimatePresence>
        {pantallaNegra && (
          <motion.div
            className="absolute inset-0 bg-black z-50"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3 }}
          />
        )}
      </AnimatePresence>

      {/* Tarjeta principal */}
      <motion.div
        initial={{ height: 250 }}
        animate={{ height: loginExitoso ? 240 : expandirTarjeta ? 500 : 250 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        className="login-card"
      >
        {/* Logo */}
        <img src={logo} alt="Logo" className="login-logo" />

        {/* Formulario */}
        <AnimatePresence>
          {mostrarFormulario && !loginExitoso && (
            <div className="form-contenedor">
              {/* Usuario */}
              <motion.div
                key={`usuario-${vibrar}`}
                animate={vibrar ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
                transition={{ duration: 0.3 }}
                className={vibrar ? 'vibrar' : ''}
              >
                <div className="relative">
                  <FiMail className="login-icon" />
                  <input
                    type="text"
                    placeholder="Usuario"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    className={`login-input ${error ? 'error' : ''}`}
                  />
                </div>
              </motion.div>

              {/* Contraseña */}
              <motion.div
                key={`contrasena-${vibrar}`}
                animate={vibrar ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
                transition={{ duration: 0.3 }}
                className={vibrar ? 'vibrar' : ''}
              >
                <div className="relative">
                  <FiLock className="login-icon" />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    className={`login-input ${error ? 'error' : ''}`}
                  />
                </div>
              </motion.div>

              {/* Recordar */}
              <div className="login-remember">
                <input
                  id="recordar"
                  type="checkbox"
                  checked={recordar}
                  onChange={() => setRecordar(!recordar)}
                />
                <label htmlFor="recordar">Recordar usuario y contraseña</label>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Botón */}
        {(mostrarFormulario || loginExitoso) && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleLogin}
            disabled={loginExitoso}
            className="login-btn"
          >
            {loginExitoso ? 'Ingresando...' : 'Iniciar Sesión'}
          </motion.button>
        )}

        {/* Error */}
        {error && !loginExitoso && (
          <p className="login-error">{error}</p>
        )}
      </motion.div>
    </div>
  );
}
