// src/modules/vendedor/ui/components/FormMisClientes.jsx
// -----------------------------------------------------------------------------
// QUÉ HACE ESTE ARCHIVO
// -----------------------------------------------------------------------------
// Formulario "Ingresar Cliente" para el sistema del vendedor.
// 
// CAPA: UI (React)
//
// BASES DE DATOS / TABLAS INVOLUCRADAS (vía casos de uso y repositorios):
// 1) Supabase → TABLA: public.hsp_resumen
//    - Columnas mínimas usadas: departamento (text), fecha (date/timestamp), hsp (numeric)
//    - Se usa para listar departamentos disponibles y para calcular el HSP del cliente
//      con base en su departamento y la fecha de creación.
//
// 2) Supabase → TABLA: public.clientes
//    - Columnas típicas: id (uuid), nombre_completo, empresa, correo, telefono, celular,
//      pais, departamento, municipio, direccion, hsp, created_at, ...
//    - **Metadatos del vendedor (recomendados para filtros por usuario):**
//        * created_by (uuid)           → auth.uid del vendedor que lo crea
//        * vendedor_id (uuid)          → igual a created_by (o a quien se asigne)
//        * vendedor_nombre (text)      → nombre para mostrar del vendedor
//    - Con estos 3 campos podrás:
//        * Filtrar: cada vendedor ve solo sus clientes (created_by = auth.uid).
//        * Permitir que el supervisor de ventas vea todos (omitiendo ese filtro en su rol).
//
// NOTA: Este componente usa casos de uso y repositorios ya creados:
//  - Repos: HspResumenSupabaseRepository, ClientesSupabaseRepository
//  - Use-cases: getDepartamentosConHsp, getHspParaCliente, createCliente
// -----------------------------------------------------------------------------

import React, { useEffect, useState } from "react";

import supabase from "../../../../supabase.js";
import { ClientesSupabaseRepository } from "../../infra/supabase/ClientesSupabaseRepository.js";
import { HspResumenSupabaseRepository } from "../../infra/supabase/HspResumenSupabaseRepository.js";

import { createCreateCliente } from "../../application/use-cases/createCliente.js";
import { createUpdateCliente } from "../../application/use-cases/updateCliente.js";
import { createGetDepartamentosConHsp } from "../../application/use-cases/getDepartamentosConHsp.js";
import { createGetHspParaCliente } from "../../application/use-cases/getHspParaCliente.js";

// -----------------------------------------------------------------------------
// COMPOSICIÓN: repositorios + casos de uso
// -----------------------------------------------------------------------------
const hspResumenRepository = new HspResumenSupabaseRepository(supabase);
const getDepartamentosConHsp = createGetDepartamentosConHsp({ hspResumenRepository });
const getHspParaCliente = createGetHspParaCliente({ hspResumenRepository });

const clientesRepository = new ClientesSupabaseRepository(supabase);
const createCliente = createCreateCliente({ clientesRepository });
const updateCliente = createUpdateCliente({ clientesRepository });

