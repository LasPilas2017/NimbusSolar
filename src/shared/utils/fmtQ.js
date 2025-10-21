// src/shared/utils/fmtQ.js
export const fmtQ = (n) =>
  (n ?? 0).toLocaleString("es-GT", {
    style: "currency",
    currency: "GTQ",
    maximumFractionDigits: 2,
  });
