// -----------------------------------------------------------------------------
// supabase/functions/enviar-codigo-sms/index.ts
// -----------------------------------------------------------------------------
// Esta función se ejecuta en el entorno de Supabase Edge (Deno).
// Envía un SMS con el código de activación de Nimbus Solar a través de Twilio.
//
// Configura las siguientes variables de entorno en tu proyecto Supabase:
//   - TWILIO_ACCOUNT_SID
//   - TWILIO_AUTH_TOKEN
//   - TWILIO_FROM_NUMBER
//
// Endpoint público (POST):
//   https://<tu-project-id>.functions.supabase.co/enviar-codigo-sms
// -----------------------------------------------------------------------------

// Guía de integración del servidor Deno:
// https://deno.land/manual/getting_started/setup_your_environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// -----------------------------------------------------------------------------
// CORS HEADERS
// -----------------------------------------------------------------------------
const corsHeaders: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// -----------------------------------------------------------------------------
// SERVIDOR PRINCIPAL
// -----------------------------------------------------------------------------
serve(async (req) => {
  // Manejo de preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Solo aceptamos POST
  if (req.method !== "POST") {
    return new Response("Only POST allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    // -------------------------------------------------------------------------
    // LECTURA DE BODY
    // -------------------------------------------------------------------------
    const { telefono, alias, codigo } = await req.json();

    if (!telefono || !codigo) {
      return new Response("Faltan datos", {
        status: 400,
        headers: corsHeaders,
      });
    }

    // -------------------------------------------------------------------------
    // VARIABLES DE ENTORNO
    // -------------------------------------------------------------------------
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken  = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_FROM_NUMBER");

    if (!accountSid || !authToken || !fromNumber) {
      console.error("Faltan variables de entorno de Twilio");
      return new Response("Config error", {
        status: 500,
        headers: corsHeaders,
      });
    }

    // -------------------------------------------------------------------------
    // ENVÍO DEL SMS
    // -------------------------------------------------------------------------
    // Normalizamos el teléfono (quitamos espacios)
    const toClean = String(telefono).replace(/\s+/g, "");

    const basicAuth = btoa(`${accountSid}:${authToken}`);

    const body = new URLSearchParams({
      To: toClean,
      From: fromNumber,
      Body: `Hola ${alias ?? ""}, tu código de activación de Nimbus Solar es: ${codigo}`,
    });

    // Petición a Twilio
    const twilioResp = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );

    // -------------------------------------------------------------------------
    // MANEJO DE ERRORES DE TWILIO
    // -------------------------------------------------------------------------
    if (!twilioResp.ok) {
      const text = await twilioResp.text();
      console.error("Error Twilio:", text);
      return new Response(text, {         // 👈 devolvemos el texto exacto
        status: 500,
        headers: corsHeaders,
      });
    }

    // -------------------------------------------------------------------------
    // RESPUESTA EXITOSA
    // -------------------------------------------------------------------------
    return new Response("OK", {
      status: 200,
      headers: corsHeaders,
    });

  } catch (e) {
    console.error(e);
    return new Response(String(e), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
