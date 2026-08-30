/* 让 giscus 留言板跟随网站深浅色主题 */
(function () {
  'use strict';

  var applyGiscus = function (dark) {
    var frame = document.querySelector('iframe.giscus-frame');
    if (frame && frame.contentWindow) {
      frame.contentWindow.postMessage(
        { giscus: { setConfig: { theme: dark ? 'dark' : 'light' } } },
        'https://giscus.app'
      );
    }
  };

  var sync = function () {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyGiscus(dark);
  };

  // 等待 giscus iframe 出现（最多约 20 秒）
  var tries = 0;
  var timer = setInterval(function () {
    if (document.querySelector('iframe.giscus-frame')) {
      clearInterval(timer);
      sync();
    } else if (++tries > 40) {
      clearInterval(timer);
    }
  }, 500);

  // 主题切换时同步
  if (window.MutationObserver) {
    new MutationObserver(sync).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }
})();
