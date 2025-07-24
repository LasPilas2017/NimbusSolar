import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock } from 'react-icons/fi';
import supabase from './supabase';
import { guardarLog } from './utils';

export default function Login({ onLogin }) {
  const [pantallaNegra, setPantallaNegra] = useState(true);
  const [expandirTarjeta, setExpandirTarjeta] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loginExitoso, setLoginExitoso] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [vibrar, setVibrar] = useState(false);
  const [recordar, setRecordar] = useState(true); // Casilla de recordar

  useEffect(() => {
    // 🔹 Restaurar sesión si existe
    const usuarioGuardado = localStorage.getItem('sesionUsuario');
    if (usuarioGuardado) {
      const datos = JSON.parse(usuarioGuardado);
      onLogin(datos); // ya está logueado
    }

    const timer1 = setTimeout(() => setPantallaNegra(false), 1000);
    const timer2 = setTimeout(() => setExpandirTarjeta(true), 2000);
    const timer3 = setTimeout(() => setMostrarFormulario(true), 3700);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

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

      if (recordar) {
        localStorage.setItem('sesionUsuario', JSON.stringify(data));
      }

      await guardarLog(data, "Inicio de sesión", "El usuario ingresó al sistema");
      setTimeout(() => onLogin(data), 2000);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative"
      style={{
        backgroundImage: "url('/fondo.png')",
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

      {/* Tarjetas de fondo giradas */}
      <div className="absolute w-[350px] h-[480px] sm:w-[400px] sm:h-[500px]">
        <div className="absolute bg-blue-400 shadow-lg w-full h-full rounded-3xl transform -rotate-6"></div>
        <div className="absolute bg-red-400 shadow-lg w-full h-full rounded-3xl transform rotate-6"></div>
      </div>

      {/* Tarjeta principal */}
     <motion.div
              initial={{ height: 250 }}
              animate={{ height: loginExitoso ? 240 : expandirTarjeta ? 500 : 250 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="relative bg-white px-6 py-8 sm:px-8 sm:py-6 rounded-3xl shadow-2xl text-gray-800 z-10 flex flex-col justify-center items-center w-[95vw] max-w-[400px] text-[22px] sm:text-base overflow-hidden scale-[0.7] sm:scale-100"
            >
              {/* Logo */}
              <img
                src="/logo.png"
                alt="Logo de la empresa"
                className="h-36 sm:h-40 object-contain mb-4"
              />

              {/* Formulario de login */}
              <AnimatePresence>
                {mostrarFormulario && !loginExitoso && (
                  <div className="flex flex-col w-full items-center justify-center gap-4">
                    {/* Usuario */}
                    <motion.div
                      key={`usuario-${vibrar}`}
                      animate={vibrar ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full"
                    >
                      <div className="relative">
                        <FiMail className="absolute left-3 top-3 text-gray-500 text-xl sm:text-base" />
                        <input
                          type="text"
                          placeholder="Usuario"
                          value={usuario}
                          onChange={(e) => setUsuario(e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 sm:py-2 rounded-md border ${
                            error ? 'border-red-500' : 'border-gray-300'
                          } bg-white text-gray-800 placeholder-gray-400 text-lg sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                    </motion.div>

                    {/* Contraseña */}
                    <motion.div
                      key={`contrasena-${vibrar}`}
                      animate={vibrar ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full"
                    >
                      <div className="relative">
                        <FiLock className="absolute left-3 top-3 text-gray-500 text-xl sm:text-base" />
                        <input
                          type="password"
                          placeholder="Contraseña"
                          value={contrasena}
                          onChange={(e) => setContrasena(e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 sm:py-2 rounded-md border ${
                            error ? 'border-red-500' : 'border-gray-300'
                          } bg-white text-gray-800 placeholder-gray-400 text-lg sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                    </motion.div>

                    {/* Checkbox */}
                    <div className="w-full flex justify-center items-center text-sm text-gray-600">
                        <input
                          id="recordar"
                          type="checkbox"
                          className="mr-2"
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
                  className={`w-full mt-6 bg-blue-600 text-white font-semibold py-3 sm:py-2 text-lg sm:text-base rounded-full shadow-md hover:bg-blue-700 transition duration-300 ease-in-out ${
                    loginExitoso ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loginExitoso ? 'Ingresando...' : 'Iniciar Sesión'}
                </motion.button>
              )}

              {/* Error */}
              {error && !loginExitoso && (
                <p className="text-red-500 text-center font-medium mt-4 text-base sm:text-sm">{error}</p>
              )}
            </motion.div>

    </div>
  );
}
