export default async function handler(req, res) {
  // Allow requests from your GitHub Pages site
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const API_KEY = process.env.BREVO_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { endpoint } = req.query;
  if (!endpoint) {
    return res.status(400).json({ error: 'No endpoint specified' });
  }

  const brevoUrl = `https://api.brevo.com/v3/${endpoint}`;
  const headers = {
    'accept': 'application/json',
    'content-type': 'application/json',
    'api-key': API_KEY
  };

  try {
    const options = {
      method: req.method,
      headers
    };

    if (req.method === 'POST' && req.body) {
      options.body = JSON.stringify(req.body);
    }

    const brevoRes = await fetch(brevoUrl, options);
    const text = await brevoRes.text();

    let data;
    try { data = JSON.parse(text); } catch(e) { data = { raw: text }; }

    return res.status(brevoRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
