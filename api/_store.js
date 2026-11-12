const fs = require('fs');
const os = require('os');
const path = require('path');

const TMP_DB_PATH = path.join(os.tmpdir(), 'profirmio_admin_db.json');
const LOCAL_FALLBACK_PATH = path.join(process.cwd(), 'data_backup.json');

const DEFAULT_STATE = {
  widget: {
    enabled: true,
    primaryColor: '#179ccb',
    secondaryColor: '#0076a3',
    accentColor: '#35c4ed',
    bgColor: '#ffffff',
    headerBgColor: '#fafafa',
    textColor: '#17233b',
    botBubbleColor: '#f1f5f9',
    botTextColor: '#17233b',
    userBubbleColor: '#179ccb',
    userTextColor: '#ffffff',
    position: 'right',
    bottomOffset: 32,
    sideOffset: 24,
    borderRadius: 20,
    buttonSize: 56,
    width: 350,
    height: 500,
    avatarType: 'cpu',
    customAvatarUrl: '',
    headerTitle: 'AI Konzultant ProFirmio',
    headerSubtitle: 'Online — připraven pomoci',
    welcomeTitle: 'Jak vám mohu pomoci?',
    welcomeText: 'Jsem AI asistent ProFirmio. Zeptejte se mě na automatizaci, AI agenty, tvorbu webů nebo si rovnou vyzkoušejte hlasový hovor.',
    inputPlaceholder: 'Napište zprávu...',
    footerText: 'Powered by ProFirmio AI',
    quickButtons: [
      '💼 Jaké služby nabízíte?',
      '📞 Chci nasadit volacího agenta',
      '📅 Chci bezplatnou konzultaci'
    ],
    enableVoiceTab: true,
    enableWiggle: true,
    enableSound: true,
    showBadge: true,
    autoOpenDelay: 0
  },
  chatbot: {
    enabled: true,
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    temperature: 0.6,
    maxTokens: 500,
    systemPrompt: `Jsi přátelský a profesionální AI konzultant společnosti ProFirmio (Vladimír Kochan, tel. 730 553 971, e-mail profirmio@gmail.com).
Pomáháš firmám automatizovat podnikání pomocí:
1. AI Chatbotů na míru (zákaznická podpora 24/7, kvalifikace leadů, napojení na web a CRM).
2. AI Hlasových / Volacích agentů (automatické zvedání hovorů, recepce, obvolávání leadů, rezervace termínů).
3. Tvorby moderních webů, workflow automatizace (Make, n8n, Zapier) a SMM/PPC marketingu.

Tvůj cíl:
- Stručně, srozumitelně a česky odpovědět na dotaz návštěvníka.
- Zjistit, jaký typ firmy má a s čím potřebuje pomoci.
- Požádat o e-mail nebo telefonní číslo pro nezávaznou bezplatnou konzultaci (nebo nabídnout rezervaci schůzky).`,
    knowledgeBase: [
      {
        id: 'kb-1',
        question: 'Kolik stojí AI chatbot nebo hlasový agent?',
        answer: 'Cenu vždy přizpůsobujeme rozsahu. Základní nasazení AI chatbota začína od 3 500 Kč/měsíc, kombinace Chat + Volací agent s napojením na CRM od 6 900 Kč/měsíc. Úvodní konzultace a návrh řešení jsou zcela zdarma.'
      },
      {
        id: 'kb-2',
        question: 'Jak rychle dokážete řešení nasadit?',
        answer: 'Konkrétní plán připravíme do 48 hodin. Samotné nasazení chatbota nebo hlasového agenta trvá obvykle 3 až 7 pracovních dní.'
      },
      {
        id: 'kb-3',
        question: 'Umí hlasový agent mluvit plynule česky a přepojit hovor?',
        answer: 'Ano! Náš AI volací agent mluví přirozeným českým hlasem s nízkou odezvou, zvládá rezervace do kalendáře, posílá potvrzovací SMS a v případě složitého dotazu okamžitě přepojí hovor na živého kolegu.'
      }
    ],
    captureLeads: true,
    leadWebhookUrl: '',
    bookingUrl: 'https://api.leadconnectorhq.com/widget/booking/lcovmTWC7gpJz4WLal2h',
    fallbackReply: 'Děkuji za dotaz! Rád vám připravím řešení na míru. Zanechte mi prosím svůj e-mail nebo telefon (případně zavolejte na 730 553 971) a náš specialista se vám obratem ozve.'
  },
  voicebot: {
    enabled: true,
    provider: 'elevenlabs',
    voiceId: 'EXAVITQu4vr4xnSDxMaL',
    voiceName: 'Viktorie (Český přirozený hlas)',
    voiceGender: 'female',
    speechRate: 1.02,
    pitch: 1.0,
    stability: 0.75,
    phoneNumber: '+420 730 553 971',
    transferNumber: '+420 730 553 971',
    workingHours: 'Nonstop 24/7',
    recordCalls: true,
    sendFollowupSms: true,
    followupSmsTemplate: 'Dobrý den, děkujeme za hovor s AI asistentem ProFirmio. Zde si můžete vybrat termín konzultace: https://profirmio.cz/#konzultace',
    greeting: 'Dobrý den, dovolali jste se do společnosti ProFirmio. Jsem virtuální hlasová asistentka. Jak vám dnes mohu pomoci s automatizací vašeho podnikání?',
    systemPrompt: `Jsi hlasový telefonní AI agent společnosti ProFirmio.
Mluvíš po telefonu s klientem, takže tvé odpovědi MUSÍ být krátké (maximálně 1 až 3 věty), přirozené pro mluvené slovo, bez odrážek, hvězdiček nebo markdown formátování.
Ptej se vždy jen na jednu věc najednou. Zjisti, o jakou službu má volající zájem (chatbot, hlasový agent, tvorba webu nebo automatizace) a domluv termín krátkého hovoru s Vladimírem Kochanem.`,
    callWebhookUrl: ''
  },
  companies: [
    {
      id: 'comp-profirmio',
      clientId: 'profirmio-main',
      name: 'ProFirmio (Vlastní web)',
      ico: '00785679',
      industry: 'AI & IT Automatizace',
      contactPerson: 'Vladimír Kochan',
      email: 'profirmio@gmail.com',
      phone: '+420 730 553 971',
      domain: 'profirmio.cz',
      status: 'active',
      monthlyFee: 0,
      createdAt: '2026-01-10',
      notes: 'Hlavní firemní profil pro vlastní web ProFirmio.',
      chatAgent: {
        enabled: true,
        botName: 'AI Konzultant ProFirmio',
        welcomeMessage: 'Dobrý den! Jsem AI konzultant ProFirmio. Chcete ukázat, jak automatizovat příjem klientů?',
        primaryColor: '#179ccb',
        secondaryColor: '#0076a3',
        systemPrompt: 'Jsi AI konzultant ProFirmio. Nabízíš AI chatboty, hlasové agenty a automatizaci na klíč. Cíl: získat kontakt na bezplatnou konzultaci.',
        knowledgeBase: 'Služby: AI Integrace, Webový vývoj, Workflow Automatizace (Make, n8n), CRM integrace. Kontakt: Vladimír Kochan, 730 553 971, profirmio@gmail.com.',
        quickButtons: ['💼 Jaké služby nabízíte?', '📅 Chci bezplatnou konzultaci'],
        webhookUrl: '',
        conversationsCount: 142
      },
      voiceAgent: {
        enabled: true,
        phoneNumber: '+420 730 553 971',
        provider: 'elevenlabs',
        voiceName: 'Viktorie (CZ)',
        greeting: 'Dobrý den, u telefonu AI asistentka ProFirmio. Jak vám mohu pomoci?',
        systemPrompt: 'Jsi telefonní recepční ProFirmio. Odpovídej stručně v 1-2 větách, zjisti o jakou automatizaci má volající zájem a navrhni schůzku.',
        transferNumber: '+420 730 553 971',
        workingHours: '24/7',
        callsCount: 38,
        minutesUsed: 94
      }
    },
    {
      id: 'comp-dental',
      clientId: 'dental-praha-01',
      name: 'DentalCare Clinic Praha s.r.o.',
      ico: '08451239',
      industry: 'Zdravotnictví / Stomatologie',
      contactPerson: 'MUDr. Jana Svobodová',
      email: 'recepce@dentalcare-praha.cz',
      phone: '+420 602 118 440',
      domain: 'dentalcare-praha.cz',
      status: 'active',
      monthlyFee: 8900,
      createdAt: '2026-08-15',
      notes: 'AI recepční zvedá hovory, když sestra ošetřuje, a objednává pacienty na dentální hygienu.',
      chatAgent: {
        enabled: true,
        botName: 'Virtuální Sestra DentalCare',
        welcomeMessage: 'Dobrý den! Potřebujete se objednat na dentální hygienu, prohlídku nebo máte akutní bolest?',
        primaryColor: '#0d9488',
        secondaryColor: '#0f766e',
        systemPrompt: 'Jsi virtuální recepční stomatologické kliniky DentalCare Praha (Vinohradská 45, Praha 2). Objednáváš pacienty, odpovídáš na ceník a otevírací dobu. Při akutní bolesti doporuč ranní pohotovost 7:30-8:30.',
        knowledgeBase: 'Otevírací doba: Po-Čt 7:30-18:00, Pá 7:30-14:00. Dentální hygiena: 1 650 Kč. Vstupní prohlídka s RTG: 1 200 Kč (nebo na pojišťovnu VZP, ZPMV, OZP). Bělení zubů: 5 900 Kč. Adresa: Vinohradská 45, Praha 2.',
        quickButtons: ['🦷 Objednat na hygienu', '💰 Ceník zákroků', '🚨 Mám akutní bolest'],
        webhookUrl: 'https://hook.eu2.make.com/dentalcare-leads-demo',
        conversationsCount: 318
      },
      voiceAgent: {
        enabled: true,
        phoneNumber: '+420 222 510 900',
        provider: 'vapi',
        voiceName: 'Klára (Empatický CZ)',
        greeting: 'Krásný den, dovolali jste se na kliniku DentalCare Praha. Jsem virtuální recepční. Přejete si objednat na termín, nebo přeobjednat stávající návštěvu?',
        systemPrompt: 'Jsi telefonní recepční zubní kliniky DentalCare Praha. Zjisti jméno pacienta, zda je u nás registrovaný, s čím potřebuje pomoci a nabídni volné termíny (středa 14:00 nebo pátek 10:30). Odpovídej vřele a stručně.',
        transferNumber: '+420 602 118 440',
        workingHours: 'Po-Ne 24/7 (mimo ordinační dobu bere vzkazy)',
        callsCount: 215,
        minutesUsed: 412
      }
    },
    {
      id: 'comp-autoservis',
      clientId: 'autoservis-kolar-02',
      name: 'AutoServis & Pneuservis Kolář s.r.o.',
      ico: '27904511',
      industry: 'Auto-moto / Servis',
      contactPerson: 'Petr Kolář',
      email: 'servis@autokolar-brno.cz',
      phone: '+420 777 320 115',
      domain: 'autokolar-brno.cz',
      status: 'active',
      monthlyFee: 6500,
      createdAt: '2026-09-02',
      notes: 'Hlasový agent řeší nápor hovorů během sezóny přezouvání pneumatik + objednávky STK.',
      chatAgent: {
        enabled: true,
        botName: 'Technik AI – AutoKolář',
        welcomeMessage: 'Zdravím! Potřebujete přezout pneu, udělat servis oleje, diagnostiku nebo přípravu na STK?',
        primaryColor: '#2563eb',
        secondaryColor: '#1d4ed8',
        systemPrompt: 'Jsi AI přijímací technik v AutoServisu Kolář Brno (Křižíkova 70, Brno). Zjisti značku a model auta, rok výroby, požadovaný úkon a telefon na řidiče pro potvrzení termínu.',
        knowledgeBase: 'Přezutí 4 kol (osobní): 990 Kč, SUV: 1 290 Kč. Výměna oleje + filtru: od 1 800 Kč. Příprava a provedení STK: 3 400 Kč vč. poplatků. Geometrie 3D: 1 100 Kč. Otevírací doba: Po-Pá 7:00-17:00.',
        quickButtons: ['🛞 Objednat přezutí pneu', '🔧 Servis / Výměna oleje', '📋 Příprava na STK'],
        webhookUrl: '',
        conversationsCount: 189
      },
      voiceAgent: {
        enabled: true,
        phoneNumber: '+420 530 331 200',
        provider: 'retell',
        voiceName: 'Marek (Technický CZ)',
        greeting: 'Dobrý den, AutoServis Kolář Brno, u telefonu automatický přijímací technik. Voláte kvůli přezutí pneumatik nebo servisu vozu?',
        systemPrompt: 'Jsi telefonní přijímací technik AutoServisu Kolář Brno. Mluv věcně a přátelsky. Zeptej se na SPZ nebo model auta, jakou závadu či servis řeší a jaký den se klientovi hodí auto přistavit.',
        transferNumber: '+420 777 320 115',
        workingHours: '24/7',
        callsCount: 164,
        minutesUsed: 280
      }
    },
    {
      id: 'comp-reality',
      clientId: 'next-reality-morava-03',
      name: 'MoravaDomy Reality s.r.o.',
      ico: '14029384',
      industry: 'Reality & Development',
      contactPerson: 'Ing. Lukáš Marek',
      email: 'info@moravadomy.cz',
      phone: '+420 739 882 100',
      domain: 'moravadomy.cz',
      status: 'trial',
      monthlyFee: 7500,
      createdAt: '2026-10-20',
      notes: 'Testovací provoz – kvalifikace zájemců o prohlídku nemovitostí a odhad ceny zdarma.',
      chatAgent: {
        enabled: true,
        botName: 'AI Makléř MoravaDomy',
        welcomeMessage: 'Dobrý den! Hledáte novou nemovitost, chcete nezávazný odhad tržní ceny zdarma nebo domluvit prohlídku?',
        primaryColor: '#7c3aed',
        secondaryColor: '#5b21b6',
        systemPrompt: 'Jsi AI realitní asistent kanceláře MoravaDomy. Pomáháš zájemcům o koupi/pronájem a majitelům, kteří chtějí prodat nemovitost. Vždy získej telefon a e-mail pro makléře Ing. Lukáše Marka.',
        knowledgeBase: 'Působnost: Olomouc, Ostrava, Brno a okolí. Odhad tržní ceny nemovitosti: ZDARMA do 24 hodin. Provize při prodeji: 3-4 % vč. kompletního právního servisu, home-stagingu a 3D Matterport skenu.',
        quickButtons: ['🏠 Odhad ceny nemovitosti zdarma', '🔑 Domluvit prohlídku', '📞 Spojit s makléřem'],
        webhookUrl: '',
        conversationsCount: 64
      },
      voiceAgent: {
        enabled: false,
        phoneNumber: '+420 585 220 111',
        provider: 'elevenlabs',
        voiceName: 'Viktorie (CZ)',
        greeting: 'Dobrý den, realitní kancelář MoravaDomy. Jakou nemovitost pro vás můžeme najít nebo ocenit?',
        systemPrompt: 'Jsi hlasový asistent realitní kanceláře MoravaDomy. Zjisti, zda volající prodává nebo kupuje nemovitost, v jaké lokalitě a předem domluv zpětné zavolání makléře.',
        transferNumber: '+420 739 882 100',
        workingHours: 'Po-Ne 8:00-20:00',
        callsCount: 12,
        minutesUsed: 24
      }
    }
  ],
  leads: [
    {
      id: 'lead-101',
      companyId: 'comp-profirmio',
      companyName: 'ProFirmio (Vlastní web)',
      source: 'chat',
      contact: 'martin.dvorak@stavby-dvorak.cz',
      phone: '+420 608 441 290',
      summary: 'Poptává AI hlasového bota na přebírání hovorů ze stavby + nový web.',
      createdAt: '2026-11-11 14:22',
      status: 'Nový'
    },
    {
      id: 'lead-102',
      companyId: 'comp-dental',
      companyName: 'DentalCare Clinic Praha s.r.o.',
      source: 'voice',
      contact: 'Eva Králová',
      phone: '+420 724 910 332',
      summary: 'Hlasový agent domluvil termín dentální hygieny na středu 14:00.',
      createdAt: '2026-11-11 11:05',
      status: 'Zpracováno'
    },
    {
      id: 'lead-103',
      companyId: 'comp-autoservis',
      companyName: 'AutoServis & Pneuservis Kolář s.r.o.',
      source: 'voice',
      contact: 'Škoda Octavia III (4B2 8819)',
      phone: '+420 775 112 604',
      summary: 'Objednávka přezutí zimních pneu + geometrie na pátek ráno.',
      createdAt: '2026-11-10 16:48',
      status: 'Zpracováno'
    }
  ],
  logs: [
    {
      id: 'log-1',
      type: 'voice',
      companyId: 'comp-dental',
      companyName: 'DentalCare Clinic Praha s.r.o.',
      caller: '+420 724 910 332',
      duration: '1m 42s',
      timestamp: '2026-11-11 11:05',
      outcome: 'Rezervace dokončena',
      transcript: 'AI: Krásný den, dovolali jste se na kliniku DentalCare Praha...\nKlient: Dobrý den, chtěla bych se objednat na dentální hygienu.\nAI: Ráda vás objednám. Máme volný termín ve středu ve 14:00 nebo v pátek v 10:30. Který se vám hodí lépe?\nKlient: Ta středa ve dvě bude super, jmenuji se Eva Králová.\nAI: Výborně paní Králová, píšu si vás na středu ve 14:00. Potvrzení vám právě posílám v SMS.'
    },
    {
      id: 'log-2',
      type: 'chat',
      companyId: 'comp-profirmio',
      companyName: 'ProFirmio (Vlastní web)',
      caller: 'martin.dvorak@stavby-dvorak.cz',
      duration: '4 zprávy',
      timestamp: '2026-11-11 14:22',
      outcome: 'Zachycen e-mail & telefon',
      transcript: 'Klient: Dobrý den, nestíháme zvedat telefony zákazníkům, umíte to zautomatizovat?\nAI: Dobrý den! Přesně na to nasazujeme AI Volacího Agenta, který zvedne každý hovor 24/7, zjistí poptávku a zapíše ji do vašeho kalendáře či CRM. Jaký obor podnikání máte?\nKlient: Máme stavební firmu. Můj email je martin.dvorak@stavby-dvorak.cz a tel 608 441 290.\nAI: Skvělé, děkuji! Předal jsem vaše číslo i e-mail Vladimírovi Kochanovi, ozve se vám s ukázkou přímo pro stavebnictví.'
    }
  ],
  apiKeys: {
    geminiKey: '',
    openaiKey: '',
    elevenlabsKey: '',
    vapiKey: '',
    retellKey: ''
  }
};

