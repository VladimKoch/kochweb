/* ──────────────────────────────────────────────────
   LOADER
────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 2400);
});

/* ──────────────────────────────────────────────────
   CUSTOM CURSOR
────────────────────────────────────────────────── */
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (isTouchDevice) {
  dot.style.display = 'none';
  ring.style.display = 'none';
} else {
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.transform = `translate(${ringX - 18}px, ${ringY - 18}px)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, .service-card, .step-card, .testimonial-card, .nav-toggle, .magnetic').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
  });
}

/* ──────────────────────────────────────────────────
   MAGNETIC BUTTONS
────────────────────────────────────────────────── */
document.querySelectorAll('.magnetic').forEach(magnet => {
  magnet.addEventListener('mousemove', e => {
    const rect = magnet.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    magnet.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
  });
  magnet.addEventListener('mouseleave', () => {
    magnet.style.transform = '';
    magnet.style.transition = 'transform 0.5s var(--ease-out-expo)';
    setTimeout(() => magnet.style.transition = '', 500);
  });
});

/* ──────────────────────────────────────────────────
   NAV SCROLL
────────────────────────────────────────────────── */
const nav = document.getElementById('mainNav');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > 60) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
  lastScroll = y;
}, { passive: true });

/* ──────────────────────────────────────────────────
   INTERSECTION OBSERVER
────────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.08,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.reveal, .reveal-left, .reveal-scale').forEach(el => {
  revealObserver.observe(el);
});

/* ──────────────────────────────────────────────────
   STATS COUNTER
────────────────────────────────────────────────── */
function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      const duration = 2000;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutQuart(progress);
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      statsObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => statsObserver.observe(el));

/* ──────────────────────────────────────────────────
   HERO FLOAT CARD COUNTERS
────────────────────────────────────────────────── */
document.querySelectorAll('.fc-value[data-count]').forEach(el => {
  const target = parseInt(el.dataset.count);
  const duration = 2500;
  const startDelay = 3200;

  setTimeout(() => {
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.round(target * easeOutQuart(progress));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, startDelay);
});

/* ──────────────────────────────────────────────────
   PARALLAX
────────────────────────────────────────────────── */
const orbs = document.querySelectorAll('.orb');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  orbs.forEach((orb, i) => {
    const speed = 0.03 + i * 0.015;
    orb.style.transform = `translateY(${y * speed}px)`;
  });
}, { passive: true });

/* ──────────────────────────────────────────────────
   SMOOTH HOVER TILT
────────────────────────────────────────────────── */
document.querySelectorAll('.service-card, .step-card, .testimonial-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-4px) perspective(600px) rotateX(${y * -3}deg) rotateY(${x * 3}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'border-color 0.4s, transform 0.6s var(--ease-out-expo), background 0.4s, box-shadow 0.4s';
  });
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'border-color 0.4s, transform 0.15s ease-out, background 0.4s, box-shadow 0.4s';
  });
});

/* ──────────────────────────────────────────────────
   MACHINE CANVAS — light theme
────────────────────────────────────────────────── */
(function() {
  const canvas = document.getElementById('machineCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = 560;
  canvas.height = 480;

  let t = 0;
  let scrollProgress = 0;

  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = window.scrollY / Math.max(max, 1);
  });

  function drawGear(ctx, x, y, outerR, innerR, teeth, angle, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const step = (Math.PI * 2) / teeth;
    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      const a1 = i * step - step * 0.3;
      const a2 = i * step + step * 0.3;
      const a3 = i * step + step * 0.5;
      const a4 = (i + 1) * step - step * 0.5;
      ctx.lineTo(Math.cos(a1) * innerR, Math.sin(a1) * innerR);
      ctx.lineTo(Math.cos(a1) * outerR, Math.sin(a1) * outerR);
      ctx.lineTo(Math.cos(a2) * outerR, Math.sin(a2) * outerR);
      ctx.lineTo(Math.cos(a2) * innerR, Math.sin(a2) * innerR);
      ctx.lineTo(Math.cos(a3) * innerR, Math.sin(a3) * innerR);
      ctx.lineTo(Math.cos(a4) * innerR, Math.sin(a4) * innerR);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // center circle
    ctx.beginPath();
    ctx.arc(0, 0, innerR * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fill();
    ctx.restore();
  }

  function drawGlowCircle(ctx, x, y, r, color, alpha) {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, color.replace(')', `,${alpha})`).replace('rgb', 'rgba'));
    grad.addColorStop(1, color.replace(')', ',0)').replace('rgb', 'rgba'));
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  function drawDataCube(ctx, x, y, size, glowColor) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.5);
    ctx.lineTo(size * 0.6, -size * 0.1);
    ctx.lineTo(0, size * 0.3);
    ctx.lineTo(-size * 0.6, -size * 0.1);
    ctx.closePath();
    ctx.fillStyle = glowColor;
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(size * 0.6, -size * 0.1);
    ctx.lineTo(size * 0.6, size * 0.35);
    ctx.lineTo(0, size * 0.75);
    ctx.lineTo(0, size * 0.3);
    ctx.closePath();
    ctx.fillStyle = glowColor;
    ctx.globalAlpha = 0.5;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-size * 0.6, -size * 0.1);
    ctx.lineTo(-size * 0.6, size * 0.35);
    ctx.lineTo(0, size * 0.75);
    ctx.lineTo(0, size * 0.3);
    ctx.closePath();
    ctx.fillStyle = glowColor;
    ctx.globalAlpha = 0.3;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  let cubes = [
    { p: 0.0, speed: 0.002, label: 'Lead' },
    { p: 0.35, speed: 0.002, label: 'Nabídka' },
    { p: 0.7, speed: 0.002, label: 'Deal' },
  ];

  const conveyorPath = [
    {x: 60, y: 340}, {x: 160, y: 310}, {x: 260, y: 240},
    {x: 350, y: 200}, {x: 440, y: 250}, {x: 490, y: 340}
  ];

  function getPathPoint(progress, path) {
    const total = path.length - 1;
    const scaled = progress * total;
    const idx = Math.min(Math.floor(scaled), total - 1);
    const t = scaled - idx;
    return {
      x: lerp(path[idx].x, path[idx+1].x, t),
      y: lerp(path[idx].y, path[idx+1].y, t)
    };
  }

  function drawConveyorBelt(ctx, path, t) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.setLineDash([10, 14]);
    ctx.lineDashOffset = -t * 30;
    ctx.strokeStyle = 'rgba(37,99,235,0.25)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function draw() {
    const speed = 0.8 + scrollProgress * 2;
    t += 0.016 * speed;

    ctx.clearRect(0, 0, 560, 480);

    // BG glow — lighter
    drawGlowCircle(ctx, 280, 240, 200, 'rgb(37,99,235)', 0.05);
    drawGlowCircle(ctx, 380, 180, 120, 'rgb(124,58,237)', 0.04);

    drawConveyorBelt(ctx, conveyorPath, t);

    // Labels
    ctx.save();
    ctx.font = '600 9px Inter';
    ctx.fillStyle = 'rgba(37,99,235,0.6)';
    ctx.fillText('LEAD INPUT', 35, 360);
    ctx.fillStyle = 'rgba(124,58,237,0.6)';
    ctx.fillText('SIGNED DEAL', 450, 360);
    ctx.restore();

    // Gears — lighter colors
    drawGear(ctx, 160, 295, 36, 26, 10, t * 1.2, 'rgba(37,99,235,0.2)');
    drawGear(ctx, 260, 225, 44, 32, 12, -t * 0.9, 'rgba(124,58,237,0.2)');
    drawGear(ctx, 350, 190, 30, 22, 8, t * 1.5, 'rgba(37,99,235,0.15)');
    drawGear(ctx, 440, 240, 38, 28, 10, -t * 1.1, 'rgba(124,58,237,0.18)');

    // AI Core
    const coreX = 275, coreY = 195;
    drawGlowCircle(ctx, coreX, coreY, 55, 'rgb(37,99,235)', 0.12);
    ctx.save();
    ctx.beginPath();
    ctx.arc(coreX, coreY, 36, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(37,99,235,0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // AI core nodes
    for (let i = 0; i < 6; i++) {
      const a = t * 0.5 + (i / 6) * Math.PI * 2;
      const nx = coreX + Math.cos(a) * 22;
      const ny = coreY + Math.sin(a) * 22;
      const pulse = Math.sin(t * 2 + i) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.arc(nx, ny, 3 + pulse * 2, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? '#3b82f6' : '#8b5cf6';
      ctx.globalAlpha = 0.7 + pulse * 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    // center dot
    const cp = Math.sin(t * 3) * 0.5 + 0.5;
    ctx.beginPath();
    ctx.arc(coreX, coreY, 6 + cp * 3, 0, Math.PI * 2);
    ctx.fillStyle = '#2563eb';
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.globalAlpha = 1;
    // label
    ctx.font = '700 7.5px Space Grotesk';
    ctx.fillStyle = 'rgba(26,26,46,0.85)';
    ctx.textAlign = 'center';
    ctx.fillText('KochTech', coreX, coreY + 1);
    ctx.font = '600 6px Inter';
    ctx.fillStyle = 'rgba(37,99,235,0.7)';
    ctx.fillText('AI CORE', coreX, coreY + 10);
    ctx.textAlign = 'left';
    ctx.restore();

    // Moving data cubes
    cubes.forEach((cube, i) => {
      cube.p += cube.speed * speed;
      if (cube.p > 1) cube.p = 0;
      const pos = getPathPoint(cube.p, conveyorPath);
      const progress = cube.p;
      let color;
      if (progress < 0.33) color = '#3b82f6';
      else if (progress < 0.66) color = '#8b5cf6';
      else color = '#16a34a';

      drawGlowCircle(ctx, pos.x, pos.y, 18, color.replace('#', 'rgb(').replace('3b82f6', '59,130,246').replace('8b5cf6', '139,92,246').replace('16a34a', '22,163,74'), 0.2);
      drawDataCube(ctx, pos.x, pos.y - 8, 14, color);

      ctx.save();
      ctx.font = '600 7px Inter';
      ctx.fillStyle = 'rgba(26,26,46,0.65)';
      ctx.textAlign = 'center';
      ctx.fillText(cube.label, pos.x, pos.y + 16);
      ctx.textAlign = 'left';
      ctx.restore();
    });

    // Glass panel — light theme
    ctx.save();
    const px = 60, py = 50, pw = 160, ph = 75;
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 12);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = '700 8px Space Grotesk';
    ctx.fillStyle = 'rgba(37,99,235,0.85)';
    ctx.fillText('AUTOMATION STATUS', px + 12, py + 18);
    ctx.font = '600 7px Inter';
    ctx.fillStyle = 'rgba(26,26,46,0.5)';
    ctx.fillText('● Leads processed: ' + Math.floor(t * 3 * speed % 100 + 850), px + 12, py + 33);
    ctx.fillText('● Proposals sent: ' + Math.floor(t * 2 * speed % 50 + 340), px + 12, py + 46);
    ctx.fillText('● Deals closed: ' + Math.floor(t * 1.2 * speed % 20 + 120), px + 12, py + 59);
    ctx.restore();

    // Second glass panel
    ctx.save();
    const p2x = 360, p2y = 50, p2w = 155, p2h = 60;
    ctx.beginPath();
    ctx.roundRect(p2x, p2y, p2w, p2h, 12);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(124,58,237,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = '700 8px Space Grotesk';
    ctx.fillStyle = 'rgba(124,58,237,0.85)';
    ctx.fillText('AI EFFICIENCY', p2x + 12, p2y + 18);
    const eff = 94 + Math.sin(t * 0.5) * 3;
    ctx.font = '800 18px Space Grotesk';
    ctx.fillStyle = '#7c3aed';
    ctx.fillText(eff.toFixed(1) + '%', p2x + 12, p2y + 45);
    ctx.restore();

    requestAnimationFrame(draw);
  }
  draw();
})();

 // URL Python serveru (při přesunu na Render upravíš tuto adresu)
    const BACKEND_URL = "http://127.0.0.1:5000";

    async function nactiTrendy() {
      const trendyList = document.getElementById('trendy-list');
      try {
        // Dotaz na Python
        const odpoved = await fetch(`${BACKEND_URL}/trendy`);
        const data = await odpoved.json(); 
        
        trendyList.innerHTML = ""; // Odstraní načítací text
        
        // Sestavení a vložení karet
        data.forEach(trend => {
          trendyList.innerHTML += `
            <div class="trend-karta">
              <h4>${trend.nadpis}</h4>
              <p>${trend.obsah}</p>
              <a href="${trend.odkaz}" target="_blank">Číst původní zdroj →</a>
            </div>
          `;
        });
      } catch (chyba) {
        trendyList.innerHTML = "<div class='status-text' style='color: #ef4444;'>Chyba připojení k AI serveru. Zkuste to prosím později.</div>";
      }
    }

    // Automatické spuštění načítání po načtení stránky
    window.addEventListener('DOMContentLoaded', nactiTrendy);


    