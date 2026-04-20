# AGENTS.md

你是這個專案的 AI coding 助手。這個案例已經是可部署的 GitHub Pages 靜態站，任何後續修改都必須優先維持：

- 相對路徑正確
- 無祕密金鑰
- 無 bundler 依賴
- 歷史圖層失敗時仍能 fallback

## 開始前必做

1. 如果是在 Codex App 或其他 AI 協作情境，先讀 `SKILL.md`
2. 再讀 `README.md` 與 `SPEC.md`
3. 再讀 `data/notes/data_prep_notes.md`
4. 確認 `data/processed/keelung_history_sites.geojson` 的欄位契約沒有被破壞
5. 若要改歷史圖層，先看 `data/raw/historic_wmts.txt`

## Skill 使用指示

- 在 Codex App 中，預設先依 `SKILL.md` 取得案例脈絡、工作流程與建議驗收，再依本檔執行
- 若使用者尚未明講，可主動建議：「請依照這個專案的 SKILL.md 協助我」
- `SKILL.md` 負責案例導向與建議流程，`AGENTS.md` 負責硬限制與驗收提醒
- 若 `SKILL.md` 與目前程式狀態不一致，應先指出差異，再進行修改

## 工作原則

- 優先保留最小可用展示版，不要引入框架或打包工具
- 不要自行發明新欄位
- 不要改成依賴 API key 的服務
- 不要把資料改成絕對路徑
- 所有面向使用者的文字維持繁體中文
- 若外部圖磚失敗，必須保留現代底圖與本地景點查詢

## 允許的修改範圍

- `index.html`
- `styles.css`
- `app.js`
- `SKILL.md`
- `data/processed/keelung_history_sites.geojson`
- `data/notes/data_prep_notes.md`
- `README.md`
- `SPEC.md`

## 修改資料時的限制

- `source_url` 必須保留官方來源
- `summary_zh` 必須是預先整理版，不做即時生成
- 若景點改名或移位，需同步更新 popup、結果卡片與資料筆記

## 驗收提醒

- 本地靜態伺服器可開
- GitHub Pages 子路徑可開
- 點地圖與拖曳 marker 都能重算 100 公尺結果
- 0 筆命中時有空狀態
