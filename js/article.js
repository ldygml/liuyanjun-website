/* 文章阅读页：根据 ?id= 从 SITE.posts 读取文章并渲染 */
(function () {
  'use strict';

  function mdToHtml(md) {
    const esc = (s) => String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const inline = (s) => esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    const lines = md.split('\n');
    let html = '';
    let inCode = false;
    let codeBuf = [];
    let inList = false;
    let listType = 'ul';
    const closeList = () => {
      if (inList) { html += '</' + listType + '>'; inList = false; }
    };

    lines.forEach((raw) => {
      const line = raw.trim();
      if (line.indexOf('```') === 0) {
        if (inCode) {
          html += '<pre><code>' + esc(codeBuf.join('\n')) + '</code></pre>';
          codeBuf = [];
          inCode = false;
        } else {
          inCode = true;
        }
        return;
      }
      if (inCode) { codeBuf.push(raw); return; }
      if (!line) { closeList(); return; }
      if (/^#{1,6}\s/.test(line)) {
        closeList();
        const level = line.match(/^#+/)[0].length;
        html += '<h' + level + '>' + inline(line.replace(/^#+\s*/, '')) + '</h' + level + '>';
      } else if (/^>\s?/.test(line)) {
        closeList();
        html += '<blockquote>' + inline(line.replace(/^>\s?/, '')) + '</blockquote>';
      } else if (/^[-*]\s/.test(line)) {
        if (!inList) { html += '<ul>'; inList = true; listType = 'ul'; }
        html += '<li>' + inline(line.replace(/^[-*]\s/, '')) + '</li>';
      } else if (/^\d+\.\s/.test(line)) {
        if (!inList) { html += '<ol>'; inList = true; listType = 'ol'; }
        html += '<li>' + inline(line.replace(/^\d+\.\s/, '')) + '</li>';
      } else {
        closeList();
        html += '<p>' + inline(line) + '</p>';
      }
    });
    if (inCode) html += '<pre><code>' + esc(codeBuf.join('\n')) + '</code></pre>';
    closeList();
    return html;
  }

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setText('logo-text', SITE.name);
  setText('footer-name', SITE.name);
  document.getElementById('year').textContent = new Date().getFullYear();

  const params = new URLSearchParams(location.search);
  const id = parseInt(params.get('id'), 10);
  const posts = SITE.posts || [];
  const post = posts[id];

  if (!post) {
    document.title = '文章不存在 · ' + SITE.name;
    setText('a-title', '文章不存在或已删除');
    setText('a-meta', '');
    return;
  }

  document.title = post.title + ' · ' + SITE.name;
  setText('a-title', post.title);
  setText('a-meta', post.date + ' · ' + (post.category || ''));
  document.getElementById('a-content').innerHTML = mdToHtml(post.content || post.excerpt || '暂无正文');
})();
