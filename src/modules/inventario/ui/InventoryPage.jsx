// src/modules/inventario/ui/InventoryPage.jsx
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Package,
  TrendingUp,
  AlertTriangle,
  Pencil,
  Trash2,
} from "lucide-react";
import { supabase } from "../../../infra/supabase/supabaseClient";

const money = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
});

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [panelsError, setPanelsError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addCategory, setAddCategory] = useState("materiales");
  const [addError, setAddError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingCreatedAt, setEditingCreatedAt] = useState("");
  const [showMaterials, setShowMaterials] = useState(false);
  const [showPanels, setShowPanels] = useState(false);
  const [showPanelForm, setShowPanelForm] = useState(false);
  const [panelSaving, setPanelSaving] = useState(false);
  const [panelEditingId, setPanelEditingId] = useState(null);
  const [expandedSystemId, setExpandedSystemId] = useState(null);
  const [componentsBySystem, setComponentsBySystem] = useState({});
  const [loadingSystemId, setLoadingSystemId] = useState(null);
  const [errorBySystem, setErrorBySystem] = useState({});
  const [showComponentForm, setShowComponentForm] = useState(false);
  const [componentSaving, setComponentSaving] = useState(false);
  const [componentEditingId, setComponentEditingId] = useState(null);
  const [componentEditingSystemId, setComponentEditingSystemId] =
    useState(null);
  const [componentSystemId, setComponentSystemId] = useState("");
  const [systems, setSystems] = useState([]);
  const [systemsLoading, setSystemsLoading] = useState(true);
  const [systemsError, setSystemsError] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    precio_compra: "",
    precio_venta: "",
    disponibles: "",
    comentario: "",
  });
  const [panelForm, setPanelForm] = useState({
    marca: "",
    potencia_watts: "",
    tipo: "",
    precio: "",
    moneda: "",
  });
  const [panelBrandChoice, setPanelBrandChoice] = useState("");
  const [panelBrandCustom, setPanelBrandCustom] = useState("");
  const [panelTypeChoice, setPanelTypeChoice] = useState("");
  const [panelTypeCustom, setPanelTypeCustom] = useState("");
  const [componentForm, setComponentForm] = useState({
    nombre_componente: "",
    categoria: "",
    potencia_kw: "",
    precio: "",
    moneda: "",
    detalles: "",
  });
  const [panels, setPanels] = useState([]);
  const [panelsLoading, setPanelsLoading] = useState(true);

  const componentPriceFormatter = new Intl.NumberFormat("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const modalRoot = typeof document !== "undefined" ? document.body : null;

  const loadInventory = async () => {
    setLoading(true);
    setError("");

    const { data, error: queryError } = await supabase
      .from("inventario")
      .select(
        "id,nombre,precio_compra,precio_venta,disponibles,comentario,created_at"
      )
      .order("created_at", { ascending: false });

    if (queryError) {
      setError("No se pudo cargar el inventario. Intenta nuevamente.");
      setItems([]);
    } else {
      setItems(Array.isArray(data) ? data : []);
    }

    setLoading(false);
  };

  const loadPanels = async () => {
    setPanelsLoading(true);
    setPanelsError("");

    const { data, error: queryError } = await supabase
      .from("paneles")
      .select("id,marca,potencia_watts,tipo,precio,moneda,created_at")
      .order("created_at", { ascending: false });

    if (queryError) {
      setPanelsError("No se pudieron cargar los paneles. Intenta nuevamente.");
      setPanels([]);
    } else {
      setPanels(Array.isArray(data) ? data : []);
    }

    setPanelsLoading(false);
  };

  useEffect(() => {
    if (!showForm && !showPanelForm && !showComponentForm) return undefined;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const shell = document.querySelector("main");
    const originalShellOverflow = shell ? shell.style.overflow : "";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    if (shell) shell.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      if (shell) shell.style.overflow = originalShellOverflow;
    };
  }, [showForm, showPanelForm, showComponentForm]);

  useEffect(() => {
    let isMounted = true;

    const fetchInventory = async () => {
      if (!isMounted) return;
      await loadInventory();
    };

    fetchInventory();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchSystems = async () => {
      setSystemsLoading(true);
      setSystemsError("");

      const { data, error: queryError } = await supabase
        .from("sistemas_solares")
        .select("id,nombre,descripcion")
        .order("nombre", { ascending: true });

      if (!isMounted) return;

      if (queryError) {
        setSystemsError(
          "No se pudieron cargar los sistemas. Intenta nuevamente."
        );
        setSystems([]);
      } else {
        setSystems(Array.isArray(data) ? data : []);
      }

      setSystemsLoading(false);
    };

    fetchSystems();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchPanels = async () => {
      if (!isMounted) return;
      await loadPanels();
    };

    fetchPanels();

    return () => {
      isMounted = false;
    };
  }, []);

  const panelTypeOptions = useMemo(() => {
    const types = new Set();
    panels.forEach((panel) => {
      if (panel.tipo) types.add(panel.tipo);
    });
    return Array.from(types);
  }, [panels]);

  const panelBrandOptions = useMemo(() => {
    const brands = new Set();
    panels.forEach((panel) => {
      if (panel.marca) brands.add(panel.marca);
    });
    return Array.from(brands);
  }, [panels]);

  const stats = useMemo(() => {
    const total = items.length;
    const totalValue = items.reduce((acc, item) => {
      const precio = toNumber(item.precio_compra);
      const disponibles = toNumber(item.disponibles);
      return acc + precio * disponibles;
    }, 0);

    const sinStock = items.filter(
      (item) => toNumber(item.disponibles) === 0
    ).length;

    const bajoStock = items.filter((item) => {
      const disponibles = toNumber(item.disponibles);
      return disponibles > 0 && disponibles < 5;
    }).length;

    return { total, totalValue, sinStock, bajoStock };
  }, [items]);

  const getBadgeClasses = (disponibles) => {
    if (disponibles === 0) {
      return "bg-red-100 text-red-700 border-red-200";
    }
    if (disponibles < 5) {
      return "bg-orange-100 text-orange-700 border-orange-200";
    }
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  };

  const formatPanelPrice = (value, currency) => {
    const safeCurrency = currency === "Q" ? "GTQ" : currency || "GTQ";
    try {
      const formatter = new Intl.NumberFormat("es-GT", {
        style: "currency",
        currency: safeCurrency,
      });
      return formatter.format(toNumber(value));
    } catch (error) {
      const fallback = new Intl.NumberFormat("es-GT", {
        style: "currency",
        currency: "GTQ",
      });
      return fallback.format(toNumber(value));
    }
  };

  const resetForm = () => {
    setForm({
      nombre: "",
      precio_compra: "",
      precio_venta: "",
      disponibles: "",
      comentario: "",
    });
    setEditingId(null);
    setEditingCreatedAt("");
    setAddCategory("materiales");
    setAddError("");
  };

  const resetPanelForm = () => {
    setPanelForm({
      marca: "",
      potencia_watts: "",
      tipo: "",
      precio: "",
      moneda: "",
    });
    setPanelEditingId(null);
    setPanelBrandChoice("");
    setPanelBrandCustom("");
    setPanelTypeChoice("");
    setPanelTypeCustom("");
  };

  const resetComponentForm = () => {
    setComponentForm({
      nombre_componente: "",
      categoria: "",
      potencia_kw: "",
      precio: "",
      moneda: "",
      detalles: "",
    });
    setComponentEditingId(null);
    setComponentEditingSystemId(null);
    setComponentSystemId("");
  };

  const handlePanelChange = (event) => {
    const { name, value } = event.target;
    if (name === "potencia_watts") {
      setPanelForm((prev) => ({
        ...prev,
        [name]: value.replace(/[^\d]/g, ""),
      }));
      return;
    }
    if (name === "precio") {
      setPanelForm((prev) => ({
        ...prev,
        [name]: value.replace(/[^\d.]/g, ""),
      }));
      return;
    }
    setPanelForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePanelBrandSelect = (value) => {
    setPanelBrandChoice(value);
    if (value === "__other__") {
      setPanelBrandCustom("");
      setPanelForm((prev) => ({ ...prev, marca: "" }));
      return;
    }
    setPanelBrandCustom("");
    setPanelForm((prev) => ({ ...prev, marca: value }));
  };

  const handlePanelBrandCustomChange = (value) => {
    setPanelBrandCustom(value);
    setPanelForm((prev) => ({ ...prev, marca: value }));
  };

  const handlePanelTypeSelect = (value) => {
    setPanelTypeChoice(value);
    if (value === "__other__") {
      setPanelTypeCustom("");
      setPanelForm((prev) => ({ ...prev, tipo: "" }));
      return;
    }
    setPanelTypeCustom("");
    setPanelForm((prev) => ({ ...prev, tipo: value }));
  };

  const handlePanelTypeCustomChange = (value) => {
    setPanelTypeCustom(value);
    setPanelForm((prev) => ({ ...prev, tipo: value }));
  };

  const handleComponentChange = (event) => {
    const { name, value } = event.target;
    if (name === "potencia_kw") {
      setComponentForm((prev) => ({
        ...prev,
        [name]: value.replace(/[^\d.]/g, ""),
      }));
      return;
    }
    if (name === "precio") {
      setComponentForm((prev) => ({
        ...prev,
        [name]: value.replace(/[^\d.]/g, ""),
      }));
      return;
    }
    setComponentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "precio_compra" || name === "precio_venta") {
      setForm((prev) => ({ ...prev, [name]: value.replace(/[^\d.]/g, "") }));
      return;
    }
    if (name === "disponibles") {
      setForm((prev) => ({ ...prev, [name]: value.replace(/[^\d]/g, "") }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setAddError("");

    if (editingId) {
      const payload = {
        nombre: form.nombre.trim(),
        precio_compra: toNumber(form.precio_compra),
        precio_venta: toNumber(form.precio_venta),
        disponibles: toNumber(form.disponibles),
        comentario: form.comentario.trim() || null,
      };

      const { error: updateError } = await supabase
        .from("inventario")
        .update(payload)
        .eq("id", editingId);

      if (updateError) {
        setAddError("No se pudo actualizar el producto. Intenta nuevamente.");
        setSaving(false);
        return;
      }

      setShowForm(false);
      resetForm();
      await loadInventory();
      setSaving(false);
      return;
    }

    if (addCategory === "materiales") {
      const payload = {
        nombre: form.nombre.trim(),
        precio_compra: toNumber(form.precio_compra),
        precio_venta: toNumber(form.precio_venta),
        disponibles: toNumber(form.disponibles),
        comentario: form.comentario.trim() || null,
        created_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from("inventario")
        .insert([payload]);

      if (insertError) {
        setAddError("No se pudo guardar el producto. Intenta nuevamente.");
        setSaving(false);
        return;
      }

      setShowForm(false);
      resetForm();
      await loadInventory();
      setSaving(false);
      return;
    }

    if (addCategory === "paneles") {
      const payload = {
        marca: panelForm.marca.trim(),
        potencia_watts: toNumber(panelForm.potencia_watts),
        tipo: panelForm.tipo.trim() || null,
        precio: toNumber(panelForm.precio),
        moneda: panelForm.moneda.trim() || null,
        created_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from("paneles")
        .insert([payload]);

      if (insertError) {
        setAddError("No se pudo guardar el panel. Intenta nuevamente.");
        setSaving(false);
        return;
      }

      setShowForm(false);
      resetForm();
      resetPanelForm();
      await loadPanels();
      setSaving(false);
      return;
    }

    if (addCategory === "componentes") {
      if (!componentSystemId) {
        setAddError("Selecciona un sistema.");
        setSaving(false);
        return;
      }

      const payload = {
        sistema_id: componentSystemId,
        nombre_componente: componentForm.nombre_componente.trim(),
        categoria: componentForm.categoria.trim() || null,
        potencia_kw:
          componentForm.potencia_kw === ""
            ? null
            : toNumber(componentForm.potencia_kw),
        precio: toNumber(componentForm.precio),
        moneda: componentForm.moneda.trim() || null,
        detalles: componentForm.detalles.trim() || null,
      };

      const { data, error: insertError } = await supabase
        .from("componentes_sistema")
        .insert([payload])
        .select(
          "id,nombre_componente,categoria,precio,moneda,potencia_kw,detalles"
        );

      if (insertError) {
        setAddError("No se pudo guardar el componente. Intenta nuevamente.");
        setSaving(false);
        return;
      }

      if (componentsBySystem[componentSystemId] && Array.isArray(data)) {
        setComponentsBySystem((prev) => ({
          ...prev,
          [componentSystemId]: [...prev[componentSystemId], ...data],
        }));
      }

      setShowForm(false);
      resetForm();
      resetComponentForm();
      setSaving(false);
    }
  };

  const handlePanelEdit = (panel) => {
    setPanelEditingId(panel.id);
    const brandValue = panel.marca ?? "";
    const typeValue = panel.tipo ?? "";
    const hasBrandOption = panelBrandOptions.includes(brandValue);
    const hasTypeOption = panelTypeOptions.includes(typeValue);
    setPanelForm({
      marca: brandValue,
      potencia_watts: String(panel.potencia_watts ?? ""),
      tipo: typeValue,
      precio: String(panel.precio ?? ""),
      moneda: panel.moneda ?? "",
    });
    setPanelBrandChoice(brandValue ? (hasBrandOption ? brandValue : "__other__") : "");
    setPanelBrandCustom(!hasBrandOption && brandValue ? brandValue : "");
    setPanelTypeChoice(typeValue ? (hasTypeOption ? typeValue : "__other__") : "");
    setPanelTypeCustom(!hasTypeOption && typeValue ? typeValue : "");
    setShowPanelForm(true);
  };

  const handlePanelSave = async () => {
    if (!panelEditingId) return;
    setPanelSaving(true);
    setPanelsError("");

    const payload = {
      marca: panelForm.marca.trim(),
      potencia_watts: toNumber(panelForm.potencia_watts),
      tipo: panelForm.tipo.trim() || null,
      precio: toNumber(panelForm.precio),
      moneda: panelForm.moneda.trim() || null,
    };

    const { error: updateError } = await supabase
      .from("paneles")
      .update(payload)
      .eq("id", panelEditingId);

    if (updateError) {
      setPanelsError("No se pudo actualizar el panel. Intenta nuevamente.");
      setPanelSaving(false);
      return;
    }

    const { data, error: refreshError } = await supabase
      .from("paneles")
      .select("id,marca,potencia_watts,tipo,precio,moneda,created_at")
      .order("created_at", { ascending: false });

    if (refreshError) {
      setPanelsError(
        "El panel se guardo, pero no se pudo actualizar la lista."
      );
    } else {
      setPanels(Array.isArray(data) ? data : []);
    }

    setShowPanelForm(false);
    resetPanelForm();
    setPanelSaving(false);
  };

  const handleComponentEdit = (component, systemId) => {
    setComponentEditingId(component.id);
    setComponentEditingSystemId(systemId);
    setComponentForm({
      nombre_componente: component.nombre_componente ?? "",
      categoria: component.categoria ?? "",
      potencia_kw:
        component.potencia_kw == null ? "" : String(component.potencia_kw),
      precio: component.precio == null ? "" : String(component.precio),
      moneda: component.moneda ?? "",
      detalles: component.detalles ?? "",
    });
    setShowComponentForm(true);
  };

  const handleComponentSave = async () => {
    if (!componentEditingId || !componentEditingSystemId) return;
    setComponentSaving(true);
    setErrorBySystem((prev) => ({ ...prev, [componentEditingSystemId]: "" }));

    const payload = {
      nombre_componente: componentForm.nombre_componente.trim(),
      categoria: componentForm.categoria.trim() || null,
      potencia_kw:
        componentForm.potencia_kw === ""
          ? null
          : toNumber(componentForm.potencia_kw),
      precio: toNumber(componentForm.precio),
      moneda: componentForm.moneda.trim() || null,
      detalles: componentForm.detalles.trim() || null,
    };

    const { error: updateError } = await supabase
      .from("componentes_sistema")
      .update(payload)
      .eq("id", componentEditingId);

    if (updateError) {
      setErrorBySystem((prev) => ({
        ...prev,
        [componentEditingSystemId]:
          updateError.message ||
          "No se pudo actualizar el componente. Intenta nuevamente.",
      }));
      setComponentSaving(false);
      return;
    }

    setComponentsBySystem((prev) => {
      const current = prev[componentEditingSystemId] || [];
      return {
        ...prev,
        [componentEditingSystemId]: current.map((item) =>
          item.id === componentEditingId ? { ...item, ...payload } : item
        ),
      };
    });

    setShowComponentForm(false);
    resetComponentForm();
    setComponentSaving(false);
  };

  const handleToggleSystem = async (systemId) => {
    if (expandedSystemId === systemId) {
      setExpandedSystemId(null);
      return;
    }

    setExpandedSystemId(systemId);

    if (componentsBySystem[systemId]) {
      return;
    }

    setLoadingSystemId(systemId);
    setErrorBySystem((prev) => ({ ...prev, [systemId]: "" }));

    const { data, error: queryError } = await supabase
      .from("componentes_sistema")
      .select(
        "id,nombre_componente,categoria,precio,moneda,potencia_kw,detalles"
      )
      .eq("sistema_id", systemId)
      .order("categoria", { ascending: true });

    if (queryError) {
      setErrorBySystem((prev) => ({
        ...prev,
        [systemId]:
          queryError.message ||
          "No se pudieron cargar los componentes. Intenta nuevamente.",
      }));
    } else {
      setComponentsBySystem((prev) => ({
        ...prev,
        [systemId]: Array.isArray(data) ? data : [],
      }));
    }

    setLoadingSystemId(null);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditingCreatedAt(item.created_at || "");
    setForm({
      nombre: item.nombre ?? "",
      precio_compra: String(item.precio_compra ?? ""),
      precio_venta: String(item.precio_venta ?? ""),
      disponibles: String(item.disponibles ?? ""),
      comentario: item.comentario ?? "",
    });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Inventario
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Gestión de productos y materiales
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            onClick={() => {
              resetForm();
              resetPanelForm();
              resetComponentForm();
              setAddCategory("materiales");
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Agregar producto
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total productos</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {stats.total}
                </p>
              </div>
              <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Valor en inventario</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {money.format(stats.totalValue)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Productos sin stock</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {stats.sinStock}
                </p>
              </div>
              <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Bajo stock</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {stats.bajoStock}
                </p>
              </div>
              <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Materiales para instalaciones
              </h2>
              <p className="text-sm text-slate-500">
                Lista de materiales registrados
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              onClick={() => setShowMaterials((prev) => !prev)}
            >
              {showMaterials ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          {showMaterials && (
            <>
              {loading && (
            <div className="px-6 pb-6 text-sm text-slate-500">
              Cargando inventario...
            </div>
              )}

              {error && !loading && (
            <div className="px-6 pb-6 text-sm text-red-600">{error}</div>
              )}

              {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Nombre</th>
                    <th className="px-6 py-3">Precio compra</th>
                    <th className="px-6 py-3">Precio venta</th>
                    <th className="px-6 py-3">Disponibles</th>
                    <th className="px-6 py-3">Comentario</th>
                    <th className="px-6 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const disponibles = toNumber(item.disponibles);
                    const precioCompra = toNumber(item.precio_compra);
                    const precioVenta = toNumber(item.precio_venta);

                    return (
                      <tr
                        key={item.id}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {item.nombre}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {money.format(precioCompra)}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {money.format(precioVenta)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getBadgeClasses(
                              disponibles
                            )}`}
                          >
                            {disponibles}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {item.comentario || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              title="Editar"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              title="Eliminar"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                              onClick={() => {}}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {items.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-6 text-center text-sm text-slate-500"
                      >
                        No hay productos registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
              )}
            </>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Paneles solares
              </h2>
              <p className="text-sm text-slate-500">
                Lista de paneles registrados
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              onClick={() => setShowPanels((prev) => !prev)}
            >
              {showPanels ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          {showPanels && (
            <>
              {panelsLoading && (
                <div className="px-6 pb-6 text-sm text-slate-500">
                  Cargando paneles...
                </div>
              )}

              {panelsError && !panelsLoading && (
                <div className="px-6 pb-6 text-sm text-red-600">
                  {panelsError}
                </div>
              )}

              {!panelsLoading && !panelsError && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-6 py-3">Marca</th>
                        <th className="px-6 py-3">Potencia (W)</th>
                        <th className="px-6 py-3">Tipo</th>
                        <th className="px-6 py-3">Precio</th>
                        <th className="px-6 py-3">Moneda</th>
                        <th className="px-6 py-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {panels.map((panel) => (
                        <tr
                          key={panel.id}
                          className="border-t border-slate-100 hover:bg-slate-50"
                        >
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {panel.marca}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {toNumber(panel.potencia_watts)}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {panel.tipo || "—"}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {formatPanelPrice(panel.precio, panel.moneda)}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {panel.moneda || "—"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                title="Editar"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                                onClick={() => handlePanelEdit(panel)}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                title="Eliminar"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                                onClick={() => {}}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {panels.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-6 text-center text-sm text-slate-500"
                          >
                            No hay paneles registrados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-6 space-y-6">
          {systemsLoading && (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-500 shadow-sm">
              Cargando sistemas...
            </div>
          )}

          {systemsError && !systemsLoading && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700 shadow-sm">
              {systemsError}
            </div>
          )}

          {!systemsLoading &&
            !systemsError &&
            systems.map((system) => {
            const isExpanded = expandedSystemId === system.id;
            const systemComponents = componentsBySystem[system.id] || [];
            const systemError = errorBySystem[system.id];
            const isLoading = loadingSystemId === system.id;

            return (
              <div
                key={system.id}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {system.nombre}
                    </h2>
                    <p className="text-sm text-slate-500">
                      Componentes compatibles
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    onClick={() => handleToggleSystem(system.id)}
                  >
                    {isExpanded ? "Ocultar" : "Mostrar"}
                  </button>
                </div>

                {isExpanded && (
                  <>
                    {isLoading && (
                      <div className="px-6 pb-6 text-sm text-slate-500">
                        Cargando componentes...
                      </div>
                    )}

                    {systemError && !isLoading && (
                      <div className="mx-6 mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {systemError}
                      </div>
                    )}

                    {!isLoading && !systemError && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                              <th className="px-6 py-3">Componente</th>
                              <th className="px-6 py-3">Categoria</th>
                              <th className="px-6 py-3">Potencia</th>
                              <th className="px-6 py-3">Precio</th>
                              <th className="px-6 py-3">Detalles</th>
                              <th className="px-6 py-3">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {systemComponents.map((component) => (
                              <tr
                                key={component.id}
                                className="border-t border-slate-100 hover:bg-slate-50"
                              >
                                <td className="px-6 py-4 font-medium text-slate-900">
                                  {component.nombre_componente}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                  {component.categoria || "—"}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                  {component.potencia_kw == null
                                    ? "—"
                                    : `${toNumber(component.potencia_kw)} kW`}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                  {(component.moneda || "—") +
                                    " " +
                                    componentPriceFormatter.format(
                                      toNumber(component.precio)
                                    )}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                  {component.detalles || "—"}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      title="Editar"
                                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                                      onClick={() =>
                                        handleComponentEdit(component, system.id)
                                      }
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      title="Eliminar"
                                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                                      onClick={() => {}}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}

                            {systemComponents.length === 0 && (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="px-6 py-6 text-center text-sm text-slate-500"
                                >
                                  No hay componentes
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showForm &&
        modalRoot &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
            <div className="w-full max-w-2xl">
              <div className="max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      {editingId ? "Editar producto" : "Agregar producto"}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {editingId
                        ? "Actualiza la informacion del producto."
                        : "Completa los datos para registrar un nuevo producto."}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-medium text-slate-500 hover:text-slate-700"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                  >
                    Cerrar
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {!editingId && (
                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium text-slate-600">
                        Categoria
                      </label>
                      <select
                        name="categoria"
                        value={addCategory}
                        onChange={(event) => setAddCategory(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                      >
                        <option value="materiales">
                          Materiales para instalaciones
                        </option>
                        <option value="paneles">Paneles solares</option>
                        <option value="componentes">Componentes de sistema</option>
                      </select>
                    </div>
                  )}

                  {(editingId || addCategory === "materiales") && (
                    <>
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-slate-600">
                          Nombre
                        </label>
                        <input
                          type="text"
                          name="nombre"
                          value={form.nombre}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                          placeholder="Ej. Panel solar 450W"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Precio de compra
                        </label>
                        <input
                          type="text"
                          name="precio_compra"
                          value={form.precio_compra}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Precio de venta
                        </label>
                        <input
                          type="text"
                          name="precio_venta"
                          value={form.precio_venta}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Disponibles
                        </label>
                        <input
                          type="text"
                          name="disponibles"
                          value={form.disponibles}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                          placeholder="0"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-slate-600">
                          Comentario
                        </label>
                        <textarea
                          name="comentario"
                          value={form.comentario}
                          onChange={handleChange}
                          rows={3}
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                          placeholder="Detalle adicional"
                        />
                      </div>
                    </>
                  )}

                  {addCategory === "paneles" && !editingId && (
                    <>
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-slate-600">
                          Marca
                        </label>
                        <select
                          name="marca"
                          value={panelForm.marca}
                          onChange={handlePanelChange}
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                        >
                          <option value="">Selecciona una marca</option>
                          {panelBrandOptions.map((marca) => (
                            <option key={marca} value={marca}>
                              {marca}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Potencia (W)
                        </label>
                        <input
                          type="text"
                          name="potencia_watts"
                          value={panelForm.potencia_watts}
                          onChange={handlePanelChange}
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Tipo
                        </label>
                        <select
                          name="tipo"
                          value={panelForm.tipo}
                          onChange={handlePanelChange}
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                        >
                          <option value="">Selecciona un tipo</option>
                          {panelTypeOptions.map((tipo) => (
                            <option key={tipo} value={tipo}>
                              {tipo}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Precio
                        </label>
                        <input
                          type="text"
                          name="precio"
                          value={panelForm.precio}
                          onChange={handlePanelChange}
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Moneda
                        </label>
                        <input
                          type="text"
                          name="moneda"
                          value={panelForm.moneda}
                          onChange={handlePanelChange}
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                          placeholder="GTQ"
                        />
                      </div>
                    </>
                  )}

                  {addCategory === "componentes" && !editingId && (
                    <>
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-slate-600">
                          Sistema
                        </label>
                        <select
                          name="sistema"
                          value={componentSystemId}
                          onChange={(event) =>
                            setComponentSystemId(event.target.value)
                          }
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                        >
                          <option value="">Selecciona un sistema</option>
                          {systems.map((system) => (
                            <option key={system.id} value={system.id}>
                              {system.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-slate-600">
                          Componente
                        </label>
                        <input
                          type="text"
                          name="nombre_componente"
                          value={componentForm.nombre_componente}
                          onChange={handleComponentChange}
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                          placeholder="Ej. Inversor"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Categoria
                        </label>
                        <input
                          type="text"
                          name="categoria"
                          value={componentForm.categoria}
                          onChange={handleComponentChange}
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                          placeholder="Control"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Potencia (kW)
                        </label>
                        <input
                          type="text"
                          name="potencia_kw"
                          value={componentForm.potencia_kw}
                          onChange={handleComponentChange}
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Precio
                        </label>
                        <input
                          type="text"
                          name="precio"
                          value={componentForm.precio}
                          onChange={handleComponentChange}
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Moneda
                        </label>
                        <input
                          type="text"
                          name="moneda"
                          value={componentForm.moneda}
                          onChange={handleComponentChange}
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                          placeholder="GTQ"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-slate-600">
                          Detalles
                        </label>
                        <textarea
                          name="detalles"
                          value={componentForm.detalles}
                          onChange={handleComponentChange}
                          rows={3}
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                          placeholder="Detalle adicional"
                        />
                      </div>
                    </>
                  )}
                </div>

                {addError && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {addError}
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          modalRoot
        )}

      {showPanelForm &&
        modalRoot &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
            <div className="w-full max-w-2xl">
              <div className="max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      Editar panel solar
                    </h3>
                    <p className="text-sm text-slate-500">
                      Actualiza la informacion del panel.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-medium text-slate-500 hover:text-slate-700"
                    onClick={() => {
                      setShowPanelForm(false);
                      resetPanelForm();
                    }}
                  >
                    Cerrar
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-slate-600">
                      Marca
                    </label>
                    <input
                      type="text"
                      name="marca"
                      value={panelForm.marca}
                      onChange={handlePanelChange}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                      placeholder="Ej. Trina Solar"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Potencia (W)
                    </label>
                    <input
                      type="text"
                      name="potencia_watts"
                      value={panelForm.potencia_watts}
                      onChange={handlePanelChange}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Tipo
                    </label>
                    <input
                      type="text"
                      name="tipo"
                      value={panelForm.tipo}
                      onChange={handlePanelChange}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                      placeholder="Monocristalino"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Precio
                    </label>
                    <input
                      type="text"
                      name="precio"
                      value={panelForm.precio}
                      onChange={handlePanelChange}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Moneda
                    </label>
                    <input
                      type="text"
                      name="moneda"
                      value={panelForm.moneda}
                      onChange={handlePanelChange}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                      placeholder="GTQ"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    onClick={() => {
                      setShowPanelForm(false);
                      resetPanelForm();
                    }}
                    disabled={panelSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                    onClick={handlePanelSave}
                    disabled={panelSaving}
                  >
                    {panelSaving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          modalRoot
        )}

      {showComponentForm &&
        modalRoot &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
            <div className="w-full max-w-2xl">
              <div className="max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      Editar componente
                    </h3>
                    <p className="text-sm text-slate-500">
                      Actualiza la informacion del componente.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-medium text-slate-500 hover:text-slate-700"
                    onClick={() => {
                      setShowComponentForm(false);
                      resetComponentForm();
                    }}
                  >
                    Cerrar
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-slate-600">
                      Componente
                    </label>
                    <input
                      type="text"
                      name="nombre_componente"
                      value={componentForm.nombre_componente}
                      onChange={handleComponentChange}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                      placeholder="Ej. Inversor"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Categoria
                    </label>
                    <input
                      type="text"
                      name="categoria"
                      value={componentForm.categoria}
                      onChange={handleComponentChange}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                      placeholder="Control"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Potencia (kW)
                    </label>
                    <input
                      type="text"
                      name="potencia_kw"
                      value={componentForm.potencia_kw}
                      onChange={handleComponentChange}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Precio
                    </label>
                    <input
                      type="text"
                      name="precio"
                      value={componentForm.precio}
                      onChange={handleComponentChange}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Moneda
                    </label>
                    <input
                      type="text"
                      name="moneda"
                      value={componentForm.moneda}
                      onChange={handleComponentChange}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                      placeholder="GTQ"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-slate-600">
                      Detalles
                    </label>
                    <textarea
                      name="detalles"
                      value={componentForm.detalles}
                      onChange={handleComponentChange}
                      rows={3}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                      placeholder="Detalle adicional"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    onClick={() => {
                      setShowComponentForm(false);
                      resetComponentForm();
                    }}
                    disabled={componentSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                    onClick={handleComponentSave}
                    disabled={componentSaving}
                  >
                    {componentSaving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          modalRoot
        )}
    </div>
  );
};

export default InventoryPage;
