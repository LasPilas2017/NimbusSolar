// src/utils/pdf/generarFacturaPDF.jsx
// -----------------------------------------------------------------------------
// Utilidad para renderizar la plantilla de Factura y exportarla como PDF.
// Se crea un nodo oculto en el DOM, se monta un layout de React y se captura
// con html2canvas para conservar el diseno existente.
// -----------------------------------------------------------------------------

import React, { forwardRef } from "react";
import { createRoot } from "react-dom/client";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import logoPDF from "../../assets/images/logopdf.jpg";

const FACTURA_EMISOR = {
  responsable: "ROBERTO VALENTÍN, CARRILLO GARCÍA",
  nit: "Nit Emisor: 84825626",
  empresa: "NIMBUS SOLAR",
  direccion:
    "6 AVENIDA B 21-02 CONDOMINIO PRADOS DE NIMAJUYÚ 2, Zona 21, GUATEMALA, GUATEMALA",
};

const safeText = (value, fallback = "-") =>
  value === undefined || value === null || value === "" ? fallback : value;

const sanitizeNombreReceptor = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  const cleaned = value
    .replace(/\s*[-–—]?\s*fecha\s+y\s+hora\s+de\s+certificaci[oó]n.*$/i, "")
    .trim();

  return cleaned || value;
};

export const FacturaPDFLayout = forwardRef(
  (
    {
      cliente = {},
      tipoInstalacion = {},
      items = [],
      numeroFactura = "FAC-SIN-CODIGO",
      fecha = new Date().toISOString().slice(0, 10),
      resumen = {},
      comentarioIncluye = "",
      datosFel = {},
    },
    ref
  ) => {
    const subtotalCalculado = items.reduce(
      (acc, it) => acc + Number(it.cantidad || 0) * Number(it.precio || 0),
      0
    );

    const totales = {
      subtotal:
        resumen?.subtotal !== undefined && resumen?.subtotal !== null
          ? Number(resumen.subtotal)
          : subtotalCalculado,
      ganancia:
        resumen?.ganancia !== undefined && resumen?.ganancia !== null
          ? Number(resumen.ganancia)
          : 0,
      tarjeta:
        resumen?.tarjeta !== undefined && resumen?.tarjeta !== null
          ? Number(resumen.tarjeta)
          : 0,
      iva:
        resumen?.iva !== undefined && resumen?.iva !== null
          ? Number(resumen.iva)
          : subtotalCalculado * 0.12,
    };

    let totalResumen =
      resumen?.total !== undefined && resumen?.total !== null
        ? Number(resumen.total)
        : totales.subtotal + totales.ganancia + totales.tarjeta + totales.iva;

    if (!totalResumen || Number.isNaN(totalResumen)) {
      totalResumen =
        totales.subtotal + totales.ganancia + totales.tarjeta + totales.iva;
    }

    if (
      (resumen?.iva === undefined || resumen?.iva === null) &&
      resumen?.total !== undefined &&
      resumen?.total !== null
    ) {
      const diferencia =
        totalResumen - (totales.subtotal + totales.ganancia + totales.tarjeta);
      if (diferencia > 0) {
        totales.iva = diferencia;
      }
    }

    const lineItems = items.length
      ? items
      : [
          {
            descripcion: "Sin items registrados",
            cantidad: 1,
            precio: subtotalCalculado,
          },
        ];

    const formatCurrency = (value) =>
      `Q ${Number(value || 0).toFixed(2)}`;

    const fechaTexto =
      typeof fecha === "string"
        ? fecha
        : new Date(fecha || Date.now()).toISOString().slice(0, 10);

    const datosFelRaw = [
      { label: "No. Autorizacion", value: datosFel?.numero_autorizacion },
      { label: "Serie", value: datosFel?.serie },
      { label: "No. DTE", value: datosFel?.numero_dte },
      { label: "Fecha emision", value: datosFel?.fecha_emision },
      { label: "Nit receptor", value: datosFel?.nit_receptor },
      {
        label: "Nombre receptor",
        value: sanitizeNombreReceptor(datosFel?.nombre_receptor),
      },
    ];

    const datosFactura = datosFelRaw.filter(
      ({ value }) => Boolean(String(value ?? "").trim())
    );

    const hasDatosFactura = datosFactura.length > 0;

    return (
      <div
        ref={ref}
        style={{
          width: "816px",
          height: "1056px",
          borderRadius: "5px",
          background: "#FFFFFF",
          boxShadow: "0 25px 60px rgba(10,26,58,0.35)",
          overflow: "visible",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) scale(1.8)",
            opacity: 0.08,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <img
            src={logoPDF}
            alt="watermark"
            style={{
              width: "360px",
              height: "360px",
              objectFit: "contain",
              filter: "grayscale(100%) brightness(1.2)",
            }}
          />
        </div>

        <div
          style={{
            width: "100%",
            height: "160px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "25px",
              left: 0,
              width: "68%",
              height: "115px",
              background:
                "linear-gradient(90deg, #001F4D 0%, #003366 45%, #0074D9 100%)",
              borderTopLeftRadius: "0px",
              borderTopRightRadius: "50px",
              borderBottomLeftRadius: "0px",
              borderBottomRightRadius: "50px",
              overflow: "hidden",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "30px",
              left: "440px",
              width: "105px",
              height: "105px",
              borderRadius: "50%",
              border: "8px solid #FFD700",
              zIndex: 2,
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "25px",
              left: 0,
              width: "68%",
              height: "115px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingLeft: "45px",
              lineHeight: 1.1,
              zIndex: 3,
            }}
          >
            <span
              style={{
                fontSize: "35px",
                fontWeight: "800",
                letterSpacing: "0.04em",
                color: "#FFFFFF",
                textTransform: "uppercase",
                fontFamily: "Segoe UI, Roboto, sans-serif",
              }}
            >
              Nimbus Solar
            </span>

            <span
              style={{
                marginTop: "6px",
                fontSize: "18px",
                fontWeight: "400",
                color: "#F9A602",
                letterSpacing: "0.06em",
                fontFamily: "Segoe UI, Roboto, sans-serif",
              }}
            >
              la energia del sol es gratis
            </span>
          </div>

          <div
            style={{
              position: "absolute",
              right: "45px",
              top: "55px",
              textAlign: "right",
              zIndex: 5,
            }}
          >
            <div
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#FF8C00",
              }}
            >
                No. Fact: {numeroFactura || "SIN-CODIGO"}
            </div>
            <div
              style={{
                fontSize: "13px",
                marginTop: "3px",
                color: "#003366",
              }}
            >
              Fecha: {fechaTexto}
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "0px",
            left: 262,
            width: "68%",
            height: "115px",
            background:
              "linear-gradient(90deg, #001F4D 0%, #003366 45%, #0074D9 100%)",
            borderTopLeftRadius: "50px",
            borderTopRightRadius: "0px",
            borderBottomLeftRadius: "50px",
            borderBottomRightRadius: "0px",
            overflow: "hidden",
            transform: "scaleY(-1)",
            zIndex: 2,
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "275px",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            border: "8px solid #FFD700",
            zIndex: 3,
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "767px",
            width: "50px",
            height: "100px",
            backgroundColor: "#FF8C00",
            borderTopLeftRadius: "100px",
            borderBottomLeftRadius: "100px",
            borderTopRightRadius: "0px",
            borderBottomRightRadius: "0px",
            zIndex: 3,
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "80px",
            width: "260px",
            textAlign: "center",
            color: "#003366",
            fontSize: "11px",
            lineHeight: 1.4,
            zIndex: 4,
          }}
        >
          <div style={{ fontWeight: 700 }}>(+502) 1234-5678</div>
          <div>Calle Cualquiera 123, Ciudad de Guatemala</div>
          <div>www.nimbus-solar.com - hola@nimbus-solar.com</div>
        </div>

        <div
  style={{
    padding: "40px",
    color: "#001F4D",
    fontSize: "14px",
    zIndex: 10,
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: "30px",
    minHeight: "720px",
  }}