async function readFromVercelKV() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/get/profirmio_state`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.result) {
      return typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
    }
  } catch (e) {
    console.warn('KV read warning:', e.message);
  }
  return null;
}

async function writeToVercelKV(state) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return false;
  try {
    const res = await fetch(`${url}/set/profirmio_state`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(JSON.stringify(state))
    });
    return res.ok;
  } catch (e) {
    console.warn('KV write warning:', e.message);
    return false;
  }
}

async function getState() {
  // 1. Try Vercel KV if configured
  const kvData = await readFromVercelKV();
  if (kvData) return { ...DEFAULT_STATE, ...kvData };

  // 2. Try /tmp storage (works across warm Vercel serverless invocations)
  try {
    if (fs.existsSync(TMP_DB_PATH)) {
      const raw = fs.readFileSync(TMP_DB_PATH, 'utf-8');
      return { ...DEFAULT_STATE, ...JSON.parse(raw) };
    }
  } catch (e) {
    // ignore
  }

  // 3. Try local project file if running locally
  try {
    if (fs.existsSync(LOCAL_FALLBACK_PATH)) {
      const raw = fs.readFileSync(LOCAL_FALLBACK_PATH, 'utf-8');
      return { ...DEFAULT_STATE, ...JSON.parse(raw) };
    }
  } catch (e) {
    // ignore
  }

  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

async function saveState(newState) {
  const merged = {
    ...DEFAULT_STATE,
    ...newState,
    updatedAt: new Date().toISOString()
  };

  // Save to Vercel KV if configured
  await writeToVercelKV(merged);

  // Save to /tmp (always writable on Vercel Serverless)
  try {
    fs.writeFileSync(TMP_DB_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Tmp write warning:', e.message);
  }

  // Save to local file if writable (local dev environment)
  try {
    fs.writeFileSync(LOCAL_FALLBACK_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (e) {
    // Read-only filesystem on Vercel production outside /tmp — expected
  }

  return merged;
}

function getEnvStatus() {
  return {
    hasGeminiEnv: Boolean(process.env.GEMINI_API_KEY),
    hasOpenaiEnv: Boolean(process.env.OPENAI_API_KEY),
    hasElevenlabsEnv: Boolean(process.env.ELEVENLABS_API_KEY),
    hasVapiEnv: Boolean(process.env.VAPI_API_KEY),
    hasKvStorage: Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
    hasCustomAdminPassword: Boolean(process.env.ADMIN_PASSWORD)
  };
}

module.exports = {
  DEFAULT_STATE,
  getState,
  saveState,
  getEnvStatus
};
