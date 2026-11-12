/* =====================================================================
   ProFirmio Admin Centrum – Kompletní logika (Vercel + Local Sync)
   ===================================================================== */

const STORAGE_KEY = 'profirmio_admin_state';
const AUTH_SESSION_KEY = 'profirmio_admin_token';

const DEFAULT_ADMIN_STATE = {
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
    welcomeText: 'Jsem AI asistent ProFirmio. Zeptejte se mě na automatizaci, AI agenty, tvorbu webů nebo si vyzkoušejte hlasový hovor.',
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
- Požádat o e-mail nebo telefonní číslo pro nezávaznou bezplatnou konzultaci.`,
    knowledgeBase: [
      {
        id: 'kb-1',
        question: 'Kolik stojí AI chatbot nebo hlasový agent?',
        answer: 'Cenu vždy přizpůsobujeme rozsahu. Základní nasazení AI chatbota začíná od 3 500 Kč/měsíc, kombinace Chat + Volací agent s napojením na CRM od 6 900 Kč/měsíc. Úvodní konzultace a návrh řešení jsou zcela zdarma.'
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
Mluvíš po telefonu s klientem, takže tvé odpovědi MUSÍ být krátké (maximálně 1 až 2 věty), přirozené pro mluvené slovo, bez odrážek. Zjisti, o jakou službu má volající zájem a domluv termín krátkého hovoru s Vladimírem Kochanem.`,
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
    vapiKey: ''
  }
};

let state = JSON.parse(JSON.stringify(DEFAULT_ADMIN_STATE));
let activeCompanyFilter = 'all';
let selectedChatbotProfile = 'global';
let selectedVoiceProfile = 'global';
let simChatHistory = [];
let simVoiceHistory = [];
let adminCallActive = false;
let adminCallSeconds = 0;
let adminCallTimerInterval = null;
let adminSpeechRecognition = null;

/* ── TOAST NOTIFICATIONS ───────────────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('admToast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._admToastTimer);
  window._admToastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ── AUTHENTICATION ────────────────────────────────────────── */
function initAuth() {
  const overlay = document.getElementById('authOverlay');
  const form = document.getElementById('authForm');
  const passInput = document.getElementById('authPassword');
  const errEl = document.getElementById('authError');
  const logoutBtn = document.getElementById('logoutBtn');

  if (sessionStorage.getItem(AUTH_SESSION_KEY)) {
    overlay.classList.add('hidden');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pwd = passInput.value.trim();
    errEl.style.display = 'none';

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd })
      });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem(AUTH_SESSION_KEY, data.token || 'local_ok');
        overlay.classList.add('hidden');
        updateEnvBadges(data.envStatus);
        showToast('Vítejte v ProFirmio Admin Centru!');
        return;
      }
    } catch (err) {
      // Fallback for offline / static file mode
    }

    if (pwd === 'profirmio2026' || pwd === 'admin123') {
      sessionStorage.setItem(AUTH_SESSION_KEY, 'local_token_' + Date.now());
      overlay.classList.add('hidden');
      showToast('Přihlášeno (Lokální režim)');
    } else {
      errEl.style.display = 'block';
    }
  });

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    overlay.classList.remove('hidden');
  });
}

function updateEnvBadges(envStatus) {
  if (!envStatus) return;
  const setBadge = (id, active) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = active
      ? '<strong style="color:#16a34a;">✓ Nastaveno ve Vercel ENV</strong>'
      : '<span style="color:#64748b;">Nenastaveno ve Vercel ENV (lze zadat níže)</span>';
  };
  setBadge('envBadgeGemini', envStatus.hasGeminiEnv);
  setBadge('envBadgeOpenai', envStatus.hasOpenaiEnv);
  setBadge('envBadgeElevenlabs', envStatus.hasElevenlabsEnv);
  setBadge('envBadgeVapi', envStatus.hasVapiEnv);
}

/* ── STATE LOAD & SAVE ─────────────────────────────────────── */
async function loadAdminState() {
  // 1. Load from localStorage first
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = {
        ...DEFAULT_ADMIN_STATE,
        ...parsed,
        widget: { ...DEFAULT_ADMIN_STATE.widget, ...(parsed.widget || {}) },
        chatbot: { ...DEFAULT_ADMIN_STATE.chatbot, ...(parsed.chatbot || {}) },
        voicebot: { ...DEFAULT_ADMIN_STATE.voicebot, ...(parsed.voicebot || {}) },
        apiKeys: { ...DEFAULT_ADMIN_STATE.apiKeys, ...(parsed.apiKeys || {}) }
      };
    }
  } catch (e) {
    console.warn('Local state parse warning:', e);
  }

  // 2. Sync with Vercel API /api/data if available
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      const json = await res.json();
      if (json.envStatus) updateEnvBadges(json.envStatus);
      if (json.state && !localStorage.getItem(STORAGE_KEY)) {
        state = { ...DEFAULT_ADMIN_STATE, ...json.state };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } else {
        // Push current browser state to warm Vercel server instance
        fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state })
        }).catch(() => {});
      }
    }
  } catch (e) {
    const pill = document.getElementById('syncStatusText');
    if (pill) pill.textContent = 'Lokální úložiště aktivní';
  }

  renderAll();
}

async function persistState(toastMsg = 'Změny byly uloženy a synchronizovány!') {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  if (window.ProFirmioWidget && state.widget) {
    window.ProFirmioWidget.applyConfig(state.widget);
  }

  try {
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state })
    });
  } catch (e) {}

  renderAll();
  if (toastMsg) showToast(toastMsg);
}

/* ── NAVIGATION TABS ───────────────────────────────────────── */
const TAB_TITLES = {
  'tab-dashboard': ['Přehled & Statistiky', 'Centrální řízení AI Chatbota, Hlasového Agenta a klientských firem'],
  'tab-companies': ['Databáze firem (Klienti)', 'Správa firem, kterým zprostředkováváte volacího agenta a chat agenta'],
  'tab-chatbot': ['Ovládání AI Chatbota', 'Konfigurace AI modelu, instrukcí, znalostní báze a živý simulátor'],
  'tab-voicebot': ['Ovládání Hlasového Bota (Voice Agent)', 'Nastavení hlasu, telefonních čísel, scénáře hovoru a hlasový tester'],
  'tab-widget': ['Grafika & Vzhled Widgetu', 'Vizuální editor barev, rozměrů, textů a generátor Embed kódu'],
  'tab-logs': ['Leady & Historie Hovorů / Chatů', 'Přehled zachycených kontaktů, přepisů hovorů a export do CSV'],
  'tab-settings': ['API Klíče, Vercel & Záloha', 'Propojení s Gemini, OpenAI, ElevenLabs, Vapi a zálohování databáze']
};

window.switchAdminTab = function (tabId) {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === tabId);
  });
  const [title, sub] = TAB_TITLES[tabId] || ['Admin Centrum', ''];
  document.getElementById('topbarHeading').textContent = title;
  document.getElementById('topbarSub').textContent = sub;
};

/* ── RENDER ALL SECTIONS ───────────────────────────────────── */
function renderAll() {
  renderDashboard();
  renderCompanies();
  renderProfileSelects();
  populateChatbotForm();
  populateVoicebotForm();
  populateWidgetForm();
  renderEmbedGenerator();
  renderLeadsAndLogs();
  populateApiKeysForm();
}

