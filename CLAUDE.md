# CodeViz Research Context

> **Note**: This file contains research context from CodeViz. Most recent contexts are at the bottom.

---

## Research Query

Investigate the "Authentication & Login" component in detail. Provide a comprehensive analysis of its architecture, responsibilities, and implementation details.

*Session: 5a8bf7f925c6e07e27a329b75ce025e4 | Generated: 24/7/2025, 9:22:37*

### Analysis Summary

# Authentication & Login Component Analysis

The "Authentication & Login" component is primarily handled by the **Login** component, defined in [src/Login.jsx](src/Login.jsx). This component is responsible for user authentication, managing the login UI, and persisting user sessions.

## Architecture

The **Login** component is a React functional component that encapsulates the entire login experience. Its architecture can be broken down into:

*   **State Management:** Utilizes React's `useState` hook for managing various UI states (e.g., `pantallaNegra`, `expandirTarjeta`, `mostrarFormulario`, `loginExitoso`, `usuario`, `contrasena`, `error`, `vibrar`, `recordar`) and input values.
*   **Lifecycle Management:** Employs React's `useEffect` hook for initial animations, session restoration from local storage, and cleanup of timers.
*   **Authentication Logic:** Contains the `handleLogin` asynchronous function that interacts with the Supabase backend for user validation.
*   **User Interface (UI):** Renders the visual elements of the login screen, including input fields, buttons, and animated transitions using `framer-motion`.
*   **External Dependencies:** Integrates with `supabase` for backend authentication and `react-icons` for UI iconography.

## Responsibilities

The **Login** component has several key responsibilities:

*   **User Authentication:** Validates user credentials (username and password) against a Supabase database.
*   **Session Management:**
    *   Restores user sessions from `localStorage` upon component mount if a saved session exists.
    *   Persists successful user login data to `localStorage` if the "Remember me" option is selected.
*   **User Interface Presentation:** Displays a visually engaging login form with animations and feedback.
*   **Input Handling:** Captures user input for username and password.
*   **Error Handling:** Provides visual feedback for incorrect login attempts.
*   **Logging:** Records successful login events using the `guardarLog` utility.
*   **Navigation:** Triggers an `onLogin` callback upon successful authentication to transition the user to the main application.

## Implementation Details

### Component Definition and State

The component is defined as `export default function Login({ onLogin })` in [src/Login.jsx](src/Login.jsx). It receives an `onLogin` prop, which is a callback function executed upon successful login.

Key state variables managed by `useState` include:

*   `pantallaNegra`: Controls the initial black screen animation.
*   `expandirTarjeta`: Manages the expansion animation of the main login card.
*   `mostrarFormulario`: Controls the visibility of the login form elements.
*   `loginExitoso`: Indicates a successful login, triggering UI changes (e.g., "Ingresando..." text).
*   `usuario`, `contrasena`: Store the current input values for the username and password fields.
*   `error`: Stores any authentication error messages.
*   `vibrar`: Triggers a vibration animation on input fields for incorrect credentials.
*   `recordar`: Manages the state of the "Remember me" checkbox.

### Initial Animations and Session Restoration

The `useEffect` hook at [src/Login.jsx:20](src/Login.jsx:20) handles initial UI animations and session restoration:

*   It attempts to retrieve a saved user session from `localStorage` using the key `'sesionUsuario'`. If found, it immediately calls `onLogin(datos)` to bypass the login screen.
*   It sets up a sequence of `setTimeout` calls to control the timing of the `pantallaNegra`, `expandirTarjeta`, and `mostrarFormulario` state changes, creating a staggered animation effect.

### Authentication Logic (`handleLogin`)

The `handleLogin` asynchronous function at [src/Login.jsx:34](src/Login.jsx:34) performs the core authentication:

1.  It clears any previous error messages.
2.  It queries the `usuarios` table in Supabase:
        ```javascript
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, usuario, contrasena, rol')
      .eq('usuario', usuario)
      .eq('contrasena', contrasena)
      .single();
    ```
    This query attempts to find a single user record matching the provided `usuario` and `contrasena`.
3.  **Error Handling:** If `error` is present or `data` is null, it sets an error message, triggers the `vibrar` animation, and displays "Usuario o contraseña incorrectos".
4.  **Successful Login:** If authentication is successful:
    *   `loginExitoso` is set to `true`.
    *   If `recordar` (remember me) is checked, the user's data is saved to `localStorage` as a JSON string.
    *   The `guardarLog` utility function (imported from [src/utils.js](src/utils.js)) is called to record the login event in the database.
    *   Finally, `onLogin(data)` is called after a short delay, passing the authenticated user's data to the parent component.

### UI Rendering

The `return` statement in [src/Login.jsx:60](src/Login.jsx:60) defines the visual structure of the login page.

*   **Background:** A `div` with `backgroundImage` set to `/fondo.png` provides the visual background.
*   **Animated Overlays:** `AnimatePresence` and `motion.div` from `framer-motion` are used for the initial black screen fade-out and the main card's height animation.
*   **Login Form:**
    *   Input fields for username and password are styled with Tailwind CSS and include `FiMail` and `FiLock` icons from `react-icons/fi`.
    *   The "Recordar usuario y contraseña" checkbox is implemented with an `input` and `label`.
    *   A "Iniciar Sesión" button triggers the `handleLogin` function.
    *   Error messages are displayed conditionally.

### Supabase Integration

The component imports `supabase` from [src/supabase.js](src/supabase.js). This file is expected to contain the Supabase client initialization, allowing the `Login` component to interact with the Supabase backend for authentication and data storage.

### Utility Functions

The `guardarLog` function, imported from [src/utils.js](src/utils.js), is used to log user actions, specifically successful login events. This suggests a centralized logging mechanism within the application.

