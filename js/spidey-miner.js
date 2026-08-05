/* 蜘蛛侠版黄金矿工：用蛛丝抓取矿井中的财宝 */
(function () {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const ui = document.getElementById('gameUi');
  const titleEl = document.querySelector('.game-title');
  const descEl = document.getElementById('gameDesc');
  const startBtn = document.getElementById('startBtn');

  let state = 'start';
  let level = 1;
  let score = 0;
  let best = 0;
  const TIME_LIMIT = 90;
  let timeLeft = TIME_LIMIT;
  const player = { x: W / 2, y: 42 };
  const hook = { angle: 0, dir: 1, state: 'swing', len: 46, x: W / 2, y: 42, target: null, cd: 0 };
  let objects = [];
  let refillCd = 2;
  let parts = [];
  let words = [];
  let flash = 0;
  let raf = null;
  let last = 0;

  const TARGETS = [120, 260, 480];
  const TYPES = [
    { e: '🪙', v: 10, w: 1, r: 20, p: 0.4 },
    { e: '💰', v: 30, w: 2, r: 24, p: 0.2 },
    { e: '💎', v: 80, w: 3, r: 22, p: 0.12 },
    { e: '🪨', v: 0, w: 6, r: 26, p: 0.18 },
    { e: '💣', v: -50, w: 2, r: 22, p: 0.1 }
  ];

  try { best = parseInt(localStorage.getItem('minerBest') || '0', 10) || 0; } catch (e) { /* ignore */ }

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
    if (e.key === ' ') {
      e.preventDefault();
      if (state === 'playing') launch();
      if (state === 'start' || state === 'over' || state === 'win') startGame();
      if (state === 'levelclear') nextLevel();
    }
    if (e.key === 'Enter' && (state === 'start' || state === 'over' || state === 'win')) startGame();
    if (e.key === 'Enter' && state === 'levelclear') nextLevel();
  });

  canvas.addEventListener('mousedown', () => { if (state === 'playing') launch(); });
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (state === 'playing') launch();
  }, { passive: false });

  const spawnObjects = () => {
    objects = [];
    const count = 8 + level;
    for (let i = 0; i < count; i++) {
      spawnOne();
    }
  };

  const spawnOne = () => {
    const r = Math.random();
    let acc = 0, chosen = TYPES[0];
    for (let t = 0; t < TYPES.length; t++) {
      acc += TYPES[t].p;
      if (r <= acc) { chosen = TYPES[t]; break; }
    }
    objects.push({
      type: chosen,
      x: 44 + Math.random() * (W - 88),
      y: 150 + Math.random() * (H - 220),
      r: chosen.r
    });
  };

  const startGame = () => {
    state = 'playing';
    level = 1;
    score = 0;
    timeLeft = TIME_LIMIT;
    resetHook();
    spawnObjects();
    ui.classList.add('hidden');
    if (!raf) raf = requestAnimationFrame(loop);
    beep(660, 0.12, 'triangle', 0.07);
  };

  const nextLevel = () => {
    level++;
    state = 'playing';
    timeLeft = TIME_LIMIT;
    resetHook();
    spawnObjects();
    ui.classList.add('hidden');
    beep(520, 0.1, 'triangle', 0.07);
  };

  const resetHook = () => {
    hook.angle = 0;
    hook.dir = 1;
    hook.state = 'swing';
    hook.len = 46;
    hook.x = player.x;
    hook.y = player.y;
    hook.target = null;
    hook.cd = 0;
    refillCd = 2;
    flash = 0;
    parts = [];
    words = [];
  };

  const levelClear = () => {
    state = 'levelclear';
    if (level >= TARGETS.length) {
      winGame();
      return;
    }
    titleEl.textContent = '🎉 第 ' + level + ' 关完成！';
    descEl.innerHTML = '得分 <b>' + score + '</b> · 下一关目标 <b>' + TARGETS[level] + '</b><br/>按空格或点按钮继续';
    startBtn.textContent = '下一关';
    ui.classList.remove('hidden');
    beep(660, 0.15, 'triangle', 0.08);
  };

  const winGame = () => {
    state = 'win';
    if (score > best) {
      best = score;
      try { localStorage.setItem('minerBest', String(best)); } catch (e) { /* ignore */ }
    }
    titleEl.textContent = '🏆 全部通关！';
    descEl.innerHTML = '3 关全部完成，总分 <b>' + score + '</b> · 历史最高 <b>' + best + '</b><br/>按空格再来一局';
    startBtn.textContent = '再来一局';
    ui.classList.remove('hidden');
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    draw();
    beep(880, 0.25, 'triangle', 0.08);
  };

  const gameOver = () => {
    state = 'over';
    if (score > best) {
      best = score;
      try { localStorage.setItem('minerBest', String(best)); } catch (e) { /* ignore */ }
    }
    titleEl.textContent = '⏰ 时间到！';
    descEl.innerHTML = '第 ' + level + ' 关 · 得分 <b>' + score + '</b>（目标 ' + TARGETS[level - 1] + '）· 最高 <b>' + best + '</b><br/>按空格再来一局';
    startBtn.textContent = '再来一局';
    ui.classList.remove('hidden');
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    draw();
    beep(200, 0.3, 'sawtooth', 0.08);
  };

  startBtn.addEventListener('click', () => {
    if (state === 'levelclear') nextLevel();
    else startGame();
  });
  ui.addEventListener('click', () => {
    if (state === 'levelclear') nextLevel();
    if (state === 'over' || state === 'win') startGame();
  });

  const launch = () => {
    if (hook.state === 'swing' && hook.cd <= 0) hook.state = 'out';
  };

  const collect = (obj) => {
    const t = obj.type;
    if (t.v < 0) {
      score += t.v;
      flash = 0.4;
      words.push({ x: obj.x, y: obj.y, text: '💥 -50', life: 0.8 });
      for (let k = 0; k < 16; k++) {
        const a = Math.random() * Math.PI * 2;
        parts.push({ x: obj.x, y: obj.y, vx: Math.cos(a) * 130, vy: Math.sin(a) * 130, r: 2 + Math.random() * 3, life: 0.5 });
      }
      beep(160, 0.3, 'sawtooth', 0.1);
    } else if (t.v > 0) {
      score += t.v;
      words.push({ x: obj.x, y: obj.y, text: '+' + t.v, life: 0.7 });
      for (let k = 0; k < 10; k++) {
        const a = Math.random() * Math.PI * 2;
        parts.push({ x: obj.x, y: obj.y, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90, r: 2 + Math.random() * 3, life: 0.4 });
      }
      beep(700, 0.08, 'triangle', 0.06);
    } else {
      words.push({ x: obj.x, y: obj.y, text: '太沉了…', life: 0.7 });
      beep(240, 0.15, 'sawtooth', 0.06);
    }
    if (score >= TARGETS[level - 1]) levelClear();
  };

  const update = (dt) => {
    if (flash > 0) flash -= dt;
    if (hook.cd > 0) hook.cd -= dt;
    timeLeft -= dt;
    if (timeLeft <= 0) {
      timeLeft = 0;
      if (score >= TARGETS[level - 1]) levelClear();
      else gameOver();
      return;
    }

    if (hook.state === 'swing') {
      hook.angle += hook.dir * 0.85 * dt;
      if (hook.angle > 1.1) { hook.angle = 1.1; hook.dir = -1; }
      if (hook.angle < -1.1) { hook.angle = -1.1; hook.dir = 1; }
      hook.x = player.x + Math.sin(hook.angle) * hook.len;
      hook.y = player.y + Math.cos(hook.angle) * hook.len;
    } else if (hook.state === 'out') {
      hook.len += 300 * dt;
      hook.x = player.x + Math.sin(hook.angle) * hook.len;
      hook.y = player.y + Math.cos(hook.angle) * hook.len;
      if (hook.x < 6 || hook.x > W - 6 || hook.y > H - 6) {
        hook.state = 'reel';
        hook.cd = 0.3;
      } else {
        for (let i = objects.length - 1; i >= 0; i--) {
          const o = objects[i];
          const dx = hook.x - o.x;
          const dy = hook.y - o.y;
          if (dx * dx + dy * dy < (o.r + 12) * (o.r + 12)) {
            hook.target = o;
            hook.state = 'reel';
            objects.splice(i, 1);
            break;
          }
        }
      }
    } else if (hook.state === 'reel') {
      const sp = Math.max(45, 150 / (hook.target ? hook.target.type.w : 1));
      hook.len -= sp * dt;
      if (hook.len < 10) hook.len = 10;
      if (hook.target) {
        hook.target.x = hook.x;
        hook.target.y = hook.y + hook.target.r;
      }
      if (hook.len <= 10) {
        if (hook.target) collect(hook.target);
        hook.target = null;
        hook.state = 'swing';
        hook.len = 46;
        hook.cd = 0.35;
      }
      hook.x = player.x + Math.sin(hook.angle) * hook.len;
      hook.y = player.y + Math.cos(hook.angle) * hook.len;
    }

    // 物品补货：防止矿井被搬空导致无法达标
    if (objects.length < 6) {
      refillCd -= dt;
      if (refillCd <= 0) {
        spawnOne();
        refillCd = 1.3;
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
      words[i].y -= 40 * dt;
      if (words[i].life <= 0) words.splice(i, 1);
    }
  };

  const draw = () => {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#3a2c18');
    g.addColorStop(1, '#241a10');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // 矿井土层纹理
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    for (let i = 0; i < 60; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * W, Math.random() * H, 1 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    objects.forEach((o) => {
      ctx.save();
      ctx.translate(o.x, o.y);
      ctx.font = (o.r * 1.5) + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(o.type.e, 0, 0);
      ctx.restore();
    });
    parts.forEach((p) => {
      ctx.fillStyle = 'rgba(255,255,255,' + Math.max(0, p.life / 0.5) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    words.forEach((w) => {
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#e23636';
      ctx.lineWidth = 3;
      ctx.strokeText(w.text, w.x, w.y);
      ctx.fillStyle = 'rgba(255,255,255,' + Math.max(0, w.life / 0.7) + ')';
      ctx.fillText(w.text, w.x, w.y);
    });

    // 蛛丝
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(hook.x, hook.y);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(hook.x, hook.y, 6, 0, Math.PI * 2);
    ctx.fill();

    // 蜘蛛侠
    ctx.fillStyle = '#e23636';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(player.x - 6, player.y - 2, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + 6, player.y - 2, 4.5, 0, Math.PI * 2);
    ctx.fill();

    if (flash > 0) {
      ctx.fillStyle = 'rgba(226,54,54,' + Math.min(0.35, flash) + ')';
      ctx.fillRect(0, 0, W, H);
    }

    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd54a';
    ctx.fillText('💰 ' + score, 14, 30);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText('第 ' + level + ' 关 · 目标 ' + TARGETS[level - 1], W / 2, 30);
    ctx.textAlign = 'right';
    ctx.fillStyle = timeLeft < 10 ? '#ff8a8a' : '#8ae0ff';
    ctx.fillText('⏰ ' + Math.ceil(timeLeft), W - 14, 30);
  };

  const loop = (t) => {
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    if (state === 'playing') update(dt);
    draw();
    raf = requestAnimationFrame(loop);
  };

  draw();

  /* 调试钩子（不影响游戏） */
  window.__minerTest = {
    getState: function () {
      return {
        state: hook.state,
        len: Math.round(hook.len),
        target: hook.target ? hook.target.type.e : null,
        objectsCount: objects.length,
        score: score,
        level: level
      };
    },
    launch: launch,
    setTime: function (t) { timeLeft = t; },
    getTime: function () { return timeLeft; },
    getGameState: function () { return state; },
    forceClear: function () {
      score = TARGETS[level - 1];
      levelClear();
    },
    forceGrab: function () {
      if (objects.length) {
        hook.target = objects[0];
        hook.state = 'reel';
        hook.len = 220;
      }
    }
  };
})();
