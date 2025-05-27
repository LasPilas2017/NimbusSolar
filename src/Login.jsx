import React, { useState } from 'react';
import { supabase } from './supabase';

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('usuario', usuario)
      .eq('contrasena', contrasena)
      .single();

    if (error || !data) {
      setError('Usuario o contraseña incorrectos');
    } else {
      console.log("ROL DEL USUARIO:", data.rol);
      onLogin(data);
    }
  };

  return (
    <div
      className='min-h-screen bg-cover bg-center flex items-center justify-center'
      style={{ backgroundImage: "url('/fondo.png')" }}
    >
      <div className='bg-white bg-opacity-90 p-8 rounded-xl shadow-xl w-full max-w-md'>
        <div className='flex justify-center mb-6'>
          <img src='/logo.png' alt='Logo de la empresa' className='h-60 object-contain' />
        </div>
        <h2 className='text-2xl font-bold text-center text-gray-800 mb-4'>Iniciar sesión</h2>
        <form onSubmit={handleLogin} className='space-y-4'>
          <input
            type='text'
            placeholder='Usuario'
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <input
            type='password'
            placeholder='Contraseña'
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <button type='submit' className='w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition'>
            Entrar
          </button>
        </form>
        {error && <p className='text-red-600 mt-4 text-center font-semibold'>{error}</p>}
      </div>
    </div>
  );
}
