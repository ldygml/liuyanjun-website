/* 吉祥物小蛛：点击聊天，支持 AI 流式输出 / Markdown / 复制回复 */
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

  /* 语音播报 */
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

  /* 网站资料摘要 */
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
    '嘿嘿，我是' + name + '🕷️，主人给我做了个可爱的小窝～',
    '想了解主人的作品吗？点上面的"个人作品"就能看到啦！',
    '你猜我为什么是红蓝色的？因为我是蜘蛛侠的远房亲戚呀！',
    '我正等主人给我接上真正的大脑呢，先陪你卖个萌🕷️',
    '这里可以搜索、留言，还能看我主人的照片哦～',
    '你问的问题好难，等我主人回来帮你解答吧！'
  ];
  const fallbackReply = (q) => {
    if (q.indexOf('?') !== -1 || q.indexOf('？') !== -1) {
      return '好问题！不过小蛛现在还没连上大脑，先陪你卖个萌🕷️';
    }
    return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
  };

  const MAX_HISTORY = 50;
  const STORE_KEY = 'mascotChat';
  let history = [];
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    if (Array.isArray(saved)) history = saved.slice(-MAX_HISTORY);
  } catch (err) { /* ignore */ }

  const pushMsg = (role, text) => {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  };

  const saveHistory = () => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(history.slice(-MAX_HISTORY))); } catch (err) { /* ignore */ }
  };

  history.forEach((m) => {
    if (m && m.role && m.content) pushMsg(m.role, m.content);
  });

  /* 简易 Markdown 渲染（先转义，再替换，安全） */
  const escapeHtml = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  const renderMarkdown = (div, text) => {
    let html = escapeHtml(text);
    html = html.replace(/```([\s\S]*?)```/g, (m, c) => '<pre><code>' + c + '</code></pre>');
    html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    html = html.replace(/\n/g, '<br>');
    div.innerHTML = html;
  };

  /* 复制按钮 */
  const addCopyBtn = (div, text) => {
    const btn = document.createElement('button');
    btn.className = 'chat-copy';
    btn.textContent = '复制';
    btn.setAttribute('aria-label', '复制这条回复');
    btn.addEventListener('click', () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          btn.textContent = '已复制 ✓';
          setTimeout(() => { btn.textContent = '复制'; }, 1500);
        }).catch(() => {});
      }
    });
    div.appendChild(btn);
  };

  /* 真实流式：读取 SSE 并逐字显示 */
  const consumeStream = async (r) => {
    const reader = r.body.getReader();
    const decoder = new TextDecoder('utf-8');
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    msgs.appendChild(div);
    let buf = '';
    let full = '';
    let done = false;
    while (!done) {
      const chunk = await reader.read();
      done = chunk.done;
      if (chunk.value) {
        buf += decoder.decode(chunk.value, { stream: true });
        let nl;
        while ((nl = buf.indexOf('\n')) !== -1) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (line.indexOf('data:') !== 0) continue;
          const data = line.slice(5).trim();
          if (data === '[DONE]') continue;
          try {
            const j = JSON.parse(data);
            const delta = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content;
            if (delta) {
              full += delta;
              div.textContent = full;
              msgs.scrollTop = msgs.scrollHeight;
            }
          } catch (e) { /* 忽略不完整行 */ }
        }
      }
    }
    if (!full) return '';
    renderMarkdown(div, full);
    addCopyBtn(div, full);
    return full;
  };

  /* 打字机效果（非流式兜底） */
  const typeText = (el, text, done) => {
    let i = 0;
    el.textContent = '';
    const step = () => {
      i += 1;
      el.textContent = text.slice(0, i);
      msgs.scrollTop = msgs.scrollHeight;
      if (i < text.length) {
        setTimeout(step, 10);
      } else if (done) {
        done();
      }
    };
    step();
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

  /* 清空聊天 */
  const clearBtn = document.createElement('button');
  clearBtn.className = 'chat-clear';
  clearBtn.textContent = '清空';
  clearBtn.setAttribute('aria-label', '清空聊天记录');
  if (closeBtn && closeBtn.parentNode) {
    closeBtn.parentNode.insertBefore(clearBtn, closeBtn);
  }
  clearBtn.addEventListener('click', () => {
    history = [];
    saveHistory();
    msgs.innerHTML = '';
    showBubble('好啦，重新开始～', 2500);
  });

  /* 快捷提问 */
  const inputWrap = document.querySelector('.chat-input-wrap');
  const quick = document.createElement('div');
  quick.className = 'chat-quick';
  ['介绍一下这个网站', '他有什么作品？', '怎么联系他？', '讲个蜘蛛侠的冷笑话'].forEach((q) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = q;
    b.addEventListener('click', () => {
      input.value = q;
      send();
    });
    quick.appendChild(b);
  });
  if (inputWrap && inputWrap.parentNode) {
    inputWrap.parentNode.insertBefore(quick, inputWrap);
  }

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
    saveHistory();
    const t = typingEl();
    mascotBtn.classList.add('talking');

    let reply = '';
    let streamed = false;
    let apiError = false;

    if (apiUrl) {
      try {
        const r = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history.slice(-10),
            model: cfg.model || '',
            siteInfo: siteInfo,
            stream: true
          })
        });
        if (!r.ok) throw new Error('api ' + r.status);
        const ct = r.headers.get('content-type') || '';
        if (ct.indexOf('text/event-stream') !== -1) {
          streamed = true;
          t.remove();
          reply = await consumeStream(r);
          if (!reply) throw new Error('empty stream');
        } else {
          const j = await r.json();
          reply = j && j.reply ? j.reply : '';
          if (!reply) throw new Error('empty reply');
        }
      } catch (e) {
        apiError = true;
        reply = fallbackReply(text);
      }
    } else {
      apiError = true;
      reply = fallbackReply(text);
    }

    if (!streamed) {
      t.remove();
      const div = pushMsg('bot', '');
      typeText(div, reply, () => {
        renderMarkdown(div, reply);
        addCopyBtn(div, reply);
      });
    }

    mascotBtn.classList.remove('talking');
    history.push({ role: 'assistant', content: reply });
    saveHistory();
    showBubble(reply, 4000);
    speak(reply);

    if (apiError) {
      const note = document.createElement('div');
      note.className = 'chat-msg system';
      note.textContent = '小蛛暂时连不上大脑，先用备选话术顶上啦 🕷️';
      msgs.appendChild(note);
      msgs.scrollTop = msgs.scrollHeight;
    }
  };

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') send();
  });

  setTimeout(() => showBubble(greeting, 5000), 1500);
})();
