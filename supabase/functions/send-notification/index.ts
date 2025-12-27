import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildPushHTTPRequest } from "https://esm.sh/@pushforge/builder";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from(rawData, (c) => c.charCodeAt(0));
}

function uint8ArrayToBase64Url(uint8Array: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < uint8Array.length; i++) binary += String.fromCharCode(uint8Array[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function normalizeToBase64Url(maybeBase64: string): string {
  // If it's standard base64, convert to base64url.
  return maybeBase64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function buildVapidPrivateJwk(vapidPublicKey: string, vapidPrivateKey: string) {
  const publicKeyBytes = base64UrlToUint8Array(vapidPublicKey);
  const privateKeyBytes = base64UrlToUint8Array(vapidPrivateKey);

  let x: Uint8Array, y: Uint8Array;
  if (publicKeyBytes.length === 65 && publicKeyBytes[0] === 0x04) {
    x = publicKeyBytes.slice(1, 33);
    y = publicKeyBytes.slice(33, 65);
  } else if (publicKeyBytes.length === 64) {
    x = publicKeyBytes.slice(0, 32);
    y = publicKeyBytes.slice(32, 64);
  } else {
    throw new Error(`Invalid VAPID public key format (len=${publicKeyBytes.length})`);
  }

  if (privateKeyBytes.length !== 32) {
    throw new Error(`Invalid VAPID private key length (len=${privateKeyBytes.length})`);
  }

  return {
    kty: "EC",
    crv: "P-256",
    alg: "ES256",
    x: uint8ArrayToBase64Url(x),
    y: uint8ArrayToBase64Url(y),
    d: uint8ArrayToBase64Url(privateKeyBytes),
  };
}

async function sendToSubscription(params: {
  endpoint: string;
  p256dh: string;
  auth: string;
  payload: { title: string; body: string; icon?: string; badge?: string; url?: string };
  vapidPublicKey: string;
  vapidPrivateKey: string;
}) {
  const { endpoint, p256dh, auth, payload, vapidPublicKey, vapidPrivateKey } = params;

  const privateJWK = buildVapidPrivateJwk(vapidPublicKey, vapidPrivateKey);

  const subscription = {
    endpoint,
    keys: {
      p256dh: normalizeToBase64Url(p256dh),
      auth: normalizeToBase64Url(auth),
    },
  };

  const message = {
    payload,
    options: {
      ttl: 86400,
      urgency: "high" as const,
      topic: "galsi-notice",
    },
    adminContact: "mailto:admin@galsimahavidyalaya.ac.in",
  };

  const { endpoint: pushEndpoint, headers, body } = await buildPushHTTPRequest({
    privateJWK,
    subscription,
    message,
  });

  const res = await fetch(pushEndpoint, {
    method: "POST",
    headers,
    body,
  });

  return res;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, body, url } = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: "Title and body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!vapidPublicKey || !vapidPrivateKey) {
      return new Response(
        JSON.stringify({ error: "Push notification keys not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: subscriptions, error: fetchError } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (fetchError) {
      console.error("Error fetching subscriptions:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscriptions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validSubscriptions = (subscriptions || []).filter(
      (sub) => sub.endpoint && sub.endpoint.startsWith("https://")
    );

    if (validSubscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscribers", sent: 0, failed: 0, total: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const notificationPayload = {
      title,
      body,
      icon: "/logo.png",
      badge: "/logo.png",
      url: url || "/",
    };

    const results = await Promise.all(
      validSubscriptions.map(async (sub) => {
        try {
          const res = await sendToSubscription({
            endpoint: sub.endpoint,
            p256dh: sub.p256dh,
            auth: sub.auth,
            payload: notificationPayload,
            vapidPublicKey,
            vapidPrivateKey,
          });

          if (res.ok) {
            // Update last_success_at on successful delivery
            await supabase
              .from("push_subscriptions")
              .update({ last_success_at: new Date().toISOString() })
              .eq("id", sub.id);
            return { success: true, statusCode: res.status, id: sub.id };
          }

          const errorText = await res.text();

          // Remove invalid / stale subscriptions
          if (res.status === 410 || res.status === 404) {
            console.log(`Removing gone subscription: ${sub.id}`);
            await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          }
          if (res.status === 403 && errorText.includes("do not correspond")) {
            console.log(`Removing mismatched VAPID subscription: ${sub.id}`);
            await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          }

          console.error(`Push failed (${res.status}): ${errorText}`);
          return { success: false, statusCode: res.status, error: errorText, id: sub.id };
        } catch (e) {
          console.error("Error sending push:", e);
          return { success: false, error: (e as Error).message, id: sub.id };
        }
      })
    );

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return new Response(
      JSON.stringify({
        message: "Notifications sent",
        sent: successful,
        failed,
        total: validSubscriptions.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const error = err as Error;
    console.error("Error in send-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