>


          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "6px",
              alignItems: "stretch",
              width: "100%",
            }}
          >
            <div
              style={{
                flex: "1 1 50%",
                borderRadius: "0px",
                border: "none",
                background: "transparent",
                padding: "10px 0px",
                lineHeight: 1.35,
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                alignItems: "center",
                textAlign: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ fontWeight: 800, letterSpacing: "0.04em" }}>
                {FACTURA_EMISOR.responsable}
              </div>
              <div style={{ fontWeight: 700, color: "#003366" }}>
                {FACTURA_EMISOR.nit}
              </div>
              <div style={{ fontWeight: 700 }}>{FACTURA_EMISOR.empresa}</div>
              <div style={{ fontSize: "12px", maxWidth: "90%" }}>
                {FACTURA_EMISOR.direccion}
              </div>
            </div>

            {hasDatosFactura ? (
              <div
                style={{
                  flex: "1 1 50%",
                  borderRadius: "0px",
                  border: "none",
                  background: "transparent",
                  padding: "10px 0px",
                  lineHeight: 1.3,
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    fontSize: "14px",
                    color: "#0074D9",
                    textTransform: "uppercase",
                  }}
                >
                  Datos de factura
                </div>
                {datosFactura.map(({ label, value }) => (
                  <div
                    key={label}
                    style={{ fontSize: "12px", color: "#001F4D" }}
                  >
                    <strong>{label}:</strong> {safeText(value)}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div
              style={{
                borderRadius: "8px",
                border: "1px solid rgba(0,31,77,0.65)",
                backgroundColor: "transparent",
                maxHeight: "220px",  // ⬅️ altura fija
                overflowY: "auto",   // ⬅️ scroll vertical
                overflowX: "hidden",
              }}
            >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "5fr 1fr",
                background:
                  "linear-gradient(90deg, #0074D9 0%, #4DB6FF 100%)",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                borderBottom: "1px solid rgba(0,31,77,0.65)",
              }}
            >
              <div style={{ padding: "6px 12px" }}>Descripcion</div>
              <div style={{ padding: "6px 12px", textAlign: "center" }}>
                Cantidad
              </div>
            </div>

            {lineItems.map((it, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "5fr 1fr",
                  fontSize: "12px",
                  backgroundColor: "transparent",
                  color: "#001F4D",
                  borderTop: "1px solid rgba(0,31,77,0.65)",
                }}
              >
                <div style={{ padding: "6px 12px" }}>
                  {safeText(it.descripcion, "Sin descripcion")}
                </div>
                <div style={{ padding: "6px 12px", textAlign: "center" }}>
                  {Number(it.cantidad || 0)}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                minWidth: "200px",
                textAlign: "right",
                fontSize: "14px",
                fontWeight: 700,
                borderTop: "1px solid rgba(0,31,77,0.65)",
                paddingTop: "6px",
                color: "#001F4D",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Total</span>
              <span>{formatCurrency(totalResumen)}</span>
            </div>
          </div>
        </div>

          {/* Bloque combinado: tipo de sistema + qué incluye la compra */}
          <div
                style={{
                  marginTop: "auto",            // 👈 CLAVE: lo empuja al fondo del contenedor
                  marginBottom: "0px",
                  width: "100%",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  backgroundColor: "rgba(77,182,255,0.16)",
                  border: "1px solid rgba(0,116,217,0.2)",
                  color: "#001F4D",
                  fontSize: "12px",
                }}
              >
            {/* Tipo de sistema y descripción */}
            <div style={{ marginBottom: "8px" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "2px",
                }}
              >
                Tipo de sistema
              </div>
              <div style={{ fontSize: "12px" }}>
                {safeText(
                  tipoInstalacion.tipoSistema ||
                    tipoInstalacion.nombreSistema,
                  "Sistema solar"
                )}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "2px",
                }}
              >
                Descripción
              </div>
              <div style={{ fontSize: "12px", lineHeight: 1.3 }}>
                {safeText(
                  tipoInstalacion.descripcion,
                  "Sistema propuesto según la factura."
                )}
              </div>
            </div>

            {/* Qué incluye la compra, dentro del mismo cuadro */}
            {comentarioIncluye ? (
              <div
                style={{
                  marginTop: "10px",
                  paddingTop: "10px",
                  borderTop: "1px solid rgba(0,116,217,0.25)",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    marginBottom: "4px",
                    color: "#0074D9",
                    letterSpacing: "0.02em",
                  }}
                >
                  Qué incluye la compra
                </div>
                <div style={{ lineHeight: 1.3 }}>{comentarioIncluye}</div>
              </div>
            ) : null}
          </div>

        </div>
      </div>
    );
  }
);