/* ── 1. DASHBOARD ──────────────────────────────────────────── */
function renderDashboard() {
  const companies = state.companies || [];
  const leads = state.leads || [];

  const activeCount = companies.filter(c => c.status === 'active').length;
  const mrr = companies.reduce((acc, c) => acc + (c.status !== 'paused' ? Number(c.monthlyFee || 0) : 0), 0);
  const totalChats = companies.reduce((acc, c) => acc + Number(c.chatAgent?.conversationsCount || 0), 0);
  const totalCalls = companies.reduce((acc, c) => acc + Number(c.voiceAgent?.callsCount || 0), 0);

  document.getElementById('kpiCompanies').textContent = companies.length;
  document.getElementById('kpiCompaniesSub').textContent = `${activeCount} aktivních v produkci`;
  document.getElementById('kpiMrr').textContent = mrr.toLocaleString('cs-CZ') + ' Kč';
  document.getElementById('kpiInteractions').textContent = (totalChats + totalCalls).toLocaleString('cs-CZ');
  document.getElementById('kpiInteractionsSub').textContent = `${totalChats} chatů · ${totalCalls} hovorů`;
  document.getElementById('kpiLeads').textContent = leads.length;

  document.getElementById('navCompaniesCount').textContent = companies.length;
  document.getElementById('navLeadsCount').textContent = leads.length;

  document.getElementById('dashToggleWidget').checked = state.widget?.enabled !== false;
  document.getElementById('dashToggleChatbot').checked = state.chatbot?.enabled !== false;
  document.getElementById('dashToggleVoicebot').checked = state.voicebot?.enabled !== false;

  const recentBox = document.getElementById('dashRecentActivity');
  recentBox.innerHTML = '';
  leads.slice(0, 4).forEach(lead => {
    const item = document.createElement('div');
    item.style.cssText = 'padding:10px 12px;border-radius:10px;background:#f8fafc;border:1px solid var(--adm-border);font-size:0.8rem;display:flex;justify-content:space-between;align-items:center;gap:10px;';
    item.innerHTML = `
      <div>
        <strong>${lead.source === 'voice' ? '📞 Hovor' : '💬 Chat'} · ${lead.companyName}</strong>
        <div style="color:var(--adm-text-sec);margin-top:2px;">${lead.contact} (${lead.phone}) — ${lead.summary}</div>
      </div>
      <span class="status-badge status-active">${lead.status || 'Nový'}</span>
    `;
    recentBox.appendChild(item);
  });
}

