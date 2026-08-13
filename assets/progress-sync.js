/* 跨裝置進度同步（issue-ops）：
   儲存 = 開啟預填進度碼的 new issue（label: progress），送出後由
   .github/workflows/save-progress.yml 寫入 progress.json 並重新部署。
   還原 = 頁面載入時抓 progress.json，雲端成績較好時提示套用。
   file:// 開啟時自動略過雲端讀取，儲存功能仍可用。 */
(function () {
  'use strict';

  var REPO = 'huansbox/github-workflow-course';
  var bar = document.getElementById('sync');
  if (!bar) return;

  var units = Array.prototype.map.call(
    document.querySelectorAll('[data-unit]'),
    function (li) { return li.getAttribute('data-unit'); }
  );

  var cloud = null; // 最近一次抓到的 progress.json 內容

  function readLocalRec(u) {
    try {
      var rec = JSON.parse(localStorage.getItem('ghc.' + u));
      return (rec && rec.best != null) ? rec : null;
    } catch (e) { return null; }
  }

  /* 本機與雲端逐單元取優（best 取高分），避免舊裝置儲存時倒退雲端進度 */
  function mergedUnits() {
    var out = {};
    units.forEach(function (u) {
      var l = readLocalRec(u);
      var c = cloud && cloud.units && cloud.units[u] && cloud.units[u].best != null
        ? cloud.units[u] : null;
      if (l && c) {
        out[u] = {
          best: Math.max(l.best || 0, c.best || 0),
          last: (l.ts || '') >= (c.ts || '') ? l.last : c.last,
          total: l.total || c.total || 0,
          ts: (l.ts || '') >= (c.ts || '') ? l.ts : c.ts
        };
      } else if (l) { out[u] = l; }
      else if (c) { out[u] = c; }
    });
    return out;
  }

  function saveUrl() {
    var snap = { v: 1, units: mergedUnits() };
    var body = '課程網站產生的測驗進度碼。送出後 save-progress workflow 會自動存檔、關閉本 issue 並重新部署網站。\n\n' +
      '```json\n' + JSON.stringify(snap, null, 2) + '\n```\n';
    var title = 'progress: ' + new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
    return 'https://github.com/' + REPO + '/issues/new' +
      '?labels=progress' +
      '&title=' + encodeURIComponent(title) +
      '&body=' + encodeURIComponent(body);
  }

  function cloudImproves() {
    if (!cloud || !cloud.units) return false;
    return units.some(function (u) {
      var c = cloud.units[u];
      if (!c || c.best == null) return false;
      var l = readLocalRec(u);
      return !l || c.best > (l.best || 0);
    });
  }

  function applyCloud() {
    var merged = mergedUnits();
    Object.keys(merged).forEach(function (u) {
      try { localStorage.setItem('ghc.' + u, JSON.stringify(merged[u])); } catch (e) {}
    });
    location.reload(); // 重新載入讓徽章與提示以合併後狀態重算
  }

  function render() {
    bar.innerHTML = '';

    var save = document.createElement('a');
    save.className = 'btn';
    save.textContent = '☁ 儲存進度到 GitHub';
    save.href = '#';
    save.addEventListener('click', function (e) {
      e.preventDefault();
      window.open(saveUrl(), '_blank', 'noopener');
    });
    bar.appendChild(save);

    if (cloud && cloudImproves()) {
      var restore = document.createElement('button');
      restore.className = 'btn secondary';
      restore.textContent = '⬇ 還原雲端進度' + (cloud.ts ? '（' + cloud.ts.slice(0, 10) + ' 儲存）' : '');
      restore.addEventListener('click', applyCloud);
      bar.appendChild(restore);
    }

    var note = document.createElement('span');
    note.className = 'sync-note';
    note.textContent = '儲存會開啟預填好的 issue，按 Submit 即完成（需登入 GitHub）。';
    bar.appendChild(note);
  }

  render();

  if (location.protocol !== 'file:') {
    fetch('progress.json?t=' + Date.now())
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (data && data.v === 1) { cloud = data; render(); }
      })
      .catch(function () { /* 離線或尚未部署，略過 */ });
  }
})();
