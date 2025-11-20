/* -----------------------------------------------------------------------------
// 🌞 NIMBUS SOLAR — MÓDULO DE AUTORIZACIONES (Supervisor)
// -----------------------------------------------------------------------------
// Archivo: Autorizaciones.jsx
// Rol de usuario principal: SUPERVISOR (aunque el vendedor puede ver sus propias
//                            cotizaciones en modo solo lectura).
// -----------------------------------------------------------------------------
// 🔁 Resumen del flujo completo
// -----------------------------------------------------------------------------
// 1) El VENDEDOR arma la cotización en su formulario:
//      - Selecciona paneles y componentes desde la vista v_catalogo_items
//        (que ya trae precios reales).
//      - Los ítems se guardan en la tabla cotizaciones_aprobacion.items como
//        un arreglo JSON con estructura similar a:
//          [
//            {
//              key:   "pan-xxxx",
//              tipo:  "panel" | "inversor" | "batería" | ...,
//              refid: "<uuid del panel o componente>",
//              qty:   4,
//              titulo:  "Trina Solar 620W",
//              detalle: "620 W bifacial",
//              busqueda: "Trina 620W"
//            },
//            ...
//          ]
//      - La cotización se guarda con estado "borrador" o "pendiente".
//
// 2) Este módulo de AUTORIZACIONES se encarga de:
//      - Listar las cotizaciones en estado "pendiente" o "enviada".
//      - Permitir que el supervisor las revise a detalle.
//      - Autorizar o rechazar la cotización (cambio de estado).
//      - Registrar quién la revisó y, si se rechaza, guardar un comentario.
//
// -----------------------------------------------------------------------------
// 📦 Tablas y vistas de base de datos que usa este módulo
// -----------------------------------------------------------------------------
//
// 1) Tabla: public.cotizaciones_aprobacion
//    • Origen REAL de las cotizaciones.
//    • Campos relevantes que usamos aquí (lectura o escritura):
//        - id                (uuid)      → identificador de la cotización
//        - cliente_id        (uuid)      → FK a clientes
//        - sistema_id        (uuid)      → FK a sistemas_solares
//        - kw_dia            (numeric)   → consumo diario (kWh/día)
//        - items             (jsonb)     → detalle de artículos de la cotización
//        - consumos          (jsonb)     → consumos originales (si los hay)
//        - consumo_stats     (jsonb)     → { meses, promedioDiario, promedioMensual }
//        - estado            (text)      → 'borrador', 'pendiente', 'enviada',
//                                          'autorizada', 'rechazada', etc.
//        - monto             (numeric)   → monto base calculado (sin IVA/tarjeta)
//        - codigo            (text)      → código de la cotización (ej. CTZ-000020)
//        - fecha             (date)      → fecha de la cotización
//        - vendedor_nombre   (text)      → nombre del vendedor
//        - vendedor_id / vendedor_uid   → referencia al usuario vendedor
//        - supervisor_id     (uuid / bigint, según diseño)
//        - supervisor_nombre (text)
//        - comentario_rechazo(text, nullable)
//        - fecha_autorizacion(timestamptz)
//        - created_by        (uuid, default auth.uid())
//        - created_at / updated_at (timestamptz)
//
//    • ESTE COMPONENTE ESCRIBE en:
//        - estado
//        - supervisor_id
//        - supervisor_nombre
//        - comentario_rechazo (solo si estado = 'rechazada')
//        - fecha_autorizacion
//        - updated_at
//
//    • ESTE COMPONENTE LEE los ítems desde la VISTA (ver punto 2),
//      pero las actualizaciones se hacen siempre contra cotizaciones_aprobacion.
//
// -----------------------------------------------------------------------------
//
// 2) Vista: public.v_cotizaciones_autorizacion
//    *** VISTA CREADA ESPECÍFICAMENTE PARA ESTE MÓDULO ***
//
//    • Propósito: concentrar en una sola consulta TODO lo que el supervisor
//      necesita ver, evitando múltiples queries desde React.
//
//    • Origen de datos:
//        - FROM   cotizaciones_aprobacion c
//        - LEFT JOIN clientes        cli ON cli.id = c.cliente_id
//        - LEFT JOIN sistemas_solares s  ON s.id  = c.sistema_id
//
//    • Campos principales que expone y que el componente usa:
//        - id, codigo, estado, fecha
//        - monto_calculado      (alias de c.monto o cálculo desde items)
//        - items                (jsonb)  → copia de c.items
//        - vendedor_uid         → para filtrar si el usuario es rol "ventas"
//        - vendedor_nombre
//
//      Datos del cliente (tomados de public.clientes):
//        - cliente_id
//        - cliente_nombre       (cli.nombre_completo)
//        - cliente_correo       (cli.correo)
//        - cliente_telefono     (cli.telefono o cli.celular)
//        - cliente_pais         (cli.pais)
//        - cliente_departamento (cli.departamento)
//        - cliente_municipio    (cli.municipio)
//        - cliente_direccion    (cli.direccion)
//        - hsp                  (cli.hsp)
//
//      Datos de consumo (derivados de consumo_stats de la tabla):
//        - consumo_kwh_dia      (promedioDiario)
//        - consumo_kwh_mes      (promedioMensual)
//        - consumos_meses       (arreglo/objeto con meses y kWh)
//
//      Datos del sistema propuesto (public.sistemas_solares):
//        - sistema_id
//        - nombre_sistema       (s.nombre)
//        - tipo_sistema         (si lo definiste en la vista)
//        - descripcion_sistema  (s.descripcion)
//
//    • Filtro que aplicamos desde React:
//        - Solo se traen estados IN ('pendiente', 'enviada').
//        - Si el usuario logueado tiene rol "ventas", filtramos además por
//          v_cotizaciones_autorizacion.vendedor_uid = auth.user.id
//          para que el vendedor solo vea sus propias cotizaciones.
//
// -----------------------------------------------------------------------------
//
// 3) Tablas auxiliares usadas para precios unitarios
// -----------------------------------------------------------------------------
//
// Aunque el PRECIO UNITARIO se define realmente desde el catálogo del
// VENDEDOR, en este módulo volvemos a leerlo desde tablas base para asegurar
// que coincida con el catálogo actual.
//
// 3.1) public.paneles
//      - id           (uuid)
//      - marca        (text)
//      - potencia_watts (int)
//      - tipo         (text)  → ej. "Monocristalino Bifacial"
//      - precio       (numeric)
//      - moneda       (text)
//      - potencia_kw  (numeric, opcional)
//
//      Aquí construimos un mapa en memoria tipo:
//          priceById[panel.id] = panel.precio
//
// 3.2) public.componentes_sistema
//      - id               (uuid)
//      - sistema_id       (uuid)     → relación con sistemas_solares
//      - nombre_componente(text)
//      - categoria        (text)     → inversor, batería, estructura, etc.
//      - precio           (numeric)
//      - moneda           (text)
//      - detalles         (text)
//      - potencia_kw      (numeric, opcional)
//
//      También lo convertimos en mapa de precios:
//          priceById[componente.id] = componente.precio
//
//    • Uso en el frontend:
//        - Recorremos los items de la cotización (coming from v_cotizaciones_autorizacion.items).
//        - Tomamos it.refid (uuid del panel o componente).
//        - Buscamos su precio en priceById[refid].
//        - Complementamos cada item con:
//              it.precio  = precio unitario real
//              it.cantidad = it.qty
//              total = cantidad * precio
//
// -----------------------------------------------------------------------------
// 🔐 Autenticación y permisos
// -----------------------------------------------------------------------------
// - Se usa supabase.auth.getUser() para obtener el user.id.
// - Si el usuario tiene rol "ventas":
//        • Solo ve sus propias cotizaciones en esta pantalla
//          (filtro por vendedor_uid).
//        • A nivel de UI, normalmente el vendedor no debería autorizar/rechazar.
// - Si el usuario tiene rol "supervisor" (o similar):
//        • Puede ver todas las cotizaciones pendientes/enviadas.
//        • Puede cambiar estado a "autorizada" o "rechazada".
//        • Debe escribir comentario_rechazo cuando marca "rechazada".
//
// -----------------------------------------------------------------------------
// 🧮 Qué calcula este componente en el frontend (SOLO VISUAL)
// -----------------------------------------------------------------------------
// - Subtotal a partir de items:         sum(cantidad * precio).
// - % ganancia configurable (porcGanancia) → calcula gananciaQ.
// - % tarjeta (porcTarjeta)                → recargo por pago con tarjeta.
// - % IVA (porcIVA)                        → calcula ivaQ sobre la base.
// - Total final mostrado en pantalla:      subtotal + ganancia + tarjeta + IVA.
//   ⚠ Estos cálculos son solo para revisión visual, no se están guardando
//     todavía en la base de datos.
//
// -----------------------------------------------------------------------------
// ✅ Acciones que este módulo realiza sobre la BD
// -----------------------------------------------------------------------------
// - Actualiza cotizaciones_aprobacion (por id) con:
//      • estado = 'autorizada' o 'rechazada'
//      • supervisor_id
//      • supervisor_nombre
//      • comentario_rechazo (solo si estado = 'rechazada')
//      • fecha_autorizacion = now()
//      • updated_at         = now()
//
// - La información de cliente, consumo y sistema proviene SIEMPRE de la vista
//   v_cotizaciones_autorizacion. Este componente NO modifica esas tablas
//   (clientes, sistemas_solares, etc.) desde aquí.
//
// ----------------------------------------------------------------------------- */
import React, { useEffect, useMemo, useState } from "react";
import supabase from "../../../../supabase";
import generarCotizacionPDF from "../../../../utils/pdf/generarCotizacionPDF";
import { FileText } from "lucide-react";
// -----------------------------------------------------------------------------
// 💰 HELPERS DE FORMATEO Y UTILIDADES
// -----------------------------------------------------------------------------

