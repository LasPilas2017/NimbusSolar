import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Upload, FileText, Download, X } from "lucide-react";
import { jsPDF } from "jspdf";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist/legacy/build/pdf";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";
import supabase from "../../../../supabase";
import { FacturaPDFLayout } from "../../../../utils/pdf/generarFacturaPDF";

GlobalWorkerOptions.workerSrc = pdfjsWorker;

const ESTADO_OBJETIVO = "aprobada";
const FACTURAS_BUCKET = "facturas";
const FEL_EXTRACTION_URL = process.env.REACT_APP_FEL_EXTRACTION_URL;
const PDF_QUALITY = 0.6;
const PDF_MAX_CANVAS_WIDTH = 900; // px en canvas antes de dibujar
const PDF_SIZE_THRESHOLD = 2 * 1024 * 1024; // comprimir > 2MB

const createInitialFacturaState = () => ({
  numero_autorizacion: "",
  serie: "",
  numero_dte: "",
  fecha_emision: new Date().toISOString().slice(0, 10),
  pdf_url: "",
  nit_receptor: "",
  nombre_receptor: "",
});

const money = (value) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
  }).format(Number(value || 0));

const parseItems = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      return [];
    }
  }
  return [];
};

const getItemQuantity = (item) => {
  if (!item || typeof item !== "object") return 0;
  const candidates = [
    item.qty,
    item.cantidad,
    item.cant,
    item.quantity,
    item.count,
  ];
  const found = candidates.find(
    (value) => value !== undefined && value !== null && value !== ""
  );
  return Number(found || 0);
};

const getItemTitle = (item) =>
  (item?.titulo ||
    item?.nombre ||
    item?.detalle ||
    item?.descripcion ||
    "Articulo sin nombre");

const getItemDetail = (item) =>
  item?.detalle || item?.descripcion || item?.comentario || "";

const getItemUnitPrice = (item) =>
  Number(
    item?.precio ??
      item?.precio_unitario ??
      item?.monto_unitario ??
      item?.unitario ??
      0
  );

const buildPreviewItems = (row) => {
  const rawItems = Array.isArray(row?.items) ? row.items : [];
  if (rawItems.length === 0) {
    return [
      {
        descripcion: `Factura ${row?.codigo || "Cotizacion"}`,
        cantidad: 1,
        precio: Number(row?.monto || 0),
      },
    ];
  }

  return rawItems.map((item, index) => {
    const cantidad = getItemQuantity(item) || 1;
    const precio = getItemUnitPrice(item) || 0;
    const title = getItemTitle(item);
    const detail = getItemDetail(item);
    const descripcion = detail ? `${title} - ${detail}` : title;
    return {
      descripcion,
      cantidad,
      precio,
      key: item?.key || item?.refid || `preview-item-${index}`,
    };
  });
};

const computeResumen = (items, fallbackMonto = 0) => {
  const subtotal = items.reduce(
    (acc, item) => acc + Number(item.cantidad || 0) * Number(item.precio || 0),
    0
  );
  const base = subtotal || Number(fallbackMonto || 0);
  return {
    subtotal: base,
    ganancia: 0,
    tarjeta: 0,
    iva: 0,
    total: base,
  };
};

const formatDateDisplay = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("es-GT", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatKwhValue = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return null;
  return `${numeric.toFixed(2)} kWh`;
};