/* ── 2. COMPANIES DATABASE (KLIENTI) ───────────────────────── */
function renderCompanies() {
  const grid = document.getElementById('companiesGrid');
  const query = (document.getElementById('companySearchInput')?.value || '').toLowerCase().trim();
  const companies = state.companies || [];

  const filtered = companies.filter(c => {
    if (activeCompanyFilter === 'active' && c.status !== 'active') return false;
    if (activeCompanyFilter === 'trial' && c.status !== 'trial') return false;
    if (activeCompanyFilter === 'voice' && !c.voiceAgent?.enabled) return false;
    if (activeCompanyFilter === 'chat' && !c.chatAgent?.enabled) return false;

    if (!query) return true;
    const hay = `${c.name} ${c.ico} ${c.domain} ${c.industry} ${c.contactPerson} ${c.phone} ${c.email}`.toLowerCase();
    return hay.includes(query);
  });

  grid.innerHTML = '';

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="card" style="grid-column:1/-1;text-align:center;padding:40px;color:var(--adm-text-sec);">Žádná firma neodpovídá zadanému filtru. Klikněte na „+ Přidat novou firmu“.</div>`;
    return;
  }

  filtered.forEach(c => {
    const initials = (c.name || 'FI').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const primaryColor = c.chatAgent?.primaryColor || '#179ccb';
    const statusClass = c.status === 'active' ? 'status-active' : (c.status === 'trial' ? 'status-trial' : 'status-paused');
    const statusLabel = c.status === 'active' ? 'Aktivní' : (c.status === 'trial' ? 'Testování' : 'Pozastaveno');

    const card = document.createElement('div');
    card.className = 'company-card';
    card.innerHTML = `
      <div class="company-head">
        <div style="display:flex;align-items:center;gap:12px;min-width:0;">
          <div class="company-avatar" style="background:${primaryColor};">${initials}</div>
          <div class="company-title-wrap">
            <h3 title="${c.name}">${c.name}</h3>
            <div class="company-meta">${c.industry || 'Obecné'} · IČO: ${c.ico || '—'}</div>
          </div>
        </div>
        <span class="status-badge ${statusClass}">${statusLabel}</span>
      </div>

      <div class="company-details-list">
        <div>
          <span>Kontaktní osoba</span>
          <strong>${c.contactPerson || '—'}</strong>
        </div>
        <div>
          <span>Měsíční paušál</span>
          <strong>${Number(c.monthlyFee || 0).toLocaleString('cs-CZ')} Kč / měs.</strong>
        </div>
        <div>
          <span>Web / Doména</span>
          <strong>${c.domain || '—'}</strong>
        </div>
        <div>
          <span>Telefon klienta</span>
          <strong>${c.phone || '—'}</strong>
        </div>
      </div>

      <div class="agent-boxes">
        <div class="agent-mini-box">
          <div class="agent-mini-top">
            <span>💬 Chat Agent</span>
            <input type="checkbox" ${c.chatAgent?.enabled ? 'checked' : ''} onchange="toggleCompanyAgent('${c.id}', 'chat', this.checked)" title="Zapnout/vypnout Chat Agenta firmy" style="cursor:pointer;" />
          </div>
          <div class="agent-mini-sub">
            ${c.chatAgent?.botName || 'AI Chatbot'}<br>
            <strong>${c.chatAgent?.conversationsCount || 0}</strong> konverzací
          </div>
        </div>

        <div class="agent-mini-box">
          <div class="agent-mini-top">
            <span>📞 Volací Agent</span>
            <input type="checkbox" ${c.voiceAgent?.enabled ? 'checked' : ''} onchange="toggleCompanyAgent('${c.id}', 'voice', this.checked)" title="Zapnout/vypnout Volacího Agenta firmy" style="cursor:pointer;" />
          </div>
          <div class="agent-mini-sub">
            ${c.voiceAgent?.phoneNumber || 'Číslo nepřiřazeno'}<br>
            <strong>${c.voiceAgent?.callsCount || 0}</strong> hovorů (${c.voiceAgent?.minutesUsed || 0} min)
          </div>
        </div>
      </div>

      <div class="company-actions">
        <button type="button" class="btn btn-primary btn-sm" onclick="openCompanyModal('${c.id}')">⚙️ Upravit firmu & agenty</button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="testCompanyChatbot('${c.id}')">💬 Test Chat</button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="testCompanyVoicebot('${c.id}')">📞 Test Hlas</button>
        <button type="button" class="btn btn-secondary btn-sm" onclick="copyCompanyEmbed('${c.id}')">📋 Embed</button>
        ${c.id !== 'comp-profirmio' ? `<button type="button" class="btn btn-danger btn-sm" onclick="deleteCompany('${c.id}')">🗑️</button>` : ''}
      </div>
    `;
    grid.appendChild(card);
  });
}

window.toggleCompanyAgent = function (companyId, agentType, enabled) {
  const comp = (state.companies || []).find(c => c.id === companyId);
  if (!comp) return;
  if (agentType === 'chat') {
    comp.chatAgent = { ...(comp.chatAgent || {}), enabled };
  } else {
    comp.voiceAgent = { ...(comp.voiceAgent || {}), enabled };
  }
  persistState(`${agentType === 'chat' ? 'Chat Agent' : 'Volací Agent'} firmy ${comp.name} byl ${enabled ? 'zapnut' : 'vypnut'}.`);
};

window.deleteCompany = function (companyId) {
  const comp = (state.companies || []).find(c => c.id === companyId);
  if (!comp) return;
  if (!confirm(`Opravdu chcete odstranit firmu „${comp.name}“ z databáze?`)) return;
  state.companies = state.companies.filter(c => c.id !== companyId);
  persistState(`Firma ${comp.name} byla odstraněna.`);
};

window.copyCompanyEmbed = function (companyId) {
  const comp = (state.companies || []).find(c => c.id === companyId);
  if (!comp) return;
  const origin = window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'https://profirmio.vercel.app';
  const snippet = `<script src="${origin}/scripts-agent.js" data-client-id="${comp.clientId || comp.id}" defer></script>`;
  navigator.clipboard.writeText(snippet).then(() => {
    showToast(`Embed kód pro ${comp.name} zkopírován do schránky!`);
  });
};

window.testCompanyChatbot = function (companyId) {
  selectedChatbotProfile = companyId;
  switchAdminTab('tab-chatbot');
  const sel = document.getElementById('chatbotProfileSelect');
  if (sel) sel.value = companyId;
  populateChatbotForm();
  resetChatSimulator();
  showToast('Simulátor Chatbota přepnut na vybranou firmu!');
};

window.testCompanyVoicebot = function (companyId) {
  selectedVoiceProfile = companyId;
  switchAdminTab('tab-voicebot');
  const sel = document.getElementById('voiceProfileSelect');
  if (sel) sel.value = companyId;
  populateVoicebotForm();
  showToast('Hlasový simulátor přepnut na vybranou firmu!');
};

/* ── COMPANY MODAL EDITOR ──────────────────────────────────── */
window.openCompanyModal = function (companyId = null) {
  const modal = document.getElementById('companyModal');
  const isNew = !companyId;
  const comp = isNew
    ? {
        id: 'comp-' + Date.now(),
        clientId: 'klient-' + Math.floor(100 + Math.random() * 900),
        name: '',
        ico: '',
        industry: '',
        contactPerson: '',
        email: '',
        phone: '+420 ',
        domain: '',
        status: 'active',
        monthlyFee: 6900,
        notes: '',
        chatAgent: {
          enabled: true,
          botName: 'AI Asistent',
          welcomeMessage: 'Dobrý den! Jak vám dnes mohu pomoci?',
          primaryColor: '#179ccb',
          secondaryColor: '#0076a3',
          systemPrompt: 'Jsi přátelský AI asistent této společnosti. Odpovídej česky, pomoz zákazníkovi s dotazem a získej na něj telefon nebo e-mail.',
          knowledgeBase: 'Otevírací doba: Po-Pá 8:00-17:00. Ceník a služby na vyžádání.',
          quickButtons: ['💼 Naše služby', '💰 Ceník', '📞 Kontakt'],
          webhookUrl: '',
          conversationsCount: 0
        },
        voiceAgent: {
          enabled: true,
          phoneNumber: '+420 ',
          provider: 'elevenlabs',
          voiceName: 'Viktorie (CZ)',
          greeting: 'Dobrý den, dovolali jste se k nám. Jsem virtuální asistentka, jak vám mohu pomoci?',
          systemPrompt: 'Jsi telefonní AI recepční. Mluv stručně v 1-2 větách, zjisti požadavek volajícího a domluv termín.',
          transferNumber: '+420 ',
          workingHours: '24/7',
          callsCount: 0,
          minutesUsed: 0
        }
      }
    : (state.companies || []).find(c => c.id === companyId);

  if (!comp) return;

  document.getElementById('modalCompanyTitle').textContent = isNew ? 'Přidat novou klientskou firmu' : `Upravit firmu: ${comp.name}`;
  document.getElementById('mcId').value = isNew ? 'NEW:' + comp.id : comp.id;
  document.getElementById('mcName').value = comp.name || '';
  document.getElementById('mcClientId').value = comp.clientId || '';
  document.getElementById('mcIco').value = comp.ico || '';
  document.getElementById('mcIndustry').value = comp.industry || '';
  document.getElementById('mcContactPerson').value = comp.contactPerson || '';
  document.getElementById('mcEmail').value = comp.email || '';
  document.getElementById('mcPhone').value = comp.phone || '';
  document.getElementById('mcDomain').value = comp.domain || '';
  document.getElementById('mcStatus').value = comp.status || 'active';
  document.getElementById('mcMonthlyFee').value = comp.monthlyFee ?? 6500;
  document.getElementById('mcNotes').value = comp.notes || '';

  // Chat tab
  document.getElementById('mcChatEnabled').checked = comp.chatAgent?.enabled !== false;
  document.getElementById('mcChatBotName').value = comp.chatAgent?.botName || '';
  document.getElementById('mcChatColor').value = comp.chatAgent?.primaryColor || '#179ccb';
  document.getElementById('mcChatColorHex').value = comp.chatAgent?.primaryColor || '#179ccb';
  document.getElementById('mcChatWelcome').value = comp.chatAgent?.welcomeMessage || '';
  document.getElementById('mcChatPrompt').value = comp.chatAgent?.systemPrompt || '';
  document.getElementById('mcChatKb').value = comp.chatAgent?.knowledgeBase || '';
  document.getElementById('mcChatQuickBtns').value = (comp.chatAgent?.quickButtons || []).join(', ');
  document.getElementById('mcChatWebhook').value = comp.chatAgent?.webhookUrl || '';

  // Voice tab
  document.getElementById('mcVoiceEnabled').checked = comp.voiceAgent?.enabled !== false;
  document.getElementById('mcVoicePhone').value = comp.voiceAgent?.phoneNumber || '';
  document.getElementById('mcVoiceTransfer').value = comp.voiceAgent?.transferNumber || '';
  document.getElementById('mcVoiceProvider').value = comp.voiceAgent?.provider || 'elevenlabs';
  document.getElementById('mcVoiceName').value = comp.voiceAgent?.voiceName || '';
  document.getElementById('mcVoiceGreeting').value = comp.voiceAgent?.greeting || '';
  document.getElementById('mcVoicePrompt').value = comp.voiceAgent?.systemPrompt || '';
  document.getElementById('mcVoiceHours').value = comp.voiceAgent?.workingHours || '24/7';

  // Reset modal tab to first
  document.querySelectorAll('.modal-tab-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
  document.querySelectorAll('.mtab-pane').forEach((p, i) => p.style.display = i === 0 ? 'block' : 'none');

  modal.classList.add('open');
};

function saveCompanyFromModal() {
  const rawId = document.getElementById('mcId').value;
  const isNew = rawId.startsWith('NEW:');
  const id = isNew ? rawId.replace('NEW:', '') : rawId;
  const name = document.getElementById('mcName').value.trim();

  if (!name) {
    alert('Zadejte prosím název firmy.');
    return;
  }

  const existing = (state.companies || []).find(c => c.id === id);
  const companyObj = {
    id,
    clientId: document.getElementById('mcClientId').value.trim() || ('klient-' + Date.now()),
    name,
    ico: document.getElementById('mcIco').value.trim(),
    industry: document.getElementById('mcIndustry').value.trim(),
    contactPerson: document.getElementById('mcContactPerson').value.trim(),
    email: document.getElementById('mcEmail').value.trim(),
    phone: document.getElementById('mcPhone').value.trim(),
    domain: document.getElementById('mcDomain').value.trim(),
    status: document.getElementById('mcStatus').value,
    monthlyFee: Number(document.getElementById('mcMonthlyFee').value || 0),
    createdAt: existing?.createdAt || new Date().toISOString().slice(0, 10),
    notes: document.getElementById('mcNotes').value.trim(),
    chatAgent: {
      enabled: document.getElementById('mcChatEnabled').checked,
      botName: document.getElementById('mcChatBotName').value.trim() || `AI ${name}`,
      primaryColor: document.getElementById('mcChatColorHex').value.trim() || '#179ccb',
      secondaryColor: existing?.chatAgent?.secondaryColor || '#0076a3',
      welcomeMessage: document.getElementById('mcChatWelcome').value.trim(),
      systemPrompt: document.getElementById('mcChatPrompt').value.trim(),
      knowledgeBase: document.getElementById('mcChatKb').value.trim(),
      quickButtons: document.getElementById('mcChatQuickBtns').value.split(',').map(s => s.trim()).filter(Boolean),
      webhookUrl: document.getElementById('mcChatWebhook').value.trim(),
      conversationsCount: existing?.chatAgent?.conversationsCount || 0
    },
    voiceAgent: {
      enabled: document.getElementById('mcVoiceEnabled').checked,
      phoneNumber: document.getElementById('mcVoicePhone').value.trim(),
      transferNumber: document.getElementById('mcVoiceTransfer').value.trim(),
      provider: document.getElementById('mcVoiceProvider').value,
      voiceName: document.getElementById('mcVoiceName').value.trim(),
      greeting: document.getElementById('mcVoiceGreeting').value.trim(),
      systemPrompt: document.getElementById('mcVoicePrompt').value.trim(),
      workingHours: document.getElementById('mcVoiceHours').value.trim(),
      callsCount: existing?.voiceAgent?.callsCount || 0,
      minutesUsed: existing?.voiceAgent?.minutesUsed || 0
    }
  };

  if (isNew) {
    state.companies = [companyObj, ...(state.companies || [])];
  } else {
    state.companies = (state.companies || []).map(c => c.id === id ? companyObj : c);
  }

  document.getElementById('companyModal').classList.remove('open');
  persistState(`Firma „${name}“ byla uložena do databáze!`);
}

/* ── 3. CHATBOT CONTROL & LIVE SIMULATOR ───────────────────── */
function renderProfileSelects() {
  const cbSel = document.getElementById('chatbotProfileSelect');
  const vbSel = document.getElementById('voiceProfileSelect');
  const embSel = document.getElementById('embedCompanySelect');

  const optionsHtml = [
    `<option value="global">🌐 Globální (Hlavní web ProFirmio)</option>`,
    ...(state.companies || []).map(c => `<option value="${c.id}">🏢 Firma: ${c.name}</option>`)
  ].join('');

  if (cbSel) {
    cbSel.innerHTML = optionsHtml;
    cbSel.value = selectedChatbotProfile;
  }
  if (vbSel) {
    vbSel.innerHTML = optionsHtml;
    vbSel.value = selectedVoiceProfile;
  }
  if (embSel) {
    const prev = embSel.value;
    embSel.innerHTML = (state.companies || []).map(c => `<option value="${c.id}">${c.name} (${c.clientId})</option>`).join('');
    if (prev && (state.companies || []).some(c => c.id === prev)) embSel.value = prev;
  }
}

function populateChatbotForm() {
  const cb = state.chatbot || {};
  const comp = selectedChatbotProfile !== 'global'
    ? (state.companies || []).find(c => c.id === selectedChatbotProfile)
    : null;

  document.getElementById('cbProvider').value = cb.provider || 'gemini';
  document.getElementById('cbModel').value = cb.model || 'gemini-2.5-flash';
  document.getElementById('cbTemperature').value = cb.temperature ?? 0.6;
  document.getElementById('cbTempVal').textContent = cb.temperature ?? 0.6;
  document.getElementById('cbMaxTokens').value = cb.maxTokens ?? 500;
  document.getElementById('cbBookingUrl').value = cb.bookingUrl || '';
  document.getElementById('cbFallbackReply').value = cb.fallbackReply || '';

  if (comp) {
    document.getElementById('cbSystemPrompt').value = comp.chatAgent?.systemPrompt || '';
    document.getElementById('cbWebhookUrl').value = comp.chatAgent?.webhookUrl || '';
    document.getElementById('simActiveCompanyLabel').textContent = `Profil firmy: ${comp.name}`;
  } else {
    document.getElementById('cbSystemPrompt').value = cb.systemPrompt || '';
    document.getElementById('cbWebhookUrl').value = cb.leadWebhookUrl || '';
    document.getElementById('simActiveCompanyLabel').textContent = 'Profil: ProFirmio (Hlavní web)';
  }

  renderKbList();
}

function renderKbList() {
  const container = document.getElementById('kbListContainer');
  const list = state.chatbot?.knowledgeBase || [];
  container.innerHTML = '';

  list.forEach((item, idx) => {
    const div = document.createElement('div');
    div.style.cssText = 'padding:12px;border:1px solid var(--adm-border);border-radius:10px;background:#f8fafc;display:flex;flex-direction:column;gap:8px;';
    div.innerHTML = `
      <div style="display:flex;gap:8px;align-items:center;">
        <input type="text" class="form-input" value="${(item.question || '').replace(/"/g, '&quot;')}" onchange="updateKbItem(${idx}, 'question', this.value)" placeholder="Otázka / Téma..." />
        <button type="button" class="btn btn-danger btn-sm" onclick="removeKbItem(${idx})">✕</button>
      </div>
      <textarea class="form-textarea" style="min-height:60px;" onchange="updateKbItem(${idx}, 'answer', this.value)" placeholder="Odpověď bota...">${item.answer || ''}</textarea>
    `;
    container.appendChild(div);
  });
}

window.updateKbItem = function (idx, field, val) {
  if (!state.chatbot.knowledgeBase[idx]) return;
  state.chatbot.knowledgeBase[idx][field] = val;
};

window.removeKbItem = function (idx) {
  state.chatbot.knowledgeBase.splice(idx, 1);
  renderKbList();
};

window.applyPromptTemplate = function (type) {
  const templates = {
    b2b: `Jsi zkušený B2B AI konzultant. Zjisti velikost firmy klienta, jaké procesy ho nejvíce zdržují, srozumitelně představ přínosy automatizace a požádej o e-mail nebo telefon na 15minutovou bezplatnou konzultaci.`,
    clinic: `Jsi empatická virtuální recepční kliniky/ordinace. Odpovídej na dotazy ohledně otevírací doby, ceníku zákroků a přípravy na vyšetření. Zjisti jméno pacienta, telefonní číslo a preferovaný den návštěvy.`,
    eshop: `Jsi rychlá zákaznická podpora e-shopu. Pomáháš s výběrem zboží, stavem objednávky, dopravou a reklamacemi. Vždy odpovídej přátelsky a pokud dotaz vyžaduje lidskou kontrolu, vyžádej si číslo objednávky a e-mail.`
  };
  if (templates[type]) {
    document.getElementById('cbSystemPrompt').value = templates[type];
    showToast('Šablona System Promptu byla vložena!');
  }
};

function resetChatSimulator() {
  simChatHistory = [];
  const box = document.getElementById('simChatMessages');
  const comp = selectedChatbotProfile !== 'global'
    ? (state.companies || []).find(c => c.id === selectedChatbotProfile)
    : null;
  const welcome = comp?.chatAgent?.welcomeMessage || state.widget?.welcomeText || 'Dobrý den! Jak vám mohu pomoci?';
  box.innerHTML = `<div class="sim-msg bot">${welcome}</div>`;
}

async function sendSimChatMessage() {
  const input = document.getElementById('simChatInput');
  const box = document.getElementById('simChatMessages');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  const userDiv = document.createElement('div');
  userDiv.className = 'sim-msg user';
  userDiv.textContent = text;
  box.appendChild(userDiv);
  box.scrollTop = box.scrollHeight;

  simChatHistory.push({ role: 'user', text });

  const comp = selectedChatbotProfile !== 'global'
    ? (state.companies || []).find(c => c.id === selectedChatbotProfile)
    : null;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        history: simChatHistory,
        clientId: comp ? comp.id : 'comp-profirmio',
        companyProfile: comp || null,
        chatbotConfig: state.chatbot,
        apiKeys: state.apiKeys
      })
    });
    const data = await res.json();
    const reply = data.reply || 'Rozumím, děkuji za dotaz.';
    const botDiv = document.createElement('div');
    botDiv.className = 'sim-msg bot';
    botDiv.textContent = reply;
    box.appendChild(botDiv);
    box.scrollTop = box.scrollHeight;
    simChatHistory.push({ role: 'bot', text: reply });

    if (data.capturedLead) {
      state.leads = [data.capturedLead, ...(state.leads || [])];
      persistState('🎯 V chatu byl automaticky rozpoznán a uložen nový Lead!');
    }
  } catch (e) {
    const botDiv = document.createElement('div');
    botDiv.className = 'sim-msg bot';
    botDiv.textContent = `Děkuji za dotaz! Jako AI asistent ${comp ? comp.name : 'ProFirmio'} jsem si poznamenal vaši zprávu.`;
    box.appendChild(botDiv);
  }
}

window.sendSimQuick = function (text) {
  document.getElementById('simChatInput').value = text;
  sendSimChatMessage();
};

/* ── 4. VOICE BOT CONTROL & LIVE PHONE SIMULATOR ───────────── */
function populateVoicebotForm() {
  const vb = state.voicebot || {};
  const comp = selectedVoiceProfile !== 'global'
    ? (state.companies || []).find(c => c.id === selectedVoiceProfile)
    : null;

  document.getElementById('vbSpeechRate').value = vb.speechRate ?? 1.02;
  document.getElementById('vbRateVal').textContent = (vb.speechRate ?? 1.02) + 'x';
  document.getElementById('vbVoiceId').value = vb.voiceId || 'EXAVITQu4vr4xnSDxMaL';
  document.getElementById('vbWebhookUrl').value = vb.callWebhookUrl || '';
  document.getElementById('vbSmsTemplate').value = vb.followupSmsTemplate || '';

  if (comp) {
    document.getElementById('vbProvider').value = comp.voiceAgent?.provider || 'elevenlabs';
    document.getElementById('vbVoiceName').value = comp.voiceAgent?.voiceName || 'Viktorie (CZ)';
    document.getElementById('vbPhoneNumber').value = comp.voiceAgent?.phoneNumber || '';
    document.getElementById('vbTransferNumber').value = comp.voiceAgent?.transferNumber || '';
    document.getElementById('vbWorkingHours').value = comp.voiceAgent?.workingHours || '24/7';
    document.getElementById('vbGreeting').value = comp.voiceAgent?.greeting || '';
    document.getElementById('vbSystemPrompt').value = comp.voiceAgent?.systemPrompt || '';
    document.getElementById('phoneSimCompanyTitle').textContent = `Volací Agent: ${comp.name}`;
  } else {
    document.getElementById('vbProvider').value = vb.provider || 'elevenlabs';
    document.getElementById('vbVoiceName').value = vb.voiceName || 'Viktorie (Český přirozený hlas)';
    document.getElementById('vbPhoneNumber').value = vb.phoneNumber || '+420 730 553 971';
    document.getElementById('vbTransferNumber').value = vb.transferNumber || '+420 730 553 971';
    document.getElementById('vbWorkingHours').value = vb.workingHours || 'Nonstop 24/7';
    document.getElementById('vbGreeting').value = vb.greeting || '';
    document.getElementById('vbSystemPrompt').value = vb.systemPrompt || '';
    document.getElementById('phoneSimCompanyTitle').textContent = 'ProFirmio Hlasový Agent';
  }
}

function speakAdminVoice(text, audioBase64, onDone) {
  const rate = Number(document.getElementById('vbSpeechRate')?.value || 1.02);
  if (audioBase64) {
    const audio = new Audio('data:audio/mpeg;base64,' + audioBase64);
    audio.onended = () => { if (onDone) onDone(); };
    audio.play().catch(() => { if (onDone) onDone(); });
    return;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'cs-CZ';
    utter.rate = rate;
    const voices = window.speechSynthesis.getVoices();
    const czVoice = voices.find(v => v.lang && v.lang.toLowerCase().includes('cs'));
    if (czVoice) utter.voice = czVoice;
    utter.onend = () => { if (onDone) onDone(); };
    window.speechSynthesis.speak(utter);
  } else if (onDone) {
    onDone();
  }
}

function appendPhoneTranscript(speaker, text) {
  const box = document.getElementById('phoneSimTranscript');
  const line = document.createElement('div');
  line.style.marginBottom = '8px';
  line.innerHTML = `<strong style="color:${speaker === 'AI' ? '#38bdf8' : '#22c55e'};">${speaker}:</strong> ${text}`;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}

async function processAdminVoiceTurn(userText) {
  if (!userText) return;
  appendPhoneTranscript('Volající', userText);
  simVoiceHistory.push({ role: 'user', text: userText });

  document.getElementById('phoneSimStatusText').textContent = 'AI Agent zpracovává odpověď...';

  const comp = selectedVoiceProfile !== 'global'
    ? (state.companies || []).find(c => c.id === selectedVoiceProfile)
    : null;

  try {
    const res = await fetch('/api/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'converse',
        transcript: userText,
        history: simVoiceHistory,
        clientId: comp ? comp.id : 'comp-profirmio',
        companyProfile: comp || null,
        voiceConfig: state.voicebot,
        apiKeys: state.apiKeys
      })
    });
    const data = await res.json();
    const reply = data.reply || 'Rozumím, poznamenal jsem si to.';
    simVoiceHistory.push({ role: 'bot', text: reply });
    appendPhoneTranscript('AI', reply);
    document.getElementById('phoneSimStatusText').textContent = '🔊 AI Agent mluví...';
    speakAdminVoice(reply, data.audioBase64, () => {
      if (adminCallActive) {
        document.getElementById('phoneSimStatusText').textContent = '🎙️ Hovor aktivní — můžete mluvit';
      }
    });
  } catch (e) {
    const fallback = 'Rozumím, děkuji za informaci. Jaký termín se vám hodí?';
    appendPhoneTranscript('AI', fallback);
    speakAdminVoice(fallback, null);
  }
}

/* ── 5. WIDGET VISUAL STUDIO ───────────────────────────────── */
const WIDGET_THEMES = {
  profirmio: { primaryColor: '#179ccb', secondaryColor: '#0076a3', bgColor: '#ffffff', headerBgColor: '#fafafa', botBubbleColor: '#f1f5f9', userBubbleColor: '#179ccb', textColor: '#17233b', botTextColor: '#17233b' },
  royal: { primaryColor: '#2563eb', secondaryColor: '#1e40af', bgColor: '#ffffff', headerBgColor: '#f8fafc', botBubbleColor: '#eff6ff', userBubbleColor: '#2563eb', textColor: '#0f172a', botTextColor: '#0f172a' },
  emerald: { primaryColor: '#0d9488', secondaryColor: '#115e59', bgColor: '#ffffff', headerBgColor: '#f0fdfa', botBubbleColor: '#f1f5f9', userBubbleColor: '#0d9488', textColor: '#134e4a', botTextColor: '#0f172a' },
  violet: { primaryColor: '#7c3aed', secondaryColor: '#5b21b6', bgColor: '#ffffff', headerBgColor: '#faf5ff', botBubbleColor: '#f3e8ff', userBubbleColor: '#7c3aed', textColor: '#1e1b4b', botTextColor: '#1e1b4b' },
  dark: { primaryColor: '#35c4ed', secondaryColor: '#0284c7', bgColor: '#0f172a', headerBgColor: '#1e293b', botBubbleColor: '#1e293b', userBubbleColor: '#0284c7', textColor: '#f8fafc', botTextColor: '#f8fafc' },
  gold: { primaryColor: '#d97706', secondaryColor: '#92400e', bgColor: '#ffffff', headerBgColor: '#fffbeb', botBubbleColor: '#fef3c7', userBubbleColor: '#d97706', textColor: '#1c1917', botTextColor: '#1c1917' }
};

window.applyWidgetTheme = function (themeKey) {
  const theme = WIDGET_THEMES[themeKey];
  if (!theme) return;
  state.widget = { ...state.widget, ...theme };
  populateWidgetForm();
  if (window.ProFirmioWidget) window.ProFirmioWidget.applyConfig(state.widget);
  showToast('Barevný motiv widgetu byl aplikován!');
};

function populateWidgetForm() {
  const w = state.widget || {};
  const setColorPair = (pickerId, hexId, val) => {
    const p = document.getElementById(pickerId);
    const h = document.getElementById(hexId);
    if (p) p.value = val;
    if (h) h.value = val;
  };

  setColorPair('wgPrimaryColor', 'wgPrimaryColorHex', w.primaryColor || '#179ccb');
  setColorPair('wgSecondaryColor', 'wgSecondaryColorHex', w.secondaryColor || '#0076a3');
  setColorPair('wgBgColor', 'wgBgColorHex', w.bgColor || '#ffffff');
  setColorPair('wgHeaderBgColor', 'wgHeaderBgColorHex', w.headerBgColor || '#fafafa');
  setColorPair('wgBotBubbleColor', 'wgBotBubbleColorHex', w.botBubbleColor || '#f1f5f9');
  setColorPair('wgUserBubbleColor', 'wgUserBubbleColorHex', w.userBubbleColor || '#179ccb');

  document.getElementById('wgPosition').value = w.position || 'right';
  document.getElementById('wgAvatarType').value = w.avatarType || 'cpu';
  document.getElementById('wgBorderRadius').value = w.borderRadius ?? 20;
  document.getElementById('wgRadiusVal').textContent = (w.borderRadius ?? 20) + 'px';
  document.getElementById('wgButtonSize').value = w.buttonSize ?? 56;
  document.getElementById('wgBtnSizeVal').textContent = (w.buttonSize ?? 56) + 'px';
  document.getElementById('wgWidth').value = w.width ?? 350;
  document.getElementById('wgHeight').value = w.height ?? 500;

  document.getElementById('wgHeaderTitle').value = w.headerTitle || '';
  document.getElementById('wgHeaderSubtitle').value = w.headerSubtitle || '';
  document.getElementById('wgWelcomeTitle').value = w.welcomeTitle || '';
  document.getElementById('wgInputPlaceholder').value = w.inputPlaceholder || '';
  document.getElementById('wgWelcomeText').value = w.welcomeText || '';
  document.getElementById('wgQuickButtons').value = (w.quickButtons || []).join('\n');
  document.getElementById('wgFooterText').value = w.footerText || '';
  document.getElementById('wgCustomAvatarUrl').value = w.customAvatarUrl || '';

  document.getElementById('wgEnableVoiceTab').checked = w.enableVoiceTab !== false;
  document.getElementById('wgEnableWiggle').checked = w.enableWiggle !== false;
  document.getElementById('wgEnableSound').checked = w.enableSound !== false;
}

function readWidgetFormIntoState() {
  state.widget = {
    ...state.widget,
    primaryColor: document.getElementById('wgPrimaryColorHex').value.trim() || '#179ccb',
    secondaryColor: document.getElementById('wgSecondaryColorHex').value.trim() || '#0076a3',
    bgColor: document.getElementById('wgBgColorHex').value.trim() || '#ffffff',
    headerBgColor: document.getElementById('wgHeaderBgColorHex').value.trim() || '#fafafa',
    botBubbleColor: document.getElementById('wgBotBubbleColorHex').value.trim() || '#f1f5f9',
    userBubbleColor: document.getElementById('wgUserBubbleColorHex').value.trim() || '#179ccb',
    position: document.getElementById('wgPosition').value,
    avatarType: document.getElementById('wgAvatarType').value,
    borderRadius: Number(document.getElementById('wgBorderRadius').value || 20),
    buttonSize: Number(document.getElementById('wgButtonSize').value || 56),
    width: Number(document.getElementById('wgWidth').value || 350),
    height: Number(document.getElementById('wgHeight').value || 500),
    headerTitle: document.getElementById('wgHeaderTitle').value.trim(),
    headerSubtitle: document.getElementById('wgHeaderSubtitle').value.trim(),
    welcomeTitle: document.getElementById('wgWelcomeTitle').value.trim(),
    inputPlaceholder: document.getElementById('wgInputPlaceholder').value.trim(),
    welcomeText: document.getElementById('wgWelcomeText').value.trim(),
    quickButtons: document.getElementById('wgQuickButtons').value.split('\n').map(s => s.trim()).filter(Boolean),
    footerText: document.getElementById('wgFooterText').value.trim(),
    customAvatarUrl: document.getElementById('wgCustomAvatarUrl').value.trim(),
    enableVoiceTab: document.getElementById('wgEnableVoiceTab').checked,
    enableWiggle: document.getElementById('wgEnableWiggle').checked,
    enableSound: document.getElementById('wgEnableSound').checked
  };
  if (window.ProFirmioWidget) {
    window.ProFirmioWidget.applyConfig(state.widget);
  }
}

function renderEmbedGenerator() {
  const sel = document.getElementById('embedCompanySelect');
  const box = document.getElementById('embedCodeBox');
  if (!sel || !box) return;
  const comp = (state.companies || []).find(c => c.id === sel.value) || (state.companies || [])[0];
  const origin = window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'https://profirmio.vercel.app';
  const clientId = comp ? (comp.clientId || comp.id) : 'profirmio-main';
  box.textContent = `<!-- ProFirmio AI Chat & Voice Widget (${comp ? comp.name : 'ProFirmio'}) -->\n<script src="${origin}/scripts-agent.js" data-client-id="${clientId}" defer></script>`;
}

/* ── 6. LEADS & CALL/CHAT LOGS ─────────────────────────────── */
function renderLeadsAndLogs() {
  const tbody = document.getElementById('leadsTableBody');
  const leads = state.leads || [];
  tbody.innerHTML = '';

  leads.forEach((l, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="white-space:nowrap;color:var(--adm-text-sec);">${l.createdAt || ''}</td>
      <td><strong>${l.companyName || 'ProFirmio'}</strong></td>
      <td><span class="status-badge ${l.source === 'voice' ? 'status-trial' : 'status-active'}">${l.source === 'voice' ? '📞 Hlas' : '💬 Chat'}</span></td>
      <td><strong>${l.contact || ''}</strong></td>
      <td>${l.phone || '—'}</td>
      <td>${l.summary || ''}</td>
      <td>
        <select class="form-select" style="padding:4px 8px;font-size:0.76rem;width:auto;" onchange="updateLeadStatus(${idx}, this.value)">
          <option value="Nový" ${l.status === 'Nový' ? 'selected' : ''}>Nový</option>
          <option value="V řešení" ${l.status === 'V řešení' ? 'selected' : ''}>V řešení</option>
          <option value="Zpracováno" ${l.status === 'Zpracováno' ? 'selected' : ''}>Zpracováno</option>
        </select>
      </td>
      <td>
        <button type="button" class="btn btn-danger btn-sm" onclick="deleteLead(${idx})">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  const logsBox = document.getElementById('logsListContainer');
  logsBox.innerHTML = '';
  (state.logs || []).forEach(log => {
    const d = document.createElement('div');
    d.style.cssText = 'padding:14px 16px;border-radius:12px;border:1px solid var(--adm-border);background:#f8fafc;';
    d.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <div>
          <strong>${log.type === 'voice' ? '📞 Záznam hovoru' : '💬 Záznam chatu'} · ${log.companyName}</strong>
          <span style="font-size:0.76rem;color:var(--adm-text-sec);margin-left:8px;">Volající: ${log.caller} · Délka: ${log.duration}</span>
        </div>
        <span style="font-size:0.75rem;color:var(--adm-text-sec);">${log.timestamp} · <strong>${log.outcome}</strong></span>
      </div>
      <pre style="white-space:pre-wrap;font-family:inherit;font-size:0.8rem;color:var(--adm-text);background:#fff;padding:10px 12px;border-radius:8px;border:1px solid var(--adm-border);">${log.transcript || ''}</pre>
    `;
    logsBox.appendChild(d);
  });
}

