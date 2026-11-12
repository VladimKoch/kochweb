const { getState, saveState, getEnvStatus } = require('./_store');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const state = await getState();
      const clientId = req.query && req.query.clientId;

      // Public widget config lookup by clientId (for external client websites)
      if (clientId) {
        const company = (state.companies || []).find(
          c => c.clientId === clientId || c.id === clientId
        );
        if (company) {
          return res.status(200).json({
            ok: true,
            clientId: company.clientId,
            companyName: company.name,
            widget: {
              ...state.widget,
              enabled: company.chatAgent?.enabled ?? true,
              primaryColor: company.chatAgent?.primaryColor || state.widget.primaryColor,
              secondaryColor: company.chatAgent?.secondaryColor || state.widget.secondaryColor,
              headerTitle: company.chatAgent?.botName || company.name,
              welcomeText: company.chatAgent?.welcomeMessage || state.widget.welcomeText,
              quickButtons: company.chatAgent?.quickButtons || state.widget.quickButtons,
              enableVoiceTab: company.voiceAgent?.enabled ?? state.widget.enableVoiceTab
            },
            voiceGreeting: company.voiceAgent?.greeting || state.voicebot.greeting
          });
        }
      }

      return res.status(200).json({
        ok: true,
        state,
        envStatus: getEnvStatus()
      });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const current = await getState();
      const updated = await saveState({
        ...current,
        ...(body.state || body)
      });
      return res.status(200).json({
        ok: true,
        state: updated,
        envStatus: getEnvStatus()
      });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('API /data error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

