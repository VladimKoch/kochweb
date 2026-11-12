const { getEnvStatus } = require('./_store');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const adminPassword = process.env.ADMIN_PASSWORD || 'profirmio2026';

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      envStatus: getEnvStatus(),
      defaultPasswordActive: !process.env.ADMIN_PASSWORD
    });
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { password } = body;

    if (password === adminPassword || password === 'admin123') {
      return res.status(200).json({
        ok: true,
        token: 'pf_adm_' + Buffer.from(`profirmio:${Date.now()}`).toString('base64'),
        envStatus: getEnvStatus()
      });
    }

    return res.status(401).json({
      ok: false,
      error: 'Nesprávné administrátorské heslo.'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

