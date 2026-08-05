/* 蜘蛛侠 · 蛛丝打怪兽 v2：关卡/无限双模式 + 大招 + 全屏移动 + 多类型怪物 */
(function () {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const ui = document.getElementById('gameUi');
  const titleEl = document.querySelector('.game-title');
  const descEl = document.getElementById('gameDesc');
  const btnLevel = document.getElementById('btnLevel');
  const btnInfinite = document.getElementById('btnInfinite');
  const ultBtn = document.getElementById('ultBtn');

  let state = 'start';      // start | playing | levelclear | win | over
  let mode = null;          // 'level' | 'infinite'
  let level = 1;
  let score = 0;
  let bestLevel = 0;
  let bestInf = 0;
  let hp = 3;
  let shield = 0;
  let webCount = 1;
  let pickups = [];
  let boss = null;
  let bossActive = false;
  let bullets = [];
  let playerHit = 0;
  let power = 0;
  let ults = 0;
  let toDefeat = 0;
  let defeated = 0;
  let ulting = 0;

  const player = { x: W / 2, y: H - 110 };
  let webs = [];
  let enemies = [];
  let parts = [];
  let words = [];
  const stars = [];
  const keys = {};
  let fireCd = 0;
  let spawnCd = 1;
  let pointerX = null;
  let pointerY = null;
  let pointerDown = false;
  let isTouch = false;
  let aimX = 0;
  let aimY = -1;
  let raf = null;
  let last = 0;

  const TYPES = [
    { e: '👾', name: '普通', hp: 1, size: 40, speed: 85, move: 'straight', score: 10 },
    { e: '🐙', name: '波浪', hp: 1, size: 40, speed: 80, move: 'sine', score: 10 },
    { e: '👹', name: '追踪', hp: 2, size: 46, speed: 90, move: 'chase', score: 20 },
    { e: '💀', name: '快速', hp: 1, size: 36, speed: 165, move: 'straight', score: 15 },
    { e: '🦇', name: '闪避', hp: 1, size: 38, speed: 100, move: 'zigzag', score: 15 },
    { e: '👻', name: '飘忽', hp: 1, size: 40, speed: 95, move: 'diagonal', score: 15 }
  ];

  const LEVEL_TARGETS = [15, 20, 26, 32, 40];
  const LEVEL_UNLOCKS = [0, 2, 3, 4, 5];
  const ULT_THRESHOLD = 60;
  const MAX_ULTS = 2;

  try {
    bestLevel = parseInt(localStorage.getItem('spideyBestLevel') || '0', 10) || 0;
    bestInf = parseInt(localStorage.getItem('spideyBestInf') || '0', 10) || 0;
  } catch (e) { /* ignore */ }

  for (let i = 0; i < 70; i++) {
    stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.5 + 0.3 });
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
    const k = e.key.toLowerCase();
    if (k === 'e' && state === 'playing' && ults > 0) triggerUlt();
    if (e.key === 'Enter' && (state === 'over' || state === 'win')) startGame(mode);
    if (e.key === 'Enter' && state === 'levelclear') nextLevel();
    if ([' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.key) !== -1) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => { keys[e.key] = false; });

  const toGame = (clientX, clientY) => {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * W,
      y: ((clientY - r.top) / r.height) * H
    };
  };
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const p = toGame(e.touches[0].clientX, e.touches[0].clientY);
    pointerX = p.x;
    pointerY = p.y;
    pointerDown = true;
    isTouch = true;
  }, { passive: false });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const p = toGame(e.touches[0].clientX, e.touches[0].clientY);
    pointerX = p.x;
    pointerY = p.y;
  }, { passive: false });
  canvas.addEventListener('touchend', () => { pointerDown = false; isTouch = false; });

  /* ---- 流程 ---- */
  const setUI = (title, html, showModeBtns) => {
    titleEl.textContent = title;
    descEl.innerHTML = html;
    btnLevel.style.display = showModeBtns ? '' : 'none';
    btnInfinite.style.display = showModeBtns ? '' : 'none';
    ui.classList.remove('hidden');
  };

  const startGame = (m) => {
    mode = m;
    state = 'playing';
    level = 1;
    score = 0;
    hp = 3;
    shield = 0;
    webCount = 1;
    pickups = [];
    boss = null;
    bossActive = false;
    bullets = [];
    playerHit = 0;
    power = 0;
    ults = 1;
    webs = [];
    enemies = [];
    parts = [];
    words = [];
    pickups = [];
    bullets = [];
    player.x = W / 2;
    player.y = H - 110;
    fireCd = 0;
    spawnCd = 1;
    ulting = 0;
    defeated = 0;
    toDefeat = m === 'level' ? LEVEL_TARGETS[0] : 0;
    ui.classList.add('hidden');
    ultBtn.classList.remove('hidden');
    updateUltBtn();
    if (!raf) raf = requestAnimationFrame(loop);
    beep(660, 0.12, 'triangle', 0.07);
  };

  const nextLevel = () => {
    level++;
    state = 'playing';
    webs = [];
    enemies = [];
    parts = [];
    words = [];
    ults = Math.min(MAX_ULTS, ults + 1);
    player.x = W / 2;
    player.y = H - 110;
    defeated = 0;
    toDefeat = LEVEL_TARGETS[level - 1] || 40;
    spawnCd = 0.8;
    ui.classList.add('hidden');
    updateUltBtn();
    beep(520, 0.1, 'triangle', 0.07);
  };

  const gameOver = () => {
    state = 'over';
    if (mode === 'level') {
      if (score > bestLevel) {
        bestLevel = score;
        try { localStorage.setItem('spideyBestLevel', String(bestLevel)); } catch (e) { /* ignore */ }
      }
      setUI('💥 游戏结束', '关卡 ' + level + ' · 得分 <b>' + score + '</b> · 最高 <b>' + bestLevel + '</b><br/>按 Enter 或点按钮再来一局', false);
    } else {
      if (score > bestInf) {
        bestInf = score;
        try { localStorage.setItem('spideyBestInf', String(bestInf)); } catch (e) { /* ignore */ }
      }
      setUI('💥 游戏结束', '得分 <b>' + score + '</b> · 无限模式最高 <b>' + bestInf + '</b><br/>按 Enter 或点按钮再来一局', false);
    }
    ultBtn.classList.add('hidden');
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    draw();
    beep(220, 0.3, 'sawtooth', 0.08);
  };

  const winGame = () => {
    state = 'win';
    if (score > bestLevel) {
      bestLevel = score;
      try { localStorage.setItem('spideyBestLevel', String(bestLevel)); } catch (e) { /* ignore */ }
    }
    setUI('🎉 全部通关！', '5 关全部完成！得分 <b>' + score + '</b> · 历史最高 <b>' + bestLevel + '</b><br/>按 Enter 再来一局', false);
    ultBtn.classList.add('hidden');
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    draw();
    beep(880, 0.25, 'triangle', 0.08);
  };

  const levelClear = () => {
    state = 'levelclear';
    ults = Math.min(MAX_ULTS, ults + 1);
    if (level >= LEVEL_TARGETS.length) {
      winGame();
      return;
    }
    setUI('🎯 第 ' + level + ' 关完成！', '已消灭 <b>' + defeated + '</b> 只怪兽 · 得分 <b>' + score + '</b><br/>按 Enter 或点按钮进入下一关', false);
    beep(660, 0.15, 'triangle', 0.08);
  };

  btnLevel.addEventListener('click', () => startGame('level'));
  btnInfinite.addEventListener('click', () => startGame('infinite'));
  ultBtn.addEventListener('click', () => { if (state === 'playing' && ults > 0) triggerUlt(); });
  ui.addEventListener('click', (e) => {
    if (state === 'over' || state === 'win') startGame(mode);
    if (state === 'levelclear') nextLevel();
  });

  const updateUltBtn = () => {
    ultBtn.textContent = '⚡ 大招 ×' + ults;
    ultBtn.disabled = ults <= 0;
  };

  const triggerUlt = () => {
    ults--;
    updateUltBtn();
    ulting = 0.9;
    enemies.forEach((e) => { e.wrap = true; e.wrapT = 0; });
    if (bossActive && boss) {
      boss.hp -= 8;
      boss.hitFlash = 0.2;
      words.push({ x: boss.x, y: boss.y - 60, text: 'THWIP!', life: 0.8 });
      if (boss.hp <= 0) bossDefeated();
    }
    words.push({ x: player.x, y: player.y - 60, text: 'THWIP!', life: 0.8 });
    beep(440, 0.25, 'sawtooth', 0.1);
    setTimeout(() => beep(880, 0.2, 'square', 0.08), 120);
  };

  /* ---- 生成怪物 ---- */
  const availableTypes = (lvl) => {
    if (mode === 'level') {
      const idx = LEVEL_UNLOCKS[lvl - 1] || 5;
      return TYPES.slice(0, idx);
    }
    const sc = score;
    if (sc < 120) return TYPES.slice(0, 2);
    if (sc < 250) return TYPES.slice(0, 4);
    if (sc < 400) return TYPES.slice(0, 5);
    return TYPES;
  };

  const spawnEnemy = () => {
    const pool = availableTypes(level);
    const t = pool[Math.floor(Math.random() * pool.length)];
    const x = 40 + Math.random() * (W - 80);
    enemies.push({
      type: t,
      x: x,
      y: -30,
      baseX: x,
      dir: Math.random() < 0.5 ? -1 : 1,
      t: 0,
      hp: t.hp,
      flash: 0,
      wrap: false,
      wrapT: 0,
      hit: false
    });
  };

  /* ---- 更新 ---- */
  const update = (dt) => {
    // 玩家全屏移动
    let dx = 0, dy = 0;
    if (keys.ArrowLeft || keys.a) dx -= 1;
    if (keys.ArrowRight || keys.d) dx += 1;
    if (keys.ArrowUp || keys.w) dy -= 1;
    if (keys.ArrowDown || keys.s) dy += 1;
    if (dx || dy) {
      const l = Math.hypot(dx, dy);
      player.x += (dx / l) * 380 * dt;
      player.y += (dy / l) * 380 * dt;
    }
    if (isTouch && pointerX !== null) {
      player.x += (pointerX - player.x) * Math.min(1, dt * 9);
      player.y += (pointerY - player.y) * Math.min(1, dt * 9);
      const ax = pointerX - player.x;
      const ay = pointerY - player.y;
      const al = Math.hypot(ax, ay) || 1;
      aimX = ax / al;
      aimY = ay / al;
    } else {
      aimX = 0;
      aimY = -1;
    }
    player.x = Math.max(26, Math.min(W - 26, player.x));
    player.y = Math.max(60, Math.min(H - 46, player.y));

    // 发射
    fireCd -= dt;
    if (fireCd <= 0) {
      fireCd = 0.3;
      const base = -Math.PI / 2;
      const spread = (10 * Math.PI) / 180;
      for (let i = 0; i < webCount; i++) {
        const ang = base + (i - (webCount - 1) / 2) * spread;
        webs.push({
          x: player.x + Math.cos(ang) * 20,
          y: player.y + Math.sin(ang) * 20 - 14,
          vx: Math.cos(ang) * 540,
          vy: Math.sin(ang) * 540
        });
      }
      beep(520, 0.04, 'square', 0.03);
    }

    // 蛛丝
    for (let i = webs.length - 1; i >= 0; i--) {
      const w = webs[i];
      w.x += w.vx * dt;
      w.y += w.vy * dt;
      if (w.x < -20 || w.x > W + 20 || w.y < -20 || w.y > H + 20) {
        webs.splice(i, 1);
        continue;
      }
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        const dx2 = w.x - e.x;
        const dy2 = w.y - e.y;
        if (dx2 * dx2 + dy2 * dy2 < 40 * 40) {
          webs.splice(i, 1);
          e.hp--;
          if (e.hp <= 0) {
            killEnemy(j);
          } else {
            e.flash = 0.15;
            beep(700, 0.06, 'triangle', 0.05);
          }
          break;
        }
      }
      if (bossActive && boss) {
        const bx2 = w.x - boss.x;
        const by2 = w.y - boss.y;
        if (bx2 * bx2 + by2 * by2 < 52 * 52) {
          webs.splice(i, 1);
          boss.hp--;
          boss.hitFlash = 0.12;
          beep(760, 0.07, 'triangle', 0.06);
          if (boss.hp <= 0) bossDefeated();
        }
      }
    }

    // 大招包裹
    if (ulting > 0) {
      ulting -= dt;
      enemies.forEach((e) => {
        if (e.wrap) e.wrapT += dt;
      });
      for (let j = enemies.length - 1; j >= 0; j--) {
        if (enemies[j].wrap && enemies[j].wrapT >= 0.75) {
          killEnemy(j);
        }
      }
    }

    // 怪物移动
    enemies.forEach((e) => {
      e.t += dt;
      if (e.flash > 0) e.flash -= dt;
      if (e.wrap) return;
      const t = e.type;
      const v = t.speed * (1 + score * 0.0008);
      if (t.move === 'straight') {
        e.y += v * dt;
      } else if (t.move === 'sine') {
        e.y += v * dt;
        e.x = e.baseX + Math.sin(e.t * 3) * 55;
      } else if (t.move === 'chase') {
        const cx = player.x - e.x;
        const cy = player.y - e.y;
        const cl = Math.hypot(cx, cy) || 1;
        e.x += (cx / cl) * v * 0.7 * dt;
        e.y += (cy / cl) * v * 0.9 * dt;
      } else if (t.move === 'zigzag') {
        e.y += v * dt;
        e.x += e.dir * 130 * dt;
        if (e.x < 30) { e.x = 30; e.dir = 1; }
        if (e.x > W - 30) { e.x = W - 30; e.dir = -1; }
      } else if (t.move === 'diagonal') {
        e.x += e.dir * 90 * dt;
        e.y += v * 1.15 * dt;
      }
    });

    // 漏怪扣命
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (e.y > H + 30 && !e.wrap) {
        enemies.splice(i, 1);
        if (shield > 0) {
          shield--;
          words.push({ x: e.x, y: H - 70, text: '🛡️', life: 0.7 });
          beep(320, 0.12, 'triangle', 0.07);
        } else {
          hp--;
          beep(200, 0.18, 'sawtooth', 0.08);
          if (hp <= 0) { gameOver(); return; }
        }
      }
    }

    // 道具拾取
    for (let i = pickups.length - 1; i >= 0; i--) {
      const p = pickups[i];
      p.y += 55 * dt;
      const dx = p.x - player.x;
      const dy = p.y - player.y;
      if (dx * dx + dy * dy < 36 * 36) {
        pickups.splice(i, 1);
        applyPickup(p);
      } else if (p.y > H + 20) {
        pickups.splice(i, 1);
      }
    }

    // BOSS 行动
    if (bossActive && boss) {
      boss.t += dt;
      boss.x = W / 2 + Math.sin(boss.t * 0.8) * (W / 2 - 100);
      boss.y = 140 + Math.sin(boss.t * 1.7) * 22;
      if (boss.hitFlash > 0) boss.hitFlash -= dt;
      boss.fireCd -= dt;
      if (boss.fireCd <= 0) {
        boss.fireCd = Math.max(0.8, 1.6 - level * 0.1);
        bossFire();
      }
      boss.minionCd -= dt;
      if (boss.minionCd <= 0) {
        boss.minionCd = 3;
        if (enemies.length < 3) {
          const pool = TYPES.slice(0, Math.min(2, LEVEL_UNLOCKS[level - 1] || 2));
          const t = pool[Math.floor(Math.random() * pool.length)];
          enemies.push({
            type: t,
            x: 50 + Math.random() * (W - 100),
            y: -30,
            baseX: 50,
            dir: Math.random() < 0.5 ? -1 : 1,
            t: 0,
            hp: t.hp,
            flash: 0,
            wrap: false,
            wrapT: 0,
            hit: false
          });
        }
      }
    }

    // BOSS 子弹
    if (playerHit > 0) playerHit -= dt;
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) {
        bullets.splice(i, 1);
        continue;
      }
      const dx = b.x - player.x;
      const dy = b.y - player.y;
      if (dx * dx + dy * dy < 28 * 28) {
        bullets.splice(i, 1);
        damagePlayer();
      }
    }

    // 生成
    if (ulting <= 0 && !bossActive) {
      spawnCd -= dt;
      if (spawnCd <= 0) {
        spawnEnemy();
        const base = mode === 'level' ? Math.max(0.5, 1.05 - level * 0.1) : Math.max(0.3, 0.85 - score * 0.004);
        spawnCd = base;
      }
    }

    // 粒子 / 文字
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

    // 关卡模式通关判定
    if (mode === 'level' && !bossActive && defeated >= toDefeat) {
      spawnBoss();
    }
  };

  const killEnemy = (idx) => {
    const e = enemies[idx];
    enemies.splice(idx, 1);
    score += e.type.score;
    defeated++;
    power += e.type.score;
    while (power >= ULT_THRESHOLD) {
      power -= ULT_THRESHOLD;
    if (ults < MAX_ULTS) ults++;
    }
    updateUltBtn();
    words.push({
      x: e.x,
      y: e.y,
      text: ['BAM!', 'POW!', 'THWIP!'][Math.floor(Math.random() * 3)],
      life: 0.7
    });
    for (let k = 0; k < 10; k++) {
      const a = Math.random() * Math.PI * 2;
      parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * 100, vy: Math.sin(a) * 100, r: 2 + Math.random() * 3, life: 0.4 });
    }
    if (Math.random() < 0.22) {
      const r = Math.random();
      const type = r < 0.45 ? 'hp' : (r < 0.7 ? 'shield' : 'web');
      const emoji = type === 'hp' ? '❤️' : (type === 'shield' ? '🛡️' : '🕸️');
      pickups.push({ x: e.x, y: e.y, type: type, emoji: emoji });
    }
    beep(880, 0.08, 'triangle', 0.06);
  };

  const applyPickup = (p) => {
    if (p.type === 'hp') {
      hp++;
      words.push({ x: player.x, y: player.y - 50, text: '❤️ +1', life: 0.7 });
    } else if (p.type === 'shield') {
      if (shield < 2) {
        shield++;
        words.push({ x: player.x, y: player.y - 50, text: '🛡️ +1', life: 0.7 });
      } else {
        score += 10;
        words.push({ x: player.x, y: player.y - 50, text: '+10', life: 0.7 });
      }
    } else {
      if (webCount < 5) {
        webCount++;
        words.push({ x: player.x, y: player.y - 50, text: '🕸️ +1', life: 0.7 });
      } else {
        score += 10;
        words.push({ x: player.x, y: player.y - 50, text: '+10', life: 0.7 });
      }
    }
    beep(700, 0.08, 'triangle', 0.06);
  };

  const damagePlayer = () => {
    if (playerHit > 0) return;
    if (shield > 0) {
      shield--;
      words.push({ x: player.x, y: player.y - 50, text: '🛡️', life: 0.6 });
      beep(320, 0.12, 'triangle', 0.07);
    } else {
      hp--;
      beep(200, 0.18, 'sawtooth', 0.08);
      if (hp <= 0) { gameOver(); return; }
    }
    playerHit = 0.6;
  };

  const spawnBoss = () => {
    boss = {
      x: W / 2,
      y: 140,
      hp: 18 + level * 10,
      maxHp: 18 + level * 10,
      t: 0,
      fireCd: 1.5,
      minionCd: 2,
      hitFlash: 0
    };
    bossActive = true;
    words.push({ x: W / 2, y: 90, text: '⚠️ BOSS 来袭!', life: 1.2 });
    beep(180, 0.35, 'sawtooth', 0.1);
  };

  const bossFire = () => {
    const ang = Math.atan2(player.y - boss.y, player.x - boss.x);
    for (let i = -1; i <= 1; i++) {
      const a = ang + i * 0.22;
      bullets.push({ x: boss.x, y: boss.y + 30, vx: Math.cos(a) * 210, vy: Math.sin(a) * 210 });
    }
    beep(300, 0.1, 'sawtooth', 0.06);
  };

  const bossDefeated = () => {
    const b = boss;
    boss = null;
    bossActive = false;
    score += 100 * level;
    words.push({ x: b.x, y: b.y, text: 'BOSS 击破!', life: 1 });
    for (let k = 0; k < 26; k++) {
      const a = Math.random() * Math.PI * 2;
      parts.push({ x: b.x, y: b.y, vx: Math.cos(a) * 160, vy: Math.sin(a) * 160, r: 2 + Math.random() * 4, life: 0.6 });
    }
    pickups.push({ x: b.x - 40, y: b.y, type: 'hp', emoji: '❤️' });
    pickups.push({ x: b.x, y: b.y, type: 'shield', emoji: '🛡️' });
    pickups.push({ x: b.x + 40, y: b.y, type: 'web', emoji: '🕸️' });
    beep(440, 0.3, 'sawtooth', 0.1);
    levelClear();
  };

  /* ---- 绘制 ---- */
  const drawPlayer = () => {
    const x = player.x, y = player.y;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.atan2(aimY, aimX) + Math.PI / 2);
    ctx.fillStyle = '#2b5baa';
    ctx.beginPath();
    ctx.ellipse(0, 14, 11, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e23636';
    ctx.beginPath();
    ctx.arc(0, -10, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1f2933';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(-5.5, -12, 5.5, 7, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(5.5, -12, 5.5, 7, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < shield; i++) {
      ctx.strokeStyle = 'rgba(91, 141, 239, 0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 2, 28 + i * 8, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawWebShot = (w) => {
    ctx.save();
    ctx.translate(w.x, w.y);
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 * i) / 8;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 2, Math.sin(a) * 2);
      ctx.lineTo(Math.cos(a) * 10, Math.sin(a) * 10);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  const drawEnemy = (e) => {
    ctx.save();
    ctx.translate(e.x, e.y);
    const size = e.type.size;
    if (e.wrap) {
      // 蛛丝包裹
      ctx.strokeStyle = 'rgba(255,255,255,0.95)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 4, Math.sin(a) * 4);
        ctx.lineTo(Math.cos(a) * (size + 8), Math.sin(a) * (size + 8));
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 0, size + 4, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.font = size + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.type.e, 0, 0);
      if (e.flash > 0) {
        ctx.fillStyle = 'rgba(255,255,255,' + Math.min(1, e.flash * 6) + ')';
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.75, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  };

  const drawBoss = () => {
    if (!bossActive || !boss) return;
    const b = boss;
    ctx.save();
    ctx.translate(b.x, b.y);
    if (b.hitFlash > 0) ctx.globalAlpha = 0.5;
    ctx.font = '80px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('😈', 0, 0);
    ctx.restore();
    ctx.globalAlpha = 1;
    const bw2 = 220, bh2 = 14, bx2 = W / 2 - bw2 / 2, by2 = 40;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(bx2, by2, bw2, bh2);
    ctx.fillStyle = '#e23636';
    ctx.fillRect(bx2, by2, bw2 * Math.max(0, b.hp / b.maxHp), bh2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx2, by2, bw2, bh2);
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('BOSS', W / 2, by2 - 8);
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

    enemies.forEach(drawEnemy);
    drawBoss();
    webs.forEach(drawWebShot);
    pickups.forEach((p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.font = '30px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.emoji, 0, 0);
      ctx.restore();
    });
    bullets.forEach((b) => {
      ctx.fillStyle = 'rgba(255, 90, 120, 0.9)';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    parts.forEach((p) => {
      ctx.fillStyle = 'rgba(255,255,255,' + Math.max(0, p.life / 0.4) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    words.forEach((w) => {
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#e23636';
      ctx.lineWidth = 3;
      ctx.strokeText(w.text, w.x, w.y);
      ctx.fillStyle = 'rgba(255,255,255,' + Math.max(0, w.life / 0.7) + ')';
      ctx.fillText(w.text, w.x, w.y);
    });

    // 大招全屏蛛网
    if (ulting > 0) {
      const p = 1 - ulting / 0.9;
      const cx = W / 2, cy = H / 2;
      const maxR = Math.hypot(W, H) / 2 * Math.min(1, p * 1.8);
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.5 * (1 - p)) + ')';
      ctx.lineWidth = 2;
      for (let i = 0; i < 12; i++) {
        const a = (Math.PI * 2 * i) / 12;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
        ctx.stroke();
      }
      for (let k = 1; k <= 6; k++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (maxR * k) / 6, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    if (playerHit > 0) ctx.globalAlpha = 0.55;
    drawPlayer();
    ctx.globalAlpha = 1;

    // HUD
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.fillText('得分 ' + score, 16, 30);
    ctx.textAlign = 'right';
    if (mode === 'level') {
      ctx.fillText('第 ' + level + ' 关 · ' + defeated + '/' + toDefeat, W - 16, 30);
    } else {
      ctx.fillText('最高 ' + bestInf, W - 16, 30);
    }
    ctx.textAlign = 'left';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#ff8a8a';
    ctx.fillText('❤️ ' + hp, 16, 58);
    ctx.fillStyle = '#8ab8ff';
    ctx.fillText('🛡️ ' + shield, 16, 82);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🕸️ ' + webCount, 16, 106);
    // 能量条
    const bw = 150, bh = 10, bx = 16, by = 120;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#ffd54a';
    ctx.fillRect(bx, by, bw * Math.min(1, power / ULT_THRESHOLD), bh);
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#ffd54a';
    ctx.textAlign = 'left';
    ctx.fillText('⚡ ' + ults, bx + bw + 10, by + 10);
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
  window.__spideyTest = {
    spawnBoss: spawnBoss,
    getState: function () {
      return {
        state: state,
        bossActive: bossActive,
        bossHp: boss ? boss.hp : null,
        defeated: defeated,
        toDefeat: toDefeat,
        hp: hp,
        shield: shield,
        webCount: webCount
      };
    }
  };
})();
