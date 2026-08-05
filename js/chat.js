/* 吉祥物小蛛：点击聊天，支持 AI 代理接口或预设回复 */
(function () {
  'use strict';

  const cfg = SITE.chat || {};
  const name = cfg.name || '小蛛';
  const apiUrl = cfg.apiUrl || '';
  const greeting = cfg.greeting || ('你好呀！我是' + name + '🕷️ 点我聊天～');

  const mascotBtn = document.getElementById('mascotBtn');
  const panel = document.getElementById('chatPanel');
  const msgs = document.getElementById('chatMsgs');
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  const closeBtn = document.getElementById('chatClose');
  const voiceBtn = document.getElementById('chatVoice');
  const bubble = document.getElementById('mascotBubble');
  const chatName = document.getElementById('chatName');
  if (chatName) chatName.textContent = name;

  /* 语音播报：让小蛛把回复读出来 */
  let voiceOn = localStorage.getItem('mascotVoice') !== '0';
  const setVoiceIcon = () => { if (voiceBtn) voiceBtn.textContent = voiceOn ? '🔊' : '🔇'; };
  setVoiceIcon();
  const speak = (text) => {
    if (!voiceOn || !('speechSynthesis' in window) || !text) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[*#>`\[\]()]/g, ''));
      u.lang = 'zh-CN';
      u.rate = 1;
      speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  };
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      voiceOn = !voiceOn;
      localStorage.setItem('mascotVoice', voiceOn ? '1' : '0');
      setVoiceIcon();
      if (voiceOn) speak('你好呀，我是小蛛');
    });
  }

  /* 网站资料摘要：让小蛛“读懂”网站，回答访客关于网站的问题 */
  const buildSiteInfo = () => {
    const s = SITE;
    const parts = [];
    parts.push('网站主人：' + s.name + '。' + ((s.about && s.about.paragraphs) ? s.about.paragraphs.join('') : ''));
    parts.push('经历：' + (s.journey || []).map((j) => j.period + ' ' + j.title).join('；'));
    parts.push('荣誉：' + (s.honors || []).map((h) => h.title + '(' + (h.date || '') + ')').join('；'));
    parts.push('技能：' + (s.skills || []).map((k) => k.name).join('、'));
    parts.push('作品：' + (s.works || []).map((w) => w.category + '《' + w.title + '》' + (w.desc || '')).join('；'));
    parts.push('文章：' + (s.posts || []).map((p) => '《' + p.title + '》').join('、'));
    const emails = (s.contact && s.contact.emails || []).map((e) => e.address).join('、');
    parts.push('联系方式：' + (emails ? '邮箱 ' + emails + '；' : '') + (s.contact && s.contact.github ? 'GitHub ' + s.contact.github.handle : ''));
    return parts.join('\n');
  };
  const siteInfo = buildSiteInfo();

  const FALLBACKS = [
    '嘿嘿，我是' + name + '🕷️ 主人给我做了个可爱的小窝～',
    '想了解主人的作品吗？点上面的“个人作品”就能看到啦！',
    '你猜我为什么是红蓝色的？因为我是蜘蛛侠的远房亲戚呀！',
    '我正在等主人给我接上真正的 AI 大脑，先陪你卖个萌🕷️',
    '这里可以搜索、留言，还能看我主人的照片哦～',
    '你问的问题好难，等我主人回来帮你解答吧！'
  ];
  const fallbackReply = (q) => {
    if (q.indexOf('?') !== -1 || q.indexOf('？') !== -1) {
      return '好问题！不过我还在等主人给我接上 AI 大脑，先卖个萌🕷️';
    }
    return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
  };

  let history = [];
  const pushMsg = (role, text) => {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  };

  const showBubble = (text, ms) => {
    bubble.textContent = text;
    bubble.classList.add('show');
    mascotBtn.classList.add('talking');
    clearTimeout(showBubble._t);
    if (ms) {
      showBubble._t = setTimeout(() => {
        bubble.classList.remove('show');
        mascotBtn.classList.remove('talking');
      }, ms);
    }
  };

  const openPanel = () => {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    input.focus();
  };
  const closePanel = () => {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  };

  mascotBtn.addEventListener('click', openPanel);
  closeBtn.addEventListener('click', closePanel);

  /* ---------- 拖动小蛛 ---------- */
  try {
    const saved = JSON.parse(localStorage.getItem('mascotPos') || 'null');
    if (saved && typeof saved.x === 'number') {
      mascotBtn.style.left = saved.x + 'px';
      mascotBtn.style.top = saved.y + 'px';
      mascotBtn.style.right = 'auto';
      mascotBtn.style.bottom = 'auto';
    }
  } catch (err) { /* ignore */ }

  let drag = null;
  let suppressClick = false;
  mascotBtn.addEventListener('pointerdown', (e) => {
    const rect = mascotBtn.getBoundingClientRect();
    drag = {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      moved: 0,
      lastX: e.clientX,
      lastY: e.clientY
    };
    try { mascotBtn.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    mascotBtn.classList.add('dragging');
    e.preventDefault();
  });
  mascotBtn.addEventListener('pointermove', (e) => {
    if (!drag) return;
    drag.moved += Math.abs(e.clientX - drag.lastX) + Math.abs(e.clientY - drag.lastY);
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    const w = mascotBtn.offsetWidth;
    const h = mascotBtn.offsetHeight;
    mascotBtn.style.left = Math.max(0, Math.min(window.innerWidth - w, e.clientX - drag.offsetX)) + 'px';
    mascotBtn.style.top = Math.max(0, Math.min(window.innerHeight - h, e.clientY - drag.offsetY)) + 'px';
    mascotBtn.style.right = 'auto';
    mascotBtn.style.bottom = 'auto';
  });
  mascotBtn.addEventListener('pointerup', () => {
    if (!drag) return;
    const wasDrag = drag.moved > 8;
    mascotBtn.classList.remove('dragging');
    const left = mascotBtn.style.left;
    const top = mascotBtn.style.top;
    drag = null;
    if (left && top) {
      try {
        localStorage.setItem('mascotPos', JSON.stringify({ x: parseInt(left, 10), y: parseInt(top, 10) }));
      } catch (err) { /* ignore */ }
    }
    if (wasDrag) {
      suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 400);
    }
  });
  mascotBtn.addEventListener('pointercancel', () => {
    if (!drag) return;
    mascotBtn.classList.remove('dragging');
    drag = null;
  });
  mascotBtn.addEventListener('click', (e) => {
    if (suppressClick) e.stopPropagation();
  }, true);

  const typingEl = () => {
    const d = document.createElement('div');
    d.className = 'chat-msg bot typing';
    d.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  };

  const send = async () => {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    pushMsg('user', text);
    history.push({ role: 'user', content: text });
    const t = typingEl();
    mascotBtn.classList.add('talking');

    let reply = '';
    if (apiUrl) {
      try {
        const r = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history.slice(-10), model: cfg.model || '', siteInfo: siteInfo })
        });
        const j = await r.json();
        reply = j && j.reply ? j.reply : fallbackReply(text);
      } catch (e) {
        reply = fallbackReply(text);
      }
    } else {
      reply = fallbackReply(text);
    }

    t.remove();
    mascotBtn.classList.remove('talking');
    pushMsg('bot', reply);
    history.push({ role: 'assistant', content: reply });
    showBubble(reply, 4000);
    speak(reply);
  };

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') send();
  });

  setTimeout(() => showBubble(greeting, 5000), 1500);
})();
