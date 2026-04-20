# 案例 A SPEC：基隆車站歷史觀光小工具

## 核心需求

- 以基隆車站周邊為預設地圖中心
- 顯示本地歷史景點資料 `data/processed/keelung_history_sites.geojson`
- 提供 1 個可拖曳的查詢圖釘
- 以圖釘為中心畫出 100 公尺查詢圈
- 即時計算並列出 100 公尺內景點，並依距離由近到遠排序
- 點列表時要同步開啟對應地圖 popup
- 提供歷史圖層開關與透明度控制
- 若歷史圖層失敗，仍保留現代底圖與本地景點查詢

## 資料契約

`keelung_history_sites.geojson` 每個 feature 固定包含：

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

- `geometry.coordinates` 需與 `lng` / `lat` 一致
- `summary_zh` 需是教師整理版，不由頁面即時生成
- `source_url` 必須可直接點開

## UI 與互動

- 桌面版：左側為說明與結果，右側為地圖
- 手機版：地圖在上、控制列與結果卡片在下
- 歷史圖層預設開啟，但使用者可隨時關閉
- 查詢圖釘可透過兩種方式移動：
  - 直接拖曳 marker
  - 點地圖任意位置

## Fallback

- 歷史圖層讀取失敗：顯示提示文字，保留 OSM 底圖與查詢功能
- 100 公尺內無景點：顯示空狀態卡片，不得報錯
- GeoJSON 載入失敗：顯示錯誤訊息並停止互動列表更新

## 明確不做

- 不做即時站外抓資料
- 不做登入
- 不做後台管理
- 不做多城市切換
- 不做路線導航

## 驗收標準

- `python3 -m http.server` 與 GitHub Pages 上都能正常開啟
- 拖曳圖釘可即時更新 100 公尺清單
- 至少有 1 個查詢位置會命中多筆景點
- popup 內能看到摘要與來源連結
- 歷史圖層失敗時，不影響現代底圖與查詢結果