const waitForNextFrame = () =>
  new Promise((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 16);
    }
  });

export default async function generarFacturaPDF(params = {}) {
  const {
    cliente = {},
    tipoInstalacion = {},
    items = [],
    numeroFactura = "Factura_NimbusSolar",
    fecha = new Date().toISOString().slice(0, 10),
    resumen = {},
    comentarioIncluye = "",
    datosFel = {},
  } = params;

  if (typeof document === "undefined") {
    throw new Error("La generacion de PDF solo esta disponible en el navegador.");
  }

  const mountNode = document.createElement("div");
  mountNode.style.position = "fixed";
  mountNode.style.left = "-9999px";
  mountNode.style.top = "0";
  mountNode.style.pointerEvents = "none";
  document.body.appendChild(mountNode);

  const root = createRoot(mountNode);

  try {
    const captureNode = await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("No se pudo renderizar la plantilla del PDF."));
      }, 2000);

      root.render(
      <FacturaPDFLayout
        ref={(node) => {
          if (node) {
            clearTimeout(timeoutId);
            resolve(node);
          }
        }}
        cliente={cliente}
        tipoInstalacion={tipoInstalacion}
        items={items}
        numeroFactura={numeroFactura}
        fecha={fecha}
        resumen={resumen}
        comentarioIncluye={comentarioIncluye}
      />
    );
    });

    await waitForNextFrame();

    const canvas = await html2canvas(captureNode, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgPrintWidth = imgWidth * ratio;
    const imgPrintHeight = imgHeight * ratio;

    const x = (pdfWidth - imgPrintWidth) / 2;
    const y = (pdfHeight - imgPrintHeight) / 2;

    pdf.addImage(imgData, "PNG", x, y, imgPrintWidth, imgPrintHeight);

    const fileName = `${(numeroFactura || "Factura_NimbusSolar")
      .replace(/\s+/g, "_")
      .trim()}.pdf`;
    pdf.save(fileName);

    return fileName;
  } finally {
    root.unmount();
    document.body.removeChild(mountNode);
  }
}