// Formatear número como moneda en quetzales
const money = (v) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  }).format(Number(v || 0));

// Sumar un arreglo de números
const sum = (arr) => arr.reduce((a, b) => a + Number(b || 0), 0);

// Resolver nombre del vendedor usando varios posibles campos de la vista
function resolveVendedorNombre(row) {
  const candidatos = [
    row.vendedor_nombre,
    row.vendedor_nombre_completo,
    row.vendedorName,
    row.vendedorNombre,
    row.vendedorNombreCompleto,
    row.creado_por_nombre,
    row.creado_por_name,
  ];

  const nombreValido = candidatos.find(
    (valor) => typeof valor === "string" && valor.trim().length > 0
  );

  return nombreValido || "-";
}

// -----------------------------------------------------------------------------
// 🔎 HIDRATAR ÍTEMS CON PRECIOS DESDE LA BD (paneles + componentes_sistema)
// -----------------------------------------------------------------------------
// Esta función toma el json de "items" que viene en cotizaciones_aprobacion
// y le agrega:
//  - cantidad   (qty, cantidad, cant, etc.)
//  - precio     (lo busca en paneles / componentes_sistema por id)
// -----------------------------------------------------------------------------
async function hydrateItemsWithPrices(rawItems) {
  const items = Array.isArray(rawItems) ? rawItems : [];

  console.log("🔍 Items crudos que vienen de la BD:", items);

  // Detectar el ID real del artículo (uuid) a partir del item
  const getRefId = (it) => {
    if (!it) return null;

    // 1) Lo ideal: que ya venga como refid
    if (it.refid) return it.refid;

    // 2) Otros nombres posibles
    if (it.id_articulo) return it.id_articulo;
    if (it.articulo_id) return it.articulo_id;

    // 3) Intentar extraer un uuid de la clave "key"
    //    Ejemplo: "pan-e7239386-d780-44b7-a3c9-42d57053bd92"
    if (typeof it.key === "string") {
      const uuidMatch = it.key.match(
        /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
      );
      if (uuidMatch) return uuidMatch[0];
    }

    return null;
  };

  // Sacamos ids de paneles y de otros componentes
  const panelIds = [
    ...new Set(
      items
        .filter((it) => (it.tipo || "").toLowerCase() === "panel")
        .map(getRefId)
        .filter(Boolean)
    ),
  ];

  const compIds = [
    ...new Set(
      items
        .filter((it) => (it.tipo || "").toLowerCase() !== "panel")
        .map(getRefId)
        .filter(Boolean)
    ),
  ];

  console.log("🧾 panelIds encontrados:", panelIds);
  console.log("🧾 compIds encontrados:", compIds);

  const priceById = {};

  // ---------------------- PANELes ----------------------
  if (panelIds.length > 0) {
    const { data: paneles, error } = await supabase
      .from("paneles")
      .select("id, precio")
      .in("id", panelIds);

    if (error) {
      console.error("❌ Error cargando precios de paneles:", error);
    } else {
      console.log("✅ Paneles encontrados para precios:", paneles);
      (paneles || []).forEach((p) => {
        priceById[p.id] = Number(p.precio || 0);
      });
    }
  }

  // ---------------- COMPONENTES_SISTEMA ----------------
  if (compIds.length > 0) {
    const { data: componentes, error } = await supabase
      .from("componentes_sistema")
      .select("id, precio")
      .in("id", compIds);

    if (error) {
      console.error("❌ Error cargando precios de componentes:", error);
    } else {
      console.log("✅ Componentes encontrados para precios:", componentes);
      (componentes || []).forEach((c) => {
        priceById[c.id] = Number(c.precio || 0);
      });
    }
  }

  console.log("📦 Mapa priceById final:", priceById);

  // ------------------ DEVOLVER ÍTEMS LIMPIOS ------------------
  const itemsFinales = items.map((itRaw) => {
    const it =
      typeof itRaw === "string"
        ? (() => {
            try {
              return JSON.parse(itRaw);
            } catch {
              return {};
            }
          })()
        : itRaw || {};

    const tipo = (it.tipo || "").toLowerCase();
    const refid = getRefId(it);

    // Cantidad: tomamos el primer campo que exista
    const cantidad = Number(
      it.cantidad ?? it.qty ?? it.cant ?? it.unidades ?? 0
    );

    // Precio: primero si ya viene, si no, tratamos de buscarlo en priceById
    let precio = Number(
      it.precio ?? it.precio_unitario ?? it.precio_catalogo ?? 0
    );

    if (!precio && refid && priceById[refid] != null) {
      precio = Number(priceById[refid] || 0);
    }

    return {
      tipo,
      articulo:
        it.articulo || it.titulo || it.nombre || it.busqueda || "Artículo",
      detalle: it.detalle ?? it.descripcion ?? "",
      refid,
      cantidad,
      precio,
    };
  });

  console.log("✅ Items finales con cantidad y precio:", itemsFinales);

  return itemsFinales;
}

