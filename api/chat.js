const { getState, saveState } = require('./_store');

function buildSmartFallbackReply(message, context) {
  const msg = (message || '').toLowerCase();
  const companyName = context.companyName || 'ProFirmio';
  const kbText = context.knowledgeBaseText || '';
  const faqList = Array.isArray(context.faqList) ? context.faqList : [];

  // 1. Check if message contains email or phone (Lead captured)
  const emailMatch = message.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  const phoneMatch = message.match(/(?:\+420\s?)?[0-9]{3}\s?[0-9]{3}\s?[0-9]{3}/);
  if (emailMatch || phoneMatch) {
    return `Skvělé, děkuji! Váš kontakt (${emailMatch ? emailMatch[0] : ''}${emailMatch && phoneMatch ? ', ' : ''}${phoneMatch ? phoneMatch[0] : ''}) jsem právě uložil a předal týmu ${companyName}. Ozveme se vám co nejdříve s konkrétním návrhem. Mohu vám mezitím zodpovědět ještě něco dalšího?`;
  }

  // 2. Check FAQ items for keyword matches
  for (const item of faqList) {
    const qWords = (item.question || '').toLowerCase().split(/\s+/).filter(w => w.length > 3);
    if (qWords.some(w => msg.includes(w))) {
      return item.answer;
    }
  }

  // 3. Intent matching
  if (msg.includes('cen') || msg.includes('kolik') || msg.includes('stojí') || msg.includes('paušál')) {
    if (kbText && (kbText.toLowerCase().includes('kč') || kbText.toLowerCase().includes('cen'))) {
      return `Zde jsou informace k cenám pro ${companyName}: ${kbText} Chcete připravit přesnou kalkulaci? Zanechte mi prosím svůj e-mail nebo telefon.`;
    }
    return `Cenu v ${companyName} vždy přizpůsobujeme rozsahu. Základní nasazení AI agenta začíná od 3 500 Kč/měsíc, kompletní balíček Chat + Volací agent od 6 900 Kč/měsíc. Úvodní konzultace je zdarma – napište mi svůj e-mail nebo telefon a pošleme vám ceník.`;
  }

  if (msg.includes('služb') || msg.includes('nabíz') || msg.includes('umíte') || msg.includes('co dělá')) {
    if (kbText) {
      return `V rámci ${companyName} poskytujeme: ${kbText} S čím z toho vám můžeme pomoci?`;
    }
    return `V ${companyName} nasazujeme AI chatboty 24/7, hlasové telefonní agenty (zvedání hovorů, recepce, rezervace), moderní weby a automatizaci procesů (Make, n8n, CRM). Co z toho by vašemu podnikání pomohlo nejvíce?`;
  }

  if (msg.includes('hlas') || msg.includes('volac') || msg.includes('telefon') || msg.includes('hovor')) {
    return `Náš AI Volací Agent pro ${companyName} zvedá příchozí hovory 24/7 v přirozené češtině, odpovídá na dotazy, rezervuje termíny do kalendáře, posílá potvrzovací SMS a v případě potřeby hovor přepojí na živého člověka. Chcete si ho nezávazně vyzkoušet? Napište mi své číslo!`;
  }

  if (msg.includes('konzultac') || msg.includes('schůzk') || msg.includes('objedn') || msg.includes('termín') || msg.includes('kontakt')) {
    return `Rád pro vás zařídím termín u ${companyName}! Napište mi sem prosím svůj e-mail nebo telefonní číslo (případně krátce, o co máte zájem) a hned to zadám do systému.`;
  }

  if (msg.includes('ahoj') || msg.includes('dobrý den') || msg.includes('zdravím')) {
    return `Dobrý den! Jsem AI asistent ${companyName}. ${kbText ? 'Můžu vám poradit ohledně našich služeb, cen nebo volných termínů.' : 'Jak vám dnes mohu pomoci?'}`;
  }

  // Default contextual response
  if (kbText) {
    return `Rozumím. V ${companyName} vám s tím rádi pomůžeme (${kbText.slice(0, 180)}...). Zanechte mi prosím na sebe telefon nebo e-mail a probereme detaily!`;
  }
  return context.fallbackReply || `Děkuji za zprávu! Jako AI asistent ${companyName} vám rád připravím řešení na míru. Napište mi prosím svůj e-mail nebo telefonní číslo a ozveme se vám s konkrétním návrhem.`;
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
    const userMessage = (body.message || '').trim();
    const history = Array.isArray(body.history) ? body.history : [];
    const clientId = body.clientId || body.companyId || '';
    const inlineCompany = body.companyProfile || null;
    const inlineConfig = body.chatbotConfig || null;
    const inlineApiKeys = body.apiKeys || {};

    if (!userMessage) {
      return res.status(400).json({ reply: 'Prosím napište zprávu.' });
    }

    const state = await getState();
    const chatbot = inlineConfig || state.chatbot || {};
    const companies = state.companies || [];

    // Resolve company if clientId or inlineCompany is provided
    const company = inlineCompany || companies.find(
      c => c.id === clientId || c.clientId === clientId
    );

    const companyName = company ? company.name : 'ProFirmio';
    const systemPrompt = (company && company.chatAgent?.systemPrompt)
      ? `${company.chatAgent.systemPrompt}\n\nZnalostní báze firmy (${company.name}):\n${company.chatAgent.knowledgeBase || ''}`
      : `${chatbot.systemPrompt || ''}\n\nZnalostní báze:\n${(chatbot.knowledgeBase || []).map(k => `Q: ${k.question}\nA: ${k.answer}`).join('\n\n')}`;

    // Lead detection (Email / Phone)
    const emailMatch = userMessage.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
    const phoneMatch = userMessage.match(/(?:\+420\s?)?[0-9]{3}\s?[0-9]{3}\s?[0-9]{3}/);
    let capturedLead = null;

    if (emailMatch || phoneMatch) {
      capturedLead = {
        id: 'lead-' + Date.now(),
        companyId: company ? company.id : 'comp-profirmio',
        companyName,
        source: 'chat',
        contact: emailMatch ? emailMatch[0] : 'Telefonický kontakt',
        phone: phoneMatch ? phoneMatch[0] : 'Neuvedeno',
        summary: userMessage.slice(0, 160),
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        status: 'Nový'
      };
      state.leads = [capturedLead, ...(state.leads || [])].slice(0, 200);
      await saveState(state);

      // Optional Webhook trigger
      const webhookUrl = (company && company.chatAgent?.webhookUrl) || chatbot.leadWebhookUrl;
      if (webhookUrl && webhookUrl.startsWith('http')) {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(capturedLead)
        }).catch(() => {});
      }
    }

    // Determine active provider & API key
    const provider = chatbot.provider || 'gemini';
    const geminiKey = inlineApiKeys.geminiKey || state.apiKeys?.geminiKey || process.env.GEMINI_API_KEY || '';
    const openaiKey = inlineApiKeys.openaiKey || state.apiKeys?.openaiKey || process.env.OPENAI_API_KEY || '';
    let reply = '';
    let usedProvider = 'smart-local';

    // 1. Try Gemini API if selected or available
    if ((provider === 'gemini' || !openaiKey) && geminiKey) {
      try {
        const modelName = chatbot.model && chatbot.model.startsWith('gemini')
          ? chatbot.model
          : 'gemini-2.5-flash';
        const contents = [
          ...history.slice(-8).map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text || h.content || '' }]
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ];

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents,
              generationConfig: {
                temperature: Number(chatbot.temperature ?? 0.6),
                maxOutputTokens: Number(chatbot.maxTokens ?? 500)
              }
            })
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const candidateText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            reply = candidateText.trim();
            usedProvider = 'gemini';
          }
        }
      } catch (e) {
        console.warn('Gemini call fallback:', e.message);
      }
    }

    // 2. Try OpenAI API if selected and key present
    if (!reply && provider === 'openai' && openaiKey) {
      try {
        const modelName = chatbot.model && chatbot.model.startsWith('gpt')
          ? chatbot.model
          : 'gpt-4o-mini';
        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-8).map(h => ({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: h.text || h.content || ''
          })),
          { role: 'user', content: userMessage }
        ];

        const oaRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: modelName,
            messages,
            temperature: Number(chatbot.temperature ?? 0.6),
            max_tokens: Number(chatbot.maxTokens ?? 500)
          })
        });

        if (oaRes.ok) {
          const oaData = await oaRes.json();
          const msgText = oaData?.choices?.[0]?.message?.content;
          if (msgText) {
            reply = msgText.trim();
            usedProvider = 'openai';
          }
        }
      } catch (e) {
        console.warn('OpenAI call fallback:', e.message);
      }
    }

    // 3. Smart Context-Aware Fallback if no external AI key is set yet
    if (!reply) {
      reply = buildSmartFallbackReply(userMessage, {
        companyName,
        knowledgeBaseText: company?.chatAgent?.knowledgeBase || '',
        faqList: chatbot.knowledgeBase || [],
        fallbackReply: chatbot.fallbackReply
      });
    }

    return res.status(200).json({
      ok: true,
      reply,
      provider: usedProvider,
      companyName,
      capturedLead
    });
  } catch (err) {
    console.error('API /chat error:', err);
    return res.status(500).json({
      ok: false,
      reply: 'Omlouvám se, došlo k dočasné chybě spojení. Zanechte nám prosím kontakt.',
      error: err.message
    });
  }
};

