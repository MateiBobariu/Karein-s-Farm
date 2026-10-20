import crypto from 'node:crypto';

const UNIT_PRICE_LEI = 100;
const REWARD_CODE = 'HAYBALE10';
const MAX_BODY_BYTES = 8 * 1024;

function json(body, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (!text || text.length > maxLength || /[\u0000-\u001f\u007f]/.test(text)) return null;
  return text;
}

function allowedOrigin(origin) {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    return url.protocol === 'https:' &&
      (url.hostname === 'karins-farm.vercel.app' ||
       /^karins-farm-[a-z0-9-]+\.vercel\.app$/i.test(url.hostname));
  } catch {
    return false;
  }
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  if (!allowedOrigin(request.headers.get('origin'))) {
    return json({ error: 'This order request could not be accepted.' }, 403);
  }

  if (!String(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) {
    return json({ error: 'Please submit the order form again.' }, 415);
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return json({ error: 'The order request is too large.' }, 413);
  }

  let order;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
      return json({ error: 'The order request is too large.' }, 413);
    }
    order = JSON.parse(raw);
  } catch {
    return json({ error: 'Please check the order form and try again.' }, 400);
  }

  if (!order || typeof order !== 'object' || Array.isArray(order)) {
    return json({ error: 'Please check the order form and try again.' }, 400);
  }

  // Quietly accept the honeypot without creating an order.
  if (typeof order.website === 'string' && order.website.trim()) {
    return json({ orderReference: 'KF-RECEIVED', totalBeforeDelivery: 0 }, 201);
  }

  const name = cleanText(order.name, 120);
  const email = cleanText(order.email, 254);
  const address = cleanText(order.address, 200);
  const city = cleanText(order.city, 100);
  const postal = cleanText(order.postal, 20);
  const quantity = Number(order.quantity);
  const promoCode = typeof order.promoCode === 'string' ? order.promoCode.trim().toUpperCase() : '';

  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !address || !city || !postal || !Number.isInteger(quantity) ||
      quantity < 1 || quantity > 10 || order.orderConsent !== true ||
      (promoCode && promoCode !== REWARD_CODE)) {
    return json({ error: 'Please check your details and order consent, then try again.' }, 400);
  }

  const subtotal = UNIT_PRICE_LEI * quantity;
  const discount = promoCode === REWARD_CODE ? subtotal * 0.1 : 0;
  const totalBeforeDelivery = subtotal - discount;
  const supabaseUrl = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const legacyServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = secretKey || legacyServiceKey;

  if (!supabaseUrl || !apiKey) {
    console.error('Supabase order storage is not configured.');
    return json({ error: 'Order submission is temporarily unavailable. Please try again later.' }, 503);
  }

  const orderReference = 'KF-' + crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  const headers = {
    apikey: apiKey,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  };
  // Legacy JWT service_role keys require a bearer token. New sb_secret keys
  // must be sent only as an apikey, because they are not JWTs.
  if (!secretKey && legacyServiceKey) {
    headers.Authorization = 'Bearer ' + legacyServiceKey;
  }

  const row = {
    order_reference: orderReference,
    customer_name: name,
    customer_email: email.toLowerCase(),
    street_address: address,
    city,
    postal_code: postal,
    product_name: "Karin's Farm",
    quantity,
    unit_price_lei: UNIT_PRICE_LEI,
    subtotal_lei: subtotal,
    discount_code: promoCode || null,
    discount_lei: discount,
    total_before_delivery_lei: totalBeforeDelivery,
    currency: 'RON',
    status: 'received',
  };

  try {
    const response = await fetch(supabaseUrl.replace(/\/$/, '') + '/rest/v1/orders', {
      method: 'POST',
      headers,
      body: JSON.stringify(row),
    });
    if (!response.ok) {
      console.error('Supabase order insert failed with status:', response.status);
      return json({ error: 'Order submission is temporarily unavailable. Please try again later.' }, 503);
    }
  } catch {
    console.error('Supabase order insert could not reach the database.');
    return json({ error: 'Order submission is temporarily unavailable. Please try again later.' }, 503);
  }

  return json({ orderReference, totalBeforeDelivery }, 201);
}
