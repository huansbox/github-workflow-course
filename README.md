# GitHub Workflow 課程

為 huansbox 客製的 GitHub workflow 自學課程。一個單元一個單字，每單元含概念、何時用、怎麼用、常見的坑、takeaways 與測驗（選擇題，80% 通過）。

## 課程結構

- **第 1 章 GitHub Flow**：github-flow / issue / pull-request / merge-strategy
- **第 2 章 低頻但高價值**（依歷史 session 的使用統計選定）：rebase / tag / release / auto-merge
- **第 3 章 GitHub Actions**（主要知識缺口）：workflow / trigger / permissions-secrets / ci-cd
- **綜合演練（1–3 章驗收）**：capstone——五個實戰情境 14 題（排序、配對、單複選），80% 通過後銜接規劃中的第 4 章

課程個人化素材：

- 歷史 Claude Code session 記錄的 git/gh 指令詞頻統計（2026-08 統計，見首頁圖表）
- 使用者現行工作流（global CLAUDE.md、handoff-start/end、grill-me、to-issues、repo-wiki skills）
- htlin222 醫師公開 repo 的真實 workflow 案例（CCChange 的 auto-merge/deploy、vox-styled-reels 的 issue-to-card/release-cards）

## 使用方式

零依賴純靜態網站，不需 build：

- **線上（主要使用方式）**：https://huansbox.github.io/github-workflow-course/ ——手機、平板皆可；測驗進度存各裝置瀏覽器的 localStorage。
- **本地**：直接用瀏覽器開 `index.html` 也行（file:// 可用）。
- 部署鏈：push main → `deploy.yml` 自動部署（repo 於 2026-08-13 由 private 轉 public 以啟用 Pages；內容經隱私審查後決定公開）。
- **跨裝置進度（issue-ops）**：首頁「☁ 儲存進度到 GitHub」→ 開啟預填進度碼的 issue（label: `progress`）→ 按 Submit 即完成。`save-progress.yml` 會驗證發起人、把進度寫進 `progress.json`、關閉 issue 並重新部署；其他裝置打開網站約 1–2 分鐘後會出現「還原雲端進度」提示（逐單元取高分合併，不會倒退）。前提：該裝置的瀏覽器已登入 GitHub。

## 回饋

讀完覺得太簡單／太難、發現錯誤、想加單元 → 在本 repo 開 issue（這本身就是第 2 單元的實踐）。回饋會決定 v2 的方向。

## 檔案結構

```
index.html                  課程首頁（單元列表、進度、使用統計）
units/NN-<word>.html        單元頁（內容 + 內嵌測驗 JSON）
assets/style.css            全站樣式（深色模式自適應）
assets/quiz.js              測驗引擎（渲染、評分、解析、localStorage 進度）
assets/site.js              首頁進度徽章
.github/workflows/deploy.yml  Pages 部署（兼第 9 單元教材）
```
