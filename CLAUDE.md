# github-workflow-course

為使用者客製的 GitHub workflow 課程網站（零依賴純靜態，file:// 直接可用）。

## 硬性慣例

- 零依賴：不引入框架、build 步驟或外部 CDN；所有頁面必須在 file:// 下正常運作（禁用 fetch/ES modules，測驗資料一律內嵌在頁內 `#quiz-data` JSON）。
- 一個單元 = 一個單字 = `units/NN-<word>.html` 一檔；內容順序固定：概念 → 何時用 → 怎麼用 → 常見的坑 →（可選）給使用者的優化建議 → Takeaways → 測驗。
- 測驗 JSON schema：`{unit, questions:[{q, type: "single"|"multi", options:[{t, correct, why}]}]}`；每題每個選項都要有 `why` 解析；題目考「何時用/怎麼用/會踩什麼坑」，不出名詞背誦題。
- 新增單元 checklist：建 `units/` 頁 → `index.html` 加列表項（`data-unit` 須等於 quiz JSON 的 `unit` 值）→ 前後單元的 footer 導覽連結補上。
- 全站正體中文（臺灣用語），技術術語與指令保留英文。

## 個人化素材來源

- 首頁與各單元的「你的數據」框：2026-08 統計自使用者歷史 session 記錄的詞頻（見 README）。更新統計時同步更新首頁圖表與各單元引用的數字。
- 真實案例取自 htlin222 的公開 repo（CCChange、vox-styled-reels 等）；引用時以當時抓到的檔案內容為準，不假設其 repo 未來不變。

## 部署

- private repo（GitHub Free）開不了 Pages（2026-08-13 實測 API 422）；`deploy.yml` 是教材兼備用，目前為 disabled 狀態。轉 public 上線的三步指令見 README「使用方式」。
- 回饋與後續開發以本 repo 的 GitHub issues 為 tracker。
