const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const cachePath = path.join(process.cwd(), 'trendy_cache.json');
    if (fs.existsSync(cachePath)) {
      const raw = fs.readFileSync(cachePath, 'utf-8');
      const parsed = JSON.parse(raw);
      return res.status(200).json(parsed.data || parsed);
    }
  } catch (e) {
    console.warn('Trendy cache read error:', e.message);
  }

  return res.status(200).json([
    {
      nadpis: 'AI Hlasoví Agenti mění zákaznickou podporu firem',
      obsah: 'Moderní hlasoví boti s odezvou pod 500 ms dnes zvládají přirozeně komunikovat česky, rezervovat termíny do kalendáře a odbavit až 80 % příchozích hovorů.',
      odkaz: 'https://techcrunch.com/category/artificial-intelligence/'
    },
    {
      nadpis: 'Multimodální AI chatboti zvyšují konverze webů až o 300 %',
      obsah: 'Personalizovaní weboví asistenti napojení přímo na znalostní bázi firmy a CRM automaticky kvalifikují leady 24/7 bez nutnosti zásahu obchodníka.',
      odkaz: 'https://venturebeat.com/category/ai/'
    }
  ]);
};