const FacturaPreviewCard = ({ selectedRow, factura }) => {
  if (!selectedRow) {
    return (
      <div className="text-sm text-white/60">
        Selecciona una cotizaci?n para ver la vista previa de la factura.
      </div>
    );
  }

  const hasExtractedData = [
    factura?.numero_autorizacion,
    factura?.serie,
    factura?.numero_dte,
    factura?.fecha_emision,
    factura?.nit_receptor,
    factura?.nombre_receptor,
  ].some((value) => Boolean((value || "").trim()));

  if (!hasExtractedData) {
    return (
      <div className="text-sm text-white/60">
        Carga un PDF FEL para previsualizar la factura con el estilo oficial.
      </div>
    );
  }

  const {
    numero_autorizacion,
    serie,
    numero_dte,
    fecha_emision,
    nit_receptor,
    nombre_receptor,
  } = factura;

    const isoDate =
    fecha_emision || new Date().toISOString().slice(0, 10);

  const previewCliente = {
    nombre: selectedRow.cliente_nombre,
    correo: nombre_receptor || selectedRow.cliente_correo || "",
    pais: selectedRow.cliente_pais || "Guatemala",
    municipio: selectedRow.cliente_municipio || "",
    direccion: selectedRow.cliente_direccion || "",
    hsp: selectedRow.hsp || nit_receptor || "",
  };

  const previewTipoInstalacion = {
    nombreSistema: selectedRow.nombre_sistema || "",
    tipoSistema: selectedRow.tipo_sistema || "",
    descripcion: selectedRow.descripcion_sistema || "",
  };

  const previewItems = buildPreviewItems(selectedRow);
  const previewResumen = computeResumen(previewItems, selectedRow.monto);
  const comentarioIncluye =
    selectedRow.comentario_cotizacion ||
    selectedRow.comentario_incluye ||
    selectedRow.comentario_incluy ||
    "Detalle de compra según cotización.";

  return (
    <div className="rounded-2xl border border-white/15 bg-black/30 p-3">
      <div className="overflow-hidden rounded-xl bg-white/90 flex justify-center">
        <div
          style={{
            width: "826px",
            height: "750px",
            transform: "scale(0.7)",
            transformOrigin: "top center",
          }}
        >
          <FacturaPDFLayout
            cliente={previewCliente}
            tipoInstalacion={previewTipoInstalacion}
            items={previewItems}
            numeroFactura={numero_dte || selectedRow.codigo}
            fecha={isoDate}
            resumen={previewResumen}
            comentarioIncluye={comentarioIncluye}
            datosFel={{
              numero_autorizacion,
              serie,
              numero_dte,
              fecha_emision,
              nombre_receptor,
              nit_receptor,
            }}
          />
        </div>
      </div>
      <p className="text-[11px] text-white/60 mt-2">
        Vista previa reducida del diseño final de la factura. Los datos definitivos se basan en la información
        cargada del FEL.
      </p>
    </div>
  );
};

const compressPdfFile = async (file) => {
  if (!file) return null;
  if (typeof window === "undefined" || typeof document === "undefined") {
    return file;
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const compressedDoc = new jsPDF({ unit: "pt", format: "a4", compress: true });

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const scale = Math.min(PDF_MAX_CANVAS_WIDTH / viewport.width, 1);
    const scaledViewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    await page.render({ canvasContext: context, viewport: scaledViewport }).promise;

    const dataUrl = canvas.toDataURL("image/jpeg", PDF_QUALITY);
    if (pageNumber > 1) {
      compressedDoc.addPage();
    }

    const pageWidth = compressedDoc.internal.pageSize.getWidth();
    const pageHeight = compressedDoc.internal.pageSize.getHeight();

    let drawWidth = pageWidth;
    let drawHeight = (canvas.height / canvas.width) * drawWidth;

    if (drawHeight > pageHeight) {
      const reduction = pageHeight / drawHeight;
      drawHeight = pageHeight;
      drawWidth *= reduction;
    }

    const x = (pageWidth - drawWidth) / 2;
    const y = (pageHeight - drawHeight) / 2;

    compressedDoc.addImage(dataUrl, "JPEG", x, y, drawWidth, drawHeight);
  }

  const blob = compressedDoc.output("blob");
  return new File([blob], file.name, { type: "application/pdf" });
};

const optimizePdfFile = async (file) => {
  if (!file) return null;
  if (file.size <= PDF_SIZE_THRESHOLD) return file;
  try {
    return await compressPdfFile(file);
  } catch (error) {
    console.warn("No se pudo comprimir el PDF, se usa el original.", error);
    return file;
  }
};

