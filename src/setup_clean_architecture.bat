@echo off
setlocal enabledelayedexpansion

REM === Ruta base (ajústala si fuese distinto) ===
set SRC=src

REM ==== Carpetas SHARED (núcleo común) ====
mkdir "%SRC%\shared" 2>nul
mkdir "%SRC%\shared\domain" 2>nul
mkdir "%SRC%\shared\domain\valueObjects" 2>nul
mkdir "%SRC%\shared\application" 2>nul
mkdir "%SRC%\shared\application\usecases" 2>nul
mkdir "%SRC%\shared\infra" 2>nul
mkdir "%SRC%\shared\presentation" 2>nul
mkdir "%SRC%\shared\presentation\contexts" 2>nul
mkdir "%SRC%\shared\presentation\routes" 2>nul
mkdir "%SRC%\shared\presentation\components" 2>nul
mkdir "%SRC%\shared\ui" 2>nul
mkdir "%SRC%\shared\ui\theme" 2>nul
mkdir "%SRC%\shared\utils" 2>nul

REM ==== Carpetas AUTH (módulo de login) ====
mkdir "%SRC%\modules" 2>nul
mkdir "%SRC%\modules\auth" 2>nul
mkdir "%SRC%\modules\auth\domain" 2>nul
mkdir "%SRC%\modules\auth\application" 2>nul
mkdir "%SRC%\modules\auth\application\usecases" 2>nul
mkdir "%SRC%\modules\auth\infra" 2>nul
mkdir "%SRC%\modules\auth\presentation" 2>nul
mkdir "%SRC%\modules\auth\presentation\components" 2>nul

REM ==== Carpetas VENTAS (solo estructura inicial) ====
mkdir "%SRC%\modules\ventas" 2>nul
mkdir "%SRC%\modules\ventas\domain" 2>nul
mkdir "%SRC%\modules\ventas\application" 2>nul
mkdir "%SRC%\modules\ventas\infra" 2>nul
mkdir "%SRC%\modules\ventas\presentation" 2>nul
mkdir "%SRC%\modules\ventas\presentation\pages" 2>nul
mkdir "%SRC%\modules\ventas\presentation\components" 2>nul
mkdir "%SRC%\modules\ventas\presentation\layouts" 2>nul
mkdir "%SRC%\modules\ventas\presentation\styles" 2>nul

REM ==== jsconfig.json para aliases ====
powershell -Command ^
"Set-Content -Path 'jsconfig.json' -Value @'
{
  \"compilerOptions\": {
    \"baseUrl\": \"src\",
    \"paths\": {
      \"@shared/*\": [\"shared/*\"],
      \"@modules/*\": [\"modules/*\"]
    }
  }
}
'@"

REM ==== shared/domain/valueObjects/roles.js ====
powershell -Command ^
"Set-Content -Path '%SRC%/shared/domain/valueObjects/roles.js' -Value @'
export const ROLES = {
  ADMIN: \"admin\",
  SUPERVISOR: \"supervisor\",
  REPORTADOR: \"reportador\",
  VIEWER: \"viewer\",
};

export const PERMISSIONS = {
  VER_PROYECTOS: \"VER_PROYECTOS\",
  EDITAR_PROYECTOS: \"EDITAR_PROYECTOS\",
  VER_PLANILLA: \"VER_PLANILLA\",
  EDITAR_PLANILLA: \"EDITAR_PLANILLA\",
  VER_CONTABILIDAD: \"VER_CONTABILIDAD\",
  EDITAR_CONTABILIDAD: \"EDITAR_CONTABILIDAD\",
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.SUPERVISOR]: [
    PERMISSIONS.VER_PROYECTOS,
    PERMISSIONS.EDITAR_PROYECTOS,
    PERMISSIONS.VER_PLANILLA,
    PERMISSIONS.EDITAR_PLANILLA,
  ],
  [ROLES.REPORTADOR]: [
    PERMISSIONS.VER_PROYECTOS,
    PERMISSIONS.VER_PLANILLA,
  ],
  [ROLES.VIEWER]: [ PERMISSIONS.VER_PROYECTOS ],
};
'@"

REM ==== shared/infra/supabaseClient.js (placeholder) ====
powershell -Command ^
"Set-Content -Path '%SRC%/shared/infra/supabaseClient.js' -Value @'
/**
 * Mueve aquí el contenido de tu actual supabase.js
 * y exportalo como default.
 *
 * Ejemplo mínimo:
 *   import { createClient } from \"@supabase/supabase-js\";
 *   const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON);
 *   export default supabase;
 */
