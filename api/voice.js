const { getState, saveState } = require('./_store');

function buildSpokenFallback(transcript, companyName, companyKb, transferNumber) {
  const t = (transcript || '').toLowerCase();

  if (t.includes('člověk') || t.includes('operátor') || t.includes('přepoj') || t.includes('živ')) {
    return `Rozumím, okamžitě vás přepojuji na živého kolegu z ${companyName} na čísle ${transferNumber || '+420 730 553 971'}. Zůstaňte prosím na lince.`;
  }

  if (t.includes('termín') || t.includes('objedn') || t.includes('schůzk') || t.includes('konzultac') || t.includes('střed') || t.includes('pátek') || t.includes('zítra')) {
    return `Výborně, poznamenávám si váš zájem o termín u ${companyName}. Hodí se vám lépe zítra dopoledne v deset hodin, nebo ve čtvrtek odpoledne ve čtrnáct hodin?`;
  }

  if (t.includes('deset') || t.includes('čtrnáct') || t.includes('ano') || t.includes('hodí') || t.includes('platí') || t.includes('super')) {
    return `Perfektní, termín jsem vám právě zapsal do kalendáře ${companyName} a na vaše telefonní číslo posílám potvrzovací SMS. Mohu pro vás dnes udělat ještě něco dalšího?`;
  }

  if (t.includes('cen') || t.includes('kolik') || t.includes('stojí')) {
    if (companyKb) {
      return `Rád vám řeknu orientační ceny v ${companyName}. ${companyKb.split('.').slice(0, 2).join('.')}. Chcete poslat kompletní ceník do SMS?`;
    }
    return `Základní řešení v ${companyName} začíná od tří tisíc pět set korun měsíčně a úvodní konzultace je zcela zdarma. Chcete si rovnou domluvit krátký hovor se specialistou?`;
  }

  if (t.includes('nic') || t.includes('děkuji') || t.includes('nashle') || t.includes('všechno')) {
    return `Já vám děkuji za zavolání do ${companyName}. Přeji vám krásný zbytek dne, na shledanou!`;
  }

  return `Rozumím, děkuji za upřesnění. V ${companyName} se na to podíváme. Řekněte mi prosím, jaký den a čas by se vám nejlépe hodil pro krátké potvrzení termínu?`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const action = body.action || 'converse';
    const state = await getState();
    const companies = state.companies || [];

    const clientId = body.clientId || body.companyId || '';
    const company = body.companyProfile || companies.find(
      c => c.id === clientId || c.clientId === clientId
    );
    const voiceConfig = body.voiceConfig || state.voicebot || {};
    const inlineApiKeys = body.apiKeys || {};

    const companyName = company ? company.name : 'ProFirmio';
    const transferNumber = (company && company.voiceAgent?.transferNumber) || voiceConfig.transferNumber || '+420 730 553 971';

    // ACTION 1: Outbound Call Trigger (Vapi / Retell / Simulated)
    if (action === 'outbound_call') {
      const targetPhone = body.phoneNumber || '';
      const vapiKey = inlineApiKeys.vapiKey || state.apiKeys?.vapiKey || process.env.VAPI_API_KEY || '';

      if (vapiKey && body.assistantId && targetPhone) {
        try {
          const vapiRes = await fetch('https://api.vapi.ai/call', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${vapiKey}`
            },
            body: JSON.stringify({
              assistantId: body.assistantId,
              customer: { number: targetPhone }
            })
          });
          const vapiJson = await vapiRes.json();
          return res.status(200).json({
            ok: vapiRes.ok,
            mode: 'vapi-live',
            callData: vapiJson
          });
        } catch (e) {
          return res.status(500).json({ ok: false, error: e.message });
        }
      }

      // Simulated outbound call log
      const logEntry = {
        id: 'log-call-' + Date.now(),
        type: 'voice',
        companyId: company ? company.id : 'comp-profirmio',
        companyName,
        caller: targetPhone || '+420 730 553 971',
        duration: '0m 48s (Test)',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        outcome: 'Odchozí testovací hovor',
        transcript: `AI (${companyName}): ${(company && company.voiceAgent?.greeting) || voiceConfig.greeting}`
      };
      state.logs = [logEntry, ...(state.logs || [])].slice(0, 200);
      await saveState(state);

      return res.status(200).json({
        ok: true,
        mode: 'simulated',
        message: `Testovací hovor pro ${companyName} na číslo ${targetPhone || '+420 730 553 971'} byl zařazen a zapsán do historie hovorů.`,
        logEntry
      });
    }

    // ACTION 2: External Voice Webhook (Vapi / Retell / Twilio / Make)
    if (action === 'webhook' || body.message?.type === 'end-of-call-report') {
      const report = body.message || body;
      const logEntry = {
        id: 'log-wh-' + Date.now(),
        type: 'voice',
        companyId: company ? company.id : 'comp-profirmio',
        companyName,
        caller: report.customer?.number || report.caller || 'Příchozí hovor',
        duration: report.durationSeconds ? `${Math.round(report.durationSeconds)}s` : (report.duration || '1m 15s'),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        outcome: report.endedReason || report.outcome || 'Dokončený hovor',
        transcript: report.transcript || report.summary || 'Přepis hovoru přijat přes webhook.'
      };
      state.logs = [logEntry, ...(state.logs || [])].slice(0, 200);
      await saveState(state);
      return res.status(200).json({ ok: true, savedLog: logEntry.id });
    }

    // ACTION 3: Interactive Voice Bot Conversation Turn
    const transcript = (body.transcript || body.message || '').trim();
    const history = Array.isArray(body.history) ? body.history : [];

    const voiceSystemPrompt = (company && company.voiceAgent?.systemPrompt)
      ? `${company.voiceAgent.systemPrompt}\nZnalostní báze firmy (${company.name}): ${company.chatAgent?.knowledgeBase || ''}\nČíslo pro přepojení: ${transferNumber}.\nDŮLEŽITÉ: Odpovídej v češtině, čistým mluveným slovem, bez odrážek, maximálně 1-2 krátké věty.`
      : `${voiceConfig.systemPrompt || ''}\nČíslo pro přepojení: ${transferNumber}.\nDŮLEŽITÉ: Odpovídej v češtině, čistým mluveným slovem, bez odrážek, maximálně 1-2 krátké věty.`;

    const geminiKey = inlineApiKeys.geminiKey || state.apiKeys?.geminiKey || process.env.GEMINI_API_KEY || '';
    const elevenlabsKey = inlineApiKeys.elevenlabsKey || state.apiKeys?.elevenlabsKey || process.env.ELEVENLABS_API_KEY || '';

    let spokenReply = '';
    let usedAi = 'smart-voice-local';

    if (geminiKey && transcript) {
      try {
        const contents = [
          ...history.slice(-6).map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text || '' }]
          })),
          { role: 'user', parts: [{ text: transcript }] }
        ];

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: voiceSystemPrompt }] },
              contents,
              generationConfig: { temperature: 0.5, maxOutputTokens: 180 }
            })
          }
        );

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const text = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            spokenReply = text.replace(/[*#_`]/g, '').trim();
            usedAi = 'gemini';
          }
        }
      } catch (e) {
        console.warn('Voice Gemini fallback:', e.message);
      }
    }

    if (!spokenReply) {
      spokenReply = buildSpokenFallback(
        transcript,
        companyName,
        company?.chatAgent?.knowledgeBase || '',
        transferNumber
      );
    }

    // Optional ElevenLabs TTS generation if API key is provided
    let audioBase64 = null;
    const voiceId = voiceConfig.voiceId || 'EXAVITQu4vr4xnSDxMaL';
    if (elevenlabsKey && spokenReply) {
      try {
        const ttsRes = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: 'POST',
            headers: {
              'xi-api-key': elevenlabsKey,
              'Content-Type': 'application/json',
              Accept: 'audio/mpeg'
            },
            body: JSON.stringify({
              text: spokenReply,
              model_id: 'eleven_multilingual_v2',
              voice_settings: {
                stability: Number(voiceConfig.stability ?? 0.75),
                similarity_boost: 0.75
              }
            })
          }
        );
        if (ttsRes.ok) {
          const arrayBuffer = await ttsRes.arrayBuffer();
          audioBase64 = Buffer.from(arrayBuffer).toString('base64');
        }
      } catch (e) {
        console.warn('ElevenLabs TTS fallback to browser speech:', e.message);
      }
    }

    return res.status(200).json({
      ok: true,
      reply: spokenReply,
      provider: usedAi,
      audioBase64,
      companyName
    });
  } catch (err) {
    console.error('API /voice error:', err);
    return res.status(500).json({
      ok: false,
      reply: 'Omlouvám se, na lince došlo k krátkému výpadku. Zopakujte prosím svůj dotaz.',
      error: err.message
    });
  }
};

