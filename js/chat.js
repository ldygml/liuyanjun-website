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
  const bubble = document.getElementById('mascotBubble');
  const chatName = document.getElementById('chatName');
  if (chatName) chatName.textContent = name;

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
          body: JSON.stringify({ messages: history.slice(-10), model: cfg.model || '' })
        });
        const j = await r.json();
        reply = j && j.reply ? j.reply : ((j && j.error) ? '（' + j.error + '）' : fallbackReply(text));
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
  };

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') send();
  });

  setTimeout(() => showBubble(greeting, 5000), 1500);
})();
