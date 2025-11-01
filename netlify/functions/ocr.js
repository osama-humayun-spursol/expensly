exports.handler = async function(event, context) {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const imageBase64 = body.imageBase64;
    if (!imageBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing imageBase64 in request body' })
      };
    }

    const OCR_API_KEY = process.env.OCR_SPACE_API_KEY || process.env.REPLACE_ENV_OCR_SPACE_API_KEY || '';
    if (!OCR_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'OCR API key not configured' })
      };
    }

    // Prepare form-urlencoded body
    const params = new URLSearchParams();
    params.append('apikey', OCR_API_KEY);
    params.append('base64Image', imageBase64);
    params.append('language', 'eng');
    params.append('isOverlayRequired', 'false');

    const resp = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await resp.json();
    if (!data) {
      return { statusCode: 502, body: JSON.stringify({ error: 'Empty response from OCR provider' }) };
    }

    // OCR.space returns ParsedResults array
    const parsedText = (data.ParsedResults && data.ParsedResults[0] && data.ParsedResults[0].ParsedText) || '';

    // simple amount extraction - take last monetary-looking value
    const amountMatches = Array.from((parsedText || '').matchAll(/\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?/g)).map(m => m[0]);
    const normalized = amountMatches.map(a => parseFloat(a.replace(/,/g, ''))).filter(n => !isNaN(n));
    const amount = normalized.length ? Math.max(...normalized) : null;

    // merchant name: first non-empty non-numeric line
    const lines = (parsedText || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let name = null;
    for (const line of lines) {
      const upper = line.toUpperCase();
      if (/TOTAL|SUBTOTAL|TAX|CHANGE|AMOUNT|BALANCE|Q R|QR|FBR|POS|NET BILL|INVOICE|SUBTOTAL/.test(upper)) continue;
      if (/\d/.test(line) && !/[A-Za-z]/.test(line)) continue;
      if (line.length < 2) continue;
      name = line;
      break;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ parsedText, amount, name })
    };
  } catch (err) {
    console.error('OCR function error', err);
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
