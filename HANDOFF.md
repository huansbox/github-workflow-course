# HANDOFF

- Status: idle
- Task/issue: no tracker entry — 本 session 交付 v1 課程網站、跨裝置進度同步（issue-ops）、綜合演練（單元 13），皆已上線
- Branch: main
- Updated: 2026-08-13

## Progress

- 3 章 12 單元 + 綜合演練（單元 13：5 情境 14 題，新增 order／match 題型）上線於 https://huansbox.github.io/github-workflow-course/ （repo 經使用者隱私審查同意後由 private 轉 public 並啟用 Pages）。
- 跨裝置進度同步（issue-ops）：`assets/progress-sync.js` + `.github/workflows/save-progress.yml`，端到端驗證通過（issue #1 為測試載體，已自動關閉）。
- 專案需求原則補進 CLAUDE.md（「課程需求（長期原則）」段），供後續 session 規劃課程時遵循。

## Next step

依 issue #2（carry-over）：收集使用者的 capstone 作答結果與回饋 issues，經 /grill-me 對齊第 4 章範圍後再實作。

## Validation

- playwright 實測：13 單元 75 題結構驗證零問題；capstone 滿分與答錯路徑、排序取消遞補、配對干擾項判定、手機 390px 無橫向捲動、單元 01 舊題型回歸——皆通過。
- deploy.yml 與 save-progress.yml 的 runs 皆綠；線上 index／unit 頁 curl 200；progress.json 寫入與還原端到端驗證通過。
- 未執行：自動化測試框架（純靜態站無測試設施，驗證以瀏覽器實測為準）。

## Blockers

None
