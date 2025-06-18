import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock } from 'react-icons/fi';
import { supabase } from './supabase';
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
  const [esEscritorio, setEsEscritorio] = useState(false);

  useEffect(() => {
    const actualizar = () => setEsEscritorio(window.innerWidth >= 768);
    actualizar();
    window.addEventListener('resize', actualizar);
    return () => window.removeEventListener('resize', actualizar);
  }, []);

  useEffect(() => {
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
      await guardarLog(data, "Inicio de sesión", "El usuario ingresó al sistema");
      setTimeout(() => onLogin(data), 2000);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative bg-no-repeat bg-center"
      style={{
        backgroundImage: "url('/fondo.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        backgroundBlendMode: 'darken',
      }}
    >
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

      <motion.div
        initial={{ height: 200 }}
        animate={{ height: loginExitoso ? 240 : expandirTarjeta ? 480 : 200 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        className="backdrop-blur-md bg-white/30 px-6 py-8 sm:px-8 sm:py-6 rounded-2xl shadow-2xl text-white z-10 flex flex-col items-center w-[95vw] max-w-[450px] text-[22px] sm:text-base overflow-hidden scale-[0.7] sm:scale-100 origin-top"
      >
        <img
          src="/logo.png"
          alt="Logo de la empresa"
          className="h-45 sm:h-45 object-contain mb-4"
        />

        <AnimatePresence>
          {mostrarFormulario && !loginExitoso && (
            <div className="mt-6 sm:mt-4 w-full">
              <motion.div
                key={`usuario-${vibrar}`}
                animate={vibrar ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full mb-4"
              >
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-white text-xl sm:text-base" />
                  <input
                    type="text"
                    placeholder="Usuario"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 sm:py-2 rounded-md border ${
                      error ? 'border-red-500' : 'border-white'
                    } bg-transparent text-white placeholder-white text-lg sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400`}
                  />
                </div>
              </motion.div>

              <motion.div
                key={`contrasena-${vibrar}`}
                animate={vibrar ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-white text-xl sm:text-base" />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 sm:py-2 rounded-md border ${
                      error ? 'border-red-500' : 'border-white'
                    } bg-transparent text-white placeholder-white text-lg sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400`}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {(mostrarFormulario || loginExitoso) && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleLogin}
            disabled={loginExitoso}
            className={`w-full mt-8 bg-gradient-to-r from-white via-gray-200 to-white text-gray-800 font-semibold py-3 sm:py-2 text-lg sm:text-base rounded-full shadow-md hover:shadow-lg transition duration-300 ease-in-out ${
              loginExitoso ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loginExitoso ? 'Ingresando...' : 'Iniciar Sesión'}
          </motion.button>
        )}

        {error && !loginExitoso && (
          <p className="text-red-300 text-center font-medium mt-4 text-base sm:text-sm">{error}</p>
        )}
      </motion.div>
    </div>
  );
}
