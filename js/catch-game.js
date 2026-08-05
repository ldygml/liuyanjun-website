/* 蛛网大丰收：移动蛛网接住好东西，躲开炸弹 */
(function () {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const ui = document.getElementById('gameUi');
  const titleEl = document.getElementById('gameTitle');
  const descEl = document.getElementById('gameDesc');
  const startBtn = document.getElementById('startBtn');

  let state = 'start';
  let score = 0;
  let best = 0;
  let lives = 3;
  const net = { x: W / 2, w: 110 };
  let items = [];
  let parts = [];
  let words = [];
  const stars = [];
  const keys = {};
  let spawnCd = 0.6;
  let pointerX = null;
  let flash = 0;
  let raf = null;
  let last = 0;

  try { best = parseInt(localStorage.getItem('catchBest') || '0', 10) || 0; } catch (e) { /* ignore */ }

  for (let i = 0; i < 42; i++) {
    stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.4 + 0.3 });
  }

  const beep = (freq, dur, type, vol) => {
    try {
      if (!window.__actx) window.__actx = new (window.AudioContext || window.webkitAudioContext)();
      const o = window.__actx.createOscillator();
      const g = window.__actx.createGain();
      o.type = type || 'square';
      o.frequency.value = freq;
      g.gain.value = vol || 0.06;
      o.connect(g);
      g.connect(window.__actx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, window.__actx.currentTime + (dur || 0.12));
      o.stop(window.__actx.currentTime + (dur || 0.12));
    } catch (e) { /* ignore */ }
  };

  window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'Enter' && (state === 'start' || state === 'over')) startGame();
    if (['ArrowLeft', 'ArrowRight'].indexOf(e.key) !== -1) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => { keys[e.key] = false; });

  const toX = (clientX) => {
    const r = canvas.getBoundingClientRect();
    return ((clientX - r.left) / r.width) * W;
  };
  canvas.addEventListener('mousemove', (e) => { pointerX = toX(e.clientX); });
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    pointerX = toX(e.touches[0].clientX);
  }, { passive: false });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    pointerX = toX(e.touches[0].clientX);
  }, { passive: false });

  const startGame = () => {
    state = 'playing';
    score = 0;
    lives = 3;
    items = [];
    parts = [];
    words = [];
    net.x = W / 2;
    spawnCd = 0.6;
    flash = 0;
    ui.classList.add('hidden');
    if (!raf) raf = requestAnimationFrame(loop);
    beep(660, 0.12, 'triangle', 0.07);
  };

  const gameOver = () => {
    state = 'over';
    if (score > best) {
      best = score;
      try { localStorage.setItem('catchBest', String(best)); } catch (e) { /* ignore */ }
    }
    titleEl.textContent = '💥 游戏结束';
    descEl.innerHTML = '得分 <b>' + score + '</b> · 最高 <b>' + best + '</b><br/>按 Enter 或点按钮再来一局';
    startBtn.textContent = '再来一局';
    ui.classList.remove('hidden');
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    draw();
    beep(220, 0.3, 'sawtooth', 0.08);
  };

  startBtn.addEventListener('click', startGame);
  ui.addEventListener('click', () => {
    if (state === 'over') startGame();
  });

  const spawnItem = () => {
    const r = Math.random();
    let type = 'good', emoji = '⭐', points = 10;
    if (r < 0.15) { type = 'web'; emoji = '🕸️'; points = 25; }
    else if (r < 0.25) { type = 'life'; emoji = '❤️'; points = 0; }
    else if (r < 0.45) { type = 'bomb'; emoji = '💣'; points = 0; }
    items.push({ x: 34 + Math.random() * (W - 68), y: -24, type: type, emoji: emoji, points: points });
  };

  const update = (dt) => {
    if (keys.ArrowLeft || keys.a) net.x -= 340 * dt;
    if (keys.ArrowRight || keys.d) net.x += 340 * dt;
    if (pointerX !== null) {
      net.x += (pointerX - net.x) * Math.min(1, dt * 12);
    }
    net.x = Math.max(net.w / 2, Math.min(W - net.w / 2, net.x));
    if (flash > 0) flash -= dt;

    spawnCd -= dt;
    if (spawnCd <= 0) {
      spawnItem();
      spawnCd = Math.max(0.28, 0.55 - score * 0.004);
    }

    const fallSpeed = 200 + Math.min(400, score * 0.8);
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      it.y += fallSpeed * dt;
      if (it.y >= H - 58 && Math.abs(it.x - net.x) < net.w / 2) {
        items.splice(i, 1);
        catchItem(it);
      } else if (it.y > H + 16) {
        items.splice(i, 1);
      }
    }

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0) parts.splice(i, 1);
    }
    for (let i = words.length - 1; i >= 0; i--) {
      words[i].life -= dt;
      words[i].y -= 50 * dt;
      if (words[i].life <= 0) words.splice(i, 1);
    }
  };

  const catchItem = (it) => {
    if (it.type === 'bomb') {
      lives--;
      flash = 0.3;
      words.push({ x: it.x, y: it.y, text: '💥', life: 0.6 });
      beep(160, 0.25, 'sawtooth', 0.1);
      if (lives <= 0) { gameOver(); return; }
    } else {
      if (it.type === 'life') {
        lives++;
        words.push({ x: it.x, y: it.y, text: '❤️ +1', life: 0.7 });
      } else {
        score += it.points;
        words.push({ x: it.x, y: it.y, text: '+' + it.points, life: 0.7 });
      }
      for (let k = 0; k < 9; k++) {
        const a = Math.random() * Math.PI * 2;
        parts.push({ x: it.x, y: it.y, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90, r: 2 + Math.random() * 3, life: 0.35 });
      }
      beep(700, 0.08, 'triangle', 0.06);
    }
  };

  const drawNet = () => {
    const x = net.x, y = H - 34, r = 56;
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, r, Math.PI, 0);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= 6; i++) {
      const a = Math.PI + (Math.PI * i) / 6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.stroke();
    }
    for (let k = 1; k <= 3; k++) {
      ctx.beginPath();
      ctx.arc(0, 0, (r * k) / 4, Math.PI, 0);
      ctx.stroke();
    }
    ctx.restore();
  };

  const draw = () => {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#16233b');
    g.addColorStop(1, '#0d1524');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    stars.forEach((s) => {
      ctx.globalAlpha = 0.35 + Math.sin(Date.now() / 900 + s.x) * 0.2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    items.forEach((it) => {
      ctx.save();
      ctx.translate(it.x, it.y);
      ctx.font = '36px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(it.emoji, 0, 0);
      ctx.restore();
    });
    parts.forEach((p) => {
      ctx.fillStyle = 'rgba(255,255,255,' + Math.max(0, p.life / 0.35) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    words.forEach((w) => {
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#e23636';
      ctx.lineWidth = 3;
      ctx.strokeText(w.text, w.x, w.y);
      ctx.fillStyle = 'rgba(255,255,255,' + Math.max(0, w.life / 0.7) + ')';
      ctx.fillText(w.text, w.x, w.y);
    });
    drawNet();

    if (flash > 0) {
      ctx.fillStyle = 'rgba(226,54,54,' + Math.min(0.35, flash) + ')';
      ctx.fillRect(0, 0, W, H);
    }

    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.fillText('得分 ' + score, 16, 30);
    ctx.textAlign = 'right';
    ctx.fillText('最高 ' + best, W - 16, 30);
    ctx.textAlign = 'left';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#ff8a8a';
    ctx.fillText('❤️ ' + lives, 16, 56);
  };

  const loop = (t) => {
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    if (state === 'playing') update(dt);
    draw();
    raf = requestAnimationFrame(loop);
  };

  draw();
})();
