/* 中英文切换：语言存 localStorage，切换后刷新页面 */
(function () {
  'use strict';

  var STORE = 'siteLang';
  var lang = localStorage.getItem(STORE) || 'zh';
  var isEn = lang === 'en';

  var UI = {
    zh: {
      'nav.about': '关于', 'nav.journey': '经历', 'nav.honors': '荣誉', 'nav.skills': '技能',
      'nav.projects': '作品', 'nav.games': '游戏', 'nav.blog': '文章', 'nav.contact': '联系', 'nav.guestbook': '留言',
      'heroName': '用代码与热爱，探索更大的世界。',
      'viewWorks': '查看作品', 'contactMe': '联系我',
      'builtWith': '用 ❤ 和 ☕ 构建',
      'pv': '本站访问量 <span id="busuanzi_value_site_pv"></span> 次',
      'uv': '访客 <span id="busuanzi_value_site_uv"></span> 人',
      'searchPlaceholder': '搜索作品、文章…（Ctrl+K）',
      'searchHint': 'Enter 打开第一条结果 · Esc 关闭',
      'scrollHint': '向下滚动',
      'toTop': '回到顶部',
      'searchModal': '站内搜索'
    },
    en: {
      'nav.about': 'About', 'nav.journey': 'Journey', 'nav.honors': 'Honors', 'nav.skills': 'Skills',
      'nav.projects': 'Works', 'nav.games': 'Games', 'nav.blog': 'Posts', 'nav.contact': 'Contact', 'nav.guestbook': 'Guestbook',
      'heroName': 'Exploring a bigger world with code and passion.',
      'viewWorks': 'View works', 'contactMe': 'Contact me',
      'builtWith': 'Built with ❤ and ☕',
      'pv': 'Visits <span id="busuanzi_value_site_pv"></span>',
      'uv': 'Guests <span id="busuanzi_value_site_uv"></span>',
      'searchPlaceholder': 'Search works, posts… (Ctrl+K)',
      'searchHint': 'Enter to open first result · Esc to close',
      'scrollHint': 'Scroll down',
      'toTop': 'Back to top',
      'searchModal': 'Site search'
    }
  };
  var dict = UI[lang] || UI.zh;

  if (isEn && typeof SITE_EN !== 'undefined') {
    // SITE 是 const 对象，不能整体赋值，但可以原地覆盖属性
    Object.assign(SITE, SITE_EN);
    document.documentElement.lang = 'en';
  } else {
    document.documentElement.lang = 'zh-CN';
  }

  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    var k = el.getAttribute('data-i18n');
    if (dict[k]) el.textContent = dict[k];
  });
  document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
    var k = el.getAttribute('data-i18n-html');
    if (dict[k]) el.innerHTML = dict[k];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
    var k = el.getAttribute('data-i18n-placeholder');
    if (dict[k]) el.setAttribute('placeholder', dict[k]);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
    var k = el.getAttribute('data-i18n-aria');
    if (dict[k]) el.setAttribute('aria-label', dict[k]);
  });

  var btn = document.getElementById('langBtn');
  if (btn) {
    btn.textContent = isEn ? '中' : 'EN';
    btn.title = isEn ? '切换到中文' : 'Switch to English';
    btn.addEventListener('click', function () {
      localStorage.setItem(STORE, isEn ? 'zh' : 'en');
      location.reload();
    });
  }
})();
