import { serve } from 'https://deno.land/std@0.203.0/http/server.ts';

serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Only POST supported' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const imageBase64 = body?.imageBase64;
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'Missing imageBase64 in request body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const OCR_API_KEY = Deno.env.get('OCR_SPACE_API_KEY') || '';
    if (!OCR_API_KEY) {
      return new Response(JSON.stringify({ error: 'OCR API key not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // OCR.space expects either a file upload or base64 string with the prefix "data:image/...;base64,"
    const formData = new FormData();
    formData.append('apikey', OCR_API_KEY);
    formData.append('base64Image', imageBase64);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');

    const resp = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    const data = await resp.json();

    // debug: include full OCR.space response
    const raw = data;

    const parsedText = (data.ParsedResults && data.ParsedResults[0] && data.ParsedResults[0].ParsedText) || '';

    // extract amount
    const amountMatches = Array.from((parsedText || '').matchAll(/\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?/g)).map(m => m[0]);
    const normalized = amountMatches.map(a => parseFloat(a.replace(/,/g, ''))).filter(n => !isNaN(n));
    const amount = normalized.length ? Math.max(...normalized) : null;

    // merchant name: first non-empty non-numeric line
    const lines = (parsedText || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let name = null as string | null;
    for (const line of lines) {
      const upper = line.toUpperCase();
      if (/TOTAL|SUBTOTAL|TAX|CHANGE|AMOUNT|BALANCE|Q R|QR|FBR|POS|NET BILL|INVOICE|SUBTOTAL/.test(upper)) continue;
      if (/\d/.test(line) && !/[A-Za-z]/.test(line)) continue;
      if (line.length < 2) continue;
      name = line;
      break;
    }

    return new Response(JSON.stringify({ parsedText, amount, name, raw }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (err) {
    console.error('OCR function error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
  }
});
