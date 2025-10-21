import supabase from '../../../supabase';

export class SqlAuthRepository {
  async login(usuario, contrasena) {
    try {
      // Consulta directa a la tabla usuarios
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, usuario, rol')
        .eq('usuario', usuario)
        .eq('contrasena', contrasena)
        .single();

      if (error || !data) {
        throw new Error('Usuario o contraseña incorrectos');
      }

      return {
        id: data.id,
        usuario: data.usuario,
        rol: data.rol,
      };
    } catch (err) {
      console.error('Error en SqlAuthRepository.login:', err.message);
      throw new Error('No se pudo iniciar sesión. Intenta nuevamente.');
    }
  }

  async getSession() {
    try {
      const sesion = localStorage.getItem('sesionUsuario');
      return sesion ? JSON.parse(sesion) : null;
    } catch (err) {
      console.error('Error leyendo la sesión:', err);
      return null;
    }
  }

  async logout() {
    try {
      localStorage.removeItem('sesionUsuario');
      return true;
    } catch (err) {
      console.error('Error cerrando sesión:', err);
      return false;
    }
  }
}
