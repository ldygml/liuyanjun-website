/* 蜘蛛侠 · 蛛丝打怪兽（类打飞机小游戏） */
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
  const player = { x: W / 2, y: H - 64 };
  let webs = [];
  let enemies = [];
  let parts = [];
  let words = [];
  const stars = [];
  const keys = {};
  let fireCd = 0;
  let spawnCd = 0.8;
  let pointerX = null;
  let pointerDown = false;
  let raf = null;
  let last = 0;

  const EMOJIS = ['👾', '👹', '🐙', '💀', '🦇', '👻'];

  try { best = parseInt(localStorage.getItem('spideyBest') || '0', 10) || 0; } catch (e) { /* ignore */ }

  for (let i = 0; i < 46; i++) {
    stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.4 + 0.3 });
  }

  /* ---- 音效 ---- */
  let actx = null;
  const beep = (freq, dur, type, vol) => {
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.type = type || 'square';
      o.frequency.value = freq;
      g.gain.value = vol || 0.06;
      o.connect(g);
      g.connect(actx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + (dur || 0.12));
      o.stop(actx.currentTime + (dur || 0.12));
    } catch (e) { /* ignore */ }
  };

  /* ---- 输入 ---- */
  window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'Enter' && (state === 'start' || state === 'over')) startGame();
    if ([' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.key) !== -1) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => { keys[e.key] = false; });

  const toGameX = (clientX) => {
    const r = canvas.getBoundingClientRect();
    return ((clientX - r.left) / r.width) * W;
  };
  canvas.addEventListener('mousemove', (e) => { pointerX = toGameX(e.clientX); });
  canvas.addEventListener('mousedown', (e) => { pointerX = toGameX(e.clientX); pointerDown = true; });
  window.addEventListener('mouseup', () => { pointerDown = false; });
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    pointerX = toGameX(e.touches[0].clientX);
    pointerDown = true;
  }, { passive: false });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    pointerX = toGameX(e.touches[0].clientX);
  }, { passive: false });
  canvas.addEventListener('touchend', () => { pointerDown = false; });

  /* ---- 流程 ---- */
  const startGame = () => {
    state = 'playing';
    score = 0;
    lives = 3;
    webs = [];
    enemies = [];
    parts = [];
    words = [];
    player.x = W / 2;
    fireCd = 0;
    spawnCd = 0.8;
    ui.classList.add('hidden');
    if (!raf) raf = requestAnimationFrame(loop);
    beep(660, 0.12, 'triangle', 0.07);
  };

  const gameOver = () => {
    state = 'over';
    if (score > best) {
      best = score;
      try { localStorage.setItem('spideyBest', String(best)); } catch (e) { /* ignore */ }
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

  /* ---- 绘制 ---- */
  const drawPlayer = () => {
    const x = player.x, y = player.y;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#2b5baa';
    ctx.beginPath();
    ctx.ellipse(0, 16, 13, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e23636';
    ctx.beginPath();
    ctx.arc(0, -14, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1f2933';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(-7, -16, 6, 8, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(7, -16, 6, 8, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  const drawWeb = (w) => {
    ctx.save();
    ctx.translate(w.x, w.y);
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 * i) / 8;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 2, Math.sin(a) * 2);
      ctx.lineTo(Math.cos(a) * 9, Math.sin(a) * 9);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  const drawEnemy = (e) => {
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.font = '38px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(e.emoji, 0, 0);
    ctx.restore();
  };

  /* ---- 更新 ---- */
  const update = (dt) => {
    const speed = 320 * dt;
    if (keys.ArrowLeft || keys.a) player.x -= speed;
    if (keys.ArrowRight || keys.d) player.x += speed;
    if (pointerX !== null) {
      player.x += (pointerX - player.x) * Math.min(1, dt * 14);
    }
    player.x = Math.max(24, Math.min(W - 24, player.x));

    fireCd -= dt;
    if ((keys[' '] || pointerDown) && fireCd <= 0) {
      fireCd = 0.24;
      webs.push({ x: player.x, y: player.y - 38, vy: -460 });
      beep(520, 0.05, 'square', 0.04);
    }

    for (let i = webs.length - 1; i >= 0; i--) {
      const w = webs[i];
      w.y += w.vy * dt;
      if (w.y < -20) { webs.splice(i, 1); continue; }
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        const dx = w.x - e.x;
        const dy = w.y - e.y;
        if (dx * dx + dy * dy < 34 * 34) {
          webs.splice(i, 1);
          enemies.splice(j, 1);
          score += 10;
          words.push({
            x: e.x,
            y: e.y,
            text: ['BAM!', 'POW!', 'THWIP!'][Math.floor(Math.random() * 3)],
            life: 0.7
          });
          for (let k = 0; k < 10; k++) {
            const a = Math.random() * Math.PI * 2;
            parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90, r: 2 + Math.random() * 3, life: 0.4 });
          }
          beep(880, 0.08, 'triangle', 0.06);
          break;
        }
      }
    }

    spawnCd -= dt;
    if (spawnCd <= 0) {
      enemies.push({
        x: 30 + Math.random() * (W - 60),
        y: -26,
        v: 70 + score * 0.6,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
      });
      spawnCd = Math.max(0.35, 0.9 - score * 0.006);
    }
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      e.y += e.v * dt;
      if (e.y > H + 30) {
        enemies.splice(i, 1);
        lives--;
        beep(200, 0.18, 'sawtooth', 0.08);
        if (lives <= 0) { gameOver(); return; }
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
      words[i].y -= 60 * dt;
      if (words[i].life <= 0) words.splice(i, 1);
    }
  };

  const draw = () => {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#16233b');
    g.addColorStop(1, '#0d1524');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    stars.forEach((s) => {
      ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 900 + s.x) * 0.2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    enemies.forEach(drawEnemy);
    webs.forEach(drawWeb);
    parts.forEach((p) => {
      ctx.fillStyle = 'rgba(255,255,255,' + Math.max(0, p.life / 0.4) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    words.forEach((w) => {
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#e23636';
      ctx.lineWidth = 3;
      ctx.strokeText(w.text, w.x, w.y);
      ctx.fillStyle = 'rgba(255,255,255,' + Math.max(0, w.life / 0.7) + ')';
      ctx.fillText(w.text, w.x, w.y);
    });
    drawPlayer();

    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.fillText('得分 ' + score, 14, 26);
    ctx.textAlign = 'right';
    ctx.fillText('最高 ' + best, W - 14, 26);
    ctx.textAlign = 'center';
    let heart = '';
    for (let i = 0; i < lives; i++) heart += '🕷️';
    ctx.font = '16px serif';
    ctx.fillText(heart, W / 2, 26);
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
