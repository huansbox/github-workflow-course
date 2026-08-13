# GitHub Workflow 課程

為 huansbox 客製的 GitHub workflow 自學課程。一個單元一個單字，每單元含概念、何時用、怎麼用、常見的坑、takeaways 與測驗（選擇題，80% 通過）。

## 課程結構

- **第 1 章 GitHub Flow**：github-flow / issue / pull-request / merge-strategy
- **第 2 章 低頻但高價值**（依歷史 session 的使用統計選定）：rebase / tag / release / auto-merge
- **第 3 章 GitHub Actions**（主要知識缺口）：workflow / trigger / permissions-secrets / ci-cd

課程個人化素材：

- 歷史 Claude Code session 記錄的 git/gh 指令詞頻統計（2026-08 統計，見首頁圖表）
- 使用者現行工作流（global CLAUDE.md、handoff-start/end、grill-me、to-issues、repo-wiki skills）
- htlin222 醫師公開 repo 的真實 workflow 案例（CCChange 的 auto-merge/deploy、vox-styled-reels 的 issue-to-card/release-cards）

## 使用方式

零依賴純靜態網站，不需 build：

- **本地**：直接用瀏覽器開 `index.html`（file:// 可用；測驗進度存瀏覽器 localStorage）。
- **GitHub Pages**：`.github/workflows/deploy.yml` 已就緒，但 GitHub Free 方案的 private repo 無法啟用 Pages。repo 轉 public 或帳號升級後，Settings → Pages → Source 選 GitHub Actions 即可。

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
