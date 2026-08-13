/* 測驗引擎：讀取頁內 #quiz-data 的 JSON，渲染題目，交卷後逐項給解析，
   最佳成績存 localStorage（key: ghc.<unit>）。純 vanilla JS，file:// 可用。
   題型：
   - single / multi：選項點選（options:[{t, correct, why}]）
   - order：依正確順序點選步驟（options 陣列順序即正解；[{t, why}]）
   - match：每列下拉選單配對（pairs:[{left, right, why}]，decoys 為干擾選項）
   題目可帶 scenario 欄位，會渲染成情境敘述框。 */
(function () {
  'use strict';

  var PASS = 80; // 及格門檻（%）

  var dataEl = document.getElementById('quiz-data');
  var container = document.getElementById('quiz');
  if (!dataEl || !container) return;

  var data;
  try {
    data = JSON.parse(dataEl.textContent);
  } catch (e) {
    container.textContent = '測驗資料載入失敗：' + e.message;
    return;
  }

  var KEY = 'ghc.' + data.unit;

  function loadRecord() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || null;
    } catch (e) {
      return null;
    }
  }

  function saveRecord(percent) {
    var rec = loadRecord() || { best: 0 };
    rec.last = percent;
    rec.best = Math.max(rec.best || 0, percent);
    rec.total = data.questions.length;
    rec.ts = new Date().toISOString();
    try {
      localStorage.setItem(KEY, JSON.stringify(rec));
    } catch (e) { /* 私密模式等情況下略過 */ }
    return rec;
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function whyDiv(text) {
    var why = document.createElement('div');
    why.className = 'quiz-why';
    why.hidden = true;
    why.textContent = text || '';
    return why;
  }

  /* ── single / multi ── */

  function renderChoice(q, qi, fs) {
    shuffle(q.options.map(function (o, oi) { return { o: o, oi: oi }; }))
      .forEach(function (item) {
        var label = document.createElement('label');
        label.className = 'quiz-opt';
        label.dataset.oi = item.oi;

        var input = document.createElement('input');
        input.type = q.type === 'multi' ? 'checkbox' : 'radio';
        input.name = 'q' + qi;
        input.value = item.oi;

        var text = document.createElement('span');
        text.textContent = item.o.t;

        label.appendChild(input);
        label.appendChild(text);
        label.appendChild(whyDiv(item.o.why));
        fs.appendChild(label);
      });
  }

  function gradeChoice(q, fs) {
    var picked = [];
    fs.querySelectorAll('input').forEach(function (input) {
      input.disabled = true;
      if (input.checked) picked.push(Number(input.value));
    });

    var correctSet = [];
    q.options.forEach(function (o, oi) { if (o.correct) correctSet.push(oi); });

    var isRight = picked.length === correctSet.length &&
      picked.every(function (oi) { return correctSet.indexOf(oi) !== -1; });

    fs.querySelectorAll('.quiz-opt').forEach(function (label) {
      var oi = Number(label.dataset.oi);
      var input = label.querySelector('input');
      if (q.options[oi].correct) label.classList.add('is-correct');
      else if (input.checked) label.classList.add('is-wrong-pick');
      label.querySelector('.quiz-why').hidden = false;
    });

    return isRight;
  }

  /* ── order：依序點選 ── */

  function renderOrder(q, qi, fs) {
    var seq = [];
    fs._seq = seq;

    function refresh() {
      fs.querySelectorAll('.order-item').forEach(function (el) {
        var pos = seq.indexOf(Number(el.dataset.oi));
        el.querySelector('.order-num').textContent = pos === -1 ? '·' : String(pos + 1);
        el.classList.toggle('picked', pos !== -1);
      });
    }

    shuffle(q.options.map(function (o, oi) { return { o: o, oi: oi }; }))
      .forEach(function (item) {
        var el = document.createElement('div');
        el.className = 'order-item';
        el.dataset.oi = item.oi;
        el.setAttribute('role', 'button');
        el.tabIndex = 0;

        var num = document.createElement('span');
        num.className = 'order-num';
        num.textContent = '·';

        var text = document.createElement('span');
        text.className = 'order-text';
        text.textContent = item.o.t;

        el.appendChild(num);
        el.appendChild(text);
        el.appendChild(whyDiv(item.o.why));

        el.addEventListener('click', function () {
          if (fs.closest('form').classList.contains('graded')) return;
          var pos = seq.indexOf(item.oi);
          if (pos !== -1) seq.splice(pos, 1); // 再點一次取消，之後的自動遞補
          else seq.push(item.oi);
          refresh();
        });
        fs.appendChild(el);
      });
  }

  function gradeOrder(q, fs) {
    var seq = fs._seq;
    var isRight = seq.length === q.options.length &&
      seq.every(function (oi, i) { return oi === i; });

    fs.querySelectorAll('.order-item').forEach(function (el) {
      var oi = Number(el.dataset.oi);
      var pickedPos = seq.indexOf(oi);
      var ok = pickedPos === oi;
      el.classList.remove('picked');
      el.classList.add(ok ? 'is-correct' : 'is-wrong-pick');
      el.querySelector('.order-num').textContent =
        (pickedPos === -1 ? '未選' : '你的 ' + (pickedPos + 1)) + '｜正確 ' + (oi + 1);
      el.querySelector('.quiz-why').hidden = false;
    });

    return isRight;
  }

  /* ── match：下拉選單配對 ── */

  function renderMatch(q, qi, fs) {
    var rights = [];
    q.pairs.forEach(function (p) {
      if (rights.indexOf(p.right) === -1) rights.push(p.right);
    });
    (q.decoys || []).forEach(function (d) {
      if (rights.indexOf(d) === -1) rights.push(d);
    });
    rights = shuffle(rights);

    q.pairs.forEach(function (p, pi) {
      var row = document.createElement('div');
      row.className = 'match-row';

      var left = document.createElement('div');
      left.className = 'match-left';
      left.textContent = p.left;

      var sel = document.createElement('select');
      sel.className = 'match-select';
      var opt0 = document.createElement('option');
      opt0.value = '';
      opt0.textContent = '── 選擇 ──';
      sel.appendChild(opt0);
      rights.forEach(function (r) {
        var opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r;
        sel.appendChild(opt);
      });

      row.appendChild(left);
      row.appendChild(sel);
      row.appendChild(whyDiv(p.why));
      fs.appendChild(row);
    });
  }

  function gradeMatch(q, fs) {
    var allOk = true;
    fs.querySelectorAll('.match-row').forEach(function (row, pi) {
      var sel = row.querySelector('select');
      sel.disabled = true;
      var ok = sel.value === q.pairs[pi].right;
      if (!ok) allOk = false;
      row.classList.add(ok ? 'is-correct' : 'is-wrong-pick');
      var why = row.querySelector('.quiz-why');
      why.hidden = false;
      why.textContent = (ok ? '' : '正解：' + q.pairs[pi].right + '。') + (q.pairs[pi].why || '');
    });
    return allOk;
  }

  /* ── 主流程 ── */

  function typeLabel(q) {
    if (q.type === 'multi') return '（複選）';
    if (q.type === 'order') return '（排序：依正確順序逐一點選，點錯再點一次取消）';
    if (q.type === 'match') return '（配對：每列選一個答案）';
    return '';
  }

  function render() {
    container.innerHTML = '';
    var form = document.createElement('form');
    form.addEventListener('submit', function (e) { e.preventDefault(); });

    data.questions.forEach(function (q, qi) {
      if (q.scenario) {
        var sc = document.createElement('div');
        sc.className = 'scenario';
        var scTitle = document.createElement('span');
        scTitle.className = 'scenario-title';
        scTitle.textContent = '📍 情境';
        sc.appendChild(scTitle);
        var scText = document.createElement('div');
        scText.textContent = q.scenario;
        sc.appendChild(scText);
        form.appendChild(sc);
      }

      var fs = document.createElement('fieldset');
      fs.className = 'quiz-q';

      var legend = document.createElement('legend');
      legend.textContent = 'Q' + (qi + 1) + '. ' + q.q + typeLabel(q);
      fs.appendChild(legend);

      if (q.type === 'order') renderOrder(q, qi, fs);
      else if (q.type === 'match') renderMatch(q, qi, fs);
      else renderChoice(q, qi, fs);

      var verdict = document.createElement('div');
      verdict.className = 'q-verdict';
      verdict.hidden = true;
      fs.appendChild(verdict);

      form.appendChild(fs);
    });

    var actions = document.createElement('div');
    actions.className = 'quiz-actions';

    var submitBtn = document.createElement('button');
    submitBtn.type = 'button';
    submitBtn.textContent = '交卷';
    submitBtn.addEventListener('click', function () { grade(form, actions); });

    var result = document.createElement('span');
    result.className = 'quiz-result';

    var best = document.createElement('span');
    best.className = 'quiz-best';
    var rec = loadRecord();
    if (rec && rec.best != null) best.textContent = '歷史最佳：' + rec.best + '%';

    actions.appendChild(submitBtn);
    actions.appendChild(result);
    actions.appendChild(best);
    form.appendChild(actions);
    container.appendChild(form);
  }

  function grade(form, actions) {
    form.classList.add('graded');
    var correctCount = 0;
    var fieldsets = form.querySelectorAll('.quiz-q');

    data.questions.forEach(function (q, qi) {
      var fs = fieldsets[qi];
      var isRight;
      if (q.type === 'order') isRight = gradeOrder(q, fs);
      else if (q.type === 'match') isRight = gradeMatch(q, fs);
      else isRight = gradeChoice(q, fs);

      if (isRight) correctCount++;

      var verdict = fs.querySelector('.q-verdict');
      verdict.hidden = false;
      verdict.textContent = isRight ? '✓ 答對' : '✗ 答錯（綠色為正解）';
      verdict.classList.add(isRight ? 'ok' : 'bad');
    });

    var total = data.questions.length;
    var percent = Math.round((correctCount / total) * 100);
    var rec = saveRecord(percent);

    var result = actions.querySelector('.quiz-result');
    result.textContent = correctCount + '/' + total + '（' + percent + '%）' +
      (percent >= PASS ? ' 通過 🎉' : ' 未達 ' + PASS + '%，讀完解析再試一次');
    result.classList.add(percent >= PASS ? 'pass' : 'fail');

    var best = actions.querySelector('.quiz-best');
    best.textContent = '歷史最佳：' + rec.best + '%';

    var submitBtn = actions.querySelector('button');
    submitBtn.textContent = '重新作答';
    submitBtn.className = 'secondary';
    var fresh = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(fresh, submitBtn);
    fresh.addEventListener('click', render);
  }

  render();
})();
