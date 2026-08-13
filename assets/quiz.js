/* 測驗引擎：讀取頁內 #quiz-data 的 JSON，渲染單選/複選題，
   交卷後逐選項給解析，最佳成績存 localStorage（key: ghc.<unit>）。
   純 vanilla JS，file:// 直接開啟也能運作。 */
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

  function render() {
    container.innerHTML = '';
    var form = document.createElement('form');
    form.addEventListener('submit', function (e) { e.preventDefault(); });

    data.questions.forEach(function (q, qi) {
      var fs = document.createElement('fieldset');
      fs.className = 'quiz-q';

      var legend = document.createElement('legend');
      legend.textContent = 'Q' + (qi + 1) + '. ' + q.q + (q.type === 'multi' ? '（複選）' : '');
      fs.appendChild(legend);

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

          var why = document.createElement('div');
          why.className = 'quiz-why';
          why.hidden = true;
          why.textContent = item.o.why || '';

          label.appendChild(input);
          label.appendChild(text);
          label.appendChild(why);
          fs.appendChild(label);
        });

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
    var correctCount = 0;

    data.questions.forEach(function (q, qi) {
      var fs = form.querySelectorAll('.quiz-q')[qi];
      var picked = [];
      fs.querySelectorAll('input').forEach(function (input) {
        input.disabled = true;
        if (input.checked) picked.push(Number(input.value));
      });

      var correctSet = [];
      q.options.forEach(function (o, oi) { if (o.correct) correctSet.push(oi); });

      var isRight = picked.length === correctSet.length &&
        picked.every(function (oi) { return correctSet.indexOf(oi) !== -1; });
      if (isRight) correctCount++;

      fs.querySelectorAll('.quiz-opt').forEach(function (label) {
        var oi = Number(label.dataset.oi);
        var input = label.querySelector('input');
        if (q.options[oi].correct) label.classList.add('is-correct');
        else if (input.checked) label.classList.add('is-wrong-pick');
        label.querySelector('.quiz-why').hidden = false;
      });

      var verdict = fs.querySelector('.q-verdict');
      verdict.hidden = false;
      verdict.textContent = isRight ? '✓ 答對' : '✗ 答錯（綠框為正解）';
      verdict.classList.add(isRight ? 'ok' : 'bad');
    });

    form.classList.add('graded');

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