window.updateLeadStatus = function (idx, val) {
  if (!state.leads[idx]) return;
  state.leads[idx].status = val;
  persistState('Stav leadu aktualizován.');
};

window.deleteLead = function (idx) {
  state.leads.splice(idx, 1);
  persistState('Záznam leadu odstraněn.');
};

/* ── 7. API KEYS & BACKUP ──────────────────────────────────── */
function populateApiKeysForm() {
  const keys = state.apiKeys || {};
  document.getElementById('keyGemini').value = keys.geminiKey || '';
  document.getElementById('keyOpenai').value = keys.openaiKey || '';
  document.getElementById('keyElevenlabs').value = keys.elevenlabsKey || '';
  document.getElementById('keyVapi').value = keys.vapiKey || '';
}

/* ── EVENT LISTENERS SETUP ─────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  loadAdminState();

  // Sidebar navigation
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => window.switchAdminTab(btn.dataset.tab));
  });

  // Topbar buttons
  document.getElementById('btnSaveAll').addEventListener('click', () => persistState('Všechna nastavení byla uložena!'));
  document.getElementById('btnAddCompanyQuick').addEventListener('click', () => window.openCompanyModal(null));
  document.getElementById('btnAddNewCompany').addEventListener('click', () => window.openCompanyModal(null));

  // Dashboard switches
  document.getElementById('dashToggleWidget').addEventListener('change', (e) => {
    state.widget.enabled = e.target.checked;
    persistState(`Webový widget ${e.target.checked ? 'zapnut' : 'vypnut'}.`);
  });
  document.getElementById('dashToggleChatbot').addEventListener('change', (e) => {
    state.chatbot.enabled = e.target.checked;
    persistState(`AI Chatbot ${e.target.checked ? 'zapnut' : 'vypnut'}.`);
  });
  document.getElementById('dashToggleVoicebot').addEventListener('change', (e) => {
    state.voicebot.enabled = e.target.checked;
    state.widget.enableVoiceTab = e.target.checked;
    persistState(`AI Hlasový Bot ${e.target.checked ? 'zapnut' : 'vypnut'}.`);
  });

  // Company filters & search
  document.getElementById('companySearchInput').addEventListener('input', renderCompanies);
  document.querySelectorAll('#companyFilterPills .filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#companyFilterPills .filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCompanyFilter = pill.dataset.filter;
      renderCompanies();
    });
  });

  // Company Modal tabs & actions
  document.querySelectorAll('.modal-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.mtab;
      document.querySelectorAll('.mtab-pane').forEach(p => {
        p.style.display = p.id === target ? 'block' : 'none';
      });
    });
  });
  document.getElementById('mcChatColor').addEventListener('input', e => {
    document.getElementById('mcChatColorHex').value = e.target.value;
  });
  document.getElementById('mcChatColorHex').addEventListener('input', e => {
    document.getElementById('mcChatColor').value = e.target.value;
  });
  document.getElementById('btnCloseCompanyModal').addEventListener('click', () => {
    document.getElementById('companyModal').classList.remove('open');
  });
  document.getElementById('btnCancelCompanyModal').addEventListener('click', () => {
    document.getElementById('companyModal').classList.remove('open');
  });
  document.getElementById('btnSaveCompanyModal').addEventListener('click', saveCompanyFromModal);

  // Chatbot tab events
  document.getElementById('chatbotProfileSelect').addEventListener('change', (e) => {
    selectedChatbotProfile = e.target.value;
    populateChatbotForm();
    resetChatSimulator();
  });
  document.getElementById('cbTemperature').addEventListener('input', (e) => {
    document.getElementById('cbTempVal').textContent = e.target.value;
  });
  document.getElementById('btnAddKbItem').addEventListener('click', () => {
    state.chatbot.knowledgeBase = [
      ...(state.chatbot.knowledgeBase || []),
      { id: 'kb-' + Date.now(), question: 'Nová otázka klienta?', answer: 'Odpověď, kterou má chatbot použít...' }
    ];
    renderKbList();
  });
  document.getElementById('btnSaveChatbot').addEventListener('click', () => {
    state.chatbot.provider = document.getElementById('cbProvider').value;
    state.chatbot.model = document.getElementById('cbModel').value;
    state.chatbot.temperature = Number(document.getElementById('cbTemperature').value);
    state.chatbot.maxTokens = Number(document.getElementById('cbMaxTokens').value);
    state.chatbot.bookingUrl = document.getElementById('cbBookingUrl').value.trim();
    state.chatbot.fallbackReply = document.getElementById('cbFallbackReply').value.trim();

    if (selectedChatbotProfile === 'global') {
      state.chatbot.systemPrompt = document.getElementById('cbSystemPrompt').value.trim();
      state.chatbot.leadWebhookUrl = document.getElementById('cbWebhookUrl').value.trim();
    } else {
      const comp = (state.companies || []).find(c => c.id === selectedChatbotProfile);
      if (comp) {
        comp.chatAgent.systemPrompt = document.getElementById('cbSystemPrompt').value.trim();
        comp.chatAgent.webhookUrl = document.getElementById('cbWebhookUrl').value.trim();
      }
    }
    persistState('Nastavení Chatbota bylo uloženo!');
  });

  // Chat simulator events
  document.getElementById('btnSendSimChat').addEventListener('click', sendSimChatMessage);
  document.getElementById('simChatInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendSimChatMessage();
    }
  });
  document.getElementById('btnClearChatSim').addEventListener('click', resetChatSimulator);

  // Voicebot tab events
  document.getElementById('voiceProfileSelect').addEventListener('change', (e) => {
    selectedVoiceProfile = e.target.value;
    populateVoicebotForm();
  });
  document.getElementById('vbSpeechRate').addEventListener('input', (e) => {
    document.getElementById('vbRateVal').textContent = e.target.value + 'x';
  });
  document.getElementById('btnSaveVoicebot').addEventListener('click', () => {
    state.voicebot.speechRate = Number(document.getElementById('vbSpeechRate').value);
    state.voicebot.voiceId = document.getElementById('vbVoiceId').value.trim();
    state.voicebot.callWebhookUrl = document.getElementById('vbWebhookUrl').value.trim();
    state.voicebot.followupSmsTemplate = document.getElementById('vbSmsTemplate').value.trim();

    if (selectedVoiceProfile === 'global') {
      state.voicebot.provider = document.getElementById('vbProvider').value;
      state.voicebot.voiceName = document.getElementById('vbVoiceName').value.trim();
      state.voicebot.phoneNumber = document.getElementById('vbPhoneNumber').value.trim();
      state.voicebot.transferNumber = document.getElementById('vbTransferNumber').value.trim();
      state.voicebot.workingHours = document.getElementById('vbWorkingHours').value.trim();
      state.voicebot.greeting = document.getElementById('vbGreeting').value.trim();
      state.voicebot.systemPrompt = document.getElementById('vbSystemPrompt').value.trim();
    } else {
      const comp = (state.companies || []).find(c => c.id === selectedVoiceProfile);
      if (comp) {
        comp.voiceAgent.provider = document.getElementById('vbProvider').value;
        comp.voiceAgent.voiceName = document.getElementById('vbVoiceName').value.trim();
        comp.voiceAgent.phoneNumber = document.getElementById('vbPhoneNumber').value.trim();
        comp.voiceAgent.transferNumber = document.getElementById('vbTransferNumber').value.trim();
        comp.voiceAgent.workingHours = document.getElementById('vbWorkingHours').value.trim();
        comp.voiceAgent.greeting = document.getElementById('vbGreeting').value.trim();
        comp.voiceAgent.systemPrompt = document.getElementById('vbSystemPrompt').value.trim();
      }
    }
    persistState('Nastavení Hlasového Bota bylo uloženo!');
  });

  // Outbound Call Trigger
  document.getElementById('btnTriggerOutboundCall').addEventListener('click', async () => {
    const phone = document.getElementById('outboundPhoneInput').value.trim();
    const comp = selectedVoiceProfile !== 'global'
      ? (state.companies || []).find(c => c.id === selectedVoiceProfile)
      : null;

    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'outbound_call',
          phoneNumber: phone,
          clientId: comp ? comp.id : 'comp-profirmio',
          companyProfile: comp || null,
          voiceConfig: state.voicebot,
          apiKeys: state.apiKeys
        })
      });
      const data = await res.json();
      if (data.logEntry) {
        state.logs = [data.logEntry, ...(state.logs || [])];
        persistState(data.message || 'Testovací hovor vytočen a zapsán!');
      } else {
        showToast('Odchozí hovor odeslán přes hlasovou ústřednu!');
      }
    } catch (e) {
      showToast('Testovací hovor zaznamenán.');
    }
  });

  // Interactive Phone Call Simulator in Admin
  const phoneSimBox = document.getElementById('adminPhoneSim');
  const startCallBtn = document.getElementById('btnAdminStartCall');
  const micBtn = document.getElementById('btnAdminMicToggle');
  const timerEl = document.getElementById('phoneSimTimer');

  document.getElementById('btnAdminSpeakGreeting').addEventListener('click', () => {
    const greeting = document.getElementById('vbGreeting').value.trim() || state.voicebot.greeting;
    speakAdminVoice(greeting, null);
    showToast('Přehrávám úvodní pozdrav hlasového agenta...');
  });

  startCallBtn.addEventListener('click', () => {
    if (!adminCallActive) {
      adminCallActive = true;
      simVoiceHistory = [];
      adminCallSeconds = 0;
      phoneSimBox.classList.add('active-call');
      startCallBtn.className = 'btn btn-danger';
      startCallBtn.textContent = '📴 Zavěsit hovor';
      micBtn.style.display = 'inline-flex';
      document.getElementById('phoneSimTranscript').innerHTML = '';

      adminCallTimerInterval = setInterval(() => {
        adminCallSeconds++;
        const m = String(Math.floor(adminCallSeconds / 60)).padStart(2, '0');
        const s = String(adminCallSeconds % 60).padStart(2, '0');
        timerEl.textContent = `${m}:${s}`;
      }, 1000);

      const greeting = document.getElementById('vbGreeting').value.trim() || state.voicebot.greeting;
      appendPhoneTranscript('AI', greeting);
      document.getElementById('phoneSimStatusText').textContent = '🔊 AI Agent říká úvodní pozdrav...';
      speakAdminVoice(greeting, null, () => {
        if (adminCallActive) {
          document.getElementById('phoneSimStatusText').textContent = '🎙️ Hovor aktivní — klikněte na Mluvit nebo napište odpověď';
        }
      });
    } else {
      adminCallActive = false;
      clearInterval(adminCallTimerInterval);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      phoneSimBox.classList.remove('active-call');
      startCallBtn.className = 'btn btn-success';
      startCallBtn.textContent = '📞 Zahájit hlasový hovor';
      micBtn.style.display = 'none';
      document.getElementById('phoneSimStatusText').textContent = 'Hovor ukončen a uložen do historie';

      // Save call transcript to logs
      const comp = selectedVoiceProfile !== 'global'
        ? (state.companies || []).find(c => c.id === selectedVoiceProfile)
        : null;
      const transcriptText = Array.from(document.querySelectorAll('#phoneSimTranscript div'))
        .map(d => d.textContent)
        .join('\n');
      if (transcriptText) {
        state.logs = [
          {
            id: 'log-' + Date.now(),
            type: 'voice',
            companyId: comp ? comp.id : 'comp-profirmio',
            companyName: comp ? comp.name : 'ProFirmio (Vlastní web)',
            caller: 'Admin Tester',
            duration: timerEl.textContent,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
            outcome: 'Testovací hovor dokončen',
            transcript: transcriptText
          },
          ...(state.logs || [])
        ];
        persistState('Hovor ukončen a přepis uložen do historie!');
      }
    }
  });

  micBtn.addEventListener('click', () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Váš prohlížeč nepodporuje přímé rozpoznávání řeči (použijte Chrome/Edge nebo napište větu do pole níže).');
      return;
    }
    try {
      if (!adminSpeechRecognition) {
        adminSpeechRecognition = new SpeechRec();
        adminSpeechRecognition.lang = 'cs-CZ';
        adminSpeechRecognition.interimResults = false;
        adminSpeechRecognition.onresult = (ev) => {
          const spoken = ev.results[0][0].transcript;
          micBtn.textContent = '🎙️ Mluvit (Mikrofon)';
          processAdminVoiceTurn(spoken);
        };
        adminSpeechRecognition.onend = () => {
          micBtn.textContent = '🎙️ Mluvit (Mikrofon)';
        };
      }
      adminSpeechRecognition.start();
      micBtn.textContent = '🔴 Poslouchám... (mluvte česky)';
    } catch (e) {}
  });

  document.getElementById('btnPhoneSimSendText').addEventListener('click', () => {
    const inp = document.getElementById('phoneSimTextInput');
    const txt = inp.value.trim();
    if (!txt) return;
    inp.value = '';
    if (!adminCallActive) startCallBtn.click();
    processAdminVoiceTurn(txt);
  });
  document.getElementById('phoneSimTextInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('btnPhoneSimSendText').click();
    }
  });

  // Widget Visual Studio live binding
  const colorPairs = [
    ['wgPrimaryColor', 'wgPrimaryColorHex'],
    ['wgSecondaryColor', 'wgSecondaryColorHex'],
    ['wgBgColor', 'wgBgColorHex'],
    ['wgHeaderBgColor', 'wgHeaderBgColorHex'],
    ['wgBotBubbleColor', 'wgBotBubbleColorHex'],
    ['wgUserBubbleColor', 'wgUserBubbleColorHex']
  ];
  colorPairs.forEach(([pickerId, hexId]) => {
    const p = document.getElementById(pickerId);
    const h = document.getElementById(hexId);
    p.addEventListener('input', () => { h.value = p.value; readWidgetFormIntoState(); });
    h.addEventListener('input', () => { p.value = h.value; readWidgetFormIntoState(); });
  });

  ['wgPosition', 'wgAvatarType', 'wgWidth', 'wgHeight', 'wgHeaderTitle', 'wgHeaderSubtitle', 'wgWelcomeTitle', 'wgInputPlaceholder', 'wgWelcomeText', 'wgQuickButtons', 'wgFooterText', 'wgCustomAvatarUrl', 'wgEnableVoiceTab', 'wgEnableWiggle', 'wgEnableSound'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', readWidgetFormIntoState);
      el.addEventListener('change', readWidgetFormIntoState);
    }
  });

  document.getElementById('wgBorderRadius').addEventListener('input', e => {
    document.getElementById('wgRadiusVal').textContent = e.target.value + 'px';
    readWidgetFormIntoState();
  });
  document.getElementById('wgButtonSize').addEventListener('input', e => {
    document.getElementById('wgBtnSizeVal').textContent = e.target.value + 'px';
    readWidgetFormIntoState();
  });

  document.getElementById('btnSaveWidget').addEventListener('click', () => {
    readWidgetFormIntoState();
    persistState('Grafika a nastavení widgetu byly uloženy!');
  });

  document.getElementById('embedCompanySelect').addEventListener('change', renderEmbedGenerator);
  document.getElementById('btnCopyEmbed').addEventListener('click', () => {
    const code = document.getElementById('embedCodeBox').textContent;
    navigator.clipboard.writeText(code).then(() => showToast('Embed kód zkopírován do schránky!'));
  });

  // Leads export & manual add
  document.getElementById('btnExportLeadsCsv').addEventListener('click', () => {
    const rows = [
      ['Datum', 'Firma', 'Zdroj', 'Kontakt', 'Telefon', 'Shrnuti', 'Stav'],
      ...(state.leads || []).map(l => [l.createdAt, l.companyName, l.source, l.contact, l.phone, l.summary, l.status])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(r => r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(';')).join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csvContent);
    a.download = `profirmio_leady_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('CSV soubor s leady byl stažen!');
  });

  document.getElementById('btnAddLeadManual').addEventListener('click', () => {
    const contact = prompt('Zadejte jméno nebo e-mail kontaktu:');
    if (!contact) return;
    const phone = prompt('Zadejte telefonní číslo:', '+420 ');
    const summary = prompt('Poznámka / poptávka:', 'Telefonická poptávka AI agenta');
    state.leads = [
      {
        id: 'lead-' + Date.now(),
        companyId: 'comp-profirmio',
        companyName: 'ProFirmio (Vlastní web)',
        source: 'voice',
        contact,
        phone: phone || '—',
        summary: summary || '',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        status: 'Nový'
      },
      ...(state.leads || [])
    ];
    persistState('Nový lead byl přidán!');
  });

  // API keys & JSON Backup
  document.getElementById('btnSaveApiKeys').addEventListener('click', () => {
    state.apiKeys = {
      geminiKey: document.getElementById('keyGemini').value.trim(),
      openaiKey: document.getElementById('keyOpenai').value.trim(),
      elevenlabsKey: document.getElementById('keyElevenlabs').value.trim(),
      vapiKey: document.getElementById('keyVapi').value.trim()
    };
    persistState('API klíče byly uloženy!');
  });

  document.getElementById('btnExportJson').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profirmio_databaze_zaloha_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Kompletní JSON záloha databáze stažena!');
  });

  document.getElementById('inputImportJson').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        state = { ...DEFAULT_ADMIN_STATE, ...imported };
        persistState('Záloha databáze byla úspěšně nahrána!');
      } catch (err) {
        alert('Chyba při čtení JSON souboru.');
      }
    };
    reader.readAsText(file);
  });

  document.getElementById('btnResetDefaults').addEventListener('click', () => {
    if (!confirm('Opravdu chcete obnovit všechna nastavení a databázi firem do výchozího stavu?')) return;
    state = JSON.parse(JSON.stringify(DEFAULT_ADMIN_STATE));
    persistState('Výchozí data byla obnovena!');
  });
});

