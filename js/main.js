/* ============================================================
   个人网站交互脚本
   - 打字机效果
   - 粒子背景
   - 滚动显现 / 技能条动画
   - 导航高亮 / 移动端菜单 / 阅读进度 / 回到顶部
   ============================================================ */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     控制台彩蛋
     ============================================================ */
  console.log('%c🕷️ 欢迎来到 999gml 的巢穴', 'font-size:18px;font-weight:700;color:#fff;background:#e23636;padding:8px 16px;border-radius:8px;');
  console.log('%c   /\\_/\\%c\n  ( o.o )%c  —— 小蛛说：别乱翻，被主人发现会很尴尬的\n   > ^ <', 'color:#e23636;font-size:13px;', 'color:#2b5baa;font-size:13px;', 'color:#66707c;font-size:12px;');

  /* 深夜彩蛋：晚上 22 点后到早上 6 点，小蛛眼睛发光 */
  const nightHour = new Date().getHours();
  if (nightHour >= 22 || nightHour < 6) document.body.classList.add('night');

  /* 加载动画：页面加载完成或超时 2.5 秒后淡出 */
  const loader = document.getElementById('siteLoader');
  const hideLoader = () => {
    if (loader && !loader.classList.contains('done')) loader.classList.add('done');
  };
  window.addEventListener('load', hideLoader);
  setTimeout(hideLoader, 2500);

  /* ============================================================
     根据 js/content.js 中的配置渲染网站内容
     （以后修改文字只需要编辑 js/content.js）
     ============================================================ */
  const $ = (id) => document.getElementById(id);
  const setText = (id, text) => {
    const el = $(id);
    if (el) el.textContent = text;
  };

  const ICON_MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>';
  const ICON_GITHUB = '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>';
  const ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
  const ICON_DOUYIN = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>';
  const ICON_RED = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 10l-6-6H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V10zm-8-6.5L20.5 10H14V3.5z"/></svg>';

  document.title = SITE.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', SITE.description);

  setText('logo-text', SITE.name);
  setText('hero-greeting', SITE.heroLabel);
  setText('hero-name', SITE.heroStatement);
  setText('hero-sub', SITE.tagline);
  const heroSub = $('hero-sub');
  if (heroSub) heroSub.style.display = SITE.tagline ? '' : 'none';
  setText('footer-name', SITE.name);

  Object.keys(SITE.sections).forEach((key) => {
    const sec = SITE.sections[key];
    setText('head-' + key + '-title', sec.title);
    setText('head-' + key + '-sub', sec.sub || '');
  });
  setText('skills-heading', SITE.toolsHeading);

  const paras = $('about-paragraphs');
  if (paras) paras.innerHTML = SITE.about.paragraphs.map((p) => '<p>' + p + '</p>').join('');

  const stats = $('about-stats');
  if (stats) stats.innerHTML = SITE.about.stats.map((s) =>
    '<div class="stat"><span class="stat-num">' + s.num + '</span><span class="stat-label">' + s.label + '</span></div>'
  ).join('');

  const bars = $('skill-bars');
  if (bars) bars.innerHTML = SITE.skills.map((s) =>
    '<div class="skill-row">' +
      '<div class="skill-meta"><span>' + s.name + '</span><span class="skill-percent" data-percent="' + s.percent + '">0%</span></div>' +
      '<div class="skill-track"><div class="skill-fill" data-width="' + s.percent + '%"></div></div>' +
    '</div>'
  ).join('');

  const tags = $('skill-tags');
  if (tags) tags.innerHTML = SITE.tools.map((t) => '<span class="tag">' + t + '</span>').join('');

  const timeline = $('timeline');
  if (timeline) timeline.innerHTML = SITE.journey.map((item) =>
    '<div class="timeline-item reveal">' +
      '<span class="timeline-period">' + item.period + '</span>' +
      '<h3>' + item.title + '</h3>' +
      '<p>' + item.desc + '</p>' +
    '</div>'
  ).join('');

  const honors = $('honors-grid');
  if (honors) honors.innerHTML = SITE.honors.map((h) =>
    '<div class="honor-card reveal">' +
      '<span class="honor-icon" aria-hidden="true">' + (h.icon || '🏅') + '</span>' +
      (h.date ? '<span class="honor-date">' + h.date + '</span>' : '') +
      '<h3>' + h.title + '</h3>' +
      (h.desc ? '<p>' + h.desc + '</p>' : '') +
    '</div>'
  ).join('');

  const interests = $('interests-grid');
  if (interests) interests.innerHTML = SITE.interests.map((item) =>
    '<div class="interest-card reveal">' +
      '<span class="interest-icon" aria-hidden="true">' + item.icon + '</span>' +
      '<div class="interest-name">' + item.name + '</div>' +
      '<div class="interest-desc">' + item.desc + '</div>' +
    '</div>'
  ).join('');

  const tabWrap = $('work-tabs');
  if (tabWrap) {
    tabWrap.innerHTML = (SITE.workCategories || []).map((c) =>
      '<button class="filter-tab" data-filter="' + c + '">' + c + '</button>'
    ).join('');
  }

  const proj = $('works-grid');
  const catCounters = {};
  if (proj) proj.innerHTML = SITE.works.map((p) => {
    catCounters[p.category] = (catCounters[p.category] || 0) + 1;
    const num = catCounters[p.category];
    const isCode = p.category === '编程';
    const demo = p.demo || '';
    let mediaHtml = '';
    if (!isCode && demo) {
      const dl = demo.toLowerCase();
      if (/\.(mp3|m4a|wav|ogg|aac)$/.test(dl)) {
        mediaHtml = '<audio class="work-media" controls preload="metadata" src="' + demo + '"></audio>';
      } else if (/\.(mp4|webm|mov|m4v)$/.test(dl)) {
        mediaHtml = '<video class="work-media" controls preload="metadata" src="' + demo + '"></video>';
      } else if (/\.(jpe?g|png|gif|webp)$/.test(dl)) {
        mediaHtml = '<img class="work-media" src="' + demo + '" alt="' + p.title + '" loading="lazy" />';
      }
    }
    const links = isCode
      ? '<a href="' + (p.source || '#') + '" class="link">查看源码 →</a><a href="' + (p.demo || '#') + '" class="link">在线预览 →</a>'
      : '<a href="' + (p.source || p.demo || '#') + '" class="link">查看作品 →</a>';
    return '<article class="project-card reveal work-card" data-category="' + p.category + '">' +
      '<div class="project-thumb thumb-' + (((num - 1) % 4) + 1) + '">' +
        '<span class="cat-badge">' + p.category + '</span>' +
        '<span class="thumb-num">' + String(num).padStart(2, '0') + '</span>' +
      '</div>' +
      '<div class="project-body">' +
        '<h3>' + p.title + '</h3>' +
        '<p>' + p.desc + '</p>' +
        '<div class="project-tags">' + p.tags.map((t) => '<span>' + t + '</span>').join('') + '</div>' +
        mediaHtml +
        '<div class="project-links">' + links + '</div>' +
      '</div>' +
    '</article>';
  }).join('');

  /* 作品分类筛选 */
  const workCards = Array.from(document.querySelectorAll('.work-card'));
  const filterTabs = Array.from(document.querySelectorAll('.filter-tab'));
  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;
      const isActive = tab.classList.contains('active');
      filterTabs.forEach((t) => t.classList.remove('active'));
      if (isActive) {
        // 再次点击当前分类：取消筛选，显示全部
        workCards.forEach((card) => card.classList.remove('work-hidden'));
      } else {
        tab.classList.add('active');
        workCards.forEach((card) => {
          card.classList.toggle('work-hidden', card.dataset.category !== filter);
        });
      }
    });
  });

  const blog = $('blog-grid');
  if (blog) blog.innerHTML = SITE.posts.map((post, i) =>
    '<article class="blog-card reveal">' +
      '<div class="blog-meta"><span class="chip">' + post.category + '</span><time datetime="' + post.date + '">' + post.date + '</time></div>' +
      '<h3>' + post.title + '</h3>' +
      '<p>' + post.excerpt + '</p>' +
      '<a href="' + (post.link || ('article.html?id=' + i)) + '" class="link">阅读全文 →</a>' +
    '</article>'
  ).join('');

  const gallery = $('gallery-grid');
  if (gallery) gallery.innerHTML = SITE.gallery.map((item) => {
    const inner = item.img
      ? '<img src="' + item.img + '" alt="' + (item.title || '照片') + '" loading="lazy" />'
      : '<div class="gallery-ph"><span class="ph-icon" aria-hidden="true">📷</span><span class="ph-text">' + (item.title || '照片占位') + '</span></div>';
    return '<div class="gallery-item reveal">' + inner + '</div>';
  }).join('');

  const contactCards = $('contact-cards');
  if (contactCards) {
    let html = '';
    (SITE.contact.emails || []).forEach((e) => {
      html += '<a class="contact-card" href="mailto:' + e.address + '">' +
        '<span class="contact-icon" aria-hidden="true">' + ICON_MAIL + '</span>' +
        '<span><span class="contact-label">' + (e.label || '邮箱') + '</span><span class="contact-value">' + e.address + '</span></span>' +
      '</a>';
    });
    if (SITE.contact.github && SITE.contact.github.url) {
      html += '<a class="contact-card" href="' + SITE.contact.github.url + '" target="_blank" rel="noopener">' +
        '<span class="contact-icon" aria-hidden="true">' + ICON_GITHUB + '</span>' +
        '<span><span class="contact-label">GitHub</span><span class="contact-value">' + (SITE.contact.github.handle || '') + '</span></span>' +
      '</a>';
    }
    if (SITE.contact.wechat) {
      html += '<div class="contact-card">' +
        '<span class="contact-icon" aria-hidden="true">' + ICON_CHAT + '</span>' +
        '<span><span class="contact-label">微信</span><span class="contact-value">' + SITE.contact.wechat + '</span></span>' +
      '</div>';
    }
    (SITE.contact.socials || []).forEach((s) => {
      if (!s.url) return;
      const icon = s.icon === 'douyin' ? ICON_DOUYIN : (s.icon === 'xiaohongshu' ? ICON_RED : '');
      html += '<a class="contact-card" href="' + s.url + '" target="_blank" rel="noopener">' +
        '<span class="contact-icon" aria-hidden="true">' + icon + '</span>' +
        '<span><span class="contact-label">' + s.label + '</span><span class="contact-value">' + (s.handle || s.url) + '</span></span>' +
      '</a>';
    });
    contactCards.innerHTML = html;
  }

  /* ---------- 站内搜索 ---------- */
  const escapeHtml = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const searchBtn = document.getElementById('searchBtn');
  const searchModal = document.getElementById('searchModal');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchClose = document.getElementById('searchClose');

  const searchIndex = [];
  (SITE.works || []).forEach((w) => {
    searchIndex.push({ cat: '作品', section: 'projects', title: w.title, desc: w.desc, tags: (w.tags || []).join(' ') });
  });
  (SITE.posts || []).forEach((p) => {
    searchIndex.push({ cat: '文章', section: 'blog', title: p.title, desc: p.excerpt, tags: p.category });
  });

  const openSearch = () => {
    searchModal.classList.add('open');
    searchModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => searchInput.focus(), 50);
  };
  const closeSearch = () => {
    searchModal.classList.remove('open');
    searchModal.setAttribute('aria-hidden', 'true');
  };
  const runSearch = (q) => {
    q = q.trim().toLowerCase();
    if (!q) { searchResults.innerHTML = ''; return; }
    const hits = searchIndex.filter((item) =>
      (item.title + ' ' + item.desc + ' ' + item.tags).toLowerCase().indexOf(q) !== -1
    ).slice(0, 8);
    if (!hits.length) {
      searchResults.innerHTML = '<div class="search-empty">没有找到相关内容</div>';
      return;
    }
    searchResults.innerHTML = hits.map((h) =>
      '<a href="#' + h.section + '" class="search-item" data-section="' + h.section + '">' +
        '<span class="si-cat">' + h.cat + '</span><span class="si-title">' + escapeHtml(h.title) + '</span>' +
        (h.desc ? '<div class="si-desc">' + escapeHtml(h.desc.slice(0, 60)) + '</div>' : '') +
      '</a>'
    ).join('');
    searchResults.querySelectorAll('.search-item').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        closeSearch();
        const target = document.getElementById(a.dataset.section);
        if (target) target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
      });
    });
  };

  if (searchBtn && searchModal) {
    searchBtn.addEventListener('click', openSearch);
    searchClose.addEventListener('click', closeSearch);
    searchInput.addEventListener('input', () => runSearch(searchInput.value));
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const first = searchResults.querySelector('.search-item');
        if (first) first.click();
      }
    });
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape' && searchModal.classList.contains('open')) closeSearch();
    });
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });
  }

  /* ---------- 打字机效果 ---------- */
  const typedEl = document.getElementById('typewriter');
  const roles = SITE.roles;

  if (typedEl) {
    if (prefersReduced) {
      typedEl.textContent = roles[0];
    } else {
      let roleIndex = 0;
      let charIndex = 0;
      let deleting = false;

      const tick = () => {
        const role = roles[roleIndex];
        charIndex += deleting ? -1 : 1;
        typedEl.textContent = role.slice(0, charIndex);

        let delay = deleting ? 45 : 95;
        if (!deleting && charIndex === role.length) {
          delay = 2000;
          deleting = true;
        } else if (deleting && charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          delay = 400;
        }
        setTimeout(tick, delay);
      };
      tick();
    }
  }

  /* ---------- 首屏粒子背景 ---------- */
  const canvas = document.getElementById('particles');
  if (canvas && !prefersReduced && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const hero = canvas.parentElement;
    const colors = ['226, 54, 54', '43, 91, 170', '199, 30, 40'];
    let particles = [];
    let rafId = null;
    let width = 0;
    let height = 0;
    let running = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = hero.clientWidth;
      height = hero.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(70, Math.max(28, Math.floor((width * height) / 16000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.8,
        c: colors[Math.floor(Math.random() * colors.length)]
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.c + ', 0.55)';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < 120 * 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = 'rgba(' + p.c + ', ' + (0.14 * (1 - Math.sqrt(dist2) / 120)) + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      rafId = requestAnimationFrame(draw);
    };

    const start = () => {
      if (!running) {
        running = true;
        resize();
        draw();
      }
    };
    const stop = () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    };

    new IntersectionObserver((entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? start() : stop()));
    }, { threshold: 0.05 }).observe(hero);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (running) resize();
      }, 180);
    }, { passive: true });
  }

  /* ---------- 滚动显现动画 ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !prefersReduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  // 卡片级联出现（依次延迟）
  document.querySelectorAll('.stagger').forEach((group) => {
    Array.prototype.forEach.call(group.children, (child, i) => {
      if (child.classList.contains('reveal')) {
        child.style.transitionDelay = i * 90 + 'ms';
      }
    });
  });

  /* ---------- 技能条与百分比动画 ---------- */
  const fills = document.querySelectorAll('.skill-fill');
  if (fills.length) {
    if (prefersReduced || !('IntersectionObserver' in window)) {
      fills.forEach((f) => { f.style.width = f.dataset.width || '0%'; });
      document.querySelectorAll('.skill-percent').forEach((el) => {
        el.textContent = el.dataset.percent || '0%';
      });
    } else {
      const fillObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const fill = entry.target;
          const percentEl = fill.closest('.skill-row').querySelector('.skill-percent');
          const target = parseInt(percentEl.dataset.percent, 10) || 0;

          fill.style.width = fill.dataset.width || '0%';

          let current = 0;
          const step = Math.max(1, Math.round(target / 60));
          const counter = setInterval(() => {
            current = Math.min(target, current + step);
            percentEl.textContent = current + '%';
            if (current >= target) clearInterval(counter);
          }, 20);

          fillObserver.unobserve(fill);
        });
      }, { threshold: 0.5 });
      fills.forEach((f) => fillObserver.observe(f));
    }
  }

  /* ---------- 导航高亮 / 头部状态 / 阅读进度 / 回到顶部 ---------- */
  const header = document.getElementById('siteHeader');
  const toTop = document.getElementById('toTop');
  const progressBar = document.getElementById('progressBar');
  const navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  const sections = Array.prototype.slice
    .call(document.querySelectorAll('main section[id]'))
    .filter((s) => s.id !== 'top');

  const onScroll = () => {
    const y = window.scrollY;

    header.classList.toggle('scrolled', y > 24);
    if (toTop) toTop.classList.toggle('show', y > 560);

    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    if (progressBar && max > 0) {
      progressBar.style.width = (y / max) * 100 + '%';
    }

    let currentId = 'about';
    sections.forEach((s) => {
      if (y >= s.offsetTop - 180) currentId = s.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }

  /* ---------- 移动端菜单 ---------- */
  const navToggle = document.getElementById('navToggle');
  const siteNav = document.getElementById('siteNav');
  if (navToggle && siteNav) {
    const setMenu = (open) => {
      siteNav.classList.toggle('open', open);
      navToggle.classList.toggle('active', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    };

    navToggle.addEventListener('click', () => {
      setMenu(!siteNav.classList.contains('open'));
    });
    navLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  /* ---------- 深色模式 ---------- */
  const themeBtn = document.getElementById('themeBtn');
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const applyTheme = (dark) => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (themeBtn) themeBtn.textContent = dark ? '☀️' : '🌙';
    if (metaTheme) metaTheme.setAttribute('content', dark ? '#14161a' : '#fafafa');
  };
  if (themeBtn) {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(savedTheme ? savedTheme === 'dark' : prefersDark);
    themeBtn.addEventListener('click', () => {
      const dark = document.documentElement.getAttribute('data-theme') !== 'dark';
      applyTheme(dark);
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    });
  }

  /* ---------- 图片灯箱 ---------- */
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const galleryImgs = Array.from(document.querySelectorAll('.gallery-item img'));
    let current = 0;
    const openLightbox = (i) => {
      current = (i + galleryImgs.length) % galleryImgs.length;
      lightboxImg.src = galleryImgs[current].src;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
    };
    const closeLightbox = () => {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
    };
    galleryImgs.forEach((img, i) => {
      img.addEventListener('click', () => openLightbox(i));
      img.style.cursor = 'zoom-in';
    });
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => openLightbox(current - 1));
    lightboxNext.addEventListener('click', () => openLightbox(current + 1));
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') openLightbox(current - 1);
      if (e.key === 'ArrowRight') openLightbox(current + 1);
    });
  }

  /* ---------- 点击蛛丝特效（蜘蛛侠） ---------- */
  if (!prefersReduced) {
    const webCanvas = document.createElement('canvas');
    webCanvas.id = 'webFx';
    document.body.appendChild(webCanvas);
    const wctx = webCanvas.getContext('2d');
    let webs = [];
    let webRaf = null;

    const resizeWeb = () => {
      webCanvas.width = window.innerWidth;
      webCanvas.height = window.innerHeight;
    };
    resizeWeb();
    window.addEventListener('resize', resizeWeb, { passive: true });

    const drawWeb = (x, y, r, alpha, rot) => {
      const lines = 10;
      wctx.save();
      wctx.translate(x, y);
      wctx.rotate(rot);
      wctx.strokeStyle = 'rgba(226, 54, 54, ' + alpha + ')';
      wctx.lineWidth = 1.4;
      wctx.lineCap = 'round';
      for (let i = 0; i < lines; i++) {
        const a = (Math.PI * 2 * i) / lines;
        wctx.beginPath();
        wctx.moveTo(0, 0);
        wctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        wctx.stroke();
      }
      for (let k = 1; k <= 4; k++) {
        const rr = (r * k) / 4;
        wctx.beginPath();
        wctx.arc(0, 0, rr, 0, Math.PI * 2);
        wctx.stroke();
      }
      wctx.restore();
    };

    const webLoop = () => {
      wctx.clearRect(0, 0, webCanvas.width, webCanvas.height);
      const now = performance.now();
      webs = webs.filter((w) => now - w.start < w.maxLife);
      webs.forEach((w) => {
        const t = (now - w.start) / w.maxLife;
        const r = w.maxR * (0.2 + 0.8 * t);
        const alpha = Math.max(0, 0.9 * (1 - t * t));
        drawWeb(w.x, w.y, r, alpha, w.rot);
      });
      if (webs.length) {
        webRaf = requestAnimationFrame(webLoop);
      } else {
        webRaf = null;
        wctx.clearRect(0, 0, webCanvas.width, webCanvas.height);
      }
    };

    const spawnWeb = (x, y) => {
      webs.push({
        x: x,
        y: y,
        start: performance.now(),
        maxLife: 650,
        maxR: 58 + Math.random() * 26,
        rot: Math.random() * Math.PI * 2
      });
      if (!webRaf) webRaf = requestAnimationFrame(webLoop);
    };

    /* 蜘蛛侠贴纸彩蛋：快速连点 7 下触发 */
    const showEasterEgg = (x, y) => {
      const egg = document.createElement('div');
      egg.className = 'spidey-egg';
      egg.innerHTML =
        '<svg viewBox="0 0 120 120" width="150" height="150" aria-hidden="true">' +
          '<circle cx="60" cy="60" r="56" fill="#e23636" stroke="#9e1515" stroke-width="4"/>' +
          '<circle cx="60" cy="60" r="44" fill="#ffffff" opacity="0.15"/>' +
          '<circle cx="60" cy="56" r="9" fill="#ffffff"/>' +
          '<circle cx="60" cy="73" r="7" fill="#ffffff"/>' +
          '<path d="M60 47v-11M56 44l-9 7M64 44l9 7M53 49l-13 3M67 49l13 3M50 56l-12 -2M70 56l12 -2M49 64l-11 -5M71 64l11 -5M51 72l-10 -2M69 72l10 -2M55 80l-7 7M65 80l7 7" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '</svg>' +
        '<span class="egg-text">THWIP!</span>';
      document.body.appendChild(egg);
      egg.style.left = Math.max(20, Math.min(window.innerWidth - 170, x - 75)) + 'px';
      egg.style.top = Math.max(20, Math.min(window.innerHeight - 190, y - 75)) + 'px';
      setTimeout(() => egg.remove(), 2700);
      for (let i = 0; i < 8; i++) {
        webs.push({
          x: x,
          y: y,
          start: performance.now(),
          maxLife: 750,
          maxR: 55 + Math.random() * 45,
          rot: (Math.PI * 2 * i) / 8
        });
      }
      if (!webRaf) webRaf = requestAnimationFrame(webLoop);
    };

    const clickTimes = [];
    let eggCooldown = false;
    document.addEventListener('click', (e) => {
      spawnWeb(e.clientX, e.clientY);
      const now = performance.now();
      clickTimes.push(now);
      while (clickTimes.length && now - clickTimes[0] > 2000) clickTimes.shift();
      if (clickTimes.length >= 7 && !eggCooldown) {
        eggCooldown = true;
        clickTimes.length = 0;
        showEasterEgg(e.clientX, e.clientY);
        setTimeout(() => { eggCooldown = false; }, 4000);
      }
    });

    /* 蛛丝拖尾：鼠标移动沿途生成快速消散的小蛛网 */
    let lastTrailX = null;
    let lastTrailY = null;
    document.addEventListener('mousemove', (e) => {
      if (lastTrailX === null) {
        lastTrailX = e.clientX;
        lastTrailY = e.clientY;
        return;
      }
      const dx = e.clientX - lastTrailX;
      const dy = e.clientY - lastTrailY;
      if (dx * dx + dy * dy > 360) {
        lastTrailX = e.clientX;
        lastTrailY = e.clientY;
        webs.push({
          x: e.clientX,
          y: e.clientY,
          start: performance.now(),
          maxLife: 400,
          maxR: 18 + Math.random() * 10,
          rot: Math.random() * Math.PI * 2
        });
        if (!webRaf) webRaf = requestAnimationFrame(webLoop);
      }
    });
  }

  /* ---------- 占位链接（#）不跳转 ---------- */
  document.querySelectorAll('a[href="#"]').forEach((a) => {
    a.addEventListener('click', (e) => e.preventDefault());
  });

  /* ---------- 页脚年份 ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
