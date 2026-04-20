---
name: keelung-history-tour-demo
description: 當你要修改、除錯、延伸或驗證基隆車站歷史觀光小工具時使用這個 skill。它涵蓋 OSM 現代底圖、中研院百年歷史地圖疊圖、100 公尺鄰近查詢、本地 GeoJSON 資料契約，以及 GitHub Pages 零建置部署限制。
---

# 基隆歷史導覽案例

當任務是處理這個資料夾內的 Case A 網站時，使用這個 skill。

適合觸發這個 skill 的任務例如：

- 修復基隆歷史地圖案例的底圖或圖層切換
- 新增或調整基隆車站周邊歷史景點
- 讓 100 公尺查詢結果更清楚或更穩定
- 檢查這個案例是否仍可部署到 GitHub Pages

## 先讀哪些檔案

先依序讀：

1. `README.md`
2. `SPEC.md`
3. `data/notes/data_prep_notes.md`
4. 若任務跟歷史圖層有關，再讀 `data/raw/historic_wmts.txt`

主要實作檔：

- `index.html`
- `styles.css`
- `app.js`
- `data/processed/keelung_history_sites.geojson`

## 不可破壞的前提

- 維持零建置靜態站，不要加入 bundler、框架或伺服器依賴。
- 所有路徑都必須是相對路徑，讓資料夾能直接部署在 repo root 或 GitHub Pages 子路徑。
- 不要引入 API key、付費地圖服務或祕密設定。
- 就算歷史圖層失敗，也必須保留可用的 OSM 現代底圖。
- 所有使用者可見文字維持繁體中文。

## 地圖規則

- 現代底圖固定使用 `https://tile.openstreetmap.org/{z}/{x}/{y}.png`。
- 歷史圖層來自中研院圖磚服務；如果 WMTS 在瀏覽器不穩，優先使用這個專案已採用的 RESTful tile URL。
- 歷史圖層可能暫時失敗，頁面必須能退回成 OSM + 本地景點查詢。
- 可拖曳的查詢圖釘與 100 公尺查詢圈，不可因圖層失敗而失效。

## 資料契約

`data/processed/keelung_history_sites.geojson` 的每筆 feature 都必須保留：

- `id`
- `name`
- `category`
- `era`
- `address`
- `lat`
- `lng`
- `summary_zh`
- `source_title`
- `source_url`

補充規則：

- `geometry.coordinates` 必須與 `lng`、`lat` 一致。
- `summary_zh` 是教師整理文字，不是執行時生成文字。
- `source_url` 必須可點擊，且要指向真實來源。

## 建議工作流程

1. 先判斷問題是在圖磚、本地資料、UI 狀態，還是相對路徑。
2. 如果是地圖行為問題，先看 `app.js`。
3. 如果是內容問題，先看 `keelung_history_sites.geojson` 和 `data_prep_notes.md`。
4. 只做最小修正，優先保留現在的課堂 demo 流程。
5. 修完後重新確認點地圖、拖曳圖釘、popup 同步、空狀態都還正常。

## 常見修改

### 修底圖或圖層

- 優先調整 tile URL、attribution、pane 層級、referrer policy 或圖層切換邏輯。
- 不要為了讓地圖顯示就把 OSM 換成非自由或需要金鑰的服務。

### 改景點資料

- 更新 GeoJSON 時，屬性與座標要一起改。
- 如果名稱、摘要或來源改動，請同步更新筆記檔，讓學生能追蹤整理依據。

### 改介面

- 保留目前桌面雙欄、手機堆疊的版型。
- 避免加入會分散地圖閱讀注意力的花俏效果。

## 驗收檢查

完成前至少確認：

- 頁面可由 `python3 -m http.server` 開啟。
- OSM 底圖可正常顯示。
- 點地圖或拖曳圖釘都會重新計算 100 公尺清單。
- 結果卡片仍可打開對應 popup。
- 0 筆命中時會顯示空狀態，而不是壞掉。
- 歷史圖層失敗時，頁面仍可用 OSM 與本地資料運作。

## 不要做

- 加入即時抓站或伺服器端抓資料
- 未同步更新 spec 與筆記就擅自新增欄位
- 把這個案例改造成路線導航工具
- 明明需要顯示 fallback 訊息，卻把錯誤靜默吞掉