const normalizeFelDate = (dateString) => {
  if (!dateString) return "";
  const trimmed = dateString.trim();
  const datePart = trimmed.split(/\s+/)[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;

  const numericMatch = datePart.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (numericMatch) {
    const [, day, month, year] = numericMatch;
    return `${year}-${month}-${day}`;
  }

  const monthNames = {
    ENE: "01",
    FEB: "02",
    MAR: "03",
    ABR: "04",
    MAY: "05",
    JUN: "06",
    JUL: "07",
    AGO: "08",
    SEP: "09",
    OCT: "10",
    NOV: "11",
    DIC: "12",
  };
  const wordMatch = datePart.match(/^(\d{2})[\/\-]([A-Z]{3})[\/\-](\d{4})$/i);
  if (wordMatch) {
    const [, day, wordMonth, year] = wordMatch;
    const month = monthNames[wordMonth.toUpperCase()] || "01";
    return `${year}-${month}-${day}`;
  }

  return datePart;
};

const sanitizeFelText = (value = "") =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .toUpperCase();

const extractUuid = (text) => {
  const match = text.match(
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i
  );
  return match ? match[0].toUpperCase() : "";
};

const isUuid = (value = "") =>
  /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(
    value.trim()
  );

const parseFelDataFromText = (text) => {
  if (!text) return null;
  const sanitized = sanitizeFelText(text);
  const numeroAutorizacionMatch = sanitized.match(
    /NUMERO\s+DE\s+AUTORIZACION[::]?\s*([A-Z0-9-]+)/
  );
  const serieMatch = sanitized.match(/SERIE[::]?\s*([A-Z0-9-]+)/);
  const numeroDTEMatch = sanitized.match(
    /NUMERO\s+DE\s+DTE[::]?\s*([A-Z0-9-]+)/
  );
  const fechaEmisionMatch = sanitized.match(
    /FECHA(?:\s+Y\s+HORA)?\s+DE\s+EMISION[::]?\s*([A-Z0-9\s:\/-]+)/
  );
  const nitReceptorMatch = sanitized.match(
    /NIT\s+(?:DEL\s+)?RECEPTOR[::]?\s*([A-Z0-9-]+)/
  );
  const nombreReceptorMatch = sanitized.match(
    /NOMBRE\s+(?:DEL\s+)?RECEPTOR[::]?\s*([A-Z0-9\s,&.\-]{3,80})/
  );

    if (
    !numeroAutorizacionMatch &&
    !serieMatch &&
    !numeroDTEMatch &&
    !fechaEmisionMatch &&
    !nitReceptorMatch &&
    !nombreReceptorMatch
  ) {
    return null;
  }

  const uuidFallback = extractUuid(text);
  const candidateNumero = (numeroAutorizacionMatch?.[1] || "").trim();
  const numeroAutorizacion = isUuid(candidateNumero)
    ? candidateNumero
    : uuidFallback || candidateNumero;

  return {
    numero_autorizacion: numeroAutorizacion || "",
    serie: (serieMatch?.[1] || "").trim(),
    numero_dte: (numeroDTEMatch?.[1] || "").trim(),
    fecha_emision: normalizeFelDate(fechaEmisionMatch?.[1] || ""),
    nit_receptor: (nitReceptorMatch?.[1] || "").trim(),
    nombre_receptor: (nombreReceptorMatch?.[1] || "").trim(),
  };
};

const extractFelDataLocally = async (file) => {
  if (!file) return null;
  if (typeof window === "undefined") return null;

  const buffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: buffer }).promise;
  let combinedText = "";

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    combinedText += `${pageText}\n`;
  }

  return parseFelDataFromText(combinedText);
};