// -----------------------------------------------------------------------------
// 🧩 COMPONENTE PRINCIPAL: Autorizaciones
// -----------------------------------------------------------------------------

export default function Autorizaciones({ user }) {
  // ---------------------------------------------------------------------------
  // 🧠 ESTADOS GENERALES
  // ---------------------------------------------------------------------------
  const [rows, setRows] = useState([]); // Lista de cotizaciones
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filtroGeneral, setFiltroGeneral] = useState("");
  const [modoFiltro, setModoFiltro] = useState("vendedor"); // 'vendedor' | 'cliente'

  // ---------------------------------------------------------------------------
  // 🧠 ESTADOS DEL MODAL DE REVISIÓN
  // ---------------------------------------------------------------------------
  const [editId, setEditId] = useState(null); // ahora guarda aprob_id
  const [editRow, setEditRow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [comentario, setComentario] = useState(""); // solo si se rechaza
  const [generacionPrevista, setGeneracionPrevista] = useState("");

  // ---------------------------------------------------------------------------
  // 🧠 ESTADOS DE PORCENTAJES (SOLO VISTA)
  // ---------------------------------------------------------------------------
  const [porcGanancia, setPorcGanancia] = useState(0);
  const [porcTarjeta, setPorcTarjeta] = useState(0);
  const [porcIVA, setPorcIVA] = useState(12); // IVA 12% por defecto

  // Rangos configurados en BD (ganancia, IVA, tarjeta por rango de monto)
  const [rangosConfig, setRangosConfig] = useState([]);

  // Flags para saber si el supervisor ya tocó los porcentajes a mano
  const [gananciaEditadaManualmente, setGananciaEditadaManualmente] =
    useState(false);
  const [ivaEditadoManualmente, setIvaEditadoManualmente] = useState(false);
  const [tarjetaEditadaManualmente, setTarjetaEditadaManualmente] =
    useState(false);

  const estadosFiltrados = useMemo(() => ["pendiente", "enviada", "aprobada"], []);

  const rowsFiltrados = useMemo(() => {
    const termino = filtroGeneral.trim().toLowerCase();

    return rows.filter((row) => {
      const campoEspecifico =
        modoFiltro === "cliente"
          ? String(row.clienteLabel || "")
          : String(row.vendedorLabel || "");

      const coincideCampo =
        !termino || campoEspecifico.toLowerCase().includes(termino);

      const coincideBusquedaGeneral =
        !termino ||
        [row.codigo, row.tipo_sistema, row.estado, campoEspecifico]
          .map((campo) => String(campo || "").toLowerCase())
          .some((campo) => campo.includes(termino));

      return coincideBusquedaGeneral && coincideCampo;
    });
  }, [rows, filtroGeneral, modoFiltro]);

  const rowsOrdenados = useMemo(() => {
    return [...rowsFiltrados].sort((a, b) => {
      const fechaA = new Date(a.fecha || 0).getTime();
      const fechaB = new Date(b.fecha || 0).getTime();
      return fechaB - fechaA;
    });
  }, [rowsFiltrados]);

  // ---------------------------------------------------------------------------
  // 🔄 CARGAR COTIZACIONES DESDE LA VISTA
  // ---------------------------------------------------------------------------
  const cargar = async () => {
    setLoading(true);
    setErr("");

    try {
      const rol = String(user?.rol || "").toLowerCase();
      const { data: authData } = await supabase.auth.getUser();
      const authUid = authData?.user?.id || null;

      let query = supabase
        .from("v_cotizaciones_autorizacion")
        .select(
          `
          aprob_id,
          codigo,
          estado,
          fecha,
          monto_calculado,
          items,
          vendedor_uid,
          vendedor_nombre,
          cliente_id,
          cliente_nombre,
          cliente_correo,
          cliente_telefono,
          cliente_pais,
          cliente_departamento,
          cliente_municipio,
          cliente_direccion,
          hsp,
          generacion_prevista,
          consumo_kwh_dia,
          consumo_kwh_mes,
          consumos_meses,
          comentario_incluy,
          sistema_id,
          nombre_sistema,
          tipo_sistema,
          descripcion_sistema,
          comentario_rechazo
        `
        )
        .in("estado", estadosFiltrados)
        .order("fecha", { ascending: false });

      // Si soy vendedor, solo veo mis cotizaciones
      if (rol === "ventas" && authUid) {
        query = query.eq("vendedor_uid", authUid);
      }

      const { data, error } = await query;
      if (error) throw error;

      const mapped =
        (data || []).map((r) => ({
          ...r,
          aprob_id: r.aprob_id,
          estado: String(r.estado || "").toLowerCase(),
          vendedorLabel: r.vendedor_nombre
            ? String(r.vendedor_nombre)
            : resolveVendedorNombre(r),
          monto: Number(
            r.monto ??
              r.monto_total ??
              r.monto_final ??
              r.monto_calculado ??
              0
          ),
          comentario_incluye:
            r.comentario_incluye ?? r.comentario_incluy ?? null,
          tipo_sistema: r.tipo_sistema || "—",
          clienteLabel: r.cliente_nombre
            ? String(r.cliente_nombre)
            : "—",
          generacion_prevista: r.generacion_prevista ?? null,
          items: Array.isArray(r.items) ? r.items : [],
        })) || [];

      setRows(mapped);
      console.log("Autorizaciones cargadas:", mapped.length);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error cargando cotizaciones.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar cotizaciones al montar
  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // 🔄 CARGAR RANGOS DE CONFIGURACIÓN DESDE BD
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const cargarRangos = async () => {
      const { data, error } = await supabase
        .from("config_rangos_cotizacion")
        .select("*")
        .eq("activo", true)
        .order("rango_min", { ascending: true });

      if (error) {
        console.error("Error cargando rangos de cotización:", error);
        return;
      }

      setRangosConfig(data || []);
    };

    cargarRangos();
  }, []);

  // ---------------------------------------------------------------------------
  // 🪟 ABRIR / CERRAR MODAL
  // ---------------------------------------------------------------------------
  const abrir = async (row) => {
    // usamos el id real de cotizaciones_aprobacion
    setEditId(row.aprob_id);

    // Resetear flags de edición manual cada vez que abrimos
    setGananciaEditadaManualmente(false);
    setIvaEditadoManualmente(false);
    setTarjetaEditadaManualmente(false);

    // Porcentajes por defecto (se sobreescribirán por los rangos si existen)
    setPorcGanancia(Number(row.porc_ganancia || 35));
    setPorcTarjeta(Number(row.porc_tarjeta || 19.29));
    setPorcIVA(Number(row.porc_iva || 12));
    setComentario(row.comentario_rechazo || "");
    setGeneracionPrevista(row.generacion_prevista || "");

    // Hidratamos items con precios reales
    const itemsConPrecio = await hydrateItemsWithPrices(row.items || []);

    setEditRow({
      ...row,
      items: itemsConPrecio,
    });
  };

  const cerrar = () => {
    setEditId(null);
    setEditRow(null);
    setPorcGanancia(0);
    setPorcTarjeta(0);
    setPorcIVA(12);
    setComentario("");
    setGananciaEditadaManualmente(false);
    setIvaEditadoManualmente(false);
    setTarjetaEditadaManualmente(false);
    setGeneracionPrevista("");
  };

  // ---------------------------------------------------------------------------
  // 📐 CÁLCULOS DE MONTOS
  // ---------------------------------------------------------------------------
  const recomputeMonto = (items) =>
    sum(items.map((it) => Number(it.cantidad || 0) * Number(it.precio || 0)));

  const subtotal = editRow ? recomputeMonto(editRow.items || []) : 0;
  const gananciaQ = subtotal * (Number(porcGanancia) / 100 || 0);
  const subtotalConGanancia = subtotal + gananciaQ;
  const tarjetaQ = subtotalConGanancia * (Number(porcTarjeta) / 100 || 0);
  const ivaBase = subtotalConGanancia + tarjetaQ;
  const ivaQ = ivaBase * (Number(porcIVA) / 100 || 0);
  const totalFinal = ivaBase + ivaQ;

  // ---------------------------------------------------------------------------
  // 🧮 OBTENER RANGO ADECUADO SEGÚN SUBTOTAL Y APLICAR PORCENTAJES
  // ---------------------------------------------------------------------------

  const obtenerRangoParaSubtotal = (subtotalValor) => {
    if (!subtotalValor || isNaN(subtotalValor) || rangosConfig.length === 0)
      return null;

    const rangoEncontrado = rangosConfig.find((r) => {
      const min = Number(r.rango_min);
      const max = Number(r.rango_max);
      return subtotalValor >= min && subtotalValor <= max;
    });

    if (rangoEncontrado) return rangoEncontrado;

    const ordenados = [...rangosConfig].sort(
      (a, b) => Number(a.rango_min) - Number(b.rango_min)
    );

    if (subtotalValor < Number(ordenados[0].rango_min)) {
      return ordenados[0];
    }

    return ordenados[ordenados.length - 1];
  };

  // Cada vez que cambie el subtotal o los rangos, aplicamos porcentajes automáticos
  useEffect(() => {
    if (!editRow) return;
    if (!subtotal || subtotal <= 0) return;
    if (!rangosConfig || rangosConfig.length === 0) return;

    const rango = obtenerRangoParaSubtotal(subtotal);
    if (!rango) return;

    if (!gananciaEditadaManualmente) {
      setPorcGanancia(Number(rango.porcentaje_ganancia) || 0);
    }
    if (!ivaEditadoManualmente) {
      setPorcIVA(Number(rango.porcentaje_iva) || 0);
    }
    if (!tarjetaEditadaManualmente) {
      setPorcTarjeta(Number(rango.porcentaje_tarjeta) || 0);
    }
  }, [
    subtotal,
    rangosConfig,
    editRow,
    gananciaEditadaManualmente,
    ivaEditadoManualmente,
    tarjetaEditadaManualmente,
  ]);

  // ---------------------------------------------------------------------------
  // 💾 GUARDAR REVISIÓN (sin cambiar estado)
  // ---------------------------------------------------------------------------
  const guardar = async () => {
    if (!editRow) return;
    setSaving(true);
    try {
      const payload = {
        supervisor_id: user?.id ? Number(user.id) : null,
        supervisor_nombre: user?.nombreCompleto || user?.nombre || null,
        updated_at: new Date().toISOString(),

        // 🔹 Resumen numérico de la cotización en el momento de la revisión
        subtotal_items: Number(subtotal) || 0,

        porc_ganancia: Number(porcGanancia) || 0,
        ganancia_q: Number(gananciaQ) || 0,

        porc_iva: Number(porcIVA) || 0,
        iva_q: Number(ivaQ) || 0,

        porc_tarjeta: Number(porcTarjeta) || 0,
        tarjeta_q: Number(tarjetaQ) || 0,

        monto: Number(totalFinal) || 0,
        comentario_incluy: editRow?.comentario_incluye || null,
        generacion_prevista:
          generacionPrevista !== ""
            ? Number(generacionPrevista)
            : null,
      };

      const { error } = await supabase
        .from("cotizaciones_aprobacion")
        .update(payload)
        .eq("id", editRow.aprob_id); // 👈 usamos el id real de la tabla

      if (error) throw error;

      await cargar();
      cerrar();
    } catch (e) {
      alert(e.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 🔁 CAMBIAR ESTADO (rechazar / aprobar)
  // ---------------------------------------------------------------------------
  const cambiarEstado = async (nuevoEstado) => {
    if (!editRow) return;

    if (nuevoEstado === "rechazada" && !comentario.trim()) {
      alert("Por favor escribe un comentario del motivo de rechazo.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        estado: nuevoEstado,
        supervisor_id: user?.id ? Number(user.id) : null,
        supervisor_nombre: user?.nombreCompleto || user?.nombre || null,
        fecha_autorizacion: new Date().toISOString(),
        updated_at: new Date().toISOString(),

        // 🔹 Guardamos todos los datos del resumen
        subtotal_items: Number(subtotal) || 0,

        porc_ganancia: Number(porcGanancia) || 0,
        ganancia_q: Number(gananciaQ) || 0,

        porc_iva: Number(porcIVA) || 0,
        iva_q: Number(ivaQ) || 0,

        porc_tarjeta: Number(porcTarjeta) || 0,
        tarjeta_q: Number(tarjetaQ) || 0,
        monto: Number(totalFinal) || 0,
        comentario_incluy: editRow?.comentario_incluye || null,
        generacion_prevista:
          generacionPrevista !== ""
            ? Number(generacionPrevista)
            : null,
      };

      // el comentario SOLO se guarda si es rechazada
      if (nuevoEstado === "rechazada") {
        payload.comentario_rechazo = comentario.trim() || null;
      }

      const { error } = await supabase
        .from("cotizaciones_aprobacion")
        .update(payload)
        .eq("id", editRow.aprob_id); // 👈 igual, usamos aprob_id

      if (error) throw error;

      await cargar();
      cerrar();
    } catch (e) {
      alert(e.message || "No se pudo actualizar el estado.");
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 📄 DESCARGAR PDF (solo para cotizaciones aprobadas)
  // ---------------------------------------------------------------------------
  const handleDescargarPDF = async (row) => {
    try {
      // Solo por seguridad, no hacemos nada si no está aprobada
      if (String(row.estado).toLowerCase() !== "aprobada") return;

      // 1) Armar objeto cliente con los datos de la vista
      const cliente = {
        nombre: row.cliente_nombre || "Cliente sin nombre",
        correo: row.cliente_correo || "",
        pais: row.cliente_pais || "",
        municipio: row.cliente_municipio || "",
        direccion: row.cliente_direccion || "",
        hsp: row.hsp || "",
        capacidad_generacion: row.generacion_prevista ?? null,
      };

      // 2) Tipo de instalación usando los datos del sistema
      const tipoInstalacion = {
        nombreSistema: row.nombre_sistema || row.tipo_sistema || "Sistema solar",
        descripcion:
          row.descripcion_sistema ||
          "Sistema propuesto según la cotización.",
      };

      // 3) Items con precio y cantidad
      //    (reutilizamos la lógica de hydrateItemsWithPrices)
      const itemsConPrecio = await hydrateItemsWithPrices(row.items || []);

      const items = itemsConPrecio.map((it) => ({
        descripcion: it.articulo + (it.detalle ? ` - ${it.detalle}` : ""),
        cantidad: Number(it.cantidad || 0),
        precio: Number(it.precio || 0),
      }));

      const subtotalCalculado = items.reduce(
        (acc, it) => acc + Number(it.cantidad || 0) * Number(it.precio || 0),
        0
      );

      let resumenDb = null;
      try {
        const { data: dataResumen, error: errorResumen } = await supabase
          .from("cotizaciones_aprobacion")
          .select(
            `
            monto,
            subtotal_items,
            porc_ganancia,
            ganancia_q,
            porc_tarjeta,
            tarjeta_q,
            porc_iva,
            iva_q
          `
          )
          .eq("id", row.aprob_id)
          .single();

        if (errorResumen) throw errorResumen;
        resumenDb = dataResumen;
      } catch (fetchResumenError) {
        console.warn(
          "No se pudo recuperar el resumen financiero de la cotizacion:",
          fetchResumenError
        );
      }

      const resumenMontos = {
        subtotal: Number(resumenDb?.subtotal_items ?? subtotalCalculado),
        ganancia: Number(resumenDb?.ganancia_q ?? 0),
        tarjeta: Number(resumenDb?.tarjeta_q ?? 0),
        iva: Number(resumenDb?.iva_q ?? 0),
        total: Number(
          resumenDb?.monto ??
            row.monto ??
            row.monto_calculado ??
            subtotalCalculado
        ),
      };

      if (!resumenMontos.total || resumenMontos.total <= 0) {
        resumenMontos.total = subtotalCalculado;
      }

      const sumaParcial =
        resumenMontos.subtotal + resumenMontos.ganancia + resumenMontos.tarjeta;

      if (
        (!resumenMontos.iva || resumenMontos.iva < 0) &&
        resumenMontos.total > 0
      ) {
        resumenMontos.iva = Math.max(resumenMontos.total - sumaParcial, 0);
      }

      // 4) Llamar a tu generador de PDF con el molde profesional
      await generarCotizacionPDF({
        cliente,
        tipoInstalacion,
        items,
        comentarioIncluye:
          row.comentario_incluye ?? row.comentario_incluy ?? "",
        numeroCotizacion: row.codigo || "SIN-CODIGO",
        fecha: row.fecha
          ? String(row.fecha).slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        resumen: resumenMontos,
      });
    } catch (e) {
      console.error("Error generando PDF de cotización:", e);
      alert("No se pudo generar el PDF de la cotización.");
    }
  };

  // ---------------------------------------------------------------------------
  // 🗓️ MESES DE CONSUMO (para el recuadro del modal)
  // ---------------------------------------------------------------------------
  let mesesConsumo = [];

  if (editRow && editRow.consumos_meses) {
    const origen = editRow.consumos_meses;

    if (Array.isArray(origen)) {
      mesesConsumo = origen
        .map((m) => ({
          nombre: m.nombre || m.mes || "",
          kwh: Number(m.kwh ?? m.valor ?? m.kwh_mes ?? 0),
        }))
        .filter((m) => m.nombre);
    } else if (typeof origen === "object") {
      mesesConsumo = Object.entries(origen).map(([clave, valor]) => ({
        nombre: clave,
        kwh: Number(valor || 0),
      }));
    }
  }

  // =====================================================================
  // ========================  BLOQUE PRINCIPAL  =========================
  // =====================================================================

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white">
            Autorizaciones
          </h1>
          <p className="text-white/70 text-sm">
            Cotizaciones pendientes (y enviadas) para revisión del supervisor.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-1 text-xs text-white/80">
            <input
              type="radio"
              name="modoFiltro"
              value="vendedor"
              checked={modoFiltro === "vendedor"}
              onChange={() => setModoFiltro("vendedor")}
              className="text-amber-400 focus:ring-amber-400"
            />
            Vendedor
          </label>
          <label className="flex items-center gap-1 text-xs text-white/80">
            <input
              type="radio"
              name="modoFiltro"
              value="cliente"
              checked={modoFiltro === "cliente"}
              onChange={() => setModoFiltro("cliente")}
              className="text-amber-400 focus:ring-amber-400"
            />
            Cliente
          </label>
          <input
            type="text"
            value={filtroGeneral}
            onChange={(e) => setFiltroGeneral(e.target.value)}
            placeholder={`Buscar por ${modoFiltro === "cliente" ? "cliente" : "vendedor"}...`}
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
          />

          <button
            onClick={cargar}
            className="text-sm px-3 py-2 rounded-lg border border-white/10 bg-white/10 text-white hover:bg-white/15"
          >
            Recargar
          </button>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur p-4 overflow-x-auto">
        {loading ? (
          <div className="text-white/80 text-sm">Cargando…</div>
        ) : err ? (
          <div className="text-rose-300 text-sm">{String(err)}</div>
        ) : rowsOrdenados.length === 0 ? (
          <div className="text-white/70 text-sm">
            No hay cotizaciones pendientes/enviadas.
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-[#0b1320]/80 backdrop-blur border-b border-white/10">
              <tr className="text-left text-white/85">
                <th className="px-3 py-2">Código</th>
                <th className="px-3 py-2">Vendedor</th>
                <th className="px-3 py-2">Cliente</th>
                <th className="px-3 py-2">Tipo de sistema</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2 text-right">Monto</th>
                {/* NUEVO: columna para el icono de PDF */}
                <th className="px-3 py-2 text-center">PDF</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rowsOrdenados.map((r, i) => (
                <tr
                  key={r.aprob_id} // 👈 usamos aprob_id como key
                  className={i % 2 ? "bg-white/5" : "bg-transparent"}
                >
                  <td className="px-3 py-2 text-white">{r.codigo}</td>
                  <td className="px-3 py-2 text-white/90">
                    {r.vendedorLabel}
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-white/85">{r.clienteLabel || "—"}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-white/80">{r.tipo_sistema || "—"}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-[11px] font-medium border ${
                        r.estado === "pendiente"
                          ? "bg-amber-400/15 text-amber-200 border-amber-300/30"
                          : "bg-cyan-400/15 text-cyan-200 border-cyan-300/30"
                      }`}
                    >
                      {r.estado}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-white/80">
                    {r.fecha ? String(r.fecha).slice(0, 10) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-white/90">
                      {money(r.monto || 0)}
                    </td>

                    {/* NUEVO: Icono de PDF, solo si la cotización está aprobada */}
                    <td className="px-3 py-2 text-center">
                      {String(r.estado).toLowerCase() === "aprobada" ? (
                        <button
                          onClick={() => handleDescargarPDF(r)}
                          className="inline-flex items-center justify-center p-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition"
                          title="Descargar PDF"
                        >
                          <FileText className="w-4 h-4 text-amber-300" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-white/30">—</span>
                      )}
                    </td>

                    <td className="px-3 py-2 text-right">
                      {String(r.estado).toLowerCase() !== "aprobada" ? (
                        <button
                          onClick={() => abrir(r)}
                          className="text-[11px] px-3 py-1 rounded border border-white/10 text-white/90 bg-white/10 hover:bg-white/20"
                        >
                          Revisión
                        </button>
                      ) : (
                        <span className="text-[11px] text-white/30">-</span>
                      )}
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ================================================================= */}
      {/* ======================  BLOQUE DETALLE (MODAL)  ================= */}
      {/* ================================================================= */}

      {editId && editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !saving && cerrar()}
          />
          <div
            className="relative z-10 w-full max-w-5xl rounded-3xl overflow-hidden border border-white/10 bg-[#0b1320] text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER MODAL */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between gap-4">
              <div className="flex flex-col items-center justify-center flex-1 text-center">
                <h3 className="text-lg font-semibold">
                  {editRow.codigo} · {resolveVendedorNombre(editRow)}
                </h3>
                <p className="text-white/60 text-sm">
                  Estado actual: <b>{editRow.estado}</b>
                </p>
              </div>
              <button
                className="px-3 py-1 rounded bg-white/10 border border-white/10 ml-4"
                onClick={() => !saving && cerrar()}
              >
                Cerrar
              </button>
            </div>

            {/* CONTENIDO MODAL */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar">
              {/* INFO GENERAL */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {/* CLIENTE */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <h4 className="text-xs font-semibold text-white/80 mb-2">
                    Cliente
                  </h4>
                  <p className="text-sm font-semibold text-center">
                    {editRow.cliente_nombre || "Nombre del cliente"}
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    Correo:{" "}
                    <span className="font-medium">
                      {editRow.cliente_correo || "—"}
                    </span>
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    Teléfono:{" "}
                    <span className="font-medium">
                      {editRow.cliente_telefono || "—"}
                    </span>
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    País:{" "}
                    <span className="font-medium">
                      {editRow.cliente_pais || "—"}
                    </span>
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    Depto / Municipio:{" "}
                    <span className="font-medium">
                      {editRow.cliente_departamento || "—"}{" "}
                      {editRow.cliente_municipio
                        ? `/ ${editRow.cliente_municipio}`
                        : ""}
                    </span>
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    Dirección:{" "}
                    <span className="font-medium">
                      {editRow.cliente_direccion || "—"}
                    </span>
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    HSP:{" "}
                    <span className="font-medium">
                      {editRow.hsp ?? "—"}
                    </span>
                  </p>
                </div>

                {/* CONSUMO REGISTRADO */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex flex-col items-center text-center">
                  <h4 className="text-xs font-semibold text-white/80 mb-3">
                    Consumo registrado
                  </h4>

                  <div className="flex items-start justify-center gap-6 w-full mb-3">
                    <div className="flex flex-col items-center">
                      <p className="text-[11px] text-white/60">kWh/día</p>
                      <p className="text-lg font-semibold text-white/90">
                        {editRow.consumo_kwh_dia ?? "—"}
                      </p>
                    </div>

                    <div className="flex flex-col items-center">
                      <p className="text-[11px] text-white/60">kWh/mes</p>
                      <p className="text-lg font-semibold text-white/90">
                        {editRow.consumo_kwh_mes ?? "—"}
                      </p>
                    </div>
                  </div>

                  {mesesConsumo.length > 0 && (
                    <div className="mt-2 w-full">
                      <p className="text-[11px] text-white/60 mb-1 text-center">
                        Meses registrados
                      </p>

                      <div className="flex flex-wrap justify-center gap-2">
                        {mesesConsumo.map((m, idx) => (
                          <div
                            key={`${m.nombre}-${idx}`}
                            className="px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white/80 text-xs flex flex-col items-center shadow-sm"
                          >
                            <span className="font-semibold text-white">
                              {m.nombre}
                            </span>
                            <span className="text-white/60 text-[11px]">
                              {m.kwh} kWh
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* SISTEMA PROPUESTO */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex flex-col items-center text-center">
                  <h4 className="text-xs font-semibold text-white/80 mb-3 text-center">
                    Sistema propuesto
                  </h4>
                  <p className="text-[13px] font-semibold text-white mb-2">
                    {editRow.nombre_sistema ||
                      editRow.tipo_sistema ||
                      "—"}
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {editRow.descripcion_sistema ||
                      "Sistema propuesto según la cotización."}
                  </p>
                </div>
              </div>

              {/* Generación prevista */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 mt-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/60">
                      Sistema capacitado para generar
                    </p>
                    <p className="text-sm text-white/80">
                      Ingresa la generación prevista (kWh) para este sistema.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={generacionPrevista}
                      onChange={(e) => setGeneracionPrevista(e.target.value)}
                      className="w-40 rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-amber-300/60"
                      placeholder="kWh"
                    />
                    <span className="text-xs text-white/60">kWh</span>
                  </div>
                </div>
              </div>

              {/* TABLA ÍTEMS */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <h4 className="text-sm font-semibold text-white mb-3">
                  Artículos de la cotización
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-white/80 border-b border-white/10">
                        <th className="px-2 py-2">Tipo</th>
                        <th className="px-2 py-2">Artículo</th>
                        <th className="px-2 py-2">Detalle</th>
                        <th className="px-2 py-2 text-right">Cant.</th>
                        <th className="px-2 py-2 text-right">
                          Precio unit.
                        </th>
                        <th className="px-2 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editRow.items.map((it, idx) => (
                        <tr key={idx} className="border-b border-white/5">
                          <td className="px-2 py-2">{it.tipo}</td>
                          <td className="px-2 py-2">{it.articulo}</td>
                          <td className="px-2 py-2">{it.detalle}</td>
                          <td className="px-2 py-2 text-right">
                            {Number(it.cantidad ?? 0)}
                          </td>
                          <td className="px-2 py-2 text-right">
                            {Number(it.precio ?? 0).toFixed(2)}
                          </td>
                          <td className="px-2 py-2 text-right">
                            {money(
                              Number(it.cantidad) * Number(it.precio)
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td
                          colSpan={5}
                          className="px-2 py-3 text-right font-semibold text-xs sm:text-sm"
                        >
                          Subtotal ítems:
                        </td>
                        <td className="px-2 py-3 text-right font-semibold">
                          {money(subtotal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* RESUMEN Y PORCENTAJES */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <h4 className="text-sm font-semibold text-white">
                  Resumen y porcentajes
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {/* Subtotal */}
                  <div className="rounded-xl bg-black/20 border border-white/10 p-3 flex flex-col items-center justify-center text-center space-y-1">
                    <p className="text-white/60">Subtotal (ítems)</p>
                    <p className="text-lg font-semibold">
                      {money(subtotal)}
                    </p>
                  </div>

                  {/* % Ganancia */}
                  <div className="rounded-xl bg-black/20 border border-white/10 p-3 flex flex-col items-center justify-center text-center space-y-2">
                    <span className="text-white/60">% ganancia</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={porcGanancia}
                      onChange={(e) => {
                        setGananciaEditadaManualmente(true);
                        const val = Number(e.target.value);
                        setPorcGanancia(isNaN(val) ? 0 : val);
                      }}
                      className="w-20 text-center text-lg font-semibold text-white bg-transparent border border-transparent focus:border-white/30 focus:bg-white/5 rounded px-1 py-0.5 outline-none transition-colors"
                    />
                    <p className="text-white/60">
                      Ganancia:{" "}
                      <span className="font-semibold text-white">
                        {money(gananciaQ)}
                      </span>
                    </p>
                  </div>

                  {/* % IVA */}
                  <div className="rounded-xl bg-black/20 border border-white/10 p-3 flex flex-col items-center justify-center text-center space-y-2">
                    <span className="text-white/60">% IVA</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={porcIVA}
                      onChange={(e) => {
                        setIvaEditadoManualmente(true);
                        const val = Number(e.target.value);
                        setPorcIVA(isNaN(val) ? 0 : val);
                      }}
                      className="w-20 text-center text-lg font-semibold text-white bg-transparent border border-transparent focus:border-white/30 focus:bg-white/5 rounded px-1 py-0.5 outline-none transition-colors"
                    />
                    <p className="text-white/60">
                      IVA:{" "}
                      <span className="font-semibold text-white">
                        {money(ivaQ)}
                      </span>
                    </p>
                  </div>

                  {/* % Tarjeta */}
                  <div className="rounded-xl bg-black/20 border border-white/10 p-3 flex flex-col items-center justify-center text-center space-y-2">
                    <span className="text-white/60">% tarjeta</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={porcTarjeta}
                      onChange={(e) => {
                        setTarjetaEditadaManualmente(true);
                        const val = Number(e.target.value);
                        setPorcTarjeta(isNaN(val) ? 0 : val);
                      }}
                      className="w-24 text-center text-lg font-semibold text-white bg-transparent border border-transparent focus:border-white/30 focus:bg-white/5 rounded px-1 py-0.5 outline-none transition-colors"
                    />
                    <p className="text-white/60">
                      Recargo tarjeta:{" "}
                      <span className="font-semibold text-white">
                        {money(tarjetaQ)}
                      </span>
                    </p>
                  </div>

                  {/* Total final vista */}
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-300/40 p-4 flex flex-col items-center justify-center text-center space-y-1 sm:col-span-2 md:col-span-4">
                    <p className="text-white/70 text-xs">
                      Total final (vista)
                    </p>
                    <p className="text-2xl font-bold text-emerald-200">
                      {money(totalFinal)}
                    </p>
                    <p className="text-[11px] text-white/60" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-xs text-white/70 mb-1" htmlFor="comentario-incluye">
                    Qué incluye la compra (comentario informativo)
                  </label>
                  <textarea
                    id="comentario-incluye"
                    rows={3}
                    className="w-full rounded-xl bg-black/30 border border-white/15 px-3 py-2 text-xs text-white placeholder:text-white/30 resize-none"
                    placeholder="Ejemplo: incluye instalación, garantías, mantenimiento preventivo, monitoreo..."
                    value={
                      editRow?.comentario_incluye ??
                      editRow?.que_incluye ??
                      ""
                    }
                    onChange={(e) => {
                      if (!editRow) return;
                      setEditRow({ ...editRow, comentario_incluye: e.target.value });
                    }}
                  />
                </div>
              </div>

              {/* COMENTARIO DE RECHAZO */}
              <div className="rounded-2xl border border-rose-300/30 bg-rose-500/5 p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-white">
                    Comentario de rechazo
                  </h4>
                  <span className="text-[11px] text-white/70">
                    Solo se guarda si la cotización se marca como{" "}
                    <span className="font-semibold text-rose-200">
                      rechazada
                    </span>
                    .
                  </span>
                </div>
                <textarea
                  rows={3}
                  className="w-full rounded-xl bg-black/30 border border-white/15 px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-rose-300/60"
                  placeholder="Escribe aquí el motivo del rechazo (obligatorio al rechazar)..."
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                />
              </div>
            </div>

            {/* FOOTER MODAL */}
            <div className="px-4 pt-3 pb-14 border-t border-white/10 flex flex-wrap gap-2 justify-end">
              <button
                disabled={saving}
                onClick={() => cambiarEstado("rechazada")}
                className="px-4 py-2 rounded border border-rose-300/30 bg-rose-400/15 text-rose-200 hover:bg-rose-400/25"
              >
                Rechazar
              </button>
              <button
                disabled={saving}
                onClick={() => cambiarEstado("aprobada")}
                className="px-4 py-2 rounded border border-emerald-300/30 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25"
              >
                Autorizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