export default {};// <- Reemplazar con tu cliente real
'@"

REM ==== shared/utils/guardarLog.js (placeholder seguro) ====
powershell -Command ^
"Set-Content -Path '%SRC%/shared/utils/guardarLog.js' -Value @'
/**
 * Reemplaza con tu implementación real si ya la tenés en otra ruta.
 * Debe ser: async function guardarLog(user, accion, detalle) { ... }
 */
export async function guardarLog(user, accion, detalle) {
  try {
    console.log(\"[AUDIT]\", { user, accion, detalle, at: new Date().toISOString() });
  } catch (_) {}
}
'@"

REM ==== shared/presentation/contexts/AuthContext.jsx ====
powershell -Command ^
"Set-Content -Path '%SRC%/shared/presentation/contexts/AuthContext.jsx' -Value @'
import React, { createContext, useContext, useEffect, useMemo, useState } from \"react\";
import { container } from \"@shared/infra/container\";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const { loginUser, getCurrentUser, logoutUser, hasPermission } = container.usecases;
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      setUser(u);
      setReady(true);
    })();
  }, [getCurrentUser]);

  const value = useMemo(() => ({
    user,
    ready,
    login: async ({ username, password, remember }) => {
      const u = await loginUser({ username, password, remember });
      setUser(u);
      return u;
    },
    logout: async () => {
      await logoutUser();
      setUser(null);
    },
    hasPermission: (perm) => hasPermission(user, perm),
  }), [user, ready, loginUser, logoutUser, hasPermission]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error(\"useAuth must be used within AuthProvider\");
  return ctx;
}
'@"

REM ==== shared/presentation/routes/ProtectedRoute.jsx ====
powershell -Command ^
"Set-Content -Path '%SRC%/shared/presentation/routes/ProtectedRoute.jsx' -Value @'
import React from \"react\";
import { Navigate } from \"react-router-dom\";
import { useAuth } from \"@shared/presentation/contexts/AuthContext\";

export default function ProtectedRoute({ children, permission }) {
  const { user, ready, hasPermission } = useAuth();

  if (!ready) return null; // colocar un spinner si querés
  if (!user) return <Navigate to=\"/login\" replace />;

  if (permission && !hasPermission(permission)) {
    return <Navigate to=\"/no-autorizado\" replace />;
  }
  return children;
}
'@"

REM ==== shared/presentation/components/HasPermission.jsx ====
powershell -Command ^
"Set-Content -Path '%SRC%/shared/presentation/components/HasPermission.jsx' -Value @'
import React from \"react\";
import { useAuth } from \"@shared/presentation/contexts/AuthContext\";

export default function HasPermission({ permission, children, fallback = null }) {
  const { hasPermission } = useAuth();
  return hasPermission(permission) ? children : fallback;
}
'@"

REM ==== shared/infra/container.js (Auth mínimo registrado) ====
powershell -Command ^
"Set-Content -Path '%SRC%/shared/infra/container.js' -Value @'
import { guardarLog } from \"@shared/utils/guardarLog\";
import { SupabaseAuthRepository } from \"@modules/auth/infra/SupabaseAuthRepository\";
import { loginUser } from \"@modules/auth/application/usecases/loginUser\";
import { getCurrentUser } from \"@modules/auth/application/usecases/getCurrentUser\";
import { logoutUser } from \"@modules/auth/application/usecases/logoutUser\";
import { hasPermission } from \"@modules/auth/application/usecases/hasPermission\";

const authRepo = new SupabaseAuthRepository({ logFn: guardarLog });

export const container = {
  repos: { authRepo },
  usecases: {
    loginUser: loginUser({ authRepo, auditLog: guardarLog }),
    getCurrentUser: getCurrentUser({ authRepo }),
    logoutUser: logoutUser({ authRepo }),
    hasPermission: hasPermission(),
  },
};
'@"

REM ==== modules/auth/domain/entities/User.js ====
powershell -Command ^
"Set-Content -Path '%SRC%/modules/auth/domain/entities/User.js' -Value @'
export class User {
  constructor({ id, username, role }) {
    this.id = String(id);
    this.username = username;
    this.role = role;
  }
}
'@"

REM ==== modules/auth/domain/repositories/AuthRepository.js ====
powershell -Command ^
"Set-Content -Path '%SRC%/modules/auth/domain/repositories/AuthRepository.js' -Value @'
export class AuthRepository {
  async login(_creds) { throw new Error(\"Not implemented\"); }
  async logout() { throw new Error(\"Not implemented\"); }
  async current() { throw new Error(\"Not implemented\"); }
}
'@"

REM ==== modules/auth/application/usecases (4) ====
powershell -Command ^
"Set-Content -Path '%SRC%/modules/auth/application/usecases/loginUser.js' -Value @'
export const loginUser = ({ authRepo, auditLog }) => async ({ username, password, remember }) => {
  const user = await authRepo.login({ username, password, remember });
  if (auditLog) await auditLog(user, \"Inicio de sesión\", \"El usuario ingresó al sistema\");
  return user;
};
'@"

powershell -Command ^
"Set-Content -Path '%SRC%/modules/auth/application/usecases/getCurrentUser.js' -Value @'
export const getCurrentUser = ({ authRepo }) => async () => {
  return await authRepo.current();
};
'@"

powershell -Command ^
"Set-Content -Path '%SRC%/modules/auth/application/usecases/logoutUser.js' -Value @'
export const logoutUser = ({ authRepo }) => async () => {
  await authRepo.logout();
};
'@"

powershell -Command ^
"Set-Content -Path '%SRC%/modules/auth/application/usecases/hasPermission.js' -Value @'
import { ROLE_PERMISSIONS } from \"@shared/domain/valueObjects/roles\";
export const hasPermission = () => (user, permission) => {
  if (!user) return false;
  const list = ROLE_PERMISSIONS[user.role] || [];
  return list.includes(permission);
};
'@"

REM ==== modules/auth/infra/SupabaseAuthRepository.js ====
powershell -Command ^
"Set-Content -Path '%SRC%/modules/auth/infra/SupabaseAuthRepository.js' -Value @'
import supabase from \"@shared/infra/supabaseClient\";
import { AuthRepository } from \"@modules/auth/domain/repositories/AuthRepository\";
import { User } from \"@modules/auth/domain/entities/User\";

export class SupabaseAuthRepository extends AuthRepository {
  constructor({ storage = window.localStorage, storageKey = \"sesionUsuario\", logFn = null } = {}) {
    super();
    this.storage = storage;
    this.storageKey = storageKey;
    this.logFn = logFn;
  }

  async login({ username, password, remember = true }) {
    const { data, error } = await supabase
      .from(\"usuarios\")
      .select(\"id, usuario, contrasena, rol\")
      .eq(\"usuario\", username)
      .eq(\"contrasena\", password)
      .single();

    if (error || !data) {
      const err = new Error(\"Credenciales inválidas\");
      err.code = \"INVALID_CREDENTIALS\";
      throw err;
    }

    const user = new User({ id: data.id, username: data.usuario, role: data.rol });

    if (remember) this.storage.setItem(this.storageKey, JSON.stringify(user));
    else this.storage.removeItem(this.storageKey);

    if (this.logFn) { try { await this.logFn(user, \"Inicio de sesión\", \"El usuario ingresó al sistema\"); } catch {} }
    return user;
  }

  async current() {
    const raw = this.storage.getItem(this.storageKey);
    if (!raw) return null;
    try {
      const obj = JSON.parse(raw);
      return new User({ id: obj.id, username: obj.username, role: obj.role });
    } catch {
      return null;
    }
  }

  async logout() {
    this.storage.removeItem(this.storageKey);
  }
}
'@"

REM ==== Placeholders en ventas ====
powershell -Command ^
"Set-Content -Path '%SRC%/modules/ventas/presentation/pages/README.txt' -Value 'Mueve aquí tus páginas de Ventas (MenuPrincipal.jsx, VistaMovimientos.jsx, etc.)'"

powershell -Command ^
"Set-Content -Path '%SRC%/modules/ventas/presentation/styles/README.txt' -Value 'Coloca aquí estilos/theme específicos de Ventas (si no van en shared/ui/theme)'"


echo.
echo ===========================================
echo  Estructura Clean Architecture creada.
echo  PASOS SIGUIENTES:
echo   1) Mueve el contenido de tu supabase.js a: src\shared\infra\supabaseClient.js
echo   2) Envuelve tu App con AuthProvider (shared/presentation/contexts/AuthContext.jsx)
echo   3) Mueve tu Login.jsx a: src\modules\auth\presentation\components\Login.jsx
echo      y cambia su handleLogin para usar useAuth().login(...)
echo   4) Empieza a mover Vistas de Ventas a: src\modules\ventas\presentation\pages\
echo   5) Usa alias: @shared/* y @modules/* (jsconfig.json creado)
echo ===========================================
echo.

endlocal