export default function OrdenesCompra() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");

  const [selectedRow, setSelectedRow] = useState(null);
  const [facturaId, setFacturaId] = useState(null);
  const [facturaForm, setFacturaForm] = useState(createInitialFacturaState);
  const [archivo, setArchivo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [cargandoFactura, setCargandoFactura] = useState(false);
  const [extrayendoPdf, setExtrayendoPdf] = useState(false);
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);

  const hasFacturaPreviewData = useMemo(() => {
    if (!selectedRow) return false;
    const campos = [
      "numero_autorizacion",
      "serie",
      "numero_dte",
      "fecha_emision",
      "nit_receptor",
      "nombre_receptor",
    ];
    return campos.some((campo) => (facturaForm[campo] || "").trim());
  }, [selectedRow, facturaForm]);

  useEffect(() => {
    loadRows();
  }, []);

  const loadRows = async () => {
    setLoading(true);
    setErr("");
    try {
      const { data, error } = await supabase
        .from("v_cotizaciones_autorizacion")
        .select(
          `
          aprob_id,
          codigo,
          fecha,
          vendedor_nombre,
          cliente_nombre,
          cliente_correo,
          cliente_telefono,
          cliente_pais,
          cliente_departamento,
          cliente_municipio,
          cliente_direccion,
          hsp,
          consumo_kwh_dia,
          consumo_kwh_mes,
          comentario_incluy,
          nombre_sistema,
          tipo_sistema,
          descripcion_sistema,
          items,
          monto_calculado,
          estado
        `
        )
        .order("fecha", { ascending: false });

      if (error) throw error;

      const filtradas = (data || []).filter(
        (row) =>
          String(row.estado || "")
            .trim()
            .toLowerCase() === ESTADO_OBJETIVO
      );

      setRows(
        filtradas.map((row) => {
          const comentarioCotizacion =
            row.comentario_incluye ??
            row.comentario_incluy ??
            row.comentario ??
            "";

          return {
            ...row,
            monto: Number(row.monto_calculado || 0),
            items: parseItems(row.items),
            comentario_cotizacion: comentarioCotizacion,
          };
        })
      );
    } catch (error) {
      setErr(
        error.message ||
          "No se pudieron cargar las cotizaciones aprobadas (OC)."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      [row.codigo, row.vendedor_nombre, row.cliente_nombre]
        .map((field) => String(field || "").toLowerCase())
        .some((field) => field.includes(term))
    );
  }, [rows, search]);

  const handleSelectRow = async (row) => {
    setSelectedRow(row);
    setMostrarVistaPrevia(false);
    setArchivo(null);
    setFacturaForm(createInitialFacturaState());
    setFacturaId(null);
    if (!row) return;

    setCargandoFactura(true);
    try {
      const { data, error } = await supabase
        .from("facturas_cotizacion")
        .select(
          `
          id,
          numero_autorizacion,
          serie,
          numero_dte,
          fecha_emision,
          pdf_url
        `
        )
        .eq("cotizacion_aprobacion_id", row.aprob_id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFacturaId(data.id);
        setFacturaForm({
          numero_autorizacion: data.numero_autorizacion || "",
          serie: data.serie || "",
          numero_dte: data.numero_dte || "",
          fecha_emision:
            data.fecha_emision ||
            new Date().toISOString().slice(0, 10),
          pdf_url: data.pdf_url || "",
          nit_receptor: data.nit_receptor || "",
          nombre_receptor: data.nombre_receptor || "",
        });
      }
    } catch (error) {
      if (error?.code !== "PGRST116") {
        console.error("No se pudo cargar la información de la factura.", error);
      }
    } finally {
      setCargandoFactura(false);
    }
  };

  const handleChange = (field, value) => {
    setFacturaForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Maneja la selección de PDF FEL: sube temporalmente y extrae datos
  const handlePdfUpload = async (file) => {
    if (!file) return;
    setArchivo(null);
    setExtrayendoPdf(true);
    try {
      let data = null;

      if (FEL_EXTRACTION_URL) {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch(FEL_EXTRACTION_URL, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Respuesta no válida del extractor remoto.");
          }

          data = await response.json();
        } catch (error) {
          console.warn(
            "No se pudo contactar al extractor remoto, se intentará leer localmente.",
            error
          );
          data = null;
        }
      }

      if (!data) {
        data = await extractFelDataLocally(file);
      }

      if (!data) {
        throw new Error(
          "No se encontraron datos FEL en el PDF. Intenta con otro archivo o llena los campos manualmente."
        );
      }

      if (data.numero_autorizacion) {
        handleChange("numero_autorizacion", data.numero_autorizacion);
      }
      if (data.serie) {
        handleChange("serie", data.serie);
      }
      if (data.numero_dte) {
        handleChange("numero_dte", data.numero_dte);
      }
      if (data.fecha_emision) {
        handleChange("fecha_emision", data.fecha_emision);
      }
      if (data.nit_receptor) {
        handleChange("nit_receptor", data.nit_receptor);
      }
      if (data.nombre_receptor) {
        handleChange("nombre_receptor", data.nombre_receptor);
      }

      const optimizedFile = await optimizePdfFile(file);
      setArchivo(optimizedFile || file);
    } catch (error) {
      console.error(error);
      setArchivo(file);
      alert(
        error.message ||
          "No fue posible leer datos del PDF FEL. Puedes llenar los campos manualmente."
      );
    } finally {
      setExtrayendoPdf(false);
    }
  };

  const handleSave = async () => {
    if (!selectedRow) return;

    if (
      !facturaForm.numero_autorizacion.trim() ||
      !facturaForm.serie.trim() ||
      !facturaForm.numero_dte.trim()
    ) {
      alert(
        "Por favor completa número de autorización, serie y número de DTE."
      );
      return;
    }

    setSaving(true);
    try {
      let pdfUrl = facturaForm.pdf_url;

      if (archivo) {
        const fileName = `${selectedRow.aprob_id}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from(FACTURAS_BUCKET)
          .upload(fileName, archivo, {
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage
          .from(FACTURAS_BUCKET)
          .getPublicUrl(fileName);

        pdfUrl = publicUrl;
      }

      const payload = {
        cotizacion_aprobacion_id: selectedRow.aprob_id,
        numero_autorizacion: facturaForm.numero_autorizacion.trim(),
        serie: facturaForm.serie.trim(),
        numero_dte: facturaForm.numero_dte.trim(),
        fecha_emision: facturaForm.fecha_emision || null,
        pdf_url: pdfUrl || null,
      };

      if (facturaId) {
        const { error } = await supabase
          .from("facturas_cotizacion")
          .update(payload)
          .eq("id", facturaId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("facturas_cotizacion")
          .insert(payload)
          .select("id")
          .single();

        if (error) throw error;
        setFacturaId(data.id);
      }

      setFacturaForm((prev) => ({
        ...prev,
        pdf_url: pdfUrl || prev.pdf_url,
      }));

      alert("Factura guardada correctamente.");
    } catch (error) {
      console.error(error);
      alert(
        error.message ||
          "No se pudo guardar la factura. Intenta nuevamente."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full p-4 sm:p-6 md:p-8 bg-gradient-to-b from-[#0b1320]/80 to-[#0b1320]/90">
      <div className="w-full h-full rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md flex flex-col">
        <div className="px-5 sm:px-6 md:px-8 py-5 border-b border-white/10 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white">
              Órdenes de Compra
            </h1>
            <p className="text-sm text-white/70 mt-1">
              Cotizaciones aprobadas listas para facturación.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código, vendedor o cliente..."
              className="px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
            />
            <button
              onClick={loadRows}
              className="text-sm px-3 py-2 rounded-lg border border-white/10 bg-white/10 text-white hover:bg-white/15"
            >
              Recargar
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="lg:w-1/2 border-b lg:border-b-0 lg:border-r border-white/10 overflow-auto scrollbar-hide">
            {loading ? (
              <div className="flex items-center justify-center h-full text-white/70 gap-2 text-sm">
                <Loader2 className="animate-spin" /> Cargando ?rdenes de compra...
              </div>
            ) : err ? (
              <div className="m-4 border border-rose-400/30 bg-rose-500/10 text-rose-100 rounded-2xl px-4 py-3 text-sm">
                {err}
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="m-4 border border-white/15 rounded-2xl bg-[#020617]/40 p-4 text-white/70 text-sm text-center">
                No hay ?rdenes de compra para mostrar.
              </div>
            ) : (
              <table className="min-w-full text-sm text-white/80">
                <thead>
                  <tr className="text-left text-white/70 border-b border-white/10">
                    <th className="px-3 py-2">No. Cotizaci?n</th>
                    <th className="px-3 py-2">Vendedor</th>
                    <th className="px-3 py-2">Cliente</th>
                    <th className="px-3 py-2 text-right">Monto total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => {
                    const selected =
                      selectedRow && selectedRow.aprob_id === row.aprob_id;
                    const itemList = Array.isArray(row.items)
                      ? row.items
                      : [];
                    const ubicacion = [
                      row.cliente_municipio,
                      row.cliente_departamento,
                      row.cliente_pais,
                    ]
                      .filter(Boolean)
                      .join(", ");
                    const consumoMensual = formatKwhValue(row.consumo_kwh_mes);
                    const consumoDiario = formatKwhValue(row.consumo_kwh_dia);
                    return (
                      <React.Fragment key={row.aprob_id}>
                        <tr
                          onClick={() => handleSelectRow(row)}
                          className={`cursor-pointer hover:bg-white/10 ${
                            selected ? "bg-white/10" : ""
                          }`}
                        >
                          <td className="px-3 py-2">
                            <div className="flex flex-col">
                              <span>{row.codigo}</span>
                              <span className="text-[11px] text-white/50">
                                {formatDateDisplay(row.fecha)}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2">{row.vendedor_nombre}</td>
                          <td className="px-3 py-2">{row.cliente_nombre}</td>
                          <td className="px-3 py-2 text-right font-semibold">
                            {money(row.monto)}
                          </td>
                        </tr>
                        {selected ? (
                          <tr className="bg-transparent">
                            <td colSpan={4} className="px-3 pb-4">
                              <div className="mt-1 space-y-4 rounded-2xl border border-white/10 bg-[#010c1b]/70 p-4 text-white/80">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-1">
                                    <p className="text-[11px] uppercase tracking-wide text-white/50">
                                      Cliente
                                    </p>
                                    <p className="text-base font-semibold text-white">
                                      {row.cliente_nombre || "Sin nombre"}
                                    </p>
                                    <p className="text-xs text-white/60">
                                      {row.cliente_correo || "Sin correo"}
                                    </p>
                                    <p className="text-xs text-white/60">
                                      {row.cliente_telefono || "Sin teléfono"}
                                    </p>
                                    <p className="text-xs text-white/60">
                                      {ubicacion || "Ubicacion desconocida"}
                                    </p>
                                    {row.cliente_direccion ? (
                                      <p className="text-xs text-white/50">
                                        {row.cliente_direccion}
                                      </p>
                                    ) : null}
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[11px] uppercase tracking-wide text-white/50">
                                      Sistema propuesto
                                    </p>
                                    <p className="text-base font-semibold text-white">
                                      {row.nombre_sistema || "Sin sistema"}
                                    </p>
                                    <p className="text-xs text-white/60">
                                      {row.tipo_sistema || "Tipo no definido"}
                                    </p>
                                    {row.descripcion_sistema ? (
                                      <p className="text-xs text-white/50">
                                        {row.descripcion_sistema}
                                      </p>
                                    ) : null}
                                    <div className="mt-3 space-y-1">
                                      <p className="text-[11px] uppercase tracking-wide text-white/50">
                                        Consumos e irradiacion
                                      </p>
                                      <p className="text-xs text-white/70">
                                        Mensual: {consumoMensual || "Sin dato"}
                                      </p>
                                      <p className="text-xs text-white/70">
                                        Diario: {consumoDiario || "Sin dato"}
                                      </p>
                                      <p className="text-xs text-white/70">
                                        HSP cliente: {row.hsp || "—"}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {row.comentario_cotizacion ? (
                                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
                                    <p className="text-xs uppercase tracking-wide text-white/50">
                                      Que incluye la cotizacion
                                    </p>
                                    <p className="mt-1">{row.comentario_cotizacion}</p>
                                  </div>
                                ) : null}

                                <div>
                                  <div className="flex items-center justify-between">
                                      <p className="text-xs uppercase tracking-wide text-white/50">
                                      Articulos autorizados ({itemList.length})
                                    </p>
                                  </div>
                                  <div className="mt-2 divide-y divide-white/5 rounded-xl border border-white/10 bg-[#020617]/60">
                                    {itemList.length === 0 ? (
                                      <p className="px-4 py-3 text-xs text-white/60">
                                        Esta cotizacion no tiene articulos registrados.
                                      </p>
                                    ) : (
                                      itemList.map((item, index) => {
                                        const qty = getItemQuantity(item);
                                        const title = getItemTitle(item);
                                        const detail = getItemDetail(item);
                                        const unitPrice = getItemUnitPrice(item);
                                        const totalItem =
                                          unitPrice > 0 && qty > 0
                                            ? unitPrice * qty
                                            : null;

                                        return (
                                          <div
                                            key={
                                              item?.key ||
                                              item?.refid ||
                                              `${row.aprob_id}-${index}`
                                            }
                                            className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                          >
                                            <div>
                                              <p className="font-semibold text-white">
                                                {qty > 0 ? `${qty} x ${title}` : title}
                                              </p>
                                              {detail ? (
                                                <p className="text-xs text-white/60">
                                                  {detail}
                                                </p>
                                              ) : null}
                                            </div>
                                            {unitPrice > 0 ? (
                                              <div className="text-xs text-white/70 text-right">
                                                <p>Unitario: {money(unitPrice)}</p>
                                                {totalItem ? (
                                                  <p>Total: {money(totalItem)}</p>
                                                ) : null}
                                              </div>
                                            ) : null}
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>



          <div className="lg:w-1/2 p-5 sm:p-6 overflow-auto scrollbar-hide">
            {!selectedRow ? (
              <div className="border border-white/15 rounded-2xl bg-[#020617]/30 p-6 text-center text-white/60 text-sm">
                Selecciona una cotización aprobada para registrar o consultar su factura.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-white/60">No. de cotización</p>
                    <p className="text-lg font-semibold text-white">
                      {selectedRow.codigo}
                    </p>
                    <p className="text-sm text-white/70 mt-1">
                      {selectedRow.cliente_nombre} · {money(selectedRow.monto)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSelectRow(null)}
                    className="text-white/60 hover:text-white"
                    title="Cerrar"
                  >
                    <X />
                  </button>
                </div>

                {cargandoFactura ? (
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <Loader2 className="animate-spin" /> Cargando factura...
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-white/60">
                          N° autorización
                        </label>
                        <input
                          type="text"
                          value={facturaForm.numero_autorizacion}
                          onChange={(e) =>
                            handleChange("numero_autorizacion", e.target.value)
                          }
                          className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-amber-300/60"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-white/60">Serie</label>
                        <input
                          type="text"
                          value={facturaForm.serie}
                          onChange={(e) =>
                            handleChange("serie", e.target.value)
                          }
                          className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-amber-300/60"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-white/60">
                          N° DTE
                        </label>
                        <input
                          type="text"
                          value={facturaForm.numero_dte}
                          onChange={(e) =>
                            handleChange("numero_dte", e.target.value)
                          }
                          className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-amber-300/60"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-white/60">
                          Fecha de emisión
                        </label>
                        <input
                          type="date"
                          value={facturaForm.fecha_emision}
                          onChange={(e) =>
                            handleChange("fecha_emision", e.target.value)
                          }
                          className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-amber-300/60"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-white/60">
                          NIT receptor
                        </label>
                        <input
                          type="text"
                          value={facturaForm.nit_receptor}
                          placeholder="Se completa al leer el PDF FEL"
                          readOnly
                          className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-sm text-white/70"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-white/60">
                          Nombre receptor
                        </label>
                        <input
                          type="text"
                          value={facturaForm.nombre_receptor}
                          placeholder="Se completa al leer el PDF FEL"
                          readOnly
                          className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-sm text-white/70"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-white/60">
                        Archivo PDF
                      </label>
                      <div className="flex items-center gap-3 flex-wrap">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/30 text-sm text-white/80 hover:bg-white/10 transition-colors">
                          <Upload className="w-4 h-4" />
                          <span>Seleccionar PDF</span>
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => handlePdfUpload(e.target.files?.[0] || null)}
                          />
                        </label>
                        {extrayendoPdf && (
                          <span className="flex items-center gap-1 text-xs text-amber-200">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Extrayendo datos...
                          </span>
                        )}
                        {archivo && !extrayendoPdf && (
                          <span className="text-xs text-white/70">
                            {archivo.name}
                          </span>
                        )}
                        {facturaForm.pdf_url && (
                          <a
                            href={facturaForm.pdf_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 text-sm text-white/80 hover:bg-white/10"
                          >
                            <FileText className="w-4 h-4" />
                            Ver PDF
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setMostrarVistaPrevia((prev) => !prev)}
                        disabled={!hasFacturaPreviewData}
                        className="px-4 py-2 rounded-lg border border-white/20 text-sm text-white/80 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {mostrarVistaPrevia ? "Ocultar vista previa" : "Ver vista previa"}
                      </button>
                      {mostrarVistaPrevia && hasFacturaPreviewData && (
                        <div className="mt-2">
                          <FacturaPreviewCard
                            selectedRow={selectedRow}
                            factura={facturaForm}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 rounded-lg bg-emerald-500/80 hover:bg-emerald-500 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {facturaId ? "Actualizar factura" : "Guardar factura"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



































