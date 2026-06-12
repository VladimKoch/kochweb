
  /* ── WIDGET LOGIC ──────────────────────────── */
  const widget = document.getElementById('ktWidget');
  const messagesDiv = document.getElementById('ktMessages');
  const welcomeDiv = document.getElementById('ktWelcome');
  const typingInd = document.getElementById('ktTyping');
  const input = document.getElementById('ktInput');
  const sendBtn = document.getElementById('ktSendBtn');
  const badge = document.getElementById('ktBadge');
  const toggleBtn = widget.querySelector('.kt-chat-toggle');

  /* ── Tvé přidané funkce: Pop Sound ─────────── */
  let audioCtx = null;
  function playPopSound() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.2);
    } catch(e) { /* silent fail */ }
  }

  /* ── Tvé přidané funkce: Wiggle animace ────── */
  let wiggleInterval = null;
  function startWiggle() {
    wiggleInterval = setInterval(() => {
      if (!widget.classList.contains('open')) {
        toggleBtn.classList.add('wiggle');
        toggleBtn.addEventListener('animationend', () => {
          toggleBtn.classList.remove('wiggle');
        }, { once: true });
      }
    }, 8000);
  }
  setTimeout(startWiggle, 4000);

  /* ── Toggle (Otevření/Zavření chatu) ───────── */
  window.ktToggleChat = function() {
    widget.classList.toggle('open');
    if (widget.classList.contains('open')) {
      badge.classList.add('hidden');
      if (wiggleInterval) { clearInterval(wiggleInterval); wiggleInterval = null; }
      toggleBtn.classList.remove('wiggle');
      setTimeout(() => input.focus(), 400);
    } else {
      if (!wiggleInterval) startWiggle();
    }
  };

/* ── Vykreslení zprávy ─────────────────────── */
  function ktAddMessage(text, type) {
    welcomeDiv.classList.add('hidden');
    messagesDiv.style.display = 'flex';
    
    const row = document.createElement('div');
    row.className = `kt-msg ${type}`;
    row.innerHTML = `<div class="kt-msg-bubble">${text}</div>`;
    
    // Čistší způsob přidání zprávy: 
    // Pokud tam je typing indikátor, vložíme zprávu před něj.
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

  /* ── Odeslání zprávy (API volání) ──────────── */
  async function ktSendMessage() {
    const text = input.value.trim();
    if (!text) return;

    // Vykreslení uživatelské zprávy
    ktAddMessage(text, 'user');
    input.value = '';
    sendBtn.disabled = true;
    
    // Zobrazení typing indikátoru
    typingInd.classList.add('active');
    messagesDiv.appendChild(typingInd); // Posunout na konec
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
      // Komunikace s tvým Python backendem
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await response.json();
      
      typingInd.classList.remove('active');
      ktAddMessage(data.reply, 'bot');
    } catch (error) {
      typingInd.classList.remove('active');
      ktAddMessage('Chyba: Nemohu se spojit se serverem (Běží Python?).', 'bot');
    }

    sendBtn.disabled = false;
    input.focus();
  }

  /* ── Rychlé volby z Welcome screenu ────────── */
  window.ktQuickSend = function(text) {
    input.value = text;
    ktSendMessage();
  };

  /* ── Odeslání klávesou Enter ───────────────── */
  input.addEventListener('keypress', e => {
    if (e.key === 'Enter') { e.preventDefault(); ktSendMessage(); }
  });

