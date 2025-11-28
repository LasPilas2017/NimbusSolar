// src/utils/pdf/generarCotizacionPDF.jsx
// -----------------------------------------------------------------------------
// Utilidad para renderizar la plantilla de cotizacion y exportarla como PDF.
// Se crea un nodo oculto en el DOM, se monta un layout de React y se captura
// con html2canvas para conservar el diseno existente.
// -----------------------------------------------------------------------------

import React, { forwardRef } from "react";
import { createRoot } from "react-dom/client";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import logoPDF from "../../assets/images/logopdf.jpg";

const safeText = (value, fallback = "-") =>
  value === undefined || value === null || value === "" ? fallback : value;

const formatCapacidadGeneracion = (value) => {
  if (value === undefined || value === null || value === "") return "--";
  const num = Number(value);
  if (!Number.isFinite(num)) return safeText(value, "--");
  const hasDecimals = Math.abs(num % 1) > 0.0001;
  return num.toLocaleString("es-GT", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
};

const CotizacionPDFLayout = forwardRef(
  (
    {
      cliente = {},
      tipoInstalacion = {},
      items = [],
      numeroCotizacion = "CTZ-SIN-CODIGO",
      fecha = new Date().toISOString().slice(0, 10),
      resumen = {},
      comentarioIncluye = "",
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
      new Intl.NumberFormat("es-GT", {
        style: "currency",
        currency: "GTQ",
        minimumFractionDigits: 2,
      }).format(Number(value || 0));

    const fechaTexto =
      typeof fecha === "string"
        ? fecha
        : new Date(fecha || Date.now()).toISOString().slice(0, 10);

    const capacidadGeneracion =
      cliente.capacidad_generacion ??
      cliente.generacion_prevista ??
      cliente.generacion ??
      tipoInstalacion.capacidad_generacion ??
      resumen.capacidad_generacion ??
      null;

    return (
      <div
        ref={ref}
        style={{
          width: "816px",
          height: "1056px",
          borderRadius: "5px",
          background:
            "linear-gradient(135deg, #ffffff 0%, #e4ecff 40%, #dbe8ff 70%, #cbd9f4 100%)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
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
              backgroundColor: "#151C3A",
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
              left: "375px",
              width: "105px",
              height: "105px",
              borderRadius: "50%",
              border: "8px solid #F7A938",
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
                color: "#F7A938",
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
                color: "#1a2440",
              }}
            >
              COTIZACION: {numeroCotizacion || "SIN-CODIGO"}
            </div>
            <div
              style={{
                fontSize: "13px",
                marginTop: "3px",
                color: "#6E758A",
              }}
            >
              {fechaTexto}
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "0px",
            left: 270,
            width: "68%",
            height: "115px",
            backgroundColor: "#151C3A",
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
            border: "8px solid #F7A938",
            zIndex: 3,
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "775px",
            width: "50px",
            height: "100px",
            backgroundColor: "#F7A938",
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
            color: "#ffffff",
            fontSize: "11px",
            lineHeight: 1.4,
            zIndex: 4,
          }}
        >
          <div style={{ fontWeight: 700 }}>Contactanos: 25093575</div>
          <div>Boulevar Vista Hermosa 25-80 2do. Nivel Edif. Maria del Alma zona 15</div>
          <div>www.nimbus-solar.com - hola@nimbus-solar.com</div>
        </div>

        <div
          style={{
            padding: "40px",
            color: "#1E2433",
            fontSize: "14px",
            zIndex: 10,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "30px",
            minHeight: "720px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              alignItems: "stretch",
            }}
          >
            <div style={{ flex: "1 1 55%" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#151C3A",
                  marginBottom: "8px",
                }}
              >
                Informacion del cliente
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#111827",
                  display: "grid",
                  rowGap: "4px",
                }}
              >
                <div style={{ display: "flex", gap: "6px" }}>
                  <div style={{ fontWeight: 700, minWidth: "80px" }}>Nombre:</div>
                  <div>{safeText(cliente.nombre, "Sin nombre")}</div>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <div style={{ fontWeight: 700, minWidth: "80px" }}>Correo:</div>
                  <div>{safeText(cliente.correo)}</div>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <div style={{ fontWeight: 700, minWidth: "80px" }}>Pais:</div>
                  <div>{safeText(cliente.pais)}</div>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <div style={{ fontWeight: 700, minWidth: "80px" }}>Municipio:</div>
                  <div>{safeText(cliente.municipio)}</div>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <div style={{ fontWeight: 700, minWidth: "80px" }}>Direccion:</div>
                  <div>{safeText(cliente.direccion)}</div>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <div style={{ fontWeight: 700, minWidth: "80px" }}>HSP:</div>
                  <div>{safeText(cliente.hsp)}</div>
                </div>
              </div>
            </div>

            <div
              style={{
                flex: "1 1 45%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "6px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#003366",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                }}
              >
                Capacidad para generar mensualmente
              </div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 900,
                  color: "#001F4D",
                  lineHeight: 1.05,
                }}
              >
                {formatCapacidadGeneracion(capacidadGeneracion)} kWh
              </div>
            </div>
          </div>
          <div
            style={{
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid rgba(0,0,0,0.85)",
              backgroundColor: "transparent",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "5fr 1fr",
                backgroundColor: "transparent",
                color: "#000000",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                borderBottom: "1px solid rgba(0,0,0,0.85)",
              }}
            >
              <div style={{ padding: "10px 14px" }}>Descripcion</div>
              <div style={{ padding: "10px 14px", textAlign: "center" }}>
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
                  color: "#000000",
                  borderTop: "1px solid rgba(0,0,0,0.85)",
                }}
              >
                <div style={{ padding: "8px 14px" }}>
                  {safeText(it.descripcion, "Sin descripcion")}
                </div>
                <div style={{ padding: "8px 14px", textAlign: "center" }}>
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
                minWidth: "220px",
                textAlign: "right",
                fontSize: "14px",
                fontWeight: 700,
                borderTop: "1px solid rgba(0,0,0,0.85)",
                paddingTop: "10px",
                color: "#000000",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: "4px",
                }}
              >
                IVA incluido
              </div>
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

          {comentarioIncluye ? (
            <div
              style={{
                marginTop: "16px",
                borderRadius: "10px",
                border: "1px solid rgba(21,28,58,0.12)",
                backgroundColor: "rgba(21,28,58,0.05)",
                padding: "12px 16px",
                color: "#111827",
                fontSize: "12px",
              }}
            >
              <div style={{ lineHeight: 1.4 }}>{comentarioIncluye}</div>
            </div>
          ) : null}

          <div
            style={{
              marginTop: "auto",
              width: "58%",
              borderRadius: "14px",
              padding: "16px 20px",
              backgroundColor: "rgba(21,28,58,0.05)",
              border: "1px solid rgba(21,28,58,0.12)",
              color: "#111827",
              alignSelf: "flex-start",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#151C3A",
                marginBottom: "6px",
              }}
            >
              Tipo de instalacion
            </div>

            <div style={{ marginBottom: "8px" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "2px",
                }}
              >
                Nombre del sistema
              </div>
              <div style={{ fontSize: "12px" }}>
                {safeText(
                  tipoInstalacion.nombreSistema || tipoInstalacion.tipoSistema,
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
                Descripcion
              </div>
              <div style={{ fontSize: "12px", lineHeight: 1.3 }}>
                {safeText(
                  tipoInstalacion.descripcion,
                  "Sistema propuesto segun la cotizacion."
                )}
              </div>
            </div>
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

export default async function generarCotizacionPDF(params = {}) {
  const {
    cliente = {},
    tipoInstalacion = {},
    items = [],
    numeroCotizacion = "Cotizacion_NimbusSolar",
    fecha = new Date().toISOString().slice(0, 10),
    resumen = {},
    comentarioIncluye = "",
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
        <CotizacionPDFLayout
          ref={(node) => {
            if (node) {
              clearTimeout(timeoutId);
              resolve(node);
            }
          }}
          cliente={cliente}
          tipoInstalacion={tipoInstalacion}
          items={items}
          numeroCotizacion={numeroCotizacion}
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

    const fileName = `${(numeroCotizacion || "Cotizacion_NimbusSolar")
      .replace(/\s+/g, "_")
      .trim()}.pdf`;
    pdf.save(fileName);

    return fileName;
  } finally {
    root.unmount();
    document.body.removeChild(mountNode);
  }
}
