/* 首頁進度：讀 localStorage 中各單元測驗紀錄（ghc.<unit>），
   在單元列表加上進度徽章，並顯示總覽。 */
(function () {
  'use strict';

  var PASS = 80;
  var items = document.querySelectorAll('[data-unit]');
  if (!items.length) return;

  var passed = 0, tried = 0;

  items.forEach(function (li) {
    var unit = li.getAttribute('data-unit');
    var rec = null;
    try {
      rec = JSON.parse(localStorage.getItem('ghc.' + unit));
    } catch (e) { /* ignore */ }

    var badge = document.createElement('span');
    badge.className = 'unit-badge';

    if (rec && rec.best != null) {
      tried++;
      if (rec.best >= PASS) {
        passed++;
        badge.classList.add('pass');
        badge.textContent = '✓ ' + rec.best + '%';
      } else {
        badge.classList.add('tried');
        badge.textContent = rec.best + '%';
      }
    } else {
      badge.textContent = '未測';
    }
    li.querySelector('a').appendChild(badge);
  });

  var summary = document.getElementById('progress-summary');
  if (summary) {
    if (tried === 0) {
      summary.textContent = '尚未開始。從第 1 單元開始，或挑你最想補的單字。每單元測驗達 80% 即通過，進度只存在這台瀏覽器的 localStorage。';
    } else {
      summary.textContent = '進度：' + passed + '/' + items.length + ' 單元通過（已嘗試 ' + tried + ' 單元）。測驗達 80% 即通過，進度存在這台瀏覽器的 localStorage。';
    }
  }
})();
