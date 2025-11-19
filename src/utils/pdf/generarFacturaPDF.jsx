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

    return (
      <div
        ref={ref}
        style={{
          width: "816px",
          height: "1056px",
          borderRadius: "5px",
          background:
          "linear-gradient(135deg, #ffffff 0%, #fff3ec 35%, #ffe1d2 65%, #ffd0bd 100%)",
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
              backgroundColor: "#5c2a4a",
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
              border: "8px solid #FF9E73",
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
                color: "#FF9E73",
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
                color: "#3d1f2f",
              }}
            >
                FACTURA: {numeroFactura || "SIN-CODIGO"}
            </div>
            <div
              style={{
                fontSize: "13px",
                marginTop: "3px",
                color: "#744a55",
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
            backgroundColor: "#5c2a4a",
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
            border: "8px solid #FF9E73",
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
            backgroundColor: "#ffd9c4",
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
            color: "#5c2a4a",
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
            color: "#3d1f2f",
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
              borderRadius: "14px",
              border: "1px solid rgba(92,42,74,0.15)",
              background:
                "linear-gradient(120deg, rgba(92,42,74,0.08), rgba(255,222,204,0.4))",
              padding: "18px 22px",
              lineHeight: 1.35,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div style={{ fontWeight: 800, letterSpacing: "0.04em" }}>
              {FACTURA_EMISOR.responsable}
            </div>
            <div style={{ fontWeight: 700, color: "#744a55" }}>
              {FACTURA_EMISOR.nit}
            </div>
            <div style={{ fontWeight: 700 }}>{FACTURA_EMISOR.empresa}</div>
            <div style={{ fontSize: "12px" }}>{FACTURA_EMISOR.direccion}</div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#5c2a4a",
                  marginBottom: "8px",
                }}
              >
                Informacion del cliente
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#3b1d2f",
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
                color: "#2f1a1f",
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
                  color: "#2f1a1f",
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
                color: "#2f1a1f",
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

        {comentarioIncluye ? (
          <div
            style={{
              marginTop: "16px",
              borderRadius: "10px",
                border: "1px solid rgba(92,42,74,0.15)",
                backgroundColor: "rgba(92,42,74,0.08)",
              padding: "12px 16px",
              color: "#3b1d2f",
              fontSize: "12px",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                marginBottom: "4px",
                color: "#5c2a4a",
              }}
            >
              Qué incluye la compra
            </div>
            <div style={{ lineHeight: 1.4 }}>{comentarioIncluye}</div>
          </div>
        ) : null}

          <div
            style={{
              marginTop: "auto",
              width: "58%",
              borderRadius: "14px",
              padding: "16px 20px",
              backgroundColor: "rgba(92,42,74,0.08)",
              border: "1px solid rgba(92,42,74,0.15)",
              color: "#3b1d2f",
              alignSelf: "flex-start",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#5c2a4a",
                marginBottom: "6px",
              }}
            >
              Tipo de instalación
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
                  "Sistema propuesto según la factura."
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

export default async function generarFacturaPDF(params = {}) {
  const {
    cliente = {},
    tipoInstalacion = {},
    items = [],
    numeroFactura = "Factura_NimbusSolar",
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


