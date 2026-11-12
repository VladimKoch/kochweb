(function () {
  const STORAGE_KEY = 'profirmio_admin_state';

  // Find current script tag to detect data-client-id or base URL
  const currentScript = document.currentScript || document.querySelector('script[src*="scripts-agent.js"]');
  const scriptClientId = currentScript ? (currentScript.getAttribute('data-client-id') || '') : '';
  const scriptSrc = currentScript && currentScript.src ? new URL(currentScript.src, window.location.href) : new URL(window.location.href);
  const API_BASE = scriptSrc.origin && scriptSrc.origin !== 'null' ? scriptSrc.origin : '';

  const AVATAR_SVGS = {
    cpu: '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/></svg>',
    bot: '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    headset: '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>'
  };

  let widgetConfig = {
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
  };

  let voiceGreeting = 'Dobrý den, tady hlasový AI asistent ProFirmio. Jak vám dnes mohu pomoci?';
  let chatHistory = [];
  let voiceHistory = [];
  let activeCall = false;
  let recognition = null;
  let isListening = false;

  // Ensure stylesheet is loaded if embedded externally
  function ensureStylesheet() {
    if (!document.querySelector('link[href*="style-agent.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = (API_BASE ? API_BASE + '/' : '') + 'style-agent.css';
      document.head.appendChild(link);
    }
  }

  // Build widget DOM if not present
  function ensureWidgetDOM() {
    let widget = document.getElementById('ktWidget');
    if (!widget) {
      widget = document.createElement('div');
      widget.className = 'kt-widget';
      widget.id = 'ktWidget';
      document.body.appendChild(widget);
    }

    widget.innerHTML = `
      <div class="kt-chat-box" id="ktChatBox">
        <div class="kt-header">
          <div class="kt-header-left">
            <div class="kt-avatar" id="ktAvatar">
              ${AVATAR_SVGS.cpu}
              <div class="kt-status-dot"></div>
            </div>
            <div class="kt-header-text">
              <h3 id="ktHeaderTitle">AI Konzultant ProFirmio</h3>
              <p id="ktHeaderSubtitle">Online — připraven pomoci</p>
            </div>
          </div>
          <div class="kt-mode-switch" id="ktModeSwitch">
            <button type="button" class="kt-mode-btn active" id="ktModeChatBtn" title="Textový chat">
              <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Chat
            </button>
            <button type="button" class="kt-mode-btn" id="ktModeVoiceBtn" title="Hlasový hovor s AI">
              <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Hovor
            </button>
          </div>
        </div>

        <div class="kt-welcome" id="ktWelcome">
          <h4 id="ktWelcomeTitle">Jak vám mohu pomoci?</h4>
          <p id="ktWelcomeText">Jsem AI asistent. Zeptejte se mě na cokoliv ohledně automatizace a vývoje webů.</p>
          <div class="kt-quick-btns" id="ktQuickBtns"></div>
        </div>

        <div class="kt-messages" id="ktMessages">
          <div class="kt-typing" id="ktTyping">
            <span></span><span></span><span></span>
          </div>
        </div>

        <div class="kt-voice-panel" id="ktVoicePanel">
          <div>
            <div class="kt-voice-status" id="ktVoiceStatus">AI Hlasový Agent připraven</div>
            <p style="font-size:0.74rem;color:var(--kt-text-muted);margin-top:3px;">Hovořte česky přímo přes mikrofon</p>
          </div>
          <div class="kt-voice-orb-wrap">
            <div class="kt-voice-orb-ring"></div>
            <div class="kt-voice-orb">
              <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            </div>
          </div>
          <div class="kt-voice-sub" id="ktVoiceSub">Klikněte na „Zahájit hovor“ a vyzkoušejte našeho hlasového bota naživo.</div>
          <div class="kt-voice-controls">
            <button type="button" class="kt-voice-call-btn" id="ktVoiceCallBtn">
              📞 Zahájit hovor
            </button>
            <button type="button" class="kt-voice-mic-btn" id="ktVoiceMicBtn" title="Přidržet / přepnout mikrofon" style="display:none;">
              <svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
            </button>
          </div>
        </div>

        <div class="kt-input-area" id="ktInputArea">
          <div class="kt-input-wrap">
            <input type="text" class="kt-input" id="ktInput" placeholder="Napište zprávu..." autocomplete="off">
            <button type="button" class="kt-send-btn" id="ktSendBtn">
              <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
          <div class="kt-footer" id="ktFooterText">Powered by ProFirmio AI</div>
        </div>
      </div>

      <button type="button" class="kt-chat-toggle" id="ktToggleBtn" aria-label="Otevřít AI asistenta">
        <svg class="icon-chat" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <svg class="icon-close" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        <div class="kt-badge" id="ktBadge"></div>
      </button>
    `;
    return widget;
  }

  // Apply visual config to CSS variables and DOM elements
  function applyWidgetConfig(cfg) {
    widgetConfig = { ...widgetConfig, ...cfg };
    const root = document.documentElement;
    const widget = document.getElementById('ktWidget');
    if (!widget) return;

    if (widgetConfig.enabled === false) {
      widget.classList.add('kt-disabled');
    } else {
      widget.classList.remove('kt-disabled');
    }

    root.style.setProperty('--kt-blue', widgetConfig.primaryColor || '#179ccb');
    root.style.setProperty('--kt-purple', widgetConfig.secondaryColor || '#0076a3');
    root.style.setProperty('--kt-blue-light', widgetConfig.accentColor || '#35c4ed');
    root.style.setProperty('--kt-bg-white', widgetConfig.bgColor || '#ffffff');
    root.style.setProperty('--kt-header-bg', widgetConfig.headerBgColor || '#fafafa');
    root.style.setProperty('--kt-text-primary', widgetConfig.textColor || '#17233b');
    root.style.setProperty('--kt-bot-bubble', widgetConfig.botBubbleColor || '#f1f5f9');
    root.style.setProperty('--kt-bot-text', widgetConfig.botTextColor || '#17233b');
    root.style.setProperty('--kt-user-bubble', widgetConfig.userBubbleColor || widgetConfig.primaryColor || '#179ccb');
    root.style.setProperty('--kt-user-text', widgetConfig.userTextColor || '#ffffff');
    root.style.setProperty('--kt-radius', (widgetConfig.borderRadius ?? 20) + 'px');
    root.style.setProperty('--kt-btn-size', (widgetConfig.buttonSize ?? 56) + 'px');
    root.style.setProperty('--kt-width', (widgetConfig.width ?? 350) + 'px');
    root.style.setProperty('--kt-height', (widgetConfig.height ?? 500) + 'px');
    root.style.setProperty('--kt-bottom', (widgetConfig.bottomOffset ?? 32) + 'px');
    root.style.setProperty('--kt-side', (widgetConfig.sideOffset ?? 24) + 'px');

    widget.classList.toggle('pos-left', widgetConfig.position === 'left');

    const titleEl = document.getElementById('ktHeaderTitle');
    const subEl = document.getElementById('ktHeaderSubtitle');
    const wTitleEl = document.getElementById('ktWelcomeTitle');
    const wTextEl = document.getElementById('ktWelcomeText');
    const inputEl = document.getElementById('ktInput');
    const footerEl = document.getElementById('ktFooterText');
    const badgeEl = document.getElementById('ktBadge');
    const modeSwitchEl = document.getElementById('ktModeSwitch');
    const avatarEl = document.getElementById('ktAvatar');
    const quickBtnsEl = document.getElementById('ktQuickBtns');

    if (titleEl) titleEl.textContent = widgetConfig.headerTitle || 'AI Konzultant ProFirmio';
    if (subEl) subEl.textContent = widgetConfig.headerSubtitle || 'Online — připraven pomoci';
    if (wTitleEl) wTitleEl.textContent = widgetConfig.welcomeTitle || 'Jak vám mohu pomoci?';
    if (wTextEl) wTextEl.textContent = widgetConfig.welcomeText || '';
    if (inputEl) inputEl.placeholder = widgetConfig.inputPlaceholder || 'Napište zprávu...';
    if (footerEl) footerEl.textContent = widgetConfig.footerText || 'Powered by ProFirmio AI';
    if (badgeEl) badgeEl.classList.toggle('hidden', !widgetConfig.showBadge || widget.classList.contains('open'));
    if (modeSwitchEl) modeSwitchEl.style.display = widgetConfig.enableVoiceTab === false ? 'none' : 'flex';

    if (avatarEl) {
      if (widgetConfig.customAvatarUrl) {
        avatarEl.innerHTML = `<img src="${widgetConfig.customAvatarUrl}" alt="AI"><div class="kt-status-dot"></div>`;
      } else {
        const svg = AVATAR_SVGS[widgetConfig.avatarType] || AVATAR_SVGS.cpu;
        avatarEl.innerHTML = `${svg}<div class="kt-status-dot"></div>`;
      }
    }

    if (quickBtnsEl) {
      const btns = Array.isArray(widgetConfig.quickButtons) ? widgetConfig.quickButtons : [];
      quickBtnsEl.innerHTML = '';
      btns.forEach(btnText => {
        if (!btnText) return;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'kt-quick-btn';
        b.textContent = btnText;
        b.addEventListener('click', () => window.ktQuickSend(btnText));
        quickBtnsEl.appendChild(b);
      });
    }
  }

  // Sound Effect
  let audioCtx = null;
  function playPopSound() {
    if (widgetConfig.enableSound === false) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.14, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {}
  }

  function initWidget() {
    ensureStylesheet();
    const widget = ensureWidgetDOM();
    const messagesDiv = document.getElementById('ktMessages');
    const welcomeDiv = document.getElementById('ktWelcome');
    const typingInd = document.getElementById('ktTyping');
    const input = document.getElementById('ktInput');
    const sendBtn = document.getElementById('ktSendBtn');
    const badge = document.getElementById('ktBadge');
    const toggleBtn = document.getElementById('ktToggleBtn');
    const modeChatBtn = document.getElementById('ktModeChatBtn');
    const modeVoiceBtn = document.getElementById('ktModeVoiceBtn');
    const voicePanel = document.getElementById('ktVoicePanel');
    const inputArea = document.getElementById('ktInputArea');
    const voiceCallBtn = document.getElementById('ktVoiceCallBtn');
    const voiceMicBtn = document.getElementById('ktVoiceMicBtn');
    const voiceStatus = document.getElementById('ktVoiceStatus');
    const voiceSub = document.getElementById('ktVoiceSub');

    // Load local config first for instant rendering
    let localState = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        localState = JSON.parse(raw);
        if (localState.widget) applyWidgetConfig(localState.widget);
        if (localState.voicebot?.greeting) voiceGreeting = localState.voicebot.greeting;
        if (scriptClientId && Array.isArray(localState.companies)) {
          const comp = localState.companies.find(c => c.clientId === scriptClientId || c.id === scriptClientId);
          if (comp) {
            applyWidgetConfig({
              enabled: comp.chatAgent?.enabled ?? true,
              primaryColor: comp.chatAgent?.primaryColor || widgetConfig.primaryColor,
              secondaryColor: comp.chatAgent?.secondaryColor || widgetConfig.secondaryColor,
              headerTitle: comp.chatAgent?.botName || comp.name,
              welcomeText: comp.chatAgent?.welcomeMessage || widgetConfig.welcomeText,
              quickButtons: comp.chatAgent?.quickButtons || widgetConfig.quickButtons,
              enableVoiceTab: comp.voiceAgent?.enabled ?? true
            });
            if (comp.voiceAgent?.greeting) voiceGreeting = comp.voiceAgent.greeting;
          }
        }
      } else {
        applyWidgetConfig(widgetConfig);
      }
    } catch (e) {
      applyWidgetConfig(widgetConfig);
    }

    // Fetch remote config from Vercel API (/api/data)
    const dataUrl = `${API_BASE}/api/data${scriptClientId ? '?clientId=' + encodeURIComponent(scriptClientId) : ''}`;
    fetch(dataUrl)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data || !data.ok) return;
        if (data.widget) {
          applyWidgetConfig(data.widget);
          if (data.voiceGreeting) voiceGreeting = data.voiceGreeting;
        } else if (data.state && !localState) {
          if (data.state.widget) applyWidgetConfig(data.state.widget);
          if (data.state.voicebot?.greeting) voiceGreeting = data.state.voicebot.greeting;
        }
      })
      .catch(() => {});

    // Listen to storage events if Admin Panel is open in another tab
    window.addEventListener('storage', (ev) => {
      if (ev.key === STORAGE_KEY && ev.newValue) {
        try {
          const parsed = JSON.parse(ev.newValue);
          if (parsed.widget) applyWidgetConfig(parsed.widget);
        } catch (e) {}
      }
    });

    // Wiggle animation
    let wiggleInterval = null;
    function startWiggle() {
      if (wiggleInterval) clearInterval(wiggleInterval);
      wiggleInterval = setInterval(() => {
        if (widgetConfig.enableWiggle !== false && !widget.classList.contains('open')) {
          toggleBtn.classList.add('wiggle');
          toggleBtn.addEventListener('animationend', () => {
            toggleBtn.classList.remove('wiggle');
          }, { once: true });
        }
      }, 8000);
    }
    setTimeout(startWiggle, 4000);

    // Auto open if configured
    if (Number(widgetConfig.autoOpenDelay) > 0) {
      setTimeout(() => {
        if (!widget.classList.contains('open')) window.ktToggleChat();
      }, Number(widgetConfig.autoOpenDelay) * 1000);
    }

    // Toggle chat window
    window.ktToggleChat = function () {
      widget.classList.toggle('open');
      if (widget.classList.contains('open')) {
        badge.classList.add('hidden');
        toggleBtn.classList.remove('wiggle');
        setTimeout(() => input.focus(), 350);
      }
    };
    toggleBtn.addEventListener('click', window.ktToggleChat);

    // Mode switching (Chat vs Voice)
    function switchMode(mode) {
      if (mode === 'voice') {
        modeChatBtn.classList.remove('active');
        modeVoiceBtn.classList.add('active');
        welcomeDiv.classList.add('hidden');
        messagesDiv.style.display = 'none';
        inputArea.style.display = 'none';
        voicePanel.classList.add('active');
      } else {
        modeVoiceBtn.classList.remove('active');
        modeChatBtn.classList.add('active');
        voicePanel.classList.remove('active');
        inputArea.style.display = 'block';
        if (chatHistory.length > 0) {
          welcomeDiv.classList.add('hidden');
          messagesDiv.style.display = 'flex';
        } else {
          welcomeDiv.classList.remove('hidden');
        }
      }
    }
    modeChatBtn.addEventListener('click', () => switchMode('chat'));
    modeVoiceBtn.addEventListener('click', () => switchMode('voice'));

    // Add chat bubble
    function ktAddMessage(text, type) {
      welcomeDiv.classList.add('hidden');
      messagesDiv.style.display = 'flex';

      const row = document.createElement('div');
      row.className = `kt-msg ${type}`;
      const bubble = document.createElement('div');
      bubble.className = 'kt-msg-bubble';
      bubble.textContent = text;
      row.appendChild(bubble);

      if (typingInd.parentNode === messagesDiv) {
        messagesDiv.insertBefore(row, typingInd);
      } else {
        messagesDiv.appendChild(row);
      }

      messagesDiv.scrollTop = messagesDiv.scrollHeight;
      if (type === 'bot' && widget.classList.contains('open')) {
        playPopSound();
      }
    }

    // Send chat message
    window.ktSendMessage = async function () {
      const text = input.value.trim();
      if (!text) return;

      ktAddMessage(text, 'user');
      chatHistory.push({ role: 'user', text });
      input.value = '';
      sendBtn.disabled = true;

      typingInd.classList.add('active');
      messagesDiv.appendChild(typingInd);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;

      let currentStored = null;
      try {
        currentStored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      } catch (e) {}

      try {
        const res = await fetch(`${API_BASE}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: chatHistory,
            clientId: scriptClientId || 'comp-profirmio',
            chatbotConfig: currentStored?.chatbot || null,
            apiKeys: currentStored?.apiKeys || {}
          })
        });
        const data = await res.json();
        typingInd.classList.remove('active');
        const reply = data.reply || 'Děkuji za zprávu! Zanechte mi prosím kontakt a brzy se vám ozveme.';
        ktAddMessage(reply, 'bot');
        chatHistory.push({ role: 'bot', text: reply });
      } catch (err) {
        typingInd.classList.remove('active');
        const fallback = 'Děkuji za váš dotaz! Pro okamžité spojení nám prosím napište svůj e-mail nebo zavolejte na 730 553 971.';
        ktAddMessage(fallback, 'bot');
      }

      sendBtn.disabled = false;
      input.focus();
    };

    sendBtn.addEventListener('click', window.ktSendMessage);
    input.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        window.ktSendMessage();
      }
    });

    window.ktQuickSend = function (text) {
      input.value = text;
      window.ktSendMessage();
    };

    // Voice Call inside Widget
    function speakText(text, audioBase64, onEnd) {
      if (audioBase64) {
        const audio = new Audio('data:audio/mpeg;base64,' + audioBase64);
        audio.onended = () => { if (onEnd) onEnd(); };
        audio.play().catch(() => { if (onEnd) onEnd(); });
        return;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'cs-CZ';
        utter.rate = 1.02;
        const voices = window.speechSynthesis.getVoices();
        const czVoice = voices.find(v => v.lang && v.lang.toLowerCase().includes('cs'));
        if (czVoice) utter.voice = czVoice;
        utter.onend = () => { if (onEnd) onEnd(); };
        window.speechSynthesis.speak(utter);
      } else if (onEnd) {
        onEnd();
      }
    }

    async function handleVoiceTurn(userTranscript) {
      if (!activeCall || !userTranscript) return;
      voiceStatus.textContent = 'AI Agent přemýšlí...';
      voiceSub.textContent = `Vy: „${userTranscript}“`;
      voiceHistory.push({ role: 'user', text: userTranscript });

      let currentStored = null;
      try {
        currentStored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      } catch (e) {}

      try {
        const res = await fetch(`${API_BASE}/api/voice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'converse',
            transcript: userTranscript,
            history: voiceHistory,
            clientId: scriptClientId || 'comp-profirmio',
            voiceConfig: currentStored?.voicebot || null,
            apiKeys: currentStored?.apiKeys || {}
          })
        });
        const data = await res.json();
        const reply = data.reply || 'Rozumím, děkuji. Mohu vám pomoci ještě s něčím dalším?';
        voiceHistory.push({ role: 'bot', text: reply });
        voiceStatus.textContent = 'AI Agent mluví...';
        voiceSub.textContent = reply;
        speakText(reply, data.audioBase64, () => {
          if (activeCall) {
            voiceStatus.textContent = 'Hovor aktivní — mluvte';
            startListening();
          }
        });
      } catch (e) {
        voiceStatus.textContent = 'Hovor aktivní';
        voiceSub.textContent = 'Omlouvám se, zopakujte prosím dotaz.';
      }
    }

    function startListening() {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRec || !activeCall) return;
      try {
        if (!recognition) {
          recognition = new SpeechRec();
          recognition.lang = 'cs-CZ';
          recognition.interimResults = false;
          recognition.maxAlternatives = 1;
          recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            isListening = false;
            voiceMicBtn.classList.remove('listening');
            handleVoiceTurn(transcript);
          };
          recognition.onend = () => {
            isListening = false;
            voiceMicBtn.classList.remove('listening');
          };
        }
        recognition.start();
        isListening = true;
        voiceMicBtn.classList.add('listening');
      } catch (e) {}
    }

    voiceCallBtn.addEventListener('click', () => {
      if (!activeCall) {
        activeCall = true;
        voiceHistory = [];
        voicePanel.classList.add('calling');
        voiceCallBtn.classList.add('hangup');
        voiceCallBtn.textContent = '📴 Ukončit hovor';
        voiceMicBtn.style.display = 'flex';
        voiceStatus.textContent = 'AI Agent mluví...';
        voiceSub.textContent = voiceGreeting;
        speakText(voiceGreeting, null, () => {
          if (activeCall) {
            voiceStatus.textContent = 'Poslouchám vás...';
            startListening();
          }
        });
      } else {
        activeCall = false;
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        if (recognition && isListening) {
          try { recognition.stop(); } catch (e) {}
        }
        voicePanel.classList.remove('calling');
        voiceCallBtn.classList.remove('hangup');
        voiceCallBtn.textContent = '📞 Zahájit hovor';
        voiceMicBtn.style.display = 'none';
        voiceStatus.textContent = 'Hovor ukončen';
        voiceSub.textContent = 'Děkujeme za hovor! Kdykoliv můžete zavolat znovu.';
      }
    });

    voiceMicBtn.addEventListener('click', () => {
      if (!activeCall) return;
      if (isListening && recognition) {
        try { recognition.stop(); } catch (e) {}
      } else {
        startListening();
      }
    });
  }

  window.ProFirmioWidget = {
    applyConfig: applyWidgetConfig,
    open: () => {
      const w = document.getElementById('ktWidget');
      if (w && !w.classList.contains('open')) window.ktToggleChat();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