export default function FormMisClientes({
  onCancel,
  onSuccess,
  departamentos = {}, // reservado para futuras integraciones
  paisOptions = ["Guatemala"],
  onDepartamentoSelect,
  modo = "crear", // "crear" | "editar"
  cliente = null,
}) {
  const blankForm = () => ({
    nombreCompleto: "",
    empresa: "",
    correo: "",
    telefono: "",
    celular: "",
    pais: "Guatemala",
    departamento: "",
    municipio: "",
    direccion: "",
    hsp: "",
    fechaCreacion: new Date().toISOString().slice(0, 10),
  });

  const [form, setForm] = useState(blankForm());

  const [errors, setErrors] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [cargandoHsp, setCargandoHsp] = useState(false);
  const [departamentosLista, setDepartamentosLista] = useState([]);
  const [cargandoDeptos, setCargandoDeptos] = useState(true);

  // Animación de entrada
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  // ---------------------------------------------------------------------------
  // Cargar departamentos desde "hsp_resumen" (caso de uso)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelado = false;

    async function cargarDepartamentos() {
      try {
        setCargandoDeptos(true);
        const deps = await getDepartamentosConHsp();
        if (!cancelado) {
          setDepartamentosLista(deps);
        }
      } catch (err) {
        console.error("Error cargando departamentos:", err);
        if (!cancelado) setDepartamentosLista([]);
      } finally {
        if (!cancelado) setCargandoDeptos(false);
      }
    }

    cargarDepartamentos();
    return () => {
      cancelado = true;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Obtener HSP según el departamento y la fecha de creación (caso de uso)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const depto = form.departamento?.trim();
    if (!depto) {
      setForm((prev) => ({ ...prev, hsp: "" }));
      return;
    }

    let cancelado = false;

    (async () => {
      try {
        setCargandoHsp(true);
        const hsp = await getHspParaCliente({
          departamento: depto,
          fechaCreacion: form.fechaCreacion,
        });
        if (!cancelado) {
          setForm((prev) => ({
            ...prev,
            hsp: Number.isFinite(hsp) ? hsp.toFixed(2) : "",
          }));
        }
      } catch (err) {
        console.error("Error al obtener HSP:", err);
        if (!cancelado) {
          setForm((prev) => ({ ...prev, hsp: "" }));
        }
      } finally {
        if (!cancelado) setCargandoHsp(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [form.departamento, form.fechaCreacion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "departamento" && typeof onDepartamentoSelect === "function") {
      onDepartamentoSelect(value);
    }
  };

  // Rellenar datos cuando estemos en modo edicion
  useEffect(() => {
    if (modo !== "editar" || !cliente) return;
    setForm((prev) => ({
      ...prev,
      nombreCompleto: cliente.nombre_completo || cliente.nombreCompleto || "",
      empresa: cliente.empresa || "",
      correo: cliente.correo || "",
      telefono: cliente.telefono || "",
      celular: cliente.celular || "",
      pais: cliente.pais || "Guatemala",
      departamento: cliente.departamento || "",
      municipio: cliente.municipio || "",
      direccion: cliente.direccion || "",
      hsp:
        cliente.hsp != null
          ? Number(cliente.hsp).toString()
          : cliente.hsp === 0
          ? "0"
          : "",
      fechaCreacion:
        cliente.fecha_creacion ||
        cliente.fechaCreacion ||
        new Date().toISOString().slice(0, 10),
    }));
  }, [modo, cliente]);

  const validar = () => {
    const e = {};
    if (!form.nombreCompleto.trim()) e.nombreCompleto = "Requerido";
    if (!form.departamento) e.departamento = "Requerido";
    if (!form.municipio.trim()) e.municipio = "Requerido";
    if (form.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      e.correo = "Correo inválido";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ---------------------------------------------------------------------------
  // Guardar en BD usando caso de uso createCliente
  // *Ahora adjuntamos metadatos del vendedor:
  //    - created_by (uuid del auth.user)
  //    - vendedor_id (uuid del auth.user)
  //    - vendedor_nombre (texto para mostrar)
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    setEnviando(true);
    try {
      // Tomamos el usuario actual desde Supabase Auth
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      const vendedorId = authUser?.id || null;

      // Si tienes un user store con nombre, úsalo; si no, tomamos alias/email como fallback
      // (Si manejas el usuario enriquecido en contexto, puedes pasarlo por props y usarlo aquí)
      const vendedorNombre =
        (authUser?.user_metadata &&
          (authUser.user_metadata.nombreCompleto ||
            authUser.user_metadata.nombre ||
            authUser.user_metadata.alias)) ||
        authUser?.email ||
        "—";

      // Payload con los datos del formulario + metadatos de vendedor
      const payload = {
        ...form,
        created_by: vendedorId,
        vendedor_id: vendedorId,
        vendedor_nombre: vendedorNombre,
      };

      const data =
        modo === "editar" && cliente?.id
          ? await updateCliente(cliente.id, payload)
          : await createCliente(payload);

      // Limpiar campos principales (dejamos fecha igual) solo cuando creamos
      if (modo === "crear") {
        setForm((prev) => ({
          ...prev,
          nombreCompleto: "",
          empresa: "",
          correo: "",
          telefono: "",
          celular: "",
          departamento: "",
          municipio: "",
          direccion: "",
          hsp: "",
        }));
      }

      onSuccess && onSuccess(data, modo);
    } catch (err) {
      console.error(err);
      alert("Error al guardar en la base de datos.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full p-4 sm:p-6 md:p-8 bg-gradient-to-b from-[#0b1320]/80 to-[#0b1320]/90 overflow-y-auto hide-scrollbar">
      <div
        className={`w-full h-full rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] transition-all duration-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white">
              {modo === "editar" ? "Editar Cliente" : "Ingresar Cliente"}
            </h1>
            <p className="text-white/70 text-sm">
              Formulario para personal de ventas
            </p>
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-white border border-white/10 bg-white/10 hover:bg-white/15"
                disabled={enviando}
              >
                Cancelar
              </button>
            )}
            <button
              form="form-mis-clientes"
              type="submit"
              disabled={enviando}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-white border border-white/10 bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {enviando
                ? "Guardando..."
                : modo === "editar"
                ? "Guardar cambios"
                : "Guardar"}
            </button>
          </div>
        </div>

        {/* Formulario solo hasta HSP */}
        <form
          id="form-mis-clientes"
          onSubmit={handleSubmit}
          className="h-[calc(100%-120px)] overflow-y-auto hide-scrollbar p-5 sm:p-6 pb-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 *:min-w-0">
            <Input
              label="Nombre Completo"
              name="nombreCompleto"
              required
              value={form.nombreCompleto}
              onChange={handleChange}
              error={errors.nombreCompleto}
            />
            <Input
              label="Empresa"
              name="empresa"
              value={form.empresa}
              onChange={handleChange}
            />
            <Input
              label="Correo electronico (opcional)"
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              error={errors.correo}
            />
            <Input
              label="Teléfono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
            />
            <Input
              label="Celular"
              name="celular"
              value={form.celular}
              onChange={handleChange}
            />
            <Select
              label="Departamento"
              name="departamento"
              required
              options={departamentosLista}
              value={form.departamento}
              onChange={handleChange}
              error={errors.departamento}
              placeholder={cargandoDeptos ? "Cargando..." : "Seleccionar..."}
              disabled={cargandoDeptos}
            />
            <Input
              label="Municipio"
              name="municipio"
              required
              value={form.municipio}
              onChange={handleChange}
              error={errors.municipio}
            />
            <Input
              label="Dirección"
              name="direccion"
              placeholder="Calle, zona, referencia"
              value={form.direccion}
              onChange={handleChange}
            />
            <Select
              label="País"
              name="pais"
              options={paisOptions}
              value={form.pais}
              onChange={handleChange}
              disabled
            />
            <Input
              label="HSP (Horas Solar Pico)"
              name="hsp"
              placeholder="—"
              value={form.hsp}
              readOnly
              suffix={cargandoHsp ? "..." : "HSP"}
            />
          </div>
        </form>
      </div>
    </div>
  );
}

/* --------- Componentes Reutilizables --------- */

function Label({ children, required }) {
  return (
    <label className="block text-xs font-medium text-white/80 mb-1">
      {children} {required && <span className="text-rose-300">*</span>}
    </label>
  );
}

function ErrorText({ msg }) {
  if (!msg) return null;
  return <p className="mt-1 text-[11px] text-rose-300">{msg}</p>;
}

function InputBase({ className = "", children }) {
  return (
    <div
      className={[
        "relative rounded-xl border border-white/10 bg-white/10 text-white",
        "focus-within:ring-2 focus-within:ring-cyan-400/60",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  error,
  suffix,
  readOnly = false,
  ...rest
}) {
  const hasSuffix = Boolean(suffix);
  return (
    <div>
      <Label required={required}>{label}</Label>
      <InputBase>
        <input
          {...rest}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={!!error}
          readOnly={readOnly}
          className={[
            "w-full bg-transparent px-3 py-2.5 text-sm placeholder-white/60 focus:outline-none",
            hasSuffix ? "pr-12" : "",
          ].join(" ")}
        />
        {hasSuffix && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] px-2 py-0.5 rounded-lg border border-white/10 bg-white/10 text-white/80">
            {suffix}
          </span>
        )}
      </InputBase>
      <ErrorText msg={error} />
    </div>
  );
}

function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Seleccionar...",
  required = false,
  disabled = false,
  error,
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <InputBase className={disabled ? "opacity-60" : ""}>
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full bg-transparent px-3 py-2.5 text-sm focus:outline-none"
          aria-invalid={!!error}
        >
          <option value="" className="bg-[#0b1320]">
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-[#0b1320]">
              {opt}
            </option>
          ))}
        </select>
      </InputBase>
      <ErrorText msg={error} />
    </div>
  );
}
